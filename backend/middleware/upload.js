// ─────────────────────────────────────────────────────────────
// Multer + Supabase Storage Upload Middleware
// Vercel-compatible: uses memoryStorage (no local disk writes)
// ─────────────────────────────────────────────────────────────
const multer    = require('multer');
const path      = require('path');
const { v4: uuidv4 } = require('uuid');
const supabase  = require('../config/supabase');
const { BUCKETS } = require('../config/cloudinary');

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

// ── Helper: upload buffer to Supabase Storage ────────────────
const uploadToSupabase = async (buffer, bucket, filename, mimetype) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filename, buffer, {
      contentType: mimetype,
      upsert: true,           // overwrite if same filename
    });

  if (error) throw new Error(`Supabase Storage upload failed: ${error.message}`);

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filename);

  return urlData.publicUrl;
};

/**
 * Middleware factory that:
 *  1. Runs multer (in-memory)
 *  2. Uploads req.file.buffer → Supabase Storage bucket
 *  3. Attaches req.file.cloudinaryUrl (the public URL) for backward compatibility
 *     with all existing controllers that read req.file.cloudinaryUrl
 */
const uploadAndStore = (fieldname) => [
  upload.single(fieldname),
  async (req, res, next) => {
    if (!req.file) return next();
    try {
      const bucket = BUCKETS[fieldname] || 'media';
      const ext    = path.extname(req.file.originalname).toLowerCase();
      const uniqueName = `${uuidv4()}${ext}`;

      const publicUrl = await uploadToSupabase(
        req.file.buffer,
        bucket,
        uniqueName,
        req.file.mimetype
      );

      // Attach to req.file for controllers — keeps backward compatibility
      req.file.cloudinaryUrl      = publicUrl;  // controllers read this field
      req.file.cloudinaryPublicId = uniqueName; // kept for compat
      req.file.filename           = publicUrl;

      next();
    } catch (err) {
      next(err);
    }
  },
];

// ── Export both the raw multer instance and the uploadAndStore factory ──
upload.uploadAndStore = uploadAndStore;

module.exports = upload;
