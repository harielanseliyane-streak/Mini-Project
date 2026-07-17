// ─────────────────────────────────────────────────────────────
// Supabase API Integration Layer – 100% Client-Side
// ─────────────────────────────────────────────────────────────
import { supabase } from '../lib/supabaseClient';
import { signJWT } from '../lib/jwtHelper';

// Helper to generate UUIDs
export const generateUUID = () => {
  return crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Helper to get active user ID from session
const getActiveUserId = () => {
  const saved = localStorage.getItem('mock_session');
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved);
    return parsed.user?.id;
  } catch (e) {
    return null;
  }
};

// ══════════════════════════════════════════════════════════════
// AUTHENTICATION ENDPOINTS
// ══════════════════════════════════════════════════════════════

export const login = async (email, password) => {
  const { data, error } = await supabase.rpc('verify_user_credentials', {
    p_email: email,
    p_password: password
  });

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('Invalid email or password');

  const matchedProfile = data[0];
  
  const sessionUser = {
    id: matchedProfile.id,
    email: matchedProfile.email,
    role: matchedProfile.role,
    name: matchedProfile.name,
    phone: matchedProfile.phone
  };

  const tokenPayload = {
    sub: sessionUser.id,
    email: sessionUser.email,
    role: 'authenticated',
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365) // 1 year
  };

  const token = await signJWT(tokenPayload, import.meta.env.VITE_SUPABASE_JWT_SECRET);

  const mockSession = {
    access_token: token,
    user: sessionUser
  };

  localStorage.setItem('mock_session', JSON.stringify({ session: mockSession, user: sessionUser }));
  
  await supabase.auth.setSession({
    access_token: token,
    refresh_token: token
  });

  window.dispatchEvent(new Event('storage'));

  return { data: { session: mockSession, user: sessionUser }, error: null };
};

export const register = async ({ email, password, role, name, college_name, phone, ...rest }) => {
  const p_name = role === 'student' ? name : college_name;
  
  const { data, error } = await supabase.rpc('register_user', {
    p_email: email,
    p_password: password,
    p_role: role,
    p_name,
    p_phone: phone || null,
    p_metadata: {
      ...rest,
      college_name: role === 'student' ? college_name : undefined,
      role
    }
  });

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('Registration failed');

  const matchedProfile = data[0];

  const sessionUser = {
    id: matchedProfile.id,
    email: matchedProfile.email,
    role: matchedProfile.role,
    name: matchedProfile.name,
    phone: matchedProfile.phone
  };

  const tokenPayload = {
    sub: sessionUser.id,
    email: sessionUser.email,
    role: 'authenticated',
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365) // 1 year
  };

  const token = await signJWT(tokenPayload, import.meta.env.VITE_SUPABASE_JWT_SECRET);

  const mockSession = {
    access_token: token,
    user: sessionUser
  };

  localStorage.setItem('mock_session', JSON.stringify({ session: mockSession, user: sessionUser }));
  
  await supabase.auth.setSession({
    access_token: token,
    refresh_token: token
  });

  window.dispatchEvent(new Event('storage'));

  return { user: sessionUser, session: mockSession };
};

// ══════════════════════════════════════════════════════════════
// STUDENT PROFILE ENDPOINTS
// ══════════════════════════════════════════════════════════════

export const getStudentProfile = async (userId) => {
  const uid = userId || getActiveUserId();
  if (!uid) throw new Error('Not authenticated');

  const { data: student, error: sError } = await supabase
    .from('students')
    .select('*, profiles(*)')
    .eq('user_id', uid)
    .single();

  if (sError) throw new Error(sError.message);

  const result = {
    ...student,
    profiles: student.profiles
  };
  result.student = result;
  result.data = { student: result };
  return result;
};

export const getFullStudentProfile = async (userId) => {
  const uid = userId || getActiveUserId();
  if (!uid) throw new Error('Not authenticated');

  const { data: student, error: sError } = await supabase
    .from('students')
    .select('*, profiles(*)')
    .eq('user_id', uid)
    .single();

  if (sError) throw new Error(sError.message);

  const result = {
    ...student.profiles,
    ...student
  };
  result.data = result;
  return result;
};

export const updateStudentProfile = async (userIdOrUpdates, updates) => {
  let uid = userIdOrUpdates;
  let data = updates;
  if (typeof userIdOrUpdates === 'object') {
    data = userIdOrUpdates;
    uid = getActiveUserId();
  }
  if (!uid) throw new Error('Not authenticated');

  const { 
    name, phone, bio, hsc_marks, cutoff, interests, skills, career_goals, 
    location_pref, budget_pref, course_pref, is_college_student, college_id, 
    college_name, branch, batch 
  } = data;

  if (name !== undefined || phone !== undefined) {
    const profileUpdate = {};
    if (name !== undefined) profileUpdate.name = name;
    if (phone !== undefined) profileUpdate.phone = phone;

    const { error: pErr } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', uid);
    if (pErr) throw new Error(pErr.message);
  }

  const studentUpdate = {};
  if (bio !== undefined) studentUpdate.bio = bio;
  if (hsc_marks !== undefined) studentUpdate.hsc_marks = hsc_marks ? parseFloat(hsc_marks) : null;
  if (cutoff !== undefined) studentUpdate.cutoff = cutoff ? parseFloat(cutoff) : null;
  if (interests !== undefined) studentUpdate.interests = interests;
  if (skills !== undefined) studentUpdate.skills = skills;
  if (career_goals !== undefined) studentUpdate.career_goals = career_goals;
  if (location_pref !== undefined) studentUpdate.location_pref = location_pref;
  if (budget_pref !== undefined) studentUpdate.budget_pref = budget_pref ? parseFloat(budget_pref) : null;
  if (course_pref !== undefined) studentUpdate.course_pref = course_pref;
  
  if (is_college_student !== undefined) studentUpdate.is_college_student = is_college_student;
  if (college_id !== undefined) studentUpdate.college_id = college_id || null;
  if (college_name !== undefined) studentUpdate.college_name = college_name || null;
  if (branch !== undefined) studentUpdate.branch = branch || null;
  if (batch !== undefined) studentUpdate.batch = batch || null;

  if (Object.keys(studentUpdate).length > 0) {
    const { error: sErr } = await supabase
      .from('students')
      .update(studentUpdate)
      .eq('user_id', uid);
    if (sErr) throw new Error(sErr.message);
  }
};

