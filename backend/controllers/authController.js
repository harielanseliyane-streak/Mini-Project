// ─────────────────────────────────────────────────────────────
// Auth Controller – Register & Login (Prisma ORM)
// ─────────────────────────────────────────────────────────────
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const prisma = require('../config/db');

// ── Generate JWT ────────────────────────────────────────────
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ── POST /api/auth/register ─────────────────────────────────
const register = async (req, res) => {
  try {
    const { role, name, email, password, phone, college_name, address, city, state, website } = req.body;

    // Validation
    if (!role || !['student', 'college', 'admin'].includes(role))
      return res.status(400).json({ success: false, message: 'Role must be student, college, or admin' });
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    // Check existing email
    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing)
      return res.status(409).json({ success: false, message: 'Email already registered' });

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const displayName = role === 'college' ? (college_name || name) : name;

    // Transaction for User and Role details creation
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          role,
          name: displayName,
          email,
          passwordHash,
          phone: phone || null,
        },
      });

      if (role === 'student') {
        await tx.student.create({
          data: {
            userId: user.id,
          },
        });
      } else if (role === 'college') {
        await tx.college.create({
          data: {
            userId: user.id,
            collegeName: displayName,
            address: address || null,
            city: city || null,
            state: state || null,
            website: website || null,
          },
        });
      }
      return user;
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: { id: newUser.id, role: newUser.role, name: newUser.name, email: newUser.email, phone: newUser.phone },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Registration failed', error: err.message });
  }
};

// ── POST /api/auth/login ────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });

    // Fetch user
    const user = await prisma.user.findFirst({
      where: {
        email,
        ...(role && { role }),
      },
    });

    if (!user)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user.id, role: user.role, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Login failed', error: err.message });
  }
};

// ── GET /api/auth/me ────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        role: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    return res.json({ success: true, user });
  } catch (err) {
    console.error('GetMe error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getMe };
