// ─────────────────────────────────────────────────────────────
// Student Controller (Prisma ORM)
// ─────────────────────────────────────────────────────────────
const prisma = require('../config/db');

// GET /api/students/profile
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        student: true,
      },
    });

    if (!user || !user.student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const student = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      created_at: user.createdAt,
      hsc_marks: user.student.hscMarks,
      cutoff: user.student.cutoff,
      bio: user.student.bio,
      profile_photo: user.student.profilePhoto,
      interests: user.student.interests,
      skills: user.student.skills,
      career_goals: user.student.careerGoals,
      location_pref: user.student.locationPref,
      budget_pref: user.student.budgetPref,
      course_pref: user.student.coursePref,
    };

    if (student.profile_photo) {
      // profile_photo now stores the full Cloudinary URL
      student.profile_photo_url = student.profile_photo.startsWith('http')
        ? student.profile_photo
        : `${req.protocol}://${req.get('host')}/uploads/profiles/${student.profile_photo}`;
    }

    return res.json({ success: true, student });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/students/profile
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      hsc_marks,
      cutoff,
      bio,
      interests,
      skills,
      career_goals,
      location_pref,
      budget_pref,
      course_pref
    } = req.body;

    await prisma.$transaction(async (tx) => {
      // Update User fields
      await tx.user.update({
        where: { id: req.user.id },
        data: {
          name: name !== undefined ? name : undefined,
          phone: phone !== undefined ? phone : undefined,
        },
      });

      // Update Student fields
      await tx.student.update({
        where: { userId: req.user.id },
        data: {
          hscMarks: hsc_marks !== undefined ? (hsc_marks ? parseFloat(hsc_marks) : null) : undefined,
          cutoff: cutoff !== undefined ? (cutoff ? parseFloat(cutoff) : null) : undefined,
          bio: bio !== undefined ? bio : undefined,
          interests: interests !== undefined ? interests : undefined,
          skills: skills !== undefined ? skills : undefined,
          careerGoals: career_goals !== undefined ? career_goals : undefined,
          locationPref: location_pref !== undefined ? location_pref : undefined,
          budgetPref: budget_pref !== undefined ? (budget_pref ? parseFloat(budget_pref) : null) : undefined,
          coursePref: course_pref !== undefined ? course_pref : undefined,
        },
      });
    });

    return res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/students/profile/photo
const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const url = req.file.cloudinaryUrl;

    await prisma.student.update({
      where: { userId: req.user.id },
      data: {
        profilePhoto: url,
      },
    });

    return res.json({ success: true, message: 'Photo uploaded', url });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/students/colleges
