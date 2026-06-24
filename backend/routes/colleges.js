// ─────────────────────────────────────────────────────────────
// College Routes – Supabase PostgreSQL (all raw SQL removed)
// ─────────────────────────────────────────────────────────────
const router = require('express').Router();
const ctrl   = require('../controllers/collegeController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const prisma = require('../config/db');

// ═══════════════════════════════════════════════════════════
// PUBLIC routes — no auth required
// IMPORTANT: specific named routes must come BEFORE /:id wildcard
// ═══════════════════════════════════════════════════════════

// GET /api/colleges/list
router.get('/list', async (req, res) => {
  try {
    const collegesRaw = await prisma.college.findMany({
      take: 20,
      orderBy: { collegeName: 'asc' },
      include: {
        user:       { select: { email: true } },
        courses:    { select: { cutoff: true } },
        placements: { orderBy: { year: 'desc' }, take: 1 },
      },
    });

    const colleges = collegesRaw.map((c) => ({
      id:               c.userId,
      college_name:     c.collegeName,
      city:             c.city,
      state:            c.state,
      logo:             c.logo,
      accreditation:    c.accreditation,
      description:      c.description,
      email:            c.user.email,
      min_cutoff:       c.courses.length > 0 ? Math.min(...c.courses.map((cr) => cr.cutoff)) : null,
      course_count:     c.courses.length,
      placement_percent: c.placements.length > 0 ? c.placements[0].placementPercent : null,
    }));

    return res.json({ success: true, colleges });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/colleges/search
router.get('/search', async (req, res) => {
  try {
    const { search, city, state, cutoff, page = 1, limit = 12 } = req.query;
    const pageNum  = parseInt(page);
    const limitNum = parseInt(limit);
    const offset   = (pageNum - 1) * limitNum;

    // Build Prisma where clause
    const where = {};
    if (search) {
      where.collegeName = { contains: search, mode: 'insensitive' };
    }
    if (city)  where.city  = city;
    if (state) where.state = state;
    if (cutoff) {
      where.courses = {
        some: { cutoff: { lte: parseFloat(cutoff) } },
      };
    }

    const [collegesRaw, total] = await Promise.all([
      prisma.college.findMany({
        where,
        orderBy: { collegeName: 'asc' },
        skip: offset,
        take: limitNum,
        include: {
          user:       { select: { email: true, phone: true } },
          courses:    { select: { cutoff: true } },
          placements: { orderBy: { year: 'desc' }, take: 1 },
        },
      }),
      prisma.college.count({ where }),
    ]);

    const colleges = collegesRaw.map((c) => ({
      id:               c.userId,
      college_name:     c.collegeName,
      city:             c.city,
      state:            c.state,
      logo:             c.logo,
      accreditation:    c.accreditation,
      description:      c.description,
      email:            c.user.email,
      phone:            c.user.phone,
      min_cutoff:       c.courses.length > 0 ? Math.min(...c.courses.map((cr) => cr.cutoff)) : null,
      course_count:     c.courses.length,
      placement_percent: c.placements.length > 0 ? c.placements[0].placementPercent : null,
    }));

    return res.json({
      success: true,
      colleges,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
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

    const collegeRaw = await prisma.college.findUnique({
      where: { userId: id },
      include: {
        user:        { select: { email: true, phone: true } },
        courses:     { orderBy: { cutoff: 'desc' } },
        events:      { orderBy: { eventDate: 'asc' } },
        posts:       { orderBy: { createdAt: 'desc' }, take: 20 },
        placements:  { orderBy: { year: 'desc' } },
        scholarships: {},
      },
    });

    if (!collegeRaw) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }

    const college = {
      user_id:       collegeRaw.userId,
      college_name:  collegeRaw.collegeName,
      address:       collegeRaw.address,
      city:          collegeRaw.city,
      state:         collegeRaw.state,
      website:       collegeRaw.website,
      logo:          collegeRaw.logo,
      description:   collegeRaw.description,
      established:   collegeRaw.established,
      accreditation: collegeRaw.accreditation,
      infrastructure: collegeRaw.infrastructure,
      hostel_info:   collegeRaw.hostelInfo,
      fee_structure: collegeRaw.feeStructure,
      email:         collegeRaw.user.email,
      phone:         collegeRaw.user.phone,
      courses:       collegeRaw.courses.map((cr) => ({
        id:           cr.id,
        course_name:  cr.courseName,
        cutoff:       cr.cutoff,
        seats:        cr.seats,
        duration:     cr.duration,
        department:   cr.department,
        fee_per_year: cr.feePerYear,
        created_at:   cr.createdAt,
      })),
      events: collegeRaw.events.map((e) => ({
        id:                    e.id,
        name:                  e.name,
        description:           e.description,
        event_date:            e.eventDate,
        location:              e.location,
        poster_url:            e.posterUrl,
        registration_deadline: e.registrationDeadline,
        max_participants:      e.maxParticipants,
        created_at:            e.createdAt,
      })),
      posts: collegeRaw.posts.map((p) => ({
        id:          p.id,
        type:        p.type,
        title:       p.title,
        description: p.description,
        media_url:   p.mediaUrl,
        media_type:  p.mediaType,
        created_at:  p.createdAt,
      })),
      placements: collegeRaw.placements.map((p) => ({
        id:                p.id,
        year:              p.year,
        highest_package:   p.highestPackage,
        average_package:   p.averagePackage,
        placement_percent: p.placementPercent,
        top_recruiters:    p.topRecruiters,
        description:       p.description,
      })),
      scholarships: collegeRaw.scholarships.map((s) => ({
        id:          s.id,
        name:        s.name,
        description: s.description,
        amount:      s.amount,
        eligibility: s.eligibility,
        deadline:    s.deadline,
      })),
    };

    return res.json({ success: true, college });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
