// ─────────────────────────────────────────────────────────────
// Supabase API layer – direct client-side DB + Storage calls
// Replaces the Express backend + Axios layer entirely
// ─────────────────────────────────────────────────────────────
import { supabase } from '../lib/supabase';

// Helper to get the active user ID from session
const getActiveUserId = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id;
};

// ══════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════
export const login = (email, password) =>
  supabase.auth.signInWithPassword({ email, password });

export const register = async ({ email, password, role, name, college_name, phone, city, state, address, website }) => {
  // 1. Create auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role, name: role === 'student' ? name : college_name } },
  });
  if (error) throw error;

  const userId = data.user?.id;
  if (!userId) throw new Error('User creation failed');

  // 2. Insert into profiles
  const { error: profileErr } = await supabase.from('profiles').insert({
    id: userId,
    role,
    name: role === 'student' ? name : college_name,
    email,
    phone: phone || null,
  });
  if (profileErr) throw profileErr;

  // 3. Insert into role-specific table
  if (role === 'student') {
    await supabase.from('students').insert({ user_id: userId });
  } else if (role === 'college') {
    await supabase.from('colleges').insert({
      user_id: userId,
      college_name,
      city:    city    || null,
      state:   state   || null,
      address: address || null,
      website: website || null,
      logo: `https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=120&auto=format&fit=crop&q=60`,
      description: `${college_name} is an educational institution.`,
      established: new Date().getFullYear(),
      accreditation: 'NAAC A',
    });
  }

  return data;
};

