const router = require('express').Router();
const ctrl   = require('../controllers/collegeController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const pool   = require('../config/db');

// ═══════════════════════════════════════════════════════════
// PUBLIC routes — no auth required
// IMPORTANT: specific named routes must come BEFORE /:id wildcard
// ═══════════════════════════════════════════════════════════

// GET /api/colleges/list
router.get('/list', async (req, res) => {
  try {
    const [colleges] = await pool.query(
      `SELECT c.user_id AS id, c.college_name, c.city, c.state, c.logo, c.accreditation,
              c.description, u.email,
              (SELECT MIN(cr.cutoff) FROM courses cr WHERE cr.college_id = c.user_id) AS min_cutoff,
              (SELECT COUNT(*) FROM courses cr WHERE cr.college_id = c.user_id) AS course_count,
              (SELECT p.placement_percent FROM placements p WHERE p.college_id = c.user_id ORDER BY p.year DESC LIMIT 1) AS placement_percent
       FROM colleges c JOIN users u ON u.id = c.user_id ORDER BY c.college_name LIMIT 20`
    );
    return res.json({ success: true, colleges });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/colleges/search
router.get('/search', async (req, res) => {
  try {
    const { search, city, state, cutoff, page = 1, limit = 12 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = ['1=1'], params = [];
    if (search) { where.push('c.college_name LIKE ?'); params.push(`%${search}%`); }
    if (city)   { where.push('c.city = ?');  params.push(city); }
    if (state)  { where.push('c.state = ?'); params.push(state); }
    if (cutoff) {
      where.push('EXISTS (SELECT 1 FROM courses cr WHERE cr.college_id = c.user_id AND cr.cutoff <= ?)');
      params.push(parseFloat(cutoff));
    }
    const wc = where.join(' AND ');
    const [colleges] = await pool.query(
      `SELECT c.user_id AS id, c.college_name, c.city, c.state, c.logo, c.accreditation,
              c.description, u.email, u.phone,
              (SELECT MIN(cr.cutoff) FROM courses cr WHERE cr.college_id = c.user_id) AS min_cutoff,
              (SELECT COUNT(*) FROM courses cr WHERE cr.college_id = c.user_id) AS course_count,
              (SELECT p.placement_percent FROM placements p WHERE p.college_id = c.user_id ORDER BY p.year DESC LIMIT 1) AS placement_percent
       FROM colleges c JOIN users u ON u.id = c.user_id WHERE ${wc} ORDER BY c.college_name LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM colleges c JOIN users u ON u.id = c.user_id WHERE ${wc}`, params
    );
    return res.json({ success: true, colleges, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
});

// ═══════════════════════════════════════════════════════════
// PROTECTED routes — require auth
// Must be BEFORE /:id wildcard
// ═══════════════════════════════════════════════════════════
router.get('/profile',             authenticate, authorize('college'), ctrl.getProfile);
router.put('/profile',             authenticate, authorize('college'), ctrl.updateProfile);
router.post('/logo',               authenticate, authorize('college'), upload.uploadAndStore('logo'), ctrl.uploadLogo);
router.post('/courses',            authenticate, authorize('college'), ctrl.addCourse);
router.put('/courses/:id',         authenticate, authorize('college'), ctrl.updateCourse);
router.delete('/courses/:id',      authenticate, authorize('college'), ctrl.deleteCourse);
router.post('/posts',              authenticate, authorize('college'), upload.uploadAndStore('media'), ctrl.createPost);
router.delete('/posts/:id',        authenticate, authorize('college'), ctrl.deletePost);
router.post('/events',             authenticate, authorize('college'), upload.uploadAndStore('poster'), ctrl.createEvent);
router.post('/placements',         authenticate, authorize('college'), ctrl.addPlacement);
router.post('/scholarships',       authenticate, authorize('college'), ctrl.addScholarship);
router.get('/applications',        authenticate, authorize('college'), ctrl.getApplications);
router.patch('/applications/:id',  authenticate, authorize('college'), ctrl.updateApplicationStatus);

// ═══════════════════════════════════════════════════════════
// PUBLIC wildcard — must be LAST to avoid intercepting named routes
// ═══════════════════════════════════════════════════════════

// GET /api/colleges/:id — public college detail
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid college ID' });
    const [[college]] = await pool.query(
      'SELECT c.*, u.email, u.phone FROM colleges c JOIN users u ON u.id = c.user_id WHERE c.user_id = ?', [id]
    );
    if (!college) return res.status(404).json({ success: false, message: 'College not found' });
    const [courses]      = await pool.query('SELECT * FROM courses WHERE college_id = ? ORDER BY cutoff DESC', [id]);
    const [events]       = await pool.query('SELECT * FROM events WHERE college_id = ? ORDER BY event_date', [id]);
    const [posts]        = await pool.query('SELECT * FROM posts WHERE college_id = ? ORDER BY created_at DESC LIMIT 20', [id]);
    const [placements]   = await pool.query('SELECT * FROM placements WHERE college_id = ? ORDER BY year DESC', [id]);
    const [scholarships] = await pool.query('SELECT * FROM scholarships WHERE college_id = ?', [id]);
    return res.json({ success: true, college: { ...college, courses, events, posts, placements, scholarships } });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
