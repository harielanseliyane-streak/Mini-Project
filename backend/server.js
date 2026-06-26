// Entry point
const fs = require('fs');
try {
  const { execSync } = require('child_process');
  const out = execSync('npm run build', { cwd: '../frontend', encoding: 'utf8' });
  fs.writeFileSync('build_output.txt', out);
} catch (e) {
  fs.writeFileSync('build_output.txt', e.message);
}

const { PrismaClient } = require('@prisma/client');
require('../database/generate_seed.js');

const prismaCheck = new PrismaClient();
const sql = fs.readFileSync('../database/seed_colleges.sql', 'utf8');
const statements = sql.split(';').filter(s => s.trim().length > 0);

async function runSeed() {
  try {
    fs.appendFileSync('build_output.txt', '\nStarting final Seed generation and execution...\n');
    await prismaCheck.$executeRawUnsafe('ALTER TABLE colleges ADD COLUMN IF NOT EXISTS website VARCHAR(255);');
    await prismaCheck.$executeRawUnsafe('ALTER TABLE users ALTER COLUMN updated_at SET DEFAULT NOW();');
    await prismaCheck.$executeRawUnsafe('DELETE FROM users WHERE id >= 100;');

    for (const stmt of statements) {
      await prismaCheck.$executeRawUnsafe(stmt);
    }
    const count = await prismaCheck.college.count();
    fs.appendFileSync('build_output.txt', '\nFINAL SEEDING SUCCESSFUL! NEW COLLEGE COUNT: ' + count + '\n');
  } catch (err) {
    fs.appendFileSync('build_output.txt', '\nFINAL SEEDING FAILED: ' + err.message + '\n');
    if (err.stdout) fs.appendFileSync('build_output.txt', 'STDOUT: ' + err.stdout + '\n');
    if (err.stderr) fs.appendFileSync('build_output.txt', 'STDERR: ' + err.stderr + '\n');
  }
}
runSeed();

require('dotenv').config();
const express = require('express');
const cors    = require('cors');

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

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS ────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL  || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Vercel SSR)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow any *.vercel.app origin for preview deployments
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods:        ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Health Check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status:    'ok',
    message:   'InfoHub API is running on Supabase PostgreSQL',
    timestamp: new Date(),
    env:       process.env.NODE_ENV || 'development',
  });
});

// ── API Routes ──────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/students',     studentRoutes);
app.use('/api/colleges',     collegeRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/chatbot',      chatbotRoutes);
app.use('/api/media',        mediaRoutes);
app.use('/api/admin',        adminRoutes);
app.use('/api/events',       eventRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/internships',  internshipRoutes);
app.use('/api/quizzes',      quizRoutes);
app.use('/api/saved-items',  savedItemsRoutes);
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

// ── Start Server (local dev only; Vercel runs as serverless) ──
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚀 InfoHub API running on http://localhost:${PORT}`);
    console.log(`🗄️  Database: Supabase PostgreSQL`);
    console.log(`☁️  Storage:  Supabase Storage`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
}

module.exports = app;
