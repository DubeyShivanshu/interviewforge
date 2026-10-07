# 🎯 interviewforge — AI-Powered Interview Preparation Platform

> Generate personalized interview reports, skill gap analyses, preparation roadmaps, and AI-tailored resumes based on your profile and target job description.

---

## 📸 Overview

interviewforge is a full-stack GenAI application that analyzes a candidate's resume, self-description, and job description to produce a comprehensive interview preparation report — including technical questions, behavioral questions, skill gaps, a day-wise preparation plan, and an AI-generated resume PDF.

---

## 🏗️ Architecture

```
interviewforge/
├── frontend/                          # React + Vite SPA
│   ├── public/
│   └── src/
│       ├── features/
│       │   ├── auth/                  # Authentication feature
│       │   │   ├── components/
│       │   │   │   └── Protected.jsx  # Route guard component
│       │   │   ├── context/
│       │   │   │   ├── auth.context.jsx    # React context
│       │   │   │   └── auth.provider.jsx   # Auth state + getMe on mount
│       │   │   ├── hooks/
│       │   │   │   └── useAuth.js     # Login, register, logout hooks
│       │   │   ├── pages/
│       │   │   │   ├── login.jsx
│       │   │   │   └── register.jsx
│       │   │   ├── services/
│       │   │   │   └── auth.api.js    # Axios calls to auth endpoints
│       │   │   └── auth.form.scss
│       │   └── interview/             # Interview feature
│       │       ├── hooks/
│       │       │   └── useInterview.js     # generateReport, getReportById, getResumePdf
│       │       ├── pages/
│       │       │   ├── Home.jsx            # Input form + recent reports
│       │       │   └── Interview.jsx       # Report viewer (accordion, score ring)
│       │       ├── services/
│       │       │   └── interview.api.js    # Axios calls to interview endpoints
│       │       ├── style/
│       │       │   ├── home.scss
│       │       │   └── interview.scss
│       │       └── interview.context.jsx   # Interview state context + provider
│       ├── App.jsx                    # Root component with providers
│       └── app.routes.jsx             # React Router v6 routes
│
└── backend/                           # Node.js + Express REST API
    └── src/
        ├── config/
        │   └── database.js            # MongoDB Atlas connection
        ├── controllers/
        │   ├── auth.controller.js     # Register, login, logout, getMe
        │   └── interview.controller.js # Generate report, get report, PDF
        ├── middlewares/
        │   ├── auth.middleware.js     # JWT verification middleware
        │   └── file.middleware.js     # Multer config for PDF upload
        ├── models/
        │   ├── user.model.js          # User schema
        │   ├── interviewReport.model.js # Report schema (questions, gaps, plan)
        │   └── blacklist.model.js     # JWT blacklist for logout
        ├── routes/
        │   ├── auth.routes.js         # /api/auth/*
        │   └── interview.routes.js    # /api/interview/*
        ├── services/
        │   ├── ai.service.js          # Gemini AI + Puppeteer PDF generation
        │   └── temp.js
        ├── app.js                     # Express app setup
        └── server.js                  # Entry point
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool and dev server |
| React Router v6 | Client-side routing |
| Axios | HTTP requests with interceptors |
| SCSS (Sass) | Styling with variables and nesting |
| Context API | Global state (auth + interview) |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB Atlas | Cloud database |
| Mongoose | ODM for MongoDB |
| JWT | Stateless authentication |
| Bcrypt | Password hashing |
| Multer | Resume PDF file upload |
| pdf-parse | Extract text from uploaded PDF |
| @google/genai | Gemini 2.0 Flash AI model |
| Puppeteer | Headless Chrome for PDF generation |

---

## ✨ Features

- **🔐 Authentication** — Register, login, logout with JWT. Protected routes on both frontend and backend.
- **📄 Resume Upload** — Upload a PDF resume; text is extracted and sent to the AI.
- **🤖 AI Interview Report** — Generates using Gemini 2.0 Flash:
  - Match Score (0–100)
  - 5 Technical Questions with intention and model answer
  - 4 Behavioral Questions with STAR method answers
  - 4 Skill Gaps with severity (low / medium / high)
  - 5-Day Preparation Plan with daily tasks
- **📊 Report Viewer** — Interactive accordion UI with score ring, skill gap tags, and easy navigation.
- **📑 AI Resume PDF** — Generates a tailored, ATS-friendly, single-page resume PDF strictly formatted via Puppeteer and custom CSS injection.
- **📋 Recent Reports** — Home page lists all previously generated reports.

---

## 🔌 API Reference

### Auth Routes — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | ❌ | Create new user account |
| POST | `/login` | ❌ | Login and receive JWT token |
| POST | `/logout` | ✅ | Blacklist current token |
| GET | `/get-me` | ✅ | Get current user profile |

### Interview Routes — `/api/interview`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | ✅ | Generate new interview report (multipart/form-data) |
| GET | `/` | ✅ | Get all reports for current user |
| GET | `/report/:id` | ✅ | Get single report by ID |
| POST | `/resume/pdf/:id` | ✅ | Generate and download AI resume PDF |

---

## ⚙️ Environment Variables

### Backend `.env`
```env
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/interviewai
JWT_SECRET=your_jwt_secret_key
GOOGLE_GENAI_API_KEY=your_gemini_api_key
```

### Frontend `.env`
```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js v18+
- npm or yarn
- MongoDB Atlas account
- Google AI Studio API key (Gemini)

