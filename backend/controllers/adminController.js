// ─────────────────────────────────────────────────────────────
// Admin Controller (Prisma ORM)
// ─────────────────────────────────────────────────────────────
const prisma = require('../config/db');
const bcrypt = require('bcryptjs');

// GET /api/admin/stats
const getAdminStats = async (req, res) => {
  try {
    const studentCount = await prisma.student.count();
    const collegeCount = await prisma.college.count();
    const applicationCount = await prisma.application.count();
    const eventCount = await prisma.event.count();
    const scholarshipCount = await prisma.scholarship.count();
    const internshipCount = await prisma.internship.count();

    return res.json({
      success: true,
      stats: {
        students: studentCount,
        colleges: collegeCount,
        applications: applicationCount,
        events: eventCount,
        scholarships: scholarshipCount,
        internships: internshipCount,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/students
const getStudentsList = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
      },
    });
    const mapped = students.map((s) => ({
      id: s.userId,
      name: s.user.name,
      email: s.user.email,
      phone: s.user.phone,
      cutoff: s.cutoff,
      hsc_marks: s.hscMarks,
    }));
    return res.json({ success: true, students: mapped });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/colleges
const getCollegesList = async (req, res) => {
  try {
    const colleges = await prisma.college.findMany({
      include: {
        user: { select: { email: true, phone: true } },
      },
    });
    const mapped = colleges.map((c) => ({
      id: c.userId,
      college_name: c.collegeName,
      email: c.user.email,
      phone: c.user.phone,
      city: c.city,
      established: c.established,
      accreditation: c.accreditation,
    }));
    return res.json({ success: true, colleges: mapped });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/broadcast
const broadcastNotification = async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) return res.status(400).json({ success: false, message: 'Title and message are required' });

    const users = await prisma.user.findMany({ select: { id: true } });
    const notificationsData = users.map((u) => ({
      userId: u.id,
      title,
      message,
    }));

    await prisma.notification.createMany({
      data: notificationsData,
    });

    return res.status(201).json({ success: true, message: 'Notification broadcasted to all users' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/reviews/:id
const deleteReview = async (req, res) => {
  try {
    await prisma.review.delete({
      where: { id: parseInt(req.params.id) },
    });
    return res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/colleges
const addCollegeByAdmin = async (req, res) => {
  try {
    const {
      email,
      password,
      college_name,
      phone,
      address,
      city,
      state,
      website,
      established,
      accreditation,
      description
    } = req.body;

    if (!email || !password || !college_name) {
      return res.status(400).json({ success: false, message: 'Email, password, and college name are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newCollege = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          role: 'college',
          name: college_name,
          email,
          passwordHash,
          phone: phone || null,
        },
      });

      await tx.college.create({
        data: {
          userId: user.id,
          collegeName: college_name,
          address: address || null,
          city: city || null,
          state: state || null,
          website: website || null,
          established: established ? parseInt(established) : null,
          accreditation: accreditation || null,
          description: description || null,
        },
      });
      
      return user;
    });

    return res.status(201).json({
      success: true,
      message: 'College created successfully',
      college: { id: newCollege.id, name: newCollege.name, email: newCollege.email }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAdminStats, getStudentsList, getCollegesList, broadcastNotification, deleteReview, addCollegeByAdmin };
