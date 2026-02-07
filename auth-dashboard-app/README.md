# Auth + Dashboard App (Frontend Intern Assignment)

A modern, responsive web application built with Next.js and Node.js, featuring secure authentication, a dynamic dashboard, and full CRUD capabilities for task management.

## 🚀 Tech Stack

### Frontend
*   **Framework**: Next.js 14 (App Router)
*   **Styling**: TailwindCSS
*   **State Management**: React Context API (`AuthContext`)
*   **Icons**: Lucide React
*   **Notifications**: React Hot Toast
*   **HTTP Client**: Axios

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (via Mongoose)
*   **Authentication**: JWT (JSON Web Tokens)
*   **Security**: bcryptjs (Password Hashing), cors, helmet

---

## 🛠️ Setup Instructions

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Local or Atlas URI)

### 1. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/auth-dashboard
JWT_SECRET=your_super_secret_key_change_this
NODE_ENV=development
```

Start the server:
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

Start the application:
```bash
npm run dev
```

Visit `http://localhost:3000` to view the app.

---

## 🔑 Demo Credentials

You can use these to log in immediately if the database is seeded, or simply Sign Up with a new account.

*   **Email**: `demo@example.com`
*   **Password**: `Password123`

---

## 📈 Scaling for Production

To scale this application for a production environment, I would implement the following strategies:

1.  **Database Optimization**: Implement database indexing on frequently queried fields (e.g., `userId` in Tasks, `email` in Users) to speed up read operations. For high traffic, I'd introduce read replicas and potential sharding.
2.  **Caching Layer**: Integrate **Redis** to cache user sessions, profile data, and frequently accessed task lists. This reduces database load significantly.
3.  **Horizontal Scaling**: Containerize the backend with **Docker** and orchestrate with **Kubernetes** to spin up multiple instances behind a Load Balancer (e.g., NGINX or AWS ALB) to handle concurrent requests.
4.  **Security Hardening**: Implement rate limiting (e.g., `express-rate-limit`) to prevent DDoS, strictly configure CORS, and use HttpOnly cookies for JWT storage instead of LocalStorage for better XSS protection.
5.  **CI/CD Pipeline**: Set up automated testing (Jest/Cypress) and deployment pipelines (GitHub Actions) to ensure code quality and seamless updates without downtime.

---

## 📡 API Endpoints (Quick Reference)

*   **Auth**: `POST /auth/signup`, `POST /auth/login`
*   **Profile**: `GET /profile/me`, `PUT /profile/me`
*   **Tasks**: `GET /tasks`, `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`
