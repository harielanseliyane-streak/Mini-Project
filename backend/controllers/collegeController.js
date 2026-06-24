// ─────────────────────────────────────────────────────────────
// College Controller (Prisma ORM – Supabase PostgreSQL)
// ─────────────────────────────────────────────────────────────
const prisma = require('../config/db');

// GET /api/colleges/profile
const getProfile = async (req, res) => {
  try {
    const college = await prisma.college.findUnique({
      where: { userId: req.user.id },
      include: {
        user: { select: { email: true, phone: true } },
        courses: true,
        events: { orderBy: { eventDate: 'asc' } },
        placements: { orderBy: { year: 'desc' } },
        scholarships: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!college) {
      return res.status(404).json({ success: false, message: 'College profile not found' });
    }

    const mappedCollege = {
      user_id: college.userId,
      college_name: college.collegeName,
      address: college.address,
      city: college.city,
      state: college.state,
      website: college.website,
      logo: college.logo,
      description: college.description,
      established: college.established,
      accreditation: college.accreditation,
      infrastructure: college.infrastructure,
      hostel_info: college.hostelInfo,
      fee_structure: college.feeStructure,
      email: college.user.email,
      phone: college.user.phone,
      courses: college.courses,
      events: college.events,
      placements: college.placements,
      scholarships: college.scholarships,
    };

    return res.json({ success: true, college: mappedCollege });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/colleges/profile
const updateProfile = async (req, res) => {
  try {
    const {
      phone,
      college_name,
      address,
      city,
      state,
      website,
      description,
      established,
      accreditation,
      infrastructure,
      hostel_info,
      fee_structure,
    } = req.body;

    await prisma.$transaction(async (tx) => {
      if (phone !== undefined) {
        await tx.user.update({
          where: { id: req.user.id },
          data: { phone },
        });
      }

      await tx.college.update({
        where: { userId: req.user.id },
        data: {
          collegeName:    college_name    !== undefined ? college_name    : undefined,
          address:        address         !== undefined ? address         : undefined,
          city:           city            !== undefined ? city            : undefined,
          state:          state           !== undefined ? state           : undefined,
          website:        website         !== undefined ? website         : undefined,
          description:    description     !== undefined ? description     : undefined,
          established:    established     !== undefined ? (established ? parseInt(established) : null) : undefined,
          accreditation:  accreditation   !== undefined ? accreditation   : undefined,
          infrastructure: infrastructure  !== undefined ? infrastructure  : undefined,
          hostelInfo:     hostel_info     !== undefined ? hostel_info     : undefined,
          feeStructure:   fee_structure   !== undefined ? fee_structure   : undefined,
        },
      });
    });

    return res.json({ success: true, message: 'Profile updated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/colleges/logo
const uploadLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const url = req.file.cloudinaryUrl; // Supabase public URL (backward-compat field)

    await prisma.college.update({
      where: { userId: req.user.id },
      data: { logo: url },
    });

    return res.json({ success: true, url });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/colleges/courses
const addCourse = async (req, res) => {
  try {
    const { course_name, cutoff, seats, duration, department, fee_per_year } = req.body;
    if (!course_name || cutoff === undefined) {
      return res.status(400).json({ success: false, message: 'course_name and cutoff are required' });
    }

    const course = await prisma.course.create({
      data: {
        collegeId:  req.user.id,
        courseName: course_name,
        cutoff:     parseFloat(cutoff),
        seats:      seats      ? parseInt(seats)              : null,
        duration:   duration   || null,
        department: department || null,
        feePerYear: fee_per_year ? parseFloat(fee_per_year)  : null,
      },
    });

    return res.status(201).json({ success: true, message: 'Course added', course_id: course.id });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/colleges/courses/:id
const updateCourse = async (req, res) => {
  try {
    const { course_name, cutoff, seats, duration, department, fee_per_year } = req.body;
    const courseId = parseInt(req.params.id);

    await prisma.course.updateMany({
      where: { id: courseId, collegeId: req.user.id },
      data: {
        courseName: course_name  !== undefined ? course_name  : undefined,
        cutoff:     cutoff       !== undefined ? parseFloat(cutoff) : undefined,
        seats:      seats        !== undefined ? (seats ? parseInt(seats) : null)   : undefined,
        duration:   duration     !== undefined ? duration     : undefined,
        department: department   !== undefined ? department   : undefined,
        feePerYear: fee_per_year !== undefined ? (fee_per_year ? parseFloat(fee_per_year) : null) : undefined,
      },
    });

    return res.json({ success: true, message: 'Course updated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/colleges/courses/:id
const deleteCourse = async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);

    await prisma.course.deleteMany({
      where: { id: courseId, collegeId: req.user.id },
    });

    return res.json({ success: true, message: 'Course deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/colleges/events
const createEvent = async (req, res) => {
  try {
    const { name, description, event_date, location, registration_deadline, max_participants } = req.body;
    if (!name || !event_date) {
      return res.status(400).json({ success: false, message: 'name and event_date are required' });
    }

    let poster_url = null;
    if (req.file) poster_url = req.file.cloudinaryUrl;

    const event = await prisma.event.create({
      data: {
        collegeId:            req.user.id,
        name,
        description:          description || null,
        eventDate:            new Date(event_date),
        location:             location || null,
        posterUrl:            poster_url,
        registrationDeadline: registration_deadline ? new Date(registration_deadline) : null,
        maxParticipants:      max_participants ? parseInt(max_participants) : null,
      },
    });

    return res.status(201).json({ success: true, message: 'Event created', event_id: event.id });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/colleges/placements
const addPlacement = async (req, res) => {
  try {
    const { year, highest_package, average_package, placement_percent, top_recruiters, description } = req.body;
    if (!year) return res.status(400).json({ success: false, message: 'Year is required' });

    const placement = await prisma.placementData.create({
      data: {
        collegeId:        req.user.id,
        year:             parseInt(year),
        highestPackage:   highest_package   ? parseFloat(highest_package)   : null,
        averagePackage:   average_package   ? parseFloat(average_package)   : null,
        placementPercent: placement_percent ? parseFloat(placement_percent) : null,
        topRecruiters:    top_recruiters    || null,
        description:      description       || null,
      },
    });

    return res.status(201).json({ success: true, message: 'Placement added', id: placement.id });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/colleges/scholarships
const addScholarship = async (req, res) => {
  try {
    const { name, description, amount, eligibility, deadline, type } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    const scholarship = await prisma.scholarship.create({
      data: {
        collegeId:   req.user.id,
        name,
        type:        type || 'private',
        description: description || null,
        amount:      amount   ? parseFloat(amount)  : null,
        eligibility: eligibility || null,
        deadline:    deadline ? new Date(deadline)  : null,
      },
    });

    return res.status(201).json({ success: true, message: 'Scholarship added', id: scholarship.id });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/colleges/applications
const getApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const pageNum  = parseInt(page);
    const limitNum = parseInt(limit);
    const offset   = (pageNum - 1) * limitNum;

    const where = { collegeId: req.user.id };
    if (status) where.status = status;

    const apps = await prisma.application.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
        course:     { select: { courseName: true } },
        event:      { select: { name: true } },
        internship: { select: { title: true } },
      },
      orderBy: { appliedAt: 'desc' },
      skip: offset,
      take: limitNum,
    });

    const mappedApps = apps.map((app) => ({
      id:               app.id,
      student_id:       app.studentId,
      student_name:     app.student.user.name,
      student_email:    app.student.user.email,
      student_phone:    app.student.user.phone,
      hsc_marks:        app.student.hscMarks,
      cutoff:           app.student.cutoff,
      course_name:      app.course      ? app.course.courseName    : null,
      event_name:       app.event       ? app.event.name           : null,
      internship_title: app.internship  ? app.internship.title     : null,
      type:             app.type,
      status:           app.status,
      message:          app.message,
      applied_at:       app.appliedAt,
    }));

    return res.json({ success: true, applications: mappedApps });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/colleges/applications/:id
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appId = parseInt(req.params.id);

    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const app = await prisma.application.updateMany({
      where: { id: appId, collegeId: req.user.id },
      data:  { status },
    });

    if (app.count === 0) {
      return res.status(404).json({ success: false, message: 'Application not found or unauthorized' });
    }

    return res.json({ success: true, message: `Application ${status}` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/colleges/posts  ← now uses Prisma Post model (no more raw SQL)
const createPost = async (req, res) => {
  try {
    const { type, title, description, media_type } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    let media_url = null;
    if (req.file) media_url = req.file.cloudinaryUrl;

    const post = await prisma.post.create({
      data: {
        collegeId:   req.user.id,
        type:        type       || 'general',
        title,
        description: description || null,
        mediaUrl:    media_url,
        mediaType:   media_type || 'none',
      },
    });

    return res.status(201).json({ success: true, message: 'Post created', post_id: post.id });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/colleges/posts/:id  ← now uses Prisma Post model
const deletePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    await prisma.post.deleteMany({
      where: { id: postId, collegeId: req.user.id },
    });

    return res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadLogo,
  addCourse,
  updateCourse,
  deleteCourse,
  createEvent,
  addPlacement,
  addScholarship,
  getApplications,
  updateApplicationStatus,
  createPost,
  deletePost,
};
