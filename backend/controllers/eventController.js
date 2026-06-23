// ─────────────────────────────────────────────────────────────
// Event Controller (Prisma ORM)
// ─────────────────────────────────────────────────────────────
const prisma = require('../config/db');

// GET /api/events
const getEvents = async (req, res) => {
  try {
    const { search, college_id } = req.query;
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (college_id) {
      where.collegeId = parseInt(college_id);
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        college: { select: { collegeName: true, city: true } },
      },
      orderBy: { eventDate: 'asc' },
    });

    const mapped = events.map((e) => ({
      id: e.id,
      college_id: e.collegeId,
      college_name: e.college.collegeName,
      city: e.college.city,
      name: e.name,
      description: e.description,
      event_date: e.eventDate,
      location: e.location,
      poster_url: e.posterUrl,
      registration_deadline: e.registrationDeadline,
      max_participants: e.maxParticipants,
    }));

    return res.json({ success: true, events: mapped });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/events/:id
const getEventById = async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        college: { select: { collegeName: true, city: true } },
      },
    });

    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const mapped = {
      id: event.id,
      college_id: event.collegeId,
      college_name: event.college.collegeName,
      city: event.college.city,
      name: event.name,
      description: event.description,
      event_date: event.eventDate,
      location: event.location,
      poster_url: event.posterUrl,
      registration_deadline: event.registrationDeadline,
      max_participants: event.maxParticipants,
    };

    return res.json({ success: true, event: mapped });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/events/:id/register
const registerForEvent = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const studentId = req.user.id;

    // Check event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    // Check duplicate registration
    const existing = await prisma.eventRegistration.findUnique({
      where: {
        eventId_studentId: { eventId, studentId },
      },
    });
    if (existing) return res.status(409).json({ success: false, message: 'Already registered for this event' });

    // Check participant limit
    const count = await prisma.eventRegistration.count({ where: { eventId } });
    if (event.maxParticipants && count >= event.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Event registration full' });
    }

    // Register
    const reg = await prisma.eventRegistration.create({
      data: { eventId, studentId },
    });

    // Insert into Applications for student dashboard tracking
    await prisma.application.create({
      data: {
        studentId,
        collegeId: event.collegeId,
        type: 'event',
        eventId,
        status: 'accepted', // Event registration automatically accepted
        message: `Registered for event: ${event.name}`,
      },
    });

    // Notify college
    await prisma.notification.create({
      data: {
        userId: event.collegeId,
        title: 'New Event Registration',
        message: `A student has registered for event: ${event.name}.`,
      },
    });

    return res.status(201).json({ success: true, message: 'Registered successfully', registration: reg });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getEvents, getEventById, registerForEvent };