// ══════════════════════════════════════════════════════════════
// STUDENT PROFILE
// ══════════════════════════════════════════════════════════════
export const getStudentProfile = async (userId) => {
  const uid = userId || await getActiveUserId();
  if (!uid) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      profiles!inner(name, email, phone)
    `)
    .eq('user_id', uid)
    .single();
  if (error) throw error;
  return { student: data };
};

// Simplified profile: join profiles + students
export const getFullStudentProfile = async (userId) => {
  const uid = userId || await getActiveUserId();
  if (!uid) throw new Error('Not authenticated');
  const [profileRes, studentRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', uid).single(),
    supabase.from('students').select('*').eq('user_id', uid).single(),
  ]);
  return { ...(profileRes.data || {}), ...(studentRes.data || {}) };
};

export const updateStudentProfile = async (userIdOrUpdates, updates) => {
  let uid = userIdOrUpdates;
  let data = updates;
  if (typeof userIdOrUpdates === 'object') {
    data = userIdOrUpdates;
    uid = await getActiveUserId();
  }
  if (!uid) throw new Error('Not authenticated');
  const { name, phone, bio, hsc_marks, cutoff, interests, skills, career_goals, location_pref, budget_pref, course_pref } = data;

  // Update profiles table
  await supabase.from('profiles').update({ name, phone }).eq('id', uid);

  // Update students table
  const { error } = await supabase.from('students').update({
    bio, hsc_marks, cutoff, interests, skills, career_goals, location_pref, budget_pref, course_pref,
  }).eq('user_id', uid);
  if (error) throw error;
};

export const uploadStudentPhoto = async (userIdOrFile, file) => {
  let uid = userIdOrFile;
  let f = file;
  if (userIdOrFile instanceof File || (userIdOrFile && typeof userIdOrFile === 'object' && !file)) {
    f = userIdOrFile;
    uid = await getActiveUserId();
  }
  if (!uid) throw new Error('Not authenticated');
  const ext  = f.name.split('.').pop();
  const path = `profiles/${uid}.${ext}`;
  const { error: upErr } = await supabase.storage.from('avatars').upload(path, f, { upsert: true });
  if (upErr) throw upErr;

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);

  await supabase.from('students').update({ profile_photo: publicUrl }).eq('user_id', uid);
  return publicUrl;
};

// ══════════════════════════════════════════════════════════════
// COLLEGES (public listing)
// ══════════════════════════════════════════════════════════════
export const getColleges = async ({ search = '', city = '', cutoff = '', page = 1, limit = 12 } = {}) => {
  let query = supabase
    .from('colleges')
    .select(`
      user_id,
      college_name,
      address,
      city,
      state,
      website,
      logo,
      description,
      established,
      accreditation,
      infrastructure,
      hostel_info,
      fee_structure,
      courses(id, course_name, cutoff, seats, fee_per_year),
      placements(placement_percent, average_package, highest_package, year)
    `, { count: 'exact' });

  if (search) query = query.ilike('college_name', `%${search}%`);
  if (city)   query = query.ilike('city', `%${city}%`);

  const from = (page - 1) * limit;
  const to   = from + limit - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;
  if (error) throw error;

  // Filter by cutoff client-side (courses have individual cutoffs)
  let colleges = (data || []).map(c => ({ ...c, id: c.user_id }));
  if (cutoff) {
    colleges = colleges.filter(c => c.courses?.some(co => co.cutoff <= parseFloat(cutoff)));
  }

  return { colleges, pagination: { total: count || 0, pages: Math.ceil((count || 0) / limit) } };
};

export const getCollegeById = async (id) => {
  const { data, error } = await supabase
    .from('colleges')
    .select(`
      *,
      profiles(name, phone, email),
      courses(*),
      events(*),
      scholarships(*),
      placements(*),
      posts(*)
    `)
    .eq('user_id', id)
    .single();
  if (error) throw error;
  return { college: { ...data, id: data.user_id, email: data.profiles?.email || data.profiles?.phone || null } };
};

export const getPublicColleges = () => getColleges();

// ══════════════════════════════════════════════════════════════
// COLLEGE DASHBOARD (protected: college role)
// ══════════════════════════════════════════════════════════════
export const getCollegeProfile = async (userId) => {
  const uid = userId || await getActiveUserId();
  if (!uid) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('colleges')
    .select(`
      *,
      profiles!inner(name, phone, email),
      courses(*),
      events(*),
      scholarships(*),
      placements(*),
      posts(*)
    `)
    .eq('user_id', uid)
    .single();
  if (error) throw error;
  return { college: { ...data, email: data.profiles?.email, phone: data.profiles?.phone } };
};

export const updateCollegeProfile = async (userIdOrUpdates, updates) => {
  let uid = userIdOrUpdates;
  let data = updates;
  if (typeof userIdOrUpdates === 'object') {
    data = userIdOrUpdates;
    uid = await getActiveUserId();
  }
  if (!uid) throw new Error('Not authenticated');
  const { college_name, city, state, address, description, website, accreditation, established } = data;
  const { error } = await supabase.from('colleges').update({
    college_name, city, state, address, description, website, accreditation, established,
  }).eq('user_id', uid);
  if (error) throw error;

  // Also update name in profiles if changed
  if (college_name) {
    await supabase.from('profiles').update({ name: college_name }).eq('id', uid);
  }
};

export const uploadCollegeLogo = async (userIdOrFile, file) => {
  let uid = userIdOrFile;
  let f = file;
  if (userIdOrFile instanceof File || (userIdOrFile && typeof userIdOrFile === 'object' && !file)) {
    f = userIdOrFile;
    uid = await getActiveUserId();
  }
  if (!uid) throw new Error('Not authenticated');
  const ext  = f.name.split('.').pop();
  const path = `logos/${uid}.${ext}`;
  const { error: upErr } = await supabase.storage.from('college-assets').upload(path, f, { upsert: true });
  if (upErr) throw upErr;

  const { data: { publicUrl } } = supabase.storage.from('college-assets').getPublicUrl(path);
  await supabase.from('colleges').update({ logo: publicUrl }).eq('user_id', uid);
  return publicUrl;
};

export const addCourse = async (userIdOrData, courseData) => {
  let uid = userIdOrData;
  let data = courseData;
  if (typeof userIdOrData === 'object') {
    data = userIdOrData;
    uid = await getActiveUserId();
  }
  if (!uid) throw new Error('Not authenticated');
  const { error } = await supabase.from('courses').insert({ ...data, college_id: uid });
  if (error) throw error;
};

export const updateCourse = async (id, data) => {
  const { error } = await supabase.from('courses').update(data).eq('id', id);
  if (error) throw error;
};

export const deleteCourse = async (id) => {
  const { error } = await supabase.from('courses').delete().eq('id', id);
  if (error) throw error;
};

export const createPost = async (userIdOrData, postData, mediaFile) => {
  let uid = userIdOrData;
  let data = postData;
  let file = mediaFile;
  if (typeof userIdOrData === 'object') {
    file = postData;
    data = userIdOrData;
    uid = await getActiveUserId();
  }
  if (!uid) throw new Error('Not authenticated');
  let media_url  = null;
  let media_type = 'none';

  if (file) {
    const ext  = file.name.split('.').pop();
    const path = `posts/${uid}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('college-assets').upload(path, file, { upsert: true });
    if (!upErr) {
      const { data: { publicUrl } } = supabase.storage.from('college-assets').getPublicUrl(path);
      media_url  = publicUrl;
      media_type = file.type.startsWith('video') ? 'video' : 'image';
    }
  }

  const { error } = await supabase.from('posts').insert({
    college_id: uid,
    type:       data.type,
    title:      data.title,
    description: data.description || null,
    media_url,
    media_type,
  });
  if (error) throw error;
};