export const uploadStudentPhoto = async (userIdOrFile, file) => {
  let uid = userIdOrFile;
  let fileObj = file;
  if (userIdOrFile instanceof File || (userIdOrFile && typeof userIdOrFile === 'object' && !file)) {
    fileObj = userIdOrFile;
    uid = getActiveUserId();
  }
  if (!uid) throw new Error('Not authenticated');

  let url = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80';
  
  if (fileObj) {
    const fileExt = fileObj.name.split('.').pop();
    const filePath = `${uid}/${Math.random()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, fileObj, { upsert: true });

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);
      url = publicUrl;
    } else {
      console.error('Storage upload failed:', uploadError);
    }
  }

  const { error: sErr } = await supabase
    .from('students')
    .update({ profile_photo: url })
    .eq('user_id', uid);

  if (sErr) throw new Error(sErr.message);
  return url;
};

// ══════════════════════════════════════════════════════════════
// COLLEGE LISTING ENDPOINTS
// ══════════════════════════════════════════════════════════════

export const getColleges = async ({ search = '', city = '', cutoff = '', page = 1, limit = 12 } = {}) => {
  let query = supabase.from('colleges').select('*, courses(*), placements(*)');
  
  if (city) {
    query = query.ilike('city', `%${city}%`);
  }
  if (search) {
    query = query.ilike('college_name', `%${search}%`);
  }

  const { data: colleges, error } = await query;
  if (error) throw new Error(error.message);

  let filtered = colleges.map(c => {
    const collegeCourses = c.courses || [];
    const collegePlacements = c.placements || [];
    
    const cutoffs = collegeCourses.map(co => co.cutoff).filter(x => !isNaN(x) && x !== null);
    const min_cutoff = cutoffs.length > 0 ? Math.min(...cutoffs) : null;
    const course_count = collegeCourses.length;
    
    const sortedPlacements = [...collegePlacements].sort((a, b) => b.year - a.year);
    const latestPlacement = sortedPlacements[0];
    const placement_percent = latestPlacement ? latestPlacement.placement_percent : null;
    const average_package = latestPlacement ? latestPlacement.average_package : null;

    const mapped = {
      ...c,
      id: c.user_id,
      courses: collegeCourses,
      placements: sortedPlacements,
      min_cutoff,
      course_count,
      placement_percent,
      average_package
    };
    mapped.college = mapped;
    return mapped;
  });

  if (cutoff) {
    const cutVal = parseFloat(cutoff);
    filtered = filtered.filter(c => c.courses?.some(co => co.cutoff <= cutVal));
  }

  const count = filtered.length;
  const from = (page - 1) * limit;
  const paginated = filtered.slice(from, from + limit);

  const result = { colleges: paginated, pagination: { total: count, pages: Math.ceil(count / limit) } };
  result.data = result;
  return result;
};

export const getCollegeById = async (id) => {
  const { data: college, error: cErr } = await supabase
    .from('colleges')
    .select('*, courses(*), placements(*), events(*), scholarships(*), posts(*), profiles(*)')
    .eq('user_id', id)
    .single();

  if (cErr) throw new Error(cErr.message);

  const collegeCourses = college.courses || [];
  const collegePlacements = college.placements || [];
  
  const cutoffs = collegeCourses.map(co => co.cutoff).filter(x => !isNaN(x) && x !== null);
  const min_cutoff = cutoffs.length > 0 ? Math.min(...cutoffs) : null;
  const course_count = collegeCourses.length;
  
  const sortedPlacements = [...collegePlacements].sort((a, b) => b.year - a.year);
  const latestPlacement = sortedPlacements[0];
  const placement_percent = latestPlacement ? latestPlacement.placement_percent : null;
  const average_package = latestPlacement ? latestPlacement.average_package : null;

  const result = {
    ...college,
    id: college.user_id,
    email: college.profiles?.email || null,
    profiles: college.profiles,
    events: college.events || [],
    scholarships: college.scholarships || [],
    posts: college.posts || [],
    courses: collegeCourses,
    placements: sortedPlacements,
    min_cutoff,
    course_count,
    placement_percent,
    average_package
  };

  result.college = result;
  result.data = { college: result };
  return result;
};

export const getPublicColleges = () => getColleges();

export const getCollegeProfile = async (userId) => {
  const uid = userId || getActiveUserId();
  if (!uid) throw new Error('Not authenticated');
  return getCollegeById(uid);
};

export const updateCollegeProfile = async (userIdOrUpdates, updates) => {
  let uid = userIdOrUpdates;
  let data = updates;
  if (typeof userIdOrUpdates === 'object') {
    data = userIdOrUpdates;
    uid = getActiveUserId();
  }
  if (!uid) throw new Error('Not authenticated');

  const { college_name, city, state, address, description, website, accreditation, established } = data;

  const collegeUpdate = {};
  if (college_name !== undefined) collegeUpdate.college_name = college_name;
  if (city !== undefined) collegeUpdate.city = city;
  if (state !== undefined) collegeUpdate.state = state;
  if (address !== undefined) collegeUpdate.address = address;
  if (description !== undefined) collegeUpdate.description = description;
  if (website !== undefined) collegeUpdate.website = website;
  if (accreditation !== undefined) collegeUpdate.accreditation = accreditation;
  if (established !== undefined) collegeUpdate.established = established ? parseInt(established) : null;

  if (Object.keys(collegeUpdate).length > 0) {
    const { error: cErr } = await supabase
      .from('colleges')
      .update(collegeUpdate)
      .eq('user_id', uid);
    if (cErr) throw new Error(cErr.message);
  }

  if (college_name) {
    const { error: pErr } = await supabase
      .from('profiles')
      .update({ name: college_name })
      .eq('id', uid);
    if (pErr) throw new Error(pErr.message);
  }
};

export const uploadCollegeLogo = async (userIdOrFile, file) => {
  let uid = userIdOrFile;
  let fileObj = file;
  if (userIdOrFile instanceof File || (userIdOrFile && typeof userIdOrFile === 'object' && !file)) {
    fileObj = userIdOrFile;
    uid = getActiveUserId();
  }
  if (!uid) throw new Error('Not authenticated');

  let logoUrl = 'https://images.unsplash.com/photo-1562774053-701939374585?w=120&auto=format&fit=crop&q=80';

  if (fileObj) {
    const fileExt = fileObj.name.split('.').pop();
    const filePath = `${uid}/${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(filePath, fileObj, { upsert: true });

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);
      logoUrl = publicUrl;
    } else {
      console.error('Logo upload failed:', uploadError);
    }
  }

  const { error: cErr } = await supabase
    .from('colleges')
    .update({ logo: logoUrl })
    .eq('user_id', uid);

  if (cErr) throw new Error(cErr.message);
  return logoUrl;
};

