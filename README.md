# InfoHub – Smart Student & College Connectivity Platform

A full-stack web application connecting 12th-grade students with colleges using AI-powered recommendations.

## Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + React Router v6
- **Backend**: Node.js + Express.js (MVC)
- **Database**: MySQL
- **Auth**: JWT + bcryptjs
- **AI**: Google Gemini / OpenAI (optional)

---

## Quick Start

### Prerequisites
- Node.js v18+
- MySQL 8.0+

### 1. Database Setup
```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend Setup
```bash
cd backend
npm install
# Edit .env — set DB_PASSWORD to your MySQL password
# Optionally add GEMINI_API_KEY or OPENAI_API_KEY
npm run dev
# Runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## Default Credentials (seed data)
| Role    | Email                    | Password    |
|---------|--------------------------|-------------|
| College | admin@annauniv.edu       | college123  |
| College | admin@psgtech.ac.in      | college123  |
| College | admin@citcbe.com         | college123  |

Register new student/college accounts via `/register`.

---

## API Endpoints

| Method | Endpoint                        | Description                |
|--------|---------------------------------|----------------------------|
| POST   | /api/auth/register              | Register student/college   |
| POST   | /api/auth/login                 | Login                      |
| GET    | /api/auth/me                    | Get current user           |
| GET    | /api/students/profile           | Student profile            |
| PUT    | /api/students/profile           | Update profile             |
| POST   | /api/students/profile/photo     | Upload profile photo       |
| GET    | /api/students/colleges          | List/filter colleges       |
| GET    | /api/students/colleges/:id      | College detail             |
| GET    | /api/students/recommendations   | AI-matched colleges        |
| GET    | /api/colleges/profile           | College profile            |
| PUT    | /api/colleges/profile           | Update college             |
| POST   | /api/colleges/courses           | Add course                 |
| POST   | /api/colleges/posts             | Create post                |
| POST   | /api/colleges/events            | Create event               |
| POST   | /api/colleges/placements        | Add placement record       |
| POST   | /api/colleges/scholarships      | Add scholarship            |
| GET    | /api/colleges/applications      | View applications          |
| PATCH  | /api/colleges/applications/:id  | Accept/Reject application  |
| POST   | /api/applications               | Student applies            |
| GET    | /api/applications/my            | Student's applications     |
| POST   | /api/chatbot/message            | AI chatbot message         |
| POST   | /api/media/upload               | Upload file                |

---

## Project Structure
```
Mini Project/
├── database/schema.sql
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   └── .env
└── frontend/
    └── src/
        ├── api/
        ├── components/
        ├── context/
        └── pages/
```

---

## AI Chatbot Setup
Add your API key to `backend/.env`:
```
GEMINI_API_KEY=your_gemini_key_here
# or
OPENAI_API_KEY=your_openai_key_here
```
Without a key, the chatbot uses a rule-based fallback system.