export const deletePost = async (id) => {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw error;
};

export const createEvent = async (userIdOrData, eventData) => {
  let uid = userIdOrData;
  let data = eventData;
  if (typeof userIdOrData === 'object') {
    data = userIdOrData;
    uid = await getActiveUserId();
  }
  if (!uid) throw new Error('Not authenticated');
  const { error } = await supabase.from('events').insert({ ...data, college_id: uid });
  if (error) throw error;
};

export const addPlacement = async (userIdOrData, data) => {
  let uid = userIdOrData;
  let pData = data;
  if (typeof userIdOrData === 'object') {
    pData = userIdOrData;
    uid = await getActiveUserId();
  }
  if (!uid) throw new Error('Not authenticated');
  const { error } = await supabase.from('placements').insert({ ...pData, college_id: uid });
  if (error) throw error;
};

export const addScholarship = async (userIdOrData, data) => {
  let uid = userIdOrData;
  let sData = data;
  if (typeof userIdOrData === 'object') {
    sData = userIdOrData;
    uid = await getActiveUserId();
  }
  if (!uid) throw new Error('Not authenticated');
  const { error } = await supabase.from('scholarships').insert({ ...sData, college_id: uid });
  if (error) throw error;
};

export const getCollegeApplications = async (userId) => {
  const uid = userId || await getActiveUserId();
  if (!uid) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('applications')
    .select(`
      id, type, status, applied_at, message,
      students!inner(
        user_id,
        hsc_marks, cutoff,
        profiles!inner(name, phone)
      ),
      courses(course_name)
    `)
    .eq('college_id', uid)
    .order('applied_at', { ascending: false });
  if (error) throw error;

  return (data || []).map(a => ({
    id:           a.id,
    type:         a.type,
    status:       a.status,
    applied_at:   a.applied_at,
    course_name:  a.courses?.course_name || null,
    student_name: a.students?.profiles?.name,
    student_phone: a.students?.profiles?.phone,
    hsc_marks:    a.students?.hsc_marks,
    cutoff:       a.students?.cutoff,
  }));
};

export const updateAppStatus = async (appId, status) => {
  const { error } = await supabase.from('applications').update({ status }).eq('id', appId);
  if (error) throw error;
};

// ══════════════════════════════════════════════════════════════
// APPLICATIONS (student)
// ══════════════════════════════════════════════════════════════
export const applyToCollege = async (userIdOrData, data) => {
  let uid = userIdOrData;
  let payload = data;
  if (typeof userIdOrData === 'object') {
    payload = userIdOrData;
    uid = await getActiveUserId();
  }
  if (!uid) throw new Error('Not authenticated');
  const { college_id, course_id, type, event_id } = payload;

  // Check for duplicate
  const { data: existing } = await supabase
    .from('applications')
    .select('id')
    .eq('student_id', uid)
    .eq('college_id', college_id)
    .eq('type', type || 'admission')
    .maybeSingle();

  if (existing) throw new Error('Already applied');

  const { error } = await supabase.from('applications').insert({
    student_id:  uid,
    college_id,
    course_id:   course_id || null,
    event_id:    event_id  || null,
    type:        type || 'admission',
  });
  if (error) throw error;
};

export const getMyApplications = async (userId) => {
  const uid = userId || await getActiveUserId();
  if (!uid) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('applications')
    .select(`
      id, type, status, applied_at,
      colleges!inner(college_name, city),
      courses(course_name),
      events(name)
    `)
    .eq('student_id', uid)
    .order('applied_at', { ascending: false });
  if (error) throw error;

  return (data || []).map(a => ({
    id:           a.id,
    type:         a.type,
    status:       a.status,
    applied_at:   a.applied_at,
    college_name: a.colleges?.college_name,
    course_name:  a.courses?.course_name || null,
    event_name:   a.events?.name || null,
  }));
};