const getColleges = async (req, res) => {
  try {
    const { search, city, state, cutoff, page = 1, limit = 12 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const where = {};
    if (search) {
      where.collegeName = { contains: search };
    }
    if (city) {
      where.city = city;
    }
    if (state) {
      where.state = state;
    }
    if (cutoff) {
      where.courses = {
        some: {
          cutoff: { lte: parseFloat(cutoff) },
        },
      };
    }

    const collegesRaw = await prisma.college.findMany({
      where,
      include: {
        user: {
          select: { email: true, phone: true },
        },
        courses: {
          select: { cutoff: true },
        },
        placements: {
          orderBy: { year: 'desc' },
          take: 1,
        },
      },
      orderBy: { collegeName: 'asc' },
      skip: offset,
      take: limitNum,
    });

    const total = await prisma.college.count({ where });

    const colleges = collegesRaw.map((c) => {
      const minCutoff = c.courses.length > 0 ? Math.min(...c.courses.map((co) => co.cutoff)) : null;
      const placementPercent = c.placements.length > 0 ? c.placements[0].placementPercent : null;
      return {
        id: c.userId,
        college_name: c.collegeName,
        city: c.city,
        state: c.state,
        website: c.website,
        logo: c.logo,
        description: c.description,
        accreditation: c.accreditation,
        email: c.user.email,
        phone: c.user.phone,
        course_count: c.courses.length,
        min_cutoff: minCutoff,
        placement_percent: placementPercent,
      };
    });

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
};

// GET /api/students/colleges/:id
const getCollegeById = async (req, res) => {
  try {
    const { id } = req.params;
    const collegeId = parseInt(id);

    const collegeRaw = await prisma.college.findUnique({
      where: { userId: collegeId },
      include: {
        user: { select: { email: true, phone: true } },
        courses: { orderBy: { cutoff: 'desc' } },
        events: { orderBy: { eventDate: 'asc' } },
        placements: { orderBy: { year: 'desc' } },
        scholarships: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!collegeRaw) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }

    const reviews = await prisma.review.findMany({
      where: { collegeId },
      include: {
        student: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const ratingsAvg = await prisma.rating.aggregate({
      where: { collegeId },
      _avg: { score: true },
    });

    const college = {
      user_id: collegeRaw.userId,
      college_name: collegeRaw.collegeName,
      address: collegeRaw.address,
      city: collegeRaw.city,
      state: collegeRaw.state,
      website: collegeRaw.website,
      logo: collegeRaw.logo,
      description: collegeRaw.description,
      established: collegeRaw.established,
      accreditation: collegeRaw.accreditation,
      infrastructure: collegeRaw.infrastructure,
      hostel_info: collegeRaw.hostelInfo,
      fee_structure: collegeRaw.feeStructure,
      email: collegeRaw.user.email,
      phone: collegeRaw.user.phone,
      courses: collegeRaw.courses.map((cr) => ({
        id: cr.id,
        course_name: cr.courseName,
        cutoff: cr.cutoff,
        seats: cr.seats,
        duration: cr.duration,
        department: cr.department,
        fee_per_year: cr.feePerYear,
      })),
      events: collegeRaw.events.map((e) => ({
        id: e.id,
        name: e.name,
        description: e.description,
        event_date: e.eventDate,
        location: e.location,
        poster_url: e.posterUrl,
        max_participants: e.maxParticipants,
      })),
      placements: collegeRaw.placements.map((p) => ({
        id: p.id,
        year: p.year,
        highest_package: p.highestPackage,
        average_package: p.averagePackage,
        placement_percent: p.placementPercent,
        top_recruiters: p.topRecruiters,
        description: p.description,
      })),
      scholarships: collegeRaw.scholarships.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        amount: s.amount,
        eligibility: s.eligibility,
        deadline: s.deadline,
      })),
      reviews: reviews.map((rev) => ({
        id: rev.id,
        student_name: rev.student.user.name,
        content: rev.content,
        rating: rev.rating,
        created_at: rev.createdAt,
      })),
      rating_avg: ratingsAvg._avg.score || 5.0,
    };

    return res.json({ success: true, college });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/students/recommendations
const getRecommendations = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.id },
    });

    if (!student || !student.cutoff) {
      return res.status(400).json({ success: false, message: 'Please update your cutoff marks first' });
    }

    // Find courses matching student cutoff
    const courses = await prisma.course.findMany({
      where: {
        cutoff: { lte: student.cutoff },
      },
      include: {
        college: {
          include: {
            placements: {
              orderBy: { year: 'desc' },
              take: 1,
            },
          },
        },
      },
      take: 20,
    });

    const eligible = courses.map((cr) => {
      const placement = cr.college.placements[0];
      return {
        college_id: cr.college.userId,
        college_name: cr.college.collegeName,
        city: cr.college.city,
        state: cr.college.state,
        logo: cr.college.logo,
        accreditation: cr.college.accreditation,
        course_name: cr.courseName,
        course_cutoff: cr.cutoff,
        seats: cr.seats,
        fee_per_year: cr.feePerYear,
        placement_percent: placement ? placement.placementPercent : null,
        average_package: placement ? placement.averagePackage : null,
        diff: Math.abs(cr.cutoff - student.cutoff),
      };
    });

    // Sort by proximity to cutoff first, then by placement success percentage
    eligible.sort((a, b) => {
      if (a.diff !== b.diff) return a.diff - b.diff;
      return (b.placement_percent || 0) - (a.placement_percent || 0);
    });

    // Fetch scholarships
    const scholarships = await prisma.scholarship.findMany({
      where: {
        OR: [
          { collegeId: null }, // General/government scholarships
          {
            college: {
              courses: {
                some: { cutoff: { lte: student.cutoff } },
              },
            },
          },
        ],
      },
      include: {
        college: true,
      },
    });

    const scholarshipsMapped = scholarships.map((s) => ({
      id: s.id,
      college_id: s.collegeId,
      college_name: s.college ? s.college.collegeName : 'Government / General',
      name: s.name,
      description: s.description,
      amount: s.amount,
      eligibility: s.eligibility,
      deadline: s.deadline,
    }));

    return res.json({
      success: true,
      student_cutoff: student.cutoff,
      recommendations: {
        eligible_colleges: eligible,
        scholarships: scholarshipsMapped,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProfile, updateProfile, uploadPhoto, getColleges, getCollegeById, getRecommendations };