// ══════════════════════════════════════════════════════════════
// COURSES ENDPOINTS
// ══════════════════════════════════════════════════════════════

export const addCourse = async (userIdOrData, courseData) => {
  let uid = userIdOrData;
  let data = courseData;
  if (typeof userIdOrData === 'object') {
    data = userIdOrData;
    uid = getActiveUserId();
  }
  if (!uid) throw new Error('Not authenticated');

  const { error } = await supabase.from('courses').insert({
    college_id: uid,
    course_name: data.course_name,
    cutoff: parseFloat(data.cutoff),
    seats: parseInt(data.seats) || 60,
    duration: data.duration || '4 Years',
    department: data.department || 'General',
    fee_per_year: parseFloat(data.fee_per_year) || 0
  });

  if (error) throw new Error(error.message);
};

export const updateCourse = async (id, data) => {
  const courseUpdate = {};
  if (data.course_name !== undefined) courseUpdate.course_name = data.course_name;
  if (data.cutoff !== undefined) courseUpdate.cutoff = parseFloat(data.cutoff);
  if (data.seats !== undefined) courseUpdate.seats = parseInt(data.seats);
  if (data.duration !== undefined) courseUpdate.duration = data.duration;
  if (data.department !== undefined) courseUpdate.department = data.department;
  if (data.fee_per_year !== undefined) courseUpdate.fee_per_year = parseFloat(data.fee_per_year);

  const { error } = await supabase
    .from('courses')
    .update(courseUpdate)
    .eq('id', id);

  if (error) throw new Error(error.message);
};

export const deleteCourse = async (id) => {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
};

// ══════════════════════════════════════════════════════════════
// POSTS & FEEDS ENDPOINTS
// ══════════════════════════════════════════════════════════════