// ══════════════════════════════════════════════════════════════
// EVENTS
// ══════════════════════════════════════════════════════════════
export const getEvents = async ({ search = '', page = 1, limit = 12 } = {}) => {
  let query = supabase
    .from('events')
    .select(`*, colleges!inner(college_name, city)`, { count: 'exact' })
    .order('event_date', { ascending: true });

  if (search) query = query.ilike('name', `%${search}%`);
  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, count, error } = await query;
  if (error) throw error;
  return { events: data || [], total: count || 0 };
};

export const getEventById = async (id) => {
  const { data, error } = await supabase
    .from('events')
    .select(`*, colleges!inner(college_name, city, logo)`)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

export const registerForEvent = async (userId, eventId, collegeId) => {
  const { error } = await supabase.from('event_registrations').insert({
    event_id:   eventId,
    student_id: userId,
  });
  if (error) throw error;
};

// ══════════════════════════════════════════════════════════════
// SCHOLARSHIPS
// ══════════════════════════════════════════════════════════════
export const getScholarships = async ({ search = '' } = {}) => {
  let query = supabase
    .from('scholarships')
    .select(`*, colleges(college_name)`)
    .order('created_at', { ascending: false });
  if (search) query = query.ilike('name', `%${search}%`);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

// ══════════════════════════════════════════════════════════════
// INTERNSHIPS
// ══════════════════════════════════════════════════════════════
export const getInternships = async ({ search = '' } = {}) => {
  let query = supabase
    .from('internships')
    .select('*')
    .order('created_at', { ascending: false });
  if (search) query = query.ilike('title', `%${search}%`);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const createInternship = async (data) => {
  const { error } = await supabase.from('internships').insert(data);
  if (error) throw error;
};

// ══════════════════════════════════════════════════════════════
// QUIZ RESULTS
// ══════════════════════════════════════════════════════════════
export const saveQuizResult = async (userIdOrData, data) => {
  let uid = userIdOrData;
  let payload = data;
  if (typeof userIdOrData === 'object') {
    payload = userIdOrData;
    uid = await getActiveUserId();
  }
  if (!uid) throw new Error('Not authenticated');
  const { error } = await supabase.from('quiz_results').insert({ ...payload, student_id: uid });
  if (error) throw error;
};

export const getMyQuizResults = async (userId) => {
  const uid = userId || await getActiveUserId();
  if (!uid) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('student_id', uid)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

// ══════════════════════════════════════════════════════════════
// SAVED ITEMS
// ══════════════════════════════════════════════════════════════
export const saveItem = async (userIdOrType, typeOrItemId, itemId) => {
  let uid = userIdOrType;
  let type = typeOrItemId;
  let id = itemId;
  if (typeof userIdOrType === 'string' && !itemId) {
    type = userIdOrType;
    id = typeOrItemId;
    uid = await getActiveUserId();
  }
  if (!uid) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('saved_items')
    .insert({ student_id: uid, type, item_id: id })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getSavedItems = async (userId) => {
  const uid = userId || await getActiveUserId();
  if (!uid) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('saved_items')
    .select('*')
    .eq('student_id', uid)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const collegeItems = (data || []).filter(i => i.type === 'college');
  if (collegeItems.length > 0) {
    const ids = collegeItems.map(i => i.item_id);
    const { data: colleges } = await supabase
      .from('colleges')
      .select('user_id, college_name, city, logo')
      .in('user_id', ids);

    const colMap = {};
    (colleges || []).forEach(c => { colMap[c.user_id] = c; });

    return (data || []).map(item => ({
      ...item,
      details: item.type === 'college' ? colMap[item.item_id] : null,
    }));
  }

  return data || [];
};

export const removeSavedItem = async (id) => {
  const { error } = await supabase.from('saved_items').delete().eq('id', id);
  if (error) throw error;
};

// ══════════════════════════════════════════════════════════════
// REVIEWS
// ══════════════════════════════════════════════════════════════
export const addCollegeReview = async (userIdOrId, collegeId, reviewData) => {
  let uid = userIdOrId;
  let cid = collegeId;
  let rData = reviewData;
  if (typeof userIdOrId === 'string' && typeof collegeId === 'object') {
    rData = collegeId;
    cid = userIdOrId;
    uid = await getActiveUserId();
  }
  if (!uid) throw new Error('Not authenticated');
  const { error } = await supabase.from('reviews').insert({
    student_id: uid,
    college_id: cid,
    content:    rData.content,
    rating:     rData.rating,
  });
  if (error) throw error;
};

// ══════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ══════════════════════════════════════════════════════════════
export const getNotifications = async (userId) => {
  const uid = userId || await getActiveUserId();
  if (!uid) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', uid)
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) throw error;
  return data || [];
};

export const markNotificationAsRead = async (id) => {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  if (error) throw error;
};

// ══════════════════════════════════════════════════════════════
// RECOMMENDATIONS (computed client-side from Supabase data)
// ══════════════════════════════════════════════════════════════
export const getRecommendations = async (userId) => {
  const uid = userId || await getActiveUserId();
  if (!uid) throw new Error('Not authenticated');
  const { data: student } = await supabase
    .from('students')
    .select('cutoff, course_pref, location_pref')
    .eq('user_id', uid)
    .single();

  if (!student?.cutoff) return { eligible_colleges: [], scholarships: [] };

  const { data: colleges } = await supabase
    .from('colleges')
    .select(`
      user_id, college_name, city, state, accreditation,
      courses(id, course_name, cutoff),
      placements(placement_percent, average_package)
    `);

  const eligible_colleges = [];
  (colleges || []).forEach(college => {
    (college.courses || []).forEach(course => {
      if (course.cutoff <= student.cutoff) {
        eligible_colleges.push({
          college_name:      college.college_name,
          city:              college.city,
          state:             college.state,
          accreditation:     college.accreditation,
          course_name:       course.course_name,
          course_cutoff:     course.cutoff,
          placement_percent: college.placements?.[0]?.placement_percent || null,
        });
      }
    });
  });

  const { data: scholarships } = await supabase
    .from('scholarships')
    .select(`*, colleges(college_name)`)
    .limit(10);

  return {
    eligible_colleges: eligible_colleges.slice(0, 20),
    scholarships: (scholarships || []).map(s => ({ ...s, college_name: s.colleges?.college_name })),
  };
};

// ══════════════════════════════════════════════════════════════
// AI CHATBOT – rule-based (Gemini calls can be added via Edge Functions)
// ══════════════════════════════════════════════════════════════
export const sendChatMessage = async (message) => {
  const msg = message.toLowerCase();
  let reply = '';

  if (msg.includes('cutoff') || msg.includes('calculate')) {
    reply = `📊 **Tamil Nadu Cutoff Formula:**\n\nCutoff = (Maths / 2) + (Physics / 4) + (Chemistry / 4)\n\nMax cutoff = 200.\n\nFor example: Maths 100, Physics 100, Chemistry 100 → Cutoff = 50 + 25 + 25 = **100**.\n\nUse this to check if you're eligible for a college's courses!`;
  } else if (msg.includes('recommend') || msg.includes('college') || msg.includes('best')) {
    const { data } = await supabase
      .from('colleges')
      .select('college_name, city, accreditation')
      .limit(5);
    const list = (data || []).map(c => `• ${c.college_name} – ${c.city} (${c.accreditation || 'N/A'})`).join('\n');
    reply = `🏛️ **Top Colleges on InfoHub:**\n\n${list || 'No colleges found yet.'}\n\nVisit the Colleges page for full details, cutoffs, and placements!`;
  } else if (msg.includes('scholarship')) {
    const { data } = await supabase.from('scholarships').select('name, amount').limit(5);
    const list = (data || []).map(s => `• ${s.name} – ₹${s.amount?.toLocaleString() || 'N/A'}`).join('\n');
    reply = `🎖️ **Available Scholarships:**\n\n${list || 'Check back soon – new scholarships are added regularly!'}\n\nApply early – deadlines may be soon!`;
  } else if (msg.includes('internship')) {
    const { data } = await supabase.from('internships').select('title, company_name').limit(5);
    const list = (data || []).map(i => `• ${i.title} at ${i.company_name}`).join('\n');
    reply = `💼 **Open Internships:**\n\n${list || 'No internships listed yet.'}\n\nCheck your Student Dashboard for personalized matches!`;
  } else if (msg.includes('career') || msg.includes('after 12') || msg.includes('after 12th')) {
    reply = `🚀 **Career Paths After 12th (Science):**\n\n• Engineering (B.E / B.Tech)\n• Medical (MBBS, BDS, BAMS)\n• Pure Sciences (B.Sc)\n• Architecture\n• Data Science & AI\n• Pharmacy\n\nTake the **Career Quiz** in your dashboard to get a personalized career recommendation!`;
  } else if (msg.includes('engineering')) {
    reply = `⚙️ **Engineering Courses Available:**\n\n• Computer Science (CSE)\n• Electronics & Communication (ECE)\n• Mechanical Engineering (ME)\n• Civil Engineering (CE)\n• Electrical Engineering (EEE)\n• Information Technology (IT)\n\nMost colleges require a cutoff of 100+ for top branches. Use the Colleges page to compare!`;
  } else if (msg.includes('placement') || msg.includes('package') || msg.includes('salary')) {
    reply = `💰 **Placement Info:**\n\nTop colleges on InfoHub report:\n• Highest packages: 20–40 LPA (top CS/ECE grads)\n• Average packages: 4–8 LPA\n• Top recruiters: Google, Zoho, TCS, Infosys, Cognizant\n\nPlacement % varies by college. Check individual college profiles for detailed data!`;
  } else {
    reply = `👋 I'm InfoHub AI! I can help you with:\n\n• 🏛️ College recommendations based on your cutoff\n• 📊 TN cutoff score calculation\n• 🎖️ Scholarship search\n• 💼 Internship listings\n• 🚀 Career path guidance after 12th\n\nJust ask me anything about college admissions!`;
  }

  return { reply };
};

// ══════════════════════════════════════════════════════════════
// ADMIN
// ══════════════════════════════════════════════════════════════
export const getAdminStats = async () => {
  const [students, colleges, applications, events, scholarships, internships] = await Promise.all([
    supabase.from('students').select('user_id', { count: 'exact', head: true }),
    supabase.from('colleges').select('user_id', { count: 'exact', head: true }),
    supabase.from('applications').select('id', { count: 'exact', head: true }),
    supabase.from('events').select('id', { count: 'exact', head: true }),
    supabase.from('scholarships').select('id', { count: 'exact', head: true }),
    supabase.from('internships').select('id', { count: 'exact', head: true }),
  ]);

  return {
    students:     students.count    || 0,
    colleges:     colleges.count    || 0,
    applications: applications.count || 0,
    events:       events.count      || 0,
    scholarships: scholarships.count || 0,
    internships:  internships.count  || 0,
  };
};

export const getAdminStudents = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, phone, students(cutoff)')
    .eq('role', 'student');
  if (error) throw error;
  return (data || []).map(p => ({
    id:     p.id,
    name:   p.name,
    phone:  p.phone,
    cutoff: p.students?.[0]?.cutoff || null,
  }));
};

export const getAdminColleges = async () => {
  const { data, error } = await supabase
    .from('colleges')
    .select(`user_id, college_name, city, accreditation, profiles!inner(phone)`)
    .order('college_name');
  if (error) throw error;
  return (data || []).map(c => ({
    id:            c.user_id,
    college_name:  c.college_name,
    city:          c.city,
    accreditation: c.accreditation,
    phone:         c.profiles?.phone,
  }));
};

export const addCollegeByAdmin = async (collegeData) => {
  const { college_name, email, password, phone, established, accreditation, city, state, website, address, description } = collegeData;

  // Create auth user via signUp (admin initiated)
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { role: 'college', name: college_name } },
  });
  if (error) throw error;

  const userId = data.user?.id;
  if (!userId) throw new Error('Failed to create user');

  await supabase.from('profiles').insert({ id: userId, role: 'college', name: college_name, email, phone: phone || null });
  await supabase.from('colleges').insert({
    user_id: userId, college_name, city, state, address, description,
    website, accreditation, established: established ? parseInt(established) : null,
  });
};

export const broadcastNotification = async ({ title, message }) => {
  const { data: profiles } = await supabase.from('profiles').select('id');
  if (!profiles?.length) return;

  const notifications = profiles.map(p => ({ user_id: p.id, title, message }));
  const { error } = await supabase.from('notifications').insert(notifications);
  if (error) throw error;
};

export const deleteReviewByAdmin = async (id) => {
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw error;
};

// ══════════════════════════════════════════════════════════════
// MEDIA UPLOAD (general)
// ══════════════════════════════════════════════════════════════
export const uploadMedia = async (file, bucket = 'college-assets') => {
  const ext  = file.name.split('.').pop();
  const path = `media/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
};
