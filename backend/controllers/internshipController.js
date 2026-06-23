// ─────────────────────────────────────────────────────────────
// Internship Controller (Prisma ORM)
// ─────────────────────────────────────────────────────────────
const prisma = require('../config/db');

// GET /api/internships
const getInternships = async (req, res) => {
  try {
    const { search } = req.query;
    const where = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { companyName: { contains: search } },
        { description: { contains: search } },
        { skillsRequired: { contains: search } },
      ];
    }

    const internships = await prisma.internship.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const mapped = internships.map((i) => ({
      id: i.id,
      company_name: i.companyName,
      title: i.title,
      description: i.description,
      stipend: i.stipend,
      duration: i.duration,
      location: i.location,
      eligibility: i.eligibility,
      skills_required: i.skillsRequired,
      deadline: i.deadline,
    }));

    return res.json({ success: true, internships: mapped });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/internships/:id
const getInternshipById = async (req, res) => {
  try {
    const i = await prisma.internship.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!i) return res.status(404).json({ success: false, message: 'Internship not found' });

    const mapped = {
      id: i.id,
      company_name: i.companyName,
      title: i.title,
      description: i.description,
      stipend: i.stipend,
      duration: i.duration,
      location: i.location,
      eligibility: i.eligibility,
      skills_required: i.skillsRequired,
      deadline: i.deadline,
    };

    return res.json({ success: true, internship: mapped });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/internships
const createInternship = async (req, res) => {
  try {
    const { company_name, title, description, stipend, duration, location, eligibility, skills_required, deadline } = req.body;
    if (!company_name || !title) return res.status(400).json({ success: false, message: 'Company name and title are required' });

    const internship = await prisma.internship.create({
      data: {
        companyName: company_name,
        title,
        description: description || null,
        stipend: stipend ? parseFloat(stipend) : null,
        duration: duration || null,
        location: location || null,
        eligibility: eligibility || null,
        skillsRequired: skills_required || null,
        deadline: deadline ? new Date(deadline) : null,
      },
    });

    return res.status(201).json({ success: true, message: 'Internship posted successfully', internship });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getInternships, getInternshipById, createInternship };
