// ─────────────────────────────────────────────────────────────
// Multer File Upload Middleware
// ─────────────────────────────────────────────────────────────
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// Ensure sub-directories exist
const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };

// ── Storage engine ──────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'general';
    if (file.fieldname === 'profile_photo') folder = 'profiles';
    else if (file.fieldname === 'logo')     folder = 'logos';
    else if (file.fieldname === 'media')    folder = 'media';
    else if (file.fieldname === 'poster')   folder = 'posters';

    const uploadPath = path.join(__dirname, '..', 'uploads', folder);
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// ── File filter ─────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedImages = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const allowedVideos = ['.mp4', '.webm', '.mov', '.avi'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowed = [...allowedImages, ...allowedVideos];

  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${ext} not allowed. Accepted: ${allowed.join(', ')}`), false);
  }
};

// ── Multer instances ────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 }, // 10MB
});

module.exports = upload;
