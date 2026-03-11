import express from 'express';
import cors from 'cors';
import multer from 'multer';
import * as xlsx from 'xlsx';
import { GoogleGenAI } from '@google/genai';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:80',
    'http://localhost',
    'https://spa-rabbitt.vercel.app',
];
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    }
}));
app.use(express.json());

// Store files in memory buffer
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// Swagger Configuration
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Sales Insight Automator API',
            version: '1.0.0',
            description: 'API for processing sales data and triggering email summaries',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Local server',
            },
        ],
    },
    apis: ['./src/*.ts'], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Initialize Gemini Core SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Configure Nodemailer Transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * @swagger
 * /api/analyze:
 *   post:
 *     summary: Upload a sales data file and receive an email summary
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: AI Summary generated and email sent successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
app.post('/api/analyze', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const recipientEmail = req.body.email;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }
        if (!recipientEmail) {
            return res.status(400).json({ error: 'Recipient email is required.' });
        }

        // Parse CSV/Excel
        const workbook = xlsx.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (rawData.length === 0) {
            return res.status(400).json({ error: 'The uploaded file is empty.' });
        }

        // Convert data to a compact string for Gemini (first 100 rows to prevent token overflow for huge files)
        const summaryData = JSON.stringify(rawData.slice(0, 100));

        // Generate AI Summary
        const prompt = `You are an expert sales analyst. The following is sales data for the quarter: 
        ${summaryData}
        
        Please provide a concise, executive-level summary of this data. Identify the top performing items, key trends, and any noticeable areas of concern. Format the summary professionally with bullet points.`;

        const aiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const report = aiResponse.text;

        if (!report) {
            throw new Error('Could not generate AI response.');
        }

        // Send Email
        const mailOptions = {
            from: `"Sales Insight Automator" <${process.env.SMTP_USER}>`,
            to: recipientEmail,
            subject: 'Your AI-Generated Sales Brief',
            text: report,
            html: `<h2>Sales Quarterly Brief</h2><p>${report.replace(/\n/g, '<br/>')}</p>`
        };

        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            await transporter.sendMail(mailOptions);
        } else {
             console.log("Mock Email (Credentials missing):", mailOptions);
        }

        return res.status(200).json({
            message: 'AI Summary generated and email sent securely.',
            data: { recipientEmail }
        });

    } catch (error: any) {
        console.error('Error in /api/analyze:', Math.random());
        console.error('Error detail:', error.message);
        return res.status(500).json({ error: 'Internal server error while processing the request.' });
    }
});

// Basic Healthcheck
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

// Use http.createServer to keep the process alive (Express 5 compatibility)
import http from 'http';
const server = http.createServer(app);
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Swagger available at http://localhost:${port}/api-docs`);
});

export default app;
