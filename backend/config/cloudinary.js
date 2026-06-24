// ─────────────────────────────────────────────────────────────
// Supabase Storage Configuration
// This file replaces the old cloudinary.js
// Bucket names mirror the old Cloudinary folder structure
// ─────────────────────────────────────────────────────────────

const BUCKETS = {
  profile_photo: 'profiles',
  logo:          'logos',
  media:         'media',
  poster:        'posters',
};

module.exports = { BUCKETS };