export const createPost = async (userIdOrData, postData, mediaFile) => {
  let uid = userIdOrData;
  let data = postData;
  if (typeof userIdOrData === 'object') {
    data = userIdOrData;
    uid = getActiveUserId();
  }
  if (!uid) throw new Error('Not authenticated');

  let mediaUrl = null;
  let mediaType = 'none';

  if (mediaFile) {
    const fileExt = mediaFile.name.split('.').pop();
    const filePath = `${uid}/${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('post-media')
      .upload(filePath, mediaFile, { upsert: true });

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('post-media')
        .getPublicUrl(filePath);
      mediaUrl = publicUrl;
      mediaType = 'image';
    } else {
      console.error('Post media upload failed:', uploadError);
    }
  }

  const { error } = await supabase.from('posts').insert({
    college_id: uid,
    type: data.type || 'general',
    title: data.title,
    description: data.description || null,
    media_url: mediaUrl,
    media_type: mediaType
  });

  if (error) throw new Error(error.message);
};

export const deletePost = async (id) => {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
};

// ══════════════════════════════════════════════════════════════
// EVENTS ENDPOINTS
// ══════════════════════════════════════════════════════════════

export const createEvent = async (userIdOrData, eventData) => {
  let uid = userIdOrData;
  let data = eventData;
  if (typeof userIdOrData === 'object') {
    data = userIdOrData;
    uid = getActiveUserId();
  }
  if (!uid) throw new Error('Not authenticated');

  const { error } = await supabase.from('events').insert({
    college_id: uid,
    name: data.name,
    description: data.description || '',
    event_date: new Date(data.event_date).toISOString(),
    location: data.location || ''
  });

  if (error) throw new Error(error.message);
};

// ══════════════════════════════════════════════════════════════
// PLACEMENTS & SCHOLARSHIPS
// ══════════════════════════════════════════════════════════════

export const addPlacement = async (userIdOrData, data) => {
  let uid = userIdOrData;
  let pData = data;
  if (typeof userIdOrData === 'object') {
    pData = userIdOrData;
    uid = getActiveUserId();
  }
  if (!uid) throw new Error('Not authenticated');

  const { error } = await supabase.from('placements').insert({
    college_id: uid,
    year: parseInt(pData.year),
    highest_package: parseFloat(pData.highest_package),
    average_package: parseFloat(pData.average_package),
    placement_percent: parseFloat(pData.placement_percent),
    top_recruiters: pData.top_recruiters || '',
    description: pData.description || ''
  });

  if (error) throw new Error(error.message);
};

export const addScholarship = async (userIdOrData, data) => {
  let uid = userIdOrData;
  let sData = data;
  if (typeof userIdOrData === 'object') {
    sData = userIdOrData;
    uid = getActiveUserId();
  }
  if (!uid) throw new Error('Not authenticated');

  const { error } = await supabase.from('scholarships').insert({
    college_id: uid,
    type: sData.type || 'merit',
    name: sData.name,
    description: sData.description || '',
    amount: parseFloat(sData.amount) || 0,
    eligibility: sData.eligibility || '',
    deadline: sData.deadline ? new Date(sData.deadline).toISOString() : null
  });

  if (error) throw new Error(error.message);
};

// ══════════════════════════════════════════════════════════════
// APPLICATIONS ENDPOINTS
// ══════════════════════════════════════════════════════════════

export const getCollegeApplications = async (userId) => {
  const uid = userId || getActiveUserId();
  if (!uid) throw new Error('Not authenticated');

  const { data: apps, error } = await supabase
    .from('applications')
    .select('*, students(*, profiles(*)), courses(*)')
    .eq('college_id', uid);

  if (error) throw new Error(error.message);

  return apps.map(a => {
    const student = a.students;
    const profile = student?.profiles;
    const course = a.courses;

    return {
      id: a.id,
      type: a.type,
      status: a.status,
      applied_at: a.applied_at,
      course_name: course?.course_name || null,
      student_name: profile?.name || 'Anonymous Student',
      student_phone: profile?.phone || 'N/A',
      hsc_marks: student?.hsc_marks || null,
      cutoff: student?.cutoff || null
    };
  });
};

export const updateAppStatus = async (appId, status) => {
  const { data: app, error: fErr } = await supabase
    .from('applications')
    .select('*, colleges(*)')
    .eq('id', appId)
    .single();

  if (fErr) throw new Error(fErr.message);

  const { error: uErr } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', appId);

  if (uErr) throw new Error(uErr.message);

  await supabase.from('notifications').insert({
    user_id: app.student_id,
    title: `Application ${status.toUpperCase()}`,
    message: `Your application to ${app.colleges?.college_name || 'College'} has been ${status}.`
  });
};

export const applyToCollege = async (userIdOrData, data) => {
  let uid = userIdOrData;
  let payload = data;
  if (typeof userIdOrData === 'object') {
    payload = userIdOrData;
    uid = getActiveUserId();
  }
  if (!uid) throw new Error('Not authenticated');
  const { college_id, course_id, type, event_id } = payload;

  const { error } = await supabase.from('applications').insert({
    student_id: uid,
    college_id,
    course_id: course_id || null,
    event_id: event_id || null,
    type: type || 'admission',
    status: 'pending'
  });

  if (error) {
    if (error.code === '23505') {
      throw new Error('Already applied');
    }
    throw new Error(error.message);
  }
};

export const getMyApplications = async (userId) => {
  const uid = userId || getActiveUserId();
  if (!uid) throw new Error('Not authenticated');

  const { data: apps, error } = await supabase
    .from('applications')
    .select('*, colleges(*), courses(*), events(*)')
    .eq('student_id', uid);

  if (error) throw new Error(error.message);

  const list = apps.map(a => {
    return {
      id: a.id,
      type: a.type,
      status: a.status,
      applied_at: a.applied_at,
      college_name: a.colleges?.college_name || 'Unknown College',
      course_name: a.courses?.course_name || null,
      event_name: a.events?.name || null
    };
  });

  list.data = { applications: list };
  return list;
};

// ══════════════════════════════════════════════════════════════
// PUBLIC EVENTS & SCHOLARSHIPS
// ══════════════════════════════════════════════════════════════

export const getEvents = async ({ search = '', page = 1, limit = 12 } = {}) => {
  let query = supabase.from('events').select('*, colleges(*)');
  
  const { data: events, error } = await query;
  if (error) throw new Error(error.message);

  let filtered = events.map(ev => {
    return {
      ...ev,
      colleges: ev.colleges,
      college_name: ev.colleges?.college_name || 'Unknown College',
      city: ev.colleges?.city || 'Unknown City'
    };
  });

  if (search) {
    filtered = filtered.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));
  }

  filtered.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

  const count = filtered.length;
  const from = (page - 1) * limit;
  const paginated = filtered.slice(from, from + limit);

  const result = { events: paginated, total: count };
  result.data = result;
  return result;
};

export const getEventById = async (id) => {
  const { data: ev, error } = await supabase
    .from('events')
    .select('*, colleges(*)')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);

  const result = {
    ...ev,
    colleges: ev.colleges,
    college_name: ev.colleges?.college_name || 'Unknown College',
    city: ev.colleges?.city || 'Unknown City',
    logo: ev.colleges?.logo || null
  };
  result.data = result;
  return result;
};

export const registerForEvent = async (userId, eventId, collegeId) => {
  const uid = userId || getActiveUserId();
  if (!uid) throw new Error('Not authenticated');
  await applyToCollege(uid, { college_id: collegeId, event_id: eventId, type: 'event' });
};

export const getScholarships = async ({ search = '' } = {}) => {
  const { data: scholarships, error } = await supabase
    .from('scholarships')
    .select('*, colleges(*)');

  if (error) throw new Error(error.message);

  let filtered = scholarships.map(s => {
    return {
      ...s,
      colleges: s.colleges,
      college_name: s.colleges?.college_name || 'InfoHub General'
    };
  });

  if (search) {
    filtered = filtered.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  }

  const result = [...filtered];
  result.data = { scholarships: filtered };
  return result;
};

// ══════════════════════════════════════════════════════════════
// INTERNSHIPS ENDPOINTS
// ══════════════════════════════════════════════════════════════

export const getInternships = async ({ search = '' } = {}) => {
  const { data: internships, error } = await supabase
    .from('internships')
    .select('*');

  if (error) throw new Error(error.message);

  let filtered = [...internships];
  if (search) {
    filtered = filtered.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.company_name.toLowerCase().includes(search.toLowerCase()));
  }
  const result = [...filtered];
  result.data = { internships: filtered };
  return result;
};

export const createInternship = async (data) => {
  const { error } = await supabase.from('internships').insert({
    company_name: data.company_name,
    title: data.title,
    description: data.description || '',
    stipend: parseFloat(data.stipend) || 0,
    duration: data.duration || '',
    location: data.location || '',
    eligibility: data.eligibility || '',
    skills_required: data.skills_required || ''
  });

  if (error) throw new Error(error.message);
};

// ══════════════════════════════════════════════════════════════
// CAREER QUIZ ENDPOINTS
// ══════════════════════════════════════════════════════════════

export const saveQuizResult = async (userIdOrData, data) => {
  let uid = userIdOrData;
  let payload = data;
  if (typeof userIdOrData === 'object') {
    payload = userIdOrData;
    uid = getActiveUserId();
  }
  if (!uid) throw new Error('Not authenticated');

  const { error } = await supabase.from('quiz_results').insert({
    student_id: uid,
    career_path: payload.career_path,
    personality: payload.personality,
    aptitude_score: payload.aptitude_score,
    interest_mapping: typeof payload.interest_mapping === 'string' ? JSON.parse(payload.interest_mapping) : payload.interest_mapping,
    skills_analysis: typeof payload.skills_analysis === 'string' ? JSON.parse(payload.skills_analysis) : payload.skills_analysis,
    recommendations: payload.recommendations
  });

  if (error) throw new Error(error.message);
};

export const getMyQuizResults = async (userId) => {
  const uid = userId || getActiveUserId();
  if (!uid) throw new Error('Not authenticated');

  const { data: results, error } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('student_id', uid)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const mapped = results.map(r => {
    return {
      ...r,
      interest_mapping: typeof r.interest_mapping === 'object' ? JSON.stringify(r.interest_mapping) : r.interest_mapping,
      skills_analysis: typeof r.skills_analysis === 'object' ? JSON.stringify(r.skills_analysis) : r.skills_analysis
    };
  });

  const result = [...mapped];
  result.data = { quiz_results: mapped };
  return result;
};

// ══════════════════════════════════════════════════════════════
// BOOKMARK / FAVOURITES ENDPOINTS
// ══════════════════════════════════════════════════════════════

export const saveItem = async (userIdOrType, typeOrItemId, itemId) => {
  let uid = userIdOrType;
  let type = typeOrItemId;
  let id = itemId;
  if (typeof userIdOrType === 'string' && !itemId) {
    type = userIdOrType;
    id = typeOrItemId;
    uid = getActiveUserId();
  }
  if (!uid) throw new Error('Not authenticated');

  const { data: existing } = await supabase
    .from('saved_items')
    .select('*')
    .eq('student_id', uid)
    .eq('type', type)
    .eq('item_id', id);

  if (existing && existing.length > 0) {
    const wrap = { ...existing[0] };
    wrap.saved = wrap;
    wrap.data = { saved: wrap };
    return wrap;
  }

  const { data: inserted, error: iErr } = await supabase
    .from('saved_items')
    .insert({
      student_id: uid,
      type,
      item_id: id
    })
    .select()
    .single();

  if (iErr) throw new Error(iErr.message);

  const wrap = { ...inserted };
  wrap.saved = wrap;
  wrap.data = { saved: wrap };
  return wrap;
};

export const getSavedItems = async (userId) => {
  const uid = userId || getActiveUserId();
  if (!uid) throw new Error('Not authenticated');

  const { data: saved, error } = await supabase
    .from('saved_items')
    .select('*')
    .eq('student_id', uid);

  if (error) throw new Error(error.message);

  const collegeIds = saved.filter(s => s.type === 'college').map(s => s.item_id);
  
  let colleges = [];
  if (collegeIds.length > 0) {
    const { data: cols, error: cErr } = await supabase
      .from('colleges')
      .select('*')
      .in('user_id', collegeIds);
    if (!cErr) colleges = cols;
  }

  const list = saved.map(item => {
    const details = item.type === 'college' ? colleges.find(c => c.user_id === item.item_id) : null;
    return {
      ...item,
      details
    };
  });

  list.data = { saved_items: list };
  return list;
};

export const removeSavedItem = async (id) => {
  const { error } = await supabase
    .from('saved_items')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
};

// ══════════════════════════════════════════════════════════════
// REVIEWS ENDPOINTS
// ══════════════════════════════════════════════════════════════

export const addCollegeReview = async (userIdOrId, collegeId, reviewData) => {
  let uid = userIdOrId;
  let cid = collegeId;
  let rData = reviewData;
  if (typeof userIdOrId === 'string' && typeof collegeId === 'object') {
    rData = collegeId;
    cid = userIdOrId;
    uid = getActiveUserId();
  }
  if (!uid) throw new Error('Not authenticated');

  const { error } = await supabase.from('reviews').insert({
    student_id: uid,
    college_id: cid,
    content: rData.content,
    rating: rData.rating || 5
  });

  if (error) throw new Error(error.message);
};

// ══════════════════════════════════════════════════════════════
// NOTIFICATIONS ENDPOINTS
// ══════════════════════════════════════════════════════════════

export const getNotifications = async (userId) => {
  const uid = userId || getActiveUserId();
  if (!uid) throw new Error('Not authenticated');

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', uid)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return notifications;
};

export const markNotificationAsRead = async (id) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);

  if (error) throw new Error(error.message);
};

// ══════════════════════════════════════════════════════════════
// RECOMMENDATIONS ENDPOINTS
// ══════════════════════════════════════════════════════════════

export const getRecommendations = async (userId) => {
  const uid = userId || getActiveUserId();
  if (!uid) throw new Error('Not authenticated');

  const { data: student, error: sErr } = await supabase
    .from('students')
    .select('cutoff')
    .eq('user_id', uid)
    .single();

  if (sErr || !student?.cutoff) {
    return { eligible_colleges: [], scholarships: [], data: { eligible_colleges: [], scholarships: [] } };
  }

  const { data: courses, error: cErr } = await supabase
    .from('courses')
    .select('*, colleges(*, placements(*))')
    .lte('cutoff', student.cutoff);

  if (cErr) throw new Error(cErr.message);

  const eligible_colleges = courses.map(co => {
    const college = co.colleges;
    const sortedPlacements = [...(college?.placements || [])].sort((a, b) => b.year - a.year);
    
    return {
      college_name: college?.college_name,
      city: college?.city,
      state: college?.state,
      accreditation: college?.accreditation,
      course_name: co.course_name,
      course_cutoff: co.cutoff,
      placement_percent: sortedPlacements[0]?.placement_percent || null
    };
  });

  const { data: scholarships } = await supabase
    .from('scholarships')
    .select('*, colleges(*)');

  const matchedScholarships = (scholarships || []).map(s => {
    return {
      ...s,
      college_name: s.colleges?.college_name || 'InfoHub General'
    };
  });

  const result = {
    eligible_colleges: eligible_colleges.slice(0, 20),
    scholarships: matchedScholarships.slice(0, 10)
  };
  result.data = result;
  return result;
};

// ══════════════════════════════════════════════════════════════
// AI CHATBOT SYSTEM
// ══════════════════════════════════════════════════════════════

export const sendChatMessage = async (message) => {
  const msg = message.toLowerCase();
  let reply = '';

  if (msg.includes('cutoff') || msg.includes('calculate')) {
    reply = `📊 **Tamil Nadu Cutoff Formula:**\n\nCutoff = (Maths / 2) + (Physics / 4) + (Chemistry / 4)\n\nMax cutoff = 200.\n\nFor example: Maths 100, Physics 100, Chemistry 100 → Cutoff = 50 + 25 + 25 = **100**.\n\nUse this to check if you're eligible for a college's courses!`;
  } else if (msg.includes('recommend') || msg.includes('college') || msg.includes('best')) {
    const { data: colleges } = await supabase.from('colleges').select('college_name, city, accreditation').limit(5);
    const list = (colleges || []).map(c => `• ${c.college_name} – ${c.city} (${c.accreditation || 'N/A'})`).join('\n');
    reply = `🏛️ **Top Colleges on InfoHub:**\n\n${list || 'No colleges found.'}\n\nVisit the Colleges page for full details, cutoffs, and placements!`;
  } else if (msg.includes('scholarship')) {
    const { data: scholarships } = await supabase.from('scholarships').select('name, amount').limit(5);
    const list = (scholarships || []).map(s => `• ${s.name} – ₹${s.amount?.toLocaleString() || 'N/A'}`).join('\n');
    reply = `🎖️ **Available Scholarships:**\n\n${list || 'Check back soon!'}\n\nApply early – deadlines may be soon!`;
  } else if (msg.includes('internship')) {
    const { data: internships } = await supabase.from('internships').select('title, company_name').limit(5);
    const list = (internships || []).map(i => `• ${i.title} at ${i.company_name}`).join('\n');
    reply = `💼 **Open Internships:**\n\n${list || 'No internships listed.'}\n\nCheck your Student Dashboard for personalized matches!`;
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
// ADMIN ENDPOINTS
// ══════════════════════════════════════════════════════════════

export const getAdminStats = async () => {
  const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
  const { count: collegeCount } = await supabase.from('colleges').select('*', { count: 'exact', head: true });
  const { count: appCount } = await supabase.from('applications').select('*', { count: 'exact', head: true });
  const { count: eventCount } = await supabase.from('events').select('*', { count: 'exact', head: true });
  const { count: scholarshipCount } = await supabase.from('scholarships').select('*', { count: 'exact', head: true });
  const { count: internshipCount } = await supabase.from('internships').select('*', { count: 'exact', head: true });

  return {
    students: studentCount || 0,
    colleges: collegeCount || 0,
    applications: appCount || 0,
    events: eventCount || 0,
    scholarships: scholarshipCount || 0,
    internships: internshipCount || 0
  };
};

export const getAdminStudents = async () => {
  const { data: students, error } = await supabase
    .from('students')
    .select('*, profiles(*)');

  if (error) throw new Error(error.message);

  return students.map(s => {
    return {
      id: s.user_id,
      name: s.profiles?.name || 'N/A',
      phone: s.profiles?.phone || 'N/A',
      cutoff: s.cutoff || null
    };
  });
};

export const getAdminColleges = async () => {
  const { data: colleges, error } = await supabase
    .from('colleges')
    .select('*, profiles(*)');

  if (error) throw new Error(error.message);

  return colleges.map(c => {
    return {
      id: c.user_id,
      college_name: c.college_name,
      city: c.city,
      accreditation: c.accreditation,
      phone: c.profiles?.phone || 'N/A'
    };
  });
};

export const addCollegeByAdmin = async (collegeData) => {
  const { college_name, email, password, phone, established, accreditation, city, state, website, address, description } = collegeData;

  const { error } = await supabase.rpc('register_user', {
    p_email: email,
    p_password: password,
    p_role: 'college',
    p_name: college_name,
    p_phone: phone || null,
    p_metadata: {
      city: city || null,
      state: state || null,
      address: address || null,
      website: website || null,
      description: description || `${college_name} is an educational institution.`,
      established: established ? parseInt(established) : new Date().getFullYear(),
      accreditation: accreditation || 'NAAC A'
    }
  });

  if (error) throw new Error(error.message);
};

export const broadcastNotification = async (data) => {
  const { title, message } = data;

  const { data: profiles, error } = await supabase.from('profiles').select('id');
  if (error) throw new Error(error.message);

  if (profiles && profiles.length > 0) {
    const inserts = profiles.map(p => {
      return {
        user_id: p.id,
        title,
        message,
        is_read: false
      };
    });

    const { error: insErr } = await supabase.from('notifications').insert(inserts);
    if (insErr) throw new Error(insErr.message);
  }
};

export const resetMockDb = () => {
  localStorage.removeItem('mock_session');
  return {};
};

// ══════════════════════════════════════════════════════════════
// PEER TO PEER CHAT & STUDENT ENROLLMENT DETAILS
// ══════════════════════════════════════════════════════════════

export const getStudentsByCollege = async (collegeId) => {
  const { data, error } = await supabase
    .from('students')
    .select('*, profiles(*)')
    .eq('college_id', collegeId);

  if (error) throw new Error(error.message);

  return (data || []).map(s => ({
    user_id: s.user_id,
    name: s.profiles?.name || 'Anonymous Student',
    email: s.profiles?.email,
    phone: s.profiles?.phone,
    profile_photo: s.profile_photo,
    is_college_student: s.is_college_student,
    college_id: s.college_id,
    college_name: s.college_name,
    branch: s.branch,
    batch: s.batch,
    bio: s.bio
  }));
};

export const getChatHistory = async (otherUserId) => {
  const uid = getActiveUserId();
  if (!uid) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${uid},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${uid})`)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};