### 1. Clone the repository
```bash
git clone 
cd interviewforge
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm run dev            # starts on http://localhost:3000
```

### 3. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env   # fill in your values
npm run dev            # starts on http://localhost:5173
```

---

## 🗺️ Data Flow

```
User fills form (job desc + resume PDF + self desc)
        ↓
Frontend sends multipart/form-data to POST /api/interview
        ↓
Multer middleware receives the PDF file
        ↓
pdf-parse extracts text from the PDF buffer
        ↓
ai.service.js sends prompt to Gemini 2.0 Flash
        ↓
Gemini returns structured JSON (matchScore, questions, gaps, plan)
        ↓
Report saved to MongoDB via Mongoose
        ↓
Response sent back to frontend
        ↓
Frontend navigates to /interview/:id
        ↓
Interview.jsx fetches report by ID and renders accordion UI
```

---

## 🔒 Security & Architecture Robustness

- Passwords hashed with **bcrypt** (salt rounds: 10).
- **JWT tokens** stored in HTTP-only cookies (or localStorage), attached via Axios request interceptors.
- **Global Error Handling & Interceptors** — Automatic redirects on 401 Unauthorized errors for expired sessions.
- **TTL Indexes** — Logged-out tokens stored in a **blacklist collection** with an automatic 1-hour TTL sweep to prevent DB bloat.
- **Strict Data Integrity** — Mongoose Schema validation strictly enforces email regex formats and password lengths before database hits.
- **File Security** — Uploads are strictly validated by **Multer** server-side, immediately rejecting any non-PDF mimetypes.
- **Graceful Failures** — API utilizes exponential backoff/retry logic to handle AI usage spikes, and the Express server prevents "zombie" startups if MongoDB fails to connect.
---

## 📁 Key Files Explained

| File | Purpose |
|---|---|
| `ai.service.js` | Core AI logic — prompt engineering for Gemini, Puppeteer PDF generation |
| `auth.provider.jsx` | Checks if user is already logged in on every app mount via `getMe` |
| `useInterview.js` | All interview actions — generate, fetch, download PDF |
| `interview.context.jsx` | Global state for `report`, `reports`, `loading` |
| `Protected.jsx` | Redirects to `/login` if user is not authenticated |
| `app.routes.jsx` | All frontend routes with protection and catch-all redirects |

---

## 👤 Author

**Shivanshu Dubey**
- GitHub: [@shivanshu](https://github.com/DubeyShivanshu/)
- Email: shivanshu17103@gmail.com
- LinkedIn: [linkedin.com/in/shivanshu](https://www.linkedin.com/in/shivanshu-dubey-63949823b/)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
