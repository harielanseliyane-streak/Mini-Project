// ─────────────────────────────────────────────────────────────
// Review Controller (Prisma ORM)
// ─────────────────────────────────────────────────────────────
const prisma = require('../config/db');

// POST /api/colleges/:id/reviews
const addReview = async (req, res) => {
  try {
    const collegeId = parseInt(req.params.id);
    const studentId = req.user.id;
    const { content, rating } = req.body;

    if (!content || rating === undefined) {
      return res.status(400).json({ success: false, message: 'Content and rating are required' });
    }

    const review = await prisma.review.create({
      data: {
        studentId,
        collegeId,
        content,
        rating: parseInt(rating),
      },
    });

    // Update or insert rating score
    const existingRating = await prisma.rating.findFirst({
      where: { studentId, collegeId },
    });

    if (existingRating) {
      await prisma.rating.update({
        where: { id: existingRating.id },
        data: { score: parseInt(rating) },
      });
    } else {
      await prisma.rating.create({
        data: { studentId, collegeId, score: parseInt(rating) },
      });
    }

    // Notify college
    await prisma.notification.create({
      data: {
        userId: collegeId,
        title: 'New Review Posted',
        message: `A student has left a review of ${rating} stars on your college profile.`,
      },
    });

    return res.status(201).json({ success: true, message: 'Review added successfully', review });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { addReview };