export const sendPeerMessage = async (receiverId, content) => {
  const uid = getActiveUserId();
  if (!uid) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: uid,
      receiver_id: receiverId,
      content
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const getActiveChatPartners = async () => {
  const uid = getActiveUserId();
  if (!uid) throw new Error('Not authenticated');

  const { data, error } = await supabase.rpc('get_active_chat_partners', { p_user_id: uid });
  if (error) throw new Error(error.message);
  return data || [];
};

// ══════════════════════════════════════════════════════════════
// CAMPUS BUDDY ENDPOINTS
// ══════════════════════════════════════════════════════════════

/**
 * Submit a Campus Buddy verification request.
 * Uploads the ID card, inserts into campus_buddies, and creates
 * a pending notification for the college.
 */
export const submitCampusBuddyRequest = async ({
  userId,
  college_id,
  college_name,
  department,
  year,
  roll_number,
  college_email,
  idCardFile,
  why_buddy,
}) => {
  const uid = userId || getActiveUserId();
  if (!uid) throw new Error('Not authenticated');

  // ── Upload Student ID Card ─────────────────────────────────
  let student_id_url = null;
  if (idCardFile) {
    const fileExt = idCardFile.name.split('.').pop();
    const filePath = `${uid}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('student-ids')
      .upload(filePath, idCardFile, { upsert: true });
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('student-ids').getPublicUrl(filePath);
      student_id_url = publicUrl;
    } else {
      console.warn('ID card upload failed:', uploadError.message);
    }
  }

  // ── Insert campus buddy request ────────────────────────────
  const { data: inserted, error } = await supabase
    .from('campus_buddies')
    .insert({
      user_id: uid,
      college_id: college_id || null,
      college_name,
      department,
      year,
      roll_number,
      college_email: college_email.trim().toLowerCase(),
      student_id_url,
      why_buddy: why_buddy || null,
      verification_status: 'pending',
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('You have already applied for Campus Buddy.');
    throw new Error(error.message);
  }

  return { success: true, request: inserted };
};

// Backwards-compat alias
export const registerCampusBuddy = submitCampusBuddyRequest;

/**
 * Get all Campus Buddy requests for a specific college.
 * Includes the student's profile name, email and phone.
 */
export const getCollegeCampusBuddyRequests = async (collegeId) => {
  if (!collegeId) throw new Error('College ID required');
  const { data, error } = await supabase
    .from('campus_buddies')
    .select('*, profiles(name, email, phone)')
    .eq('college_id', collegeId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
};

/**
 * Approve a Campus Buddy request.
 * Sets status → approved, sends success notification to student.
 */
export const approveCampusBuddyRequest = async (requestId, adminNote = '') => {
  // Get the request first to know who to notify
  const { data: req, error: fetchErr } = await supabase
    .from('campus_buddies')
    .select('user_id, college_name')
    .eq('id', requestId)
    .single();
  if (fetchErr) throw new Error(fetchErr.message);

  const { error } = await supabase
    .from('campus_buddies')
    .update({ verification_status: 'approved', admin_note: adminNote || null })
    .eq('id', requestId);
  if (error) throw new Error(error.message);

  // Send notification to student
  await supabase.from('notifications').insert({
    user_id: req.user_id,
    title: '🎉 Campus Buddy Approved!',
    message: `Congratulations! Your Campus Buddy account has been approved by ${req.college_name}. You can now connect with students across the InfoHub platform.`,
    type: 'success',
  });

  return { success: true };
};

/**
 * Reject a Campus Buddy request.
 * Sets status → rejected, saves rejection reason, notifies student.
 */
export const rejectCampusBuddyRequest = async (requestId, rejectionReason) => {
  const { data: req, error: fetchErr } = await supabase
    .from('campus_buddies')
    .select('user_id, college_name')
    .eq('id', requestId)
    .single();
  if (fetchErr) throw new Error(fetchErr.message);

  const { error } = await supabase
    .from('campus_buddies')
    .update({ verification_status: 'rejected', rejection_reason: rejectionReason })
    .eq('id', requestId);
  if (error) throw new Error(error.message);

  await supabase.from('notifications').insert({
    user_id: req.user_id,
    title: '❌ Campus Buddy Request Rejected',
    message: `Your Campus Buddy verification request was rejected by ${req.college_name}. Reason: ${rejectionReason}. Please verify your details and re-submit.`,
    type: 'error',
  });

  return { success: true };
};

/**
 * Get the Campus Buddy status for a given student.
 * Returns null if no request found.
 */
export const getStudentCampusBuddyStatus = async (userId) => {
  const uid = userId || getActiveUserId();
  if (!uid) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('campus_buddies')
    .select('*')
    .eq('user_id', uid)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
};

// Backwards-compat alias
export const getCampusBuddyStatus = getStudentCampusBuddyStatus;

/** Get all Campus Buddy applications (admin). */
export const getAllCampusBuddyApplications = async () => {
  const { data, error } = await supabase
    .from('campus_buddies')
    .select('*, profiles(name, email, phone)')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
};

// ══════════════════════════════════════════════════════════════
// NOTIFICATIONS ENDPOINTS
// ══════════════════════════════════════════════════════════════

/** Send a notification to a user. */
export const sendNotification = async ({ userId, title, message, type = 'info' }) => {
  const { error } = await supabase.from('notifications').insert({
    user_id: userId, title, message, type,
  });
  if (error) throw new Error(error.message);
  return { success: true };
};

/** Get all notifications for the current user, newest first. */
export const getMyNotifications = async (userId) => {
  const uid = userId || getActiveUserId();
  if (!uid) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', uid)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return data || [];
};

/** Mark a single notification as read. */
export const markNotificationRead = async (notifId) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notifId);
  if (error) throw new Error(error.message);
  return { success: true };
};

/** Mark all notifications as read for a user. */
export const markAllNotificationsRead = async (userId) => {
  const uid = userId || getActiveUserId();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', uid)
    .eq('is_read', false);
  if (error) throw new Error(error.message);
  return { success: true };
};


/**
 * Register the current user as a Campus Buddy.
 * Optionally uploads a student ID card to Supabase storage.
 *
 * @param {Object} params
 * @param {string} params.userId       - Profile UUID of the registering user
 * @param {string} params.college_name - College name (from registration form)
 * @param {string} params.department   - Student's department / branch
 * @param {string} params.year         - Year of study (e.g. "2nd Year")
 * @param {string} params.roll_number  - Student roll number
 * @param {string} params.college_email- Official college email address
 * @param {File}   [params.idCardFile] - Student ID card image/PDF file (optional)
 * @param {string} [params.why_buddy]  - Motivation text (optional)
 */
export const registerCampusBuddy = async ({
  userId,
  college_name,
  department,
  year,
  roll_number,
  college_email,
  idCardFile,
  why_buddy,
}) => {
  const uid = userId || getActiveUserId();
  if (!uid) throw new Error('Not authenticated');

  // ── Upload Student ID Card ──────────────────────────────────
  let student_id_url = null;

  if (idCardFile) {
    const fileExt = idCardFile.name.split('.').pop();
    const filePath = `${uid}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('student-ids')
      .upload(filePath, idCardFile, { upsert: true });

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('student-ids')
        .getPublicUrl(filePath);
      student_id_url = publicUrl;
    } else {
      // Non-fatal: store without ID card URL, admin can request later
      console.warn('Student ID card upload failed:', uploadError.message);
    }
  }

  // ── Insert into campus_buddies ──────────────────────────────
  const { error } = await supabase.from('campus_buddies').insert({
    user_id: uid,
    college_name,
    department,
    year,
    roll_number,
    college_email: college_email.trim().toLowerCase(),
    student_id_url,
    why_buddy: why_buddy || null,
    verification_status: 'pending',
  });

  if (error) {
    if (error.code === '23505') throw new Error('You have already applied for Campus Buddy.');
    throw new Error(error.message);
  }

  return { success: true };
};

