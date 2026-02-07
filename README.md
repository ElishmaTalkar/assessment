# APS Resume Scanner & Dashboard

This repository contains a comprehensive full-stack application suite consisting of:
1.  **Auth & Dashboard App**: A MERN stack project featuring authentication, task management, and a modern dashboard.
2.  **Resume Builder**: A Next.js AI-powered tool for parsing and enhancing resumes.

## 🛠️ Tech Stack

### Auth Dashboard (Full-Stack)
-   **Frontend**: Next.js 15 (App Router), TypeScript, TailwindCSS, Lucide React, Dnd-kit (Kanban), Framer Motion.
-   **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT Authentication, Helmet, Morgan (Logging).

### Resume Builder (AI Tool)
-   **Framework**: Next.js 16 (App Router), TypeScript.
-   **AI Integration**: Vercel AI SDK, Google Gemini API / OpenAI API.
-   **Document Processing**: `mammoth` (DOCX), `pdf2json` (PDF), `html2pdf.js`.
-   **Styling**: TailwindCSS, Shadcn/UI patterns.

---

## 🚀 Setup & Installation

### Prerequisites
-   Node.js (v18+)
-   MongoDB (Running locally or Atlas URI)

### 1. auth-dashboard-app (Backend & Frontend)

**Backend Setup**
```bash
cd auth-dashboard-app/backend
npm install
# Create .env file (copy from .env.example)
cp .env.example .env
# Start the server
npm run dev
```

**Frontend Setup**
```bash
cd auth-dashboard-app/frontend
npm install
npm run dev
```

### 2. resume-builder (AI Tool)

```bash
cd resume-builder
npm install
# Configure AI keys in .env
cp .env.example .env.local
npm run dev
```

---

## 🔑 Environment Variables

**Backend (`auth-dashboard-app/backend/.env`)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/auth-dashboard
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

**Resume Builder (`resume-builder/.env.local`)**
```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key # Optional if using Gemini
```

---

## 💾 Database Seeding & Demo Credentials

To populate the database with demo users and tasks:

```bash
cd auth-dashboard-app/backend
npm run seed
```

### Demo User 1
-   **Email**: `john@example.com`
-   **Password**: `Password123`

### Demo User 2
-   **Email**: `jane@example.com`
-   **Password**: `Password123`

---

## 📚 API Documentation

A Postman collection is included in the repository for testing backend endpoints:
📄 `auth-dashboard-app/TaskFlow-API.postman_collection.json`

Import this file into Postman to access pre-configured requests for Auth, Tasks, Teams, and Profile endpoints.

---

## 📈 Production Scaling Strategy

To scale this application for production:

1.  **Deployment**: Dockerize both frontend and backend services. Deploy using container orchestration (Kubernetes or AWS ECS) for easy horizontal scaling.
2.  **Database**: Use MongoDB Atlas with sharding for high availability. Implement database indexing on high-frequency query fields (e.g., `userId`, `email`, `status`).
3.  **Caching**: Integrate Redis to cache user sessions, comprehensive profile data, and expensive API responses to reduce database load.
4.  **Security**: Enforce strict CORS policies (whitelist only production domains), use secure headers (Helmet), and manage secrets via AWS Secrets Manager or HashiCorp Vault.
5.  **Load Balancing**: Place a load balancer (Nginx or AWS ALB) in front of the backend instances to distribute traffic evenly.
6.  **CI/CD**: Implement automated pipelines (GitHub Actions) for testing, building, and deploying to staging/production environments.
