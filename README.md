# TaskFlow

TaskFlow is a robust, full-stack task management solution designed to enhance team collaboration and individual productivity. Built with a focus on scalability, performance, and modern architectural patterns, it demonstrates a complete MERN stack implementation with type safety and responsive design.

## Project Overview

This repository houses a comprehensive application suite featuring:
1.  **Task Management Dashboard**: A real-time interface for managing tasks, teams, and projects.
2.  **Resume Parsing Engine**: An integrated utility leveraging AI for document analysis.

## Technology Architecture

### Backend (API Service)
*   **Runtime**: Node.js with Express.js
*   **Database**: MongoDB with Mongoose ODM
*   **Authentication**: JWT-based stateless authentication with secure cookie management
*   **Security**: Helmet for header security, Express Rate Limit for DDoS protection
*   **Validation**: Express Validator for strict input sanitization
*   **Logging**: Morgan for request monitoring

### Frontend (Client Application)
*   **Framework**: Next.js 15 (App Router) for server-side rendering
*   **Language**: TypeScript for static type checking
*   **Styling**: TailwindCSS for utility-first design
*   **State Management**: React Context API
*   **UI Components**: Radix UI primitives, Lucide React icons
*   **Interactivity**: Framer Motion for animations, Dnd-kit for accessible drag-and-drop

---

## Setup and Installation

### Prerequisites
*   Node.js v18 or later
*   MongoDB v6.0 or later (Local or Atlas)

### 1. Repository Setup
Clone the repository and navigate to the project root:

```bash
git clone https://github.com/YOUR_USERNAME/aps-resume-scanner.git
cd aps-resume-scanner
```

### 2. Setup and Run Backend (API)
Navigate to the backend service directory:

```bash
cd auth-dashboard-app/backend
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in the backend directory with the following configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/auth-dashboard
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

Start the API server:
```bash
npm run dev
```

### 3. Database Initialization
This project includes a seeding script to populate the database with demonstration data. Open a new terminal in the `backend` directory and run:

```bash
npm run seed
```
This will create Admin and Member users along with sample tasks and teams.

### 4. Setup and Run Frontend (Client)
Navigate to the frontend application directory:

```bash
cd auth-dashboard-app/frontend
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```
The application will be accessible at http://localhost:3000.

---

## Access & Registration

### Demo Credentials
After running the seed script, you may log in with the following credentials:

**Administrator Access**
*   Email: john@example.com
*   Password: Password123

**Standard User Access**
*   Email: jane@example.com
*   Password: Password123

### Create Your Own Account
You can also register a new account to test the full signup flow:
1.  Navigate to the login page (`http://localhost:3000/login`).
2.  Click the **"Sign Up"** link.
3.  Enter your details to create a personalized account.

---

## API Documentation

The backend API is fully documented via a Postman collection included in the repository. Provide this collection to consumers of the API for integration details.

**Location**: `auth-dashboard-app/TaskFlow-API.postman_collection.json`

---

## Production Readiness and Scaling

To transition this application to a high-load production environment, the following strategies are recommended:

1.  **Horizontal Scaling**: Containerize services using Docker and orchestrate with Kubernetes. This allows independent scaling of the stateless API layer based on CPU/Memory load.
2.  **Database Optimization**: Deploy MongoDB on a sharded cluster (e.g., MongoDB Atlas). Implement compound indexing on `userId`, `status`, and `createdAt` fields to optimize query performance.
3.  **Caching Layer**: Introduce Redis to cache session data and expensive read operations (such as user profiles or dashboard analytics), reducing direct database hits.
4.  **Load Balancing**: Utilize Nginx or AWS Application Load Balancer (ALB) to distribute incoming traffic evenly across backend instances and handle SSL termination.
5.  **CI/CD Automation**: Implement GitHub Actions pipelines for automated testing (Jest) and deployment verification to maintain code quality.
