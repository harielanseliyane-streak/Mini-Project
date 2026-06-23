// ─────────────────────────────────────────────────────────────
// Application Controller (Prisma ORM)
// ─────────────────────────────────────────────────────────────
const prisma = require('../config/db');

// POST /api/applications
const applyToCollege = async (req, res) => {
  try {
    const { college_id, course_id, type = 'admission', event_id, internship_id, message } = req.body;
    const collegeId = parseInt(college_id);
    const courseId = course_id ? parseInt(course_id) : null;
    const eventId = event_id ? parseInt(event_id) : null;
    const internshipId = internship_id ? parseInt(internship_id) : null;

    if (!collegeId) {
      return res.status(400).json({ success: false, message: 'college_id is required' });
    }

    // Check duplicate
    const existing = await prisma.application.findFirst({
      where: {
        studentId: req.user.id,
        collegeId,
        type,
        courseId,
        eventId,
        internshipId,
      },
    });

    if (existing) {
      return res.status(409).json({ success: false, message: 'Already applied' });
    }

    const application = await prisma.application.create({
      data: {
        studentId: req.user.id,
        collegeId,
        courseId,
        type,
        eventId,
        internshipId,
        message: message || null,
      },
    });

    // Create a notification for the college
    await prisma.notification.create({
      data: {
        userId: collegeId,
        title: 'New Application Received',
        message: `A student has submitted a new ${type === 'admission' ? 'admission' : type} request.`,
      },
    });

    return res.status(201).json({ success: true, message: 'Application submitted', application_id: application.id });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/applications/my
const getMyApplications = async (req, res) => {
  try {
    const apps = await prisma.application.findMany({
      where: { studentId: req.user.id },
      include: {
        college: { select: { collegeName: true, city: true } },
        course: { select: { courseName: true } },
        event: { select: { name: true } },
        internship: { select: { title: true } },
      },
      orderBy: { appliedAt: 'desc' },
    });

    const mappedApps = apps.map((app) => ({
      id: app.id,
      college_id: app.collegeId,
      college_name: app.college.collegeName,
      city: app.college.city,
      course_name: app.course ? app.course.courseName : null,
      event_name: app.event ? app.event.name : null,
      internship_title: app.internship ? app.internship.title : null,
      type: app.type,
      status: app.status,
      applied_at: app.appliedAt,
    }));

    return res.json({ success: true, applications: mappedApps });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { applyToCollege, getMyApplications };
