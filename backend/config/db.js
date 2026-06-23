// ─────────────────────────────────────────────────────────────
// Prisma Client Instance
// ─────────────────────────────────────────────────────────────
const { PrismaClient } = require('@prisma/client');
const mysql = require('mysql2/promise');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Create a mysql2 connection pool for files that still use raw SQL queries (like routes/colleges.js)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'infohub',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Attach raw pool methods to prisma object to support both Prisma and raw pool.query calls
prisma.query = (...args) => pool.query(...args);
prisma.execute = (...args) => pool.execute(...args);
prisma.pool = pool;

module.exports = prisma;
