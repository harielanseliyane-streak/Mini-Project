// ─────────────────────────────────────────────────────────────
// AI Chatbot Controller (Prisma ORM)
// Supports Google Gemini, OpenAI, or mock rule-based responses
// ─────────────────────────────────────────────────────────────
const prisma = require('../config/db');
const axios = require('axios');

// ── Fetch student context from DB ───────────────────────────
const getStudentContext = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });
    if (user && user.student) {
      return {
        name: user.name,
        hsc_marks: user.student.hscMarks,
        cutoff: user.student.cutoff,
      };
    }
    return null;
  } catch { return null; }
};

// ── Fetch eligible colleges for context ─────────────────────
const getEligibleColleges = async (cutoff) => {
  if (!cutoff) return [];
  try {
    const courses = await prisma.course.findMany({
      where: { cutoff: { lte: cutoff } },
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
      orderBy: { cutoff: 'desc' },
      take: 10,
    });

    return courses.map((cr) => {
      const placement = cr.college.placements[0];
      return {
        college_name: cr.college.collegeName,
        city: cr.college.city || 'TN',
        course_name: cr.courseName,
        course_cutoff: cr.cutoff,
        average_package: placement ? placement.averagePackage : null,
      };
    });
  } catch { return []; }
};

// ── Google Gemini API ────────────────────────────────────────
const callGemini = async (systemPrompt, message) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    const resp = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      { contents: [{ parts: [{ text: `${systemPrompt}\n\nUser: ${message}` }] }] },
      { timeout: 15000 }
    );
    return resp.data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch { return null; }
};

// ── OpenAI API ───────────────────────────────────────────────
const callOpenAI = async (systemPrompt, message) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  try {
    const resp = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }],
        max_tokens: 500,
      },
      { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 15000 }
    );
    return resp.data?.choices?.[0]?.message?.content || null;
  } catch { return null; }
};

// ── Rule-based mock chatbot fallback ────────────────────────
const mockResponse = (message, student, colleges) => {
  const msg = message.toLowerCase();
  if (msg.includes('recommend') || msg.includes('college') || msg.includes('eligible')) {
    if (!student?.cutoff) return "Please update your cutoff marks in your profile so I can recommend colleges!";
    if (!colleges.length) return `With a cutoff of ${student.cutoff}, I couldn't find matching colleges right now. Try updating your marks.`;
    const list = colleges.slice(0, 5).map((c) => `• ${c.college_name} (${c.city}) — ${c.course_name} (Cutoff: ${c.course_cutoff})`).join('\n');
    return `Based on your cutoff of ${student.cutoff}, here are eligible colleges:\n\n${list}\n\nWould you like more details about any of these?`;
  }
  if (msg.includes('career') || msg.includes('job') || msg.includes('scope')) {
    return "Great career options after 12th in Tamil Nadu include Engineering (CSE, ECE, Mech), Medicine (MBBS, BDS), Law (BA LLB), Architecture, and Commerce-related streams like CA and MBA. Which stream interests you?";
  }
  if (msg.includes('cutoff') || msg.includes('mark') || msg.includes('score')) {
    return "Cutoff marks for Tamil Nadu colleges are calculated as: (Maths + Physics + Chemistry/2). Top colleges like Anna University require 195+ while others accept from 170+.";
  }
  if (msg.includes('scholarship')) {
    return "Tamil Nadu offers many scholarships: BC/MBC scholarships (Govt), merit-based college scholarships, and private scholarships. Check the Recommendations page for scholarships matching your profile!";
  }
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return `Hello${student?.name ? ' ' + student.name : ''}! I'm your InfoHub AI assistant. I can help with college recommendations, career guidance, scholarship info, and more. What would you like to know?`;
  }
  return "I'm here to help with college recommendations, career guidance, cutoff information, and scholarships. Could you be more specific about what you'd like to know?";
};

// ── POST /api/chatbot/message ────────────────────────────────
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message is required' });

    // Get student context if logged in
    let student = null, colleges = [];
    if (req.user?.role === 'student') {
      student = await getStudentContext(req.user.id);
      if (student?.cutoff) colleges = await getEligibleColleges(student.cutoff);
    }

    const collegesText = colleges.length
      ? `\nEligible colleges for this student:\n${colleges.map((c) => `- ${c.college_name} (${c.city}): ${c.course_name}, cutoff ${c.course_cutoff}`).join('\n')}`
      : '';

    const systemPrompt = `You are InfoHub's AI career advisor helping 12th-grade students in India choose colleges and careers.
${student ? `Student: ${student.name}, HSC Marks: ${student.hsc_marks || 'Not set'}%, Cutoff: ${student.cutoff || 'Not set'}${collegesText}` : ''}
Be concise, friendly, and helpful. Focus on the Indian education system, cutoff marks, college recommendations, events, internships, scholarships, and career advice.`;

    // Try AI APIs, fallback to mock
    let reply = await callGemini(systemPrompt, message)
              || await callOpenAI(systemPrompt, message)
              || mockResponse(message, student, colleges);

    return res.json({
      success: true,
      reply,
      source: process.env.GEMINI_API_KEY ? 'gemini' : process.env.OPENAI_API_KEY ? 'openai' : 'mock',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { sendMessage };
