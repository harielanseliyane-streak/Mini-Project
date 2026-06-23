// ─────────────────────────────────────────────────────────────
// Quiz Controller (Prisma ORM)
// ─────────────────────────────────────────────────────────────
const prisma = require('../config/db');

// POST /api/quizzes/result
const saveQuizResult = async (req, res) => {
  try {
    const { career_path, personality, aptitude_score, interest_mapping, skills_analysis } = req.body;
    const studentId = req.user.id;

    if (!career_path || !personality || aptitude_score === undefined) {
      return res.status(400).json({ success: false, message: 'career_path, personality, and aptitude_score are required' });
    }

    let recommendations = `Based on your high alignment with ${career_path} and your ${personality} traits: \n`;
    recommendations += `• We recommend courses in: Computer Science, Information Tech, or AI/Data Science.\n`;
    recommendations += `• Enhance your skills in: Programming, Critical Thinking, and System Analysis.\n`;
    recommendations += `• Consider applying to colleges like Anna University or PSG College of Tech which have high placement percentages in these fields.`;

    const result = await prisma.quizResult.create({
      data: {
        studentId,
        careerPath: career_path,
        personality,
        aptitudeScore: parseFloat(aptitude_score),
        interestMapping: interest_mapping ? JSON.stringify(interest_mapping) : null,
        skillsAnalysis: skills_analysis ? JSON.stringify(skills_analysis) : null,
        recommendations,
      },
    });

    // Automatically update student's goals and skills in profile
    const studentProfile = await prisma.student.findUnique({ where: { userId: studentId } });
    if (studentProfile) {
      const parsedSkills = skills_analysis ? Object.keys(skills_analysis).join(', ') : null;
      await prisma.student.update({
        where: { userId: studentId },
        data: {
          skills: parsedSkills || studentProfile.skills,
          careerGoals: studentProfile.careerGoals || career_path,
        },
      });
    }

    return res.status(201).json({ success: true, message: 'Quiz result saved successfully', result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/quizzes/my
const getMyQuizResults = async (req, res) => {
  try {
    const results = await prisma.quizResult.findMany({
      where: { studentId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = results.map((r) => ({
      id: r.id,
      career_path: r.careerPath,
      personality: r.personality,
      aptitude_score: r.aptitudeScore,
      interest_mapping: r.interestMapping ? JSON.parse(r.interestMapping) : null,
      skills_analysis: r.skillsAnalysis ? JSON.parse(r.skillsAnalysis) : null,
      recommendations: r.recommendations,
      created_at: r.createdAt,
    }));

    return res.json({ success: true, results: mapped });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { saveQuizResult, getMyQuizResults };
