const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authController = require('./controllers/authController');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Auth Routes
const authRouter = express.Router();
authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.get('/me', authController.getMe);

app.use('/api/auth', authRouter);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend server running smoothly' });
});

// Root Route
app.get('/', (req, res) => {
  res.send('InfoHub API Server Operating System');
});

// 404 Fallback Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API Route Not Found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 InfoHub Backend Server running on port ${PORT}`);
});