/**
 * Get the Campus Buddy registration status for a given user.
 * Returns null if the user has not registered as a campus buddy.
 */
export const getCampusBuddyStatus = async (userId) => {
  const uid = userId || getActiveUserId();
  if (!uid) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('campus_buddies')
    .select('*')
    .eq('user_id', uid)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data; // null if not found
};

/**
 * Get all Campus Buddy applications (admin use).
 * Includes profile info joined from profiles table.
 */
export const getAllCampusBuddyApplications = async () => {
  const { data, error } = await supabase
    .from('campus_buddies')
    .select('*, profiles(name, email, phone)')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};

/**
 * Approve or reject a Campus Buddy application (admin use).
 *
 * @param {string} buddyId    - UUID of the campus_buddies row
 * @param {'approved'|'rejected'} status
 * @param {string} [adminNote]- Optional admin note / rejection reason
 */
export const updateCampusBuddyStatus = async (buddyId, status, adminNote) => {
  if (!['approved', 'rejected'].includes(status))
    throw new Error("Status must be 'approved' or 'rejected'.");

  const { error } = await supabase
    .from('campus_buddies')
    .update({
      verification_status: status,
      admin_note: adminNote || null,
    })
    .eq('id', buddyId);

  if (error) throw new Error(error.message);
  return { success: true };
};
