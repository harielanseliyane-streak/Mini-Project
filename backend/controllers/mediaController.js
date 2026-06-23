// ─────────────────────────────────────────────────────────────
// Media Upload Controller
// ─────────────────────────────────────────────────────────────
const path = require('path');

// POST /api/media/upload
const uploadMedia = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const ext = path.extname(req.file.originalname).toLowerCase();
    const mediaType = ['.mp4','.webm','.mov','.avi'].includes(ext) ? 'video' : 'image';
    const url = `${req.protocol}://${req.get('host')}/uploads/media/${req.file.filename}`;
    return res.json({ success: true, url, filename: req.file.filename, mediaType });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { uploadMedia };
