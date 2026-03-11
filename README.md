# Sales Insight Automator

A secure "Quick-Response Tool" allowing sales members to upload a CSV/Excel file and instantly receive an AI-generated brief directly to their inbox.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, TypeScript
- **Backend**: Node.js, Express, TypeScript, Google Gemini AI API, Nodemailer
- **Infrastructure**: Docker, Docker Compose, GitHub Actions for CI

## Architecture & Security
- **Endpoints**: Secured through basic error handling, payload size limits (via `multer` limit 10MB), and CORS protection. Real-world applications should also implement JWT authentication and rate limiting, but for the scope of this 3-hour MVP, fundamental input validation is active.
- **Data Protection**: API Keys are never exposed to the frontend. Uploaded files are kept strictly in memory buffers (`multer.memoryStorage()`) and never touch the server disk, parsed instantly, and immediately garbage collected.

## Local Development (Docker)

You can spin up the entire application using Docker Compose with zero local dependencies (other than Docker).

1. Clone the repository.
2. In the `backend` folder, duplicate `.env.example` to `.env` and fill in your keys:
   - `GEMINI_API_KEY`: Your Google Gen AI key
   - `SMTP_USER` & `SMTP_PASS`: Your email credentials for Nodemailer
3. Run the following command from the root of the project:
   ```bash
   docker-compose up --build
   ```
4. Access the application:
   - **Frontend**: http://localhost:80
   - **Backend API Docs (Swagger)**: http://localhost:5000/api-docs

## Deployment Links (Vercel & Render)

### Deploying Frontend to Vercel
1. Connect your GitHub repository to Vercel.
2. Set the **Framework Preset** to Vite.
3. Set the **Root Directory** to `frontend`.
4. Deploy.

### Deploying Backend to Render
1. Connect your GitHub repo to Render as a "Web Service".
2. Set the **Root Directory** to `backend`.
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Ensure you define all your environment variables (from `.env.example`) in the Render dashboard.

## Engineer's Log

This rapid-prototype was developed iteratively. The core challenge was parsing varying CSV/Excel structures securely and passing them to Gemini in a token-efficient manner (limited to 100 sample rows) to guarantee quick response times. The Swagger API implementation auto-generates live docs directly from the TypeScript decorators/comments. 

The Continuous Integration (CI) pipeline handles automated testing and building of both Frontend and Backend on every Push/PR to `main`.
