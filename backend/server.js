// ─────────────────────────────────────────────────────────────
// InfoHub Backend – Entry Point
// ─────────────────────────────────────────────────────────────
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const fs         = require('fs');

// ── Import Routes ──────────────────────────────────────────
const authRoutes         = require('./routes/auth');
const studentRoutes      = require('./routes/students');
const collegeRoutes      = require('./routes/colleges');
const applicationRoutes  = require('./routes/applications');
const chatbotRoutes      = require('./routes/chatbot');
const mediaRoutes        = require('./routes/media');
const adminRoutes        = require('./routes/admin');
const eventRoutes        = require('./routes/events');
const scholarshipRoutes  = require('./routes/scholarships');
const internshipRoutes   = require('./routes/internships');
const quizRoutes         = require('./routes/quizzes');
const savedItemsRoutes   = require('./routes/savedItems');
const reviewRoutes       = require('./routes/reviews');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Ensure uploads folder exists ───────────────────────────
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static – serve uploaded files ──────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Health Check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'InfoHub API is running', timestamp: new Date() });
});

// ── API Routes ──────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/students',      studentRoutes);
app.use('/api/colleges',      collegeRoutes);
app.use('/api/applications',  applicationRoutes);
app.use('/api/chatbot',       chatbotRoutes);
app.use('/api/media',         mediaRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/events',        eventRoutes);
app.use('/api/scholarships',  scholarshipRoutes);
app.use('/api/internships',   internshipRoutes);
app.use('/api/quizzes',       quizRoutes);
app.use('/api/saved-items',   savedItemsRoutes);
app.use('/api/colleges/:id/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);

// ── Global Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Global Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Start Server ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 InfoHub API running on http://localhost:${PORT}`);
  console.log(`📁 Uploads served at  http://localhost:${PORT}/uploads`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
