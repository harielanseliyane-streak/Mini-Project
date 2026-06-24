// ─────────────────────────────────────────────────────────────
// Multer + Cloudinary Upload Middleware
// Vercel-compatible: uses memoryStorage (no local disk writes)
// ─────────────────────────────────────────────────────────────
const multer     = require('multer');
const path       = require('path');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

// ── In-memory storage (Vercel filesystem is read-only) ───────
const storage = multer.memoryStorage();

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

// ── Multer instance ─────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 }, // 10MB
});

// ── Helper: upload buffer to Cloudinary ─────────────────────
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    Readable.from(buffer).pipe(stream);
  });
};

// ── Map fieldname → Cloudinary folder ───────────────────────
const folderMap = {
  profile_photo: 'infohub/profiles',
  logo:          'infohub/logos',
  media:         'infohub/media',
  poster:        'infohub/posters',
};

/**
 * Middleware factory that:
 *  1. Runs multer (in-memory)
 *  2. Uploads req.file.buffer → Cloudinary
 *  3. Attaches req.file.cloudinaryUrl & req.file.cloudinaryPublicId
 */
const uploadAndStore = (fieldname) => [
  upload.single(fieldname),
  async (req, res, next) => {
    if (!req.file) return next();
    try {
      const folder = folderMap[fieldname] || 'infohub/general';
      const ext    = path.extname(req.file.originalname).toLowerCase();
      const resourceType = ['.mp4', '.webm', '.mov', '.avi'].includes(ext) ? 'video' : 'image';

      const result = await uploadToCloudinary(req.file.buffer, {
        folder,
        resource_type: resourceType,
      });

      // Attach Cloudinary result to req.file so controllers can use it
      req.file.cloudinaryUrl      = result.secure_url;
      req.file.cloudinaryPublicId = result.public_id;
      req.file.filename           = result.secure_url; // backward-compat shim

      next();
    } catch (err) {
      next(err);
    }
  },
];

// ── Export both the raw multer instance (for manual use)
//    AND the uploadAndStore factory ──────────────────────────
upload.uploadAndStore = uploadAndStore;

module.exports = upload;
