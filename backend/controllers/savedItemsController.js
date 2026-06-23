// ─────────────────────────────────────────────────────────────
// Saved Items Controller (Prisma ORM)
// ─────────────────────────────────────────────────────────────
const prisma = require('../config/db');

// POST /api/saved-items
const saveItem = async (req, res) => {
  try {
    const { type, item_id } = req.body;
    const itemId = parseInt(item_id);
    const studentId = req.user.id;

    if (!type || !itemId) {
      return res.status(400).json({ success: false, message: 'type and item_id are required' });
    }

    // Check duplicate
    const existing = await prisma.savedItem.findUnique({
      where: {
        studentId_type_itemId: { studentId, type, itemId },
      },
    });

    if (existing) {
      return res.status(409).json({ success: false, message: 'Item already saved' });
    }

    const saved = await prisma.savedItem.create({
      data: { studentId, type, itemId },
    });

    return res.status(201).json({ success: true, message: 'Item saved successfully', saved });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/saved-items
const getSavedItems = async (req, res) => {
  try {
    const studentId = req.user.id;
    const items = await prisma.savedItem.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });

    const populated = await Promise.all(
      items.map(async (item) => {
        let details = null;
        if (item.type === 'college') {
          details = await prisma.college.findUnique({
            where: { userId: item.itemId },
            select: { collegeName: true, city: true, logo: true },
          });
        } else if (item.type === 'scholarship') {
          details = await prisma.scholarship.findUnique({
            where: { id: item.itemId },
            select: { name: true, amount: true, deadline: true },
          });
        } else if (item.type === 'internship') {
          details = await prisma.internship.findUnique({
            where: { id: item.itemId },
            select: { title: true, companyName: true, stipend: true },
          });
        } else if (item.type === 'event') {
          details = await prisma.event.findUnique({
            where: { id: item.itemId },
            select: { name: true, eventDate: true, location: true },
          });
        }
        return {
          id: item.id,
          type: item.type,
          item_id: item.itemId,
          created_at: item.createdAt,
          details,
        };
      })
    );

    return res.json({ success: true, saved_items: populated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/saved-items/:id
const removeSavedItem = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const studentId = req.user.id;

    await prisma.savedItem.deleteMany({
      where: { id, studentId },
    });

    return res.json({ success: true, message: 'Item removed from saved opportunities' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { saveItem, getSavedItems, removeSavedItem };
