# 📊 Sales Insight Automator

A secure, containerized **Quick-Response Tool** that enables sales teams to upload CSV/Excel data files and instantly receive an AI-generated executive brief delivered directly to their inbox.

> Built as a rapid prototype for **Rabbitt AI** — showcasing end-to-end data processing, AI summarization, and automated email delivery.

---

## 🚀 Live Demo

| Service | URL |
|---------|-----|
| **Frontend (Vercel)** | [https://spa-rabbitt.vercel.app](https://spa-rabbitt.vercel.app) |
| **Backend API Docs (Render)** | [https://spa-rabbitt-backend.onrender.com/api-docs](https://spa-rabbitt-backend.onrender.com/api-docs) |

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────┐
│   React + Vite  │────▶│  Express + TypeScript │────▶│  Google     │
│   (Frontend)    │     │  (Backend API)        │     │  Gemini AI  │
│                 │     │                       │     └─────────────┘
│  Upload CSV/XLS │     │  POST /api/analyze    │
│  Enter Email    │     │  GET  /api-docs       │────▶┌─────────────┐
│  Get Feedback   │     │  GET  /health         │     │  Nodemailer │
└─────────────────┘     └──────────────────────┘     │  (SMTP)     │
                                                      └─────────────┘
```

### Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4, TypeScript
- **Backend**: Node.js, Express 5, TypeScript, Google Gemini AI (`@google/genai`), Nodemailer
- **DevOps**: Docker, Docker Compose, GitHub Actions CI
- **Documentation**: Swagger/OpenAPI at `/api-docs`

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- Docker (optional, for containerized setup)

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/SPA_Rabbitt.git
cd SPA_Rabbitt
```

### 2. Configure Environment Variables
```bash
cp backend/.env.example backend/.env
```
Edit `backend/.env` and fill in your credentials:
```env
PORT=5000
GEMINI_API_KEY=your_google_ai_api_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_SECURE=false
```

### 3a. Run with Docker (Recommended)
```bash
docker-compose up --build
```
- **Frontend**: http://localhost:80
- **Backend Swagger UI**: http://localhost:5001/api-docs

### 3b. Run without Docker
**Terminal 1 — Backend:**
```bash
cd backend
npm install
npm run build
npm start
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```
- **Frontend**: http://localhost:5173
- **Backend Swagger UI**: http://localhost:5000/api-docs

---

## 🔒 Security Overview

| Measure | Implementation |
|---------|---------------|
| **No disk storage** | Uploaded files are processed in memory (`multer.memoryStorage()`) and immediately garbage collected |
| **File size limit** | Hard cap of 10MB via `multer` to prevent resource abuse |
| **CORS protection** | Configured via the `cors` middleware |
| **Secret management** | All API keys and credentials are stored in `.env` (git-ignored) and never exposed to the frontend |
| **Input validation** | Server validates file presence, email format, and data integrity before processing |

---

## 📁 Project Structure

```
SPA_Rabbitt/
├── backend/
│   ├── src/
│   │   └── index.ts          # Express server, routes, AI & email integration
│   ├── tests/
│   │   └── index.test.ts     # Jest + Supertest unit tests
│   ├── Dockerfile
│   ├── .env.example           # Template for required env vars
│   ├── tsconfig.json
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # Main SPA component
│   │   ├── index.css          # Tailwind CSS entry
│   │   └── main.tsx           # React entry point
│   ├── index.html
│   ├── Dockerfile
│   ├── vite.config.ts
│   └── package.json
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI pipeline
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🧪 Testing

```bash
cd backend
npm test
```

Runs Jest + Supertest tests covering:
- `POST /api/analyze` — validates file and email presence
- `GET /health` — verifies server availability

---

## 🚢 Deployment

### Frontend → Vercel
1. Import the GitHub repo in Vercel
2. Set **Root Directory** to `frontend`
3. Set **Framework Preset** to `Vite`
4. Deploy

### Backend → Render
1. Create a new **Web Service** from this repo
2. Set **Root Directory** to `backend`
3. **Build Command**: `npm install && npm run build`
4. **Start Command**: `npm start`
5. Add all environment variables from `.env.example` in the Render dashboard

---

## 🔄 CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) automatically runs on every push/PR to `main`:
- ✅ Installs dependencies for both frontend and backend
- ✅ Builds the TypeScript backend
- ✅ Runs all backend unit tests
- ✅ Builds the production frontend bundle

---

## 📄 .env.example

```env
PORT=5000
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=YOUR_EMAIL@gmail.com
SMTP_PASS=YOUR_APP_PASSWORD
SMTP_SECURE=false
```

---

## 📜 License

MIT
