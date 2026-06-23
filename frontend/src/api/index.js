import api from './axios';

// ── Auth ────────────────────────────────────────────────────
export const register = (data)       => api.post('/auth/register', data);
export const login    = (data)       => api.post('/auth/login', data);
export const getMe    = ()           => api.get('/auth/me');

// ── Student (protected: student role) ───────────────────────
export const getStudentProfile    = ()       => api.get('/students/profile');
export const updateStudentProfile = (data)   => api.put('/students/profile', data);
export const uploadStudentPhoto   = (fd)     => api.post('/students/profile/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getRecommendations   = ()       => api.get('/students/recommendations');
export const getMyApplications    = ()       => api.get('/applications/my');

// ── Colleges (PUBLIC) ───────────────────────────────────────
export const getPublicColleges    = ()         => api.get('/colleges/list');
export const getColleges          = (params)   => api.get('/colleges/search', { params });
export const getCollegeById       = (id)       => api.get(`/colleges/${id}`);

// ── College Dashboard (protected: college role) ─────────────
export const getCollegeProfile    = ()           => api.get('/colleges/profile');
export const updateCollegeProfile = (data)       => api.put('/colleges/profile', data);
export const uploadCollegeLogo    = (fd)         => api.post('/colleges/logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
export const addCourse            = (data)       => api.post('/colleges/courses', data);
export const updateCourse         = (id, data)   => api.put(`/colleges/courses/${id}`, data);
export const deleteCourse         = (id)         => api.delete(`/colleges/courses/${id}`);
export const createPost           = (fd)         => api.post('/colleges/posts', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deletePost           = (id)         => api.delete(`/colleges/posts/${id}`);
export const createEvent          = (fd)         => api.post('/colleges/events', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
export const addPlacement         = (data)       => api.post('/colleges/placements', data);
export const addScholarship       = (data)       => api.post('/colleges/scholarships', data);
export const getCollegeApplications = (params)   => api.get('/colleges/applications', { params });
export const updateAppStatus      = (id, status) => api.patch(`/colleges/applications/${id}`, { status });

// ── Admissions & Registrations ──────────────────────────────
export const applyToCollege  = (data) => api.post('/applications', data);

// ── Events Module ───────────────────────────────────────────
export const getEvents        = (params) => api.get('/events', { params });
export const getEventById     = (id)     => api.get(`/events/${id}`);
export const registerForEvent = (id)     => api.post(`/events/${id}/register`);

// ── Scholarships Module ─────────────────────────────────────
export const getScholarships     = (params) => api.get('/scholarships', { params });
export const getScholarshipById = (id)     => api.get(`/scholarships/${id}`);

// ── Internships Module ──────────────────────────────────────
export const getInternships     = (params) => api.get('/internships', { params });
export const getInternshipById = (id)     => api.get(`/internships/${id}`);
export const createInternship   = (data)   => api.post('/internships', data);

// ── Quizzes Module ──────────────────────────────────────────
export const saveQuizResult   = (data) => api.post('/quizzes/result', data);
export const getMyQuizResults = ()     => api.get('/quizzes/my');

// ── Saved Items Module ──────────────────────────────────────
export const saveItem       = (type, itemId) => api.post('/saved-items', { type, item_id: itemId });
export const getSavedItems  = ()             => api.get('/saved-items');
export const removeSavedItem = (id)          => api.delete(`/saved-items/${id}`);

// ── College Reviews & Ratings ───────────────────────────────
export const addCollegeReview = (collegeId, data) => api.post(`/colleges/${collegeId}/reviews`, data);

// ── Notifications Module ────────────────────────────────────
export const getNotifications = ()   => api.get('/notifications');
export const markNotificationAsRead = (id) => api.patch(`/notifications/${id}/read`);

// ── Chatbot ──────────────────────────────────────────────────
export const sendChatMessage = (message) => api.post('/chatbot/message', { message });

// ── Media ────────────────────────────────────────────────────
export const uploadMedia = (fd) => api.post('/media/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });

// ── Super Admin Dashboard ───────────────────────────────────
export const getAdminStats          = () => api.get('/admin/stats');
export const getAdminStudents       = () => api.get('/admin/students');
export const getAdminColleges       = () => api.get('/admin/colleges');
export const broadcastNotification  = (data) => api.post('/admin/broadcast', data);
export const deleteReviewByAdmin    = (id) => api.delete(`/admin/reviews/${id}`);
