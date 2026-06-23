// ─────────────────────────────────────────────────────────────
// Scholarship Controller (Prisma ORM)
// ─────────────────────────────────────────────────────────────
const prisma = require('../config/db');

// GET /api/scholarships
const getScholarships = async (req, res) => {
  try {
    const { search, type } = req.query;
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { eligibility: { contains: search } },
      ];
    }
    if (type) {
      where.type = type;
    }

    const scholarships = await prisma.scholarship.findMany({
      where,
      include: {
        college: { select: { collegeName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = scholarships.map((s) => ({
      id: s.id,
      college_id: s.collegeId,
      college_name: s.college ? s.college.collegeName : 'Government / General',
      name: s.name,
      type: s.type,
      description: s.description,
      amount: s.amount,
      eligibility: s.eligibility,
      deadline: s.deadline,
    }));

    return res.json({ success: true, scholarships: mapped });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/scholarships/:id
const getScholarshipById = async (req, res) => {
  try {
    const s = await prisma.scholarship.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        college: { select: { collegeName: true } },
      },
    });

    if (!s) return res.status(404).json({ success: false, message: 'Scholarship not found' });

    const mapped = {
      id: s.id,
      college_id: s.collegeId,
      college_name: s.college ? s.college.collegeName : 'Government / General',
      name: s.name,
      type: s.type,
      description: s.description,
      amount: s.amount,
      eligibility: s.eligibility,
      deadline: s.deadline,
    };

    return res.json({ success: true, scholarship: mapped });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getScholarships, getScholarshipById };
