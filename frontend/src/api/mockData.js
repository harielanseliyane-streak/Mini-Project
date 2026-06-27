// ─────────────────────────────────────────────────────────────
// Combined Mock Database and API Client – 100% Client-Side
// ─────────────────────────────────────────────────────────────

// Helper to generate UUIDs
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// ══════════════════════════════════════════════════════════════
// DATABASE SEEDS
// ══════════════════════════════════════════════════════════════
const SEED_PROFILES = [
  {
    id: 'student-id-1',
    role: 'student',
    name: 'Hari Elanseliyan',
    email: 'student@infohub.com',
    phone: '+91 9876543210',
    created_at: new Date().toISOString()
  },
  {
    id: 'college-id-1',
    role: 'college',
    name: 'PSG College of Technology',
    email: 'college@infohub.com',
    phone: '+91 422 2572177',
    created_at: new Date().toISOString()
  },
  {
    id: 'college-id-2',
    role: 'college',
    name: 'SSN College of Engineering',
    email: 'ssn@infohub.com',
    phone: '+91 44 27469700',
    created_at: new Date().toISOString()
  },
  {
    id: 'college-id-3',
    role: 'college',
    name: 'Madras Institute of Technology',
    email: 'mit@infohub.com',
    phone: '+91 44 22516002',
    created_at: new Date().toISOString()
  },
  {
    id: 'admin-id-1',
    role: 'admin',
    name: 'InfoHub Administrator',
    email: 'admin@infohub.com',
    phone: '+91 9999999999',
    created_at: new Date().toISOString()
  }
];

const SEED_STUDENTS = [
  {
    user_id: 'student-id-1',
    hsc_marks: 92.5,
    cutoff: 185.0,
    profile_photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    bio: 'Aspiring Computer Science student with a strong interest in Web Development and Machine Learning.',
    interests: 'Coding, UI/UX Design, Open Source Contributions',
    skills: 'HTML, CSS, JavaScript, React, Python',
    career_goals: 'Software Architect or AI Engineer',
    location_pref: 'Chennai, Coimbatore',
    budget_pref: 150000,
    course_pref: 'Computer Science and Engineering, Information Technology'
  }
];

const SEED_COLLEGES = [
  {
    user_id: 'college-id-1',
    college_name: 'PSG College of Technology',
    address: 'Avinashi Road, Peelamedu',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    website: 'https://www.psgtech.edu',
    logo: 'https://images.unsplash.com/photo-1562774053-701939374585?w=120&auto=format&fit=crop&q=80',
    description: 'PSG College of Technology, established in 1951, is an ISO 9001:2015 certified government-aided institution. Popularly known as PSG Tech, it is one of the most prestigious engineering institutions in India, offering world-class infrastructure and top-tier industry collaborations.',
    established: 1951,
    accreditation: 'NAAC A++',
    infrastructure: 'Modern laboratory setups, high-tech research centers, fully automated central library, multi-purpose sports complex, and Wi-Fi enabled smart classrooms.',
    hostel_info: 'Spacious on-campus hostels for boys and girls with fully equipped mess facilities, gyms, and recreational halls.',
    fee_structure: 'Aided Courses: ₹25,000 - ₹40,000/year. Self-Financed Courses: ₹1,500,000 - ₹2,00,000/year.'
  },
  {
    user_id: 'college-id-2',
    college_name: 'SSN College of Engineering',
    address: 'Rajiv Gandhi Salai (OMR), Kalavakkam',
    city: 'Chennai',
    state: 'Tamil Nadu',
    website: 'https://www.ssn.edu.in',
    logo: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=120&auto=format&fit=crop&q=80',
    description: 'Sri Sivasubramaniya Nadar (SSN) College of Engineering, founded by Dr. Shiv Nadar (Chairman, HCL Technologies), is a highly acclaimed private institution known for its state-of-the-art infrastructure, research focus, and lush green campus.',
    established: 1996,
    accreditation: 'NAAC A+',
    infrastructure: '250-acre green campus, advanced research facilities, fully computerized air-conditioned library, indoor stadium, and high-speed Wi-Fi.',
    hostel_info: 'Excellent hostel facilities with internet, laundry, and delicious food options.',
    fee_structure: 'Management/Merit Quota: ₹1,20,000 - ₹2,20,000/year.'
  },
  {
    user_id: 'college-id-3',
    college_name: 'Madras Institute of Technology',
    address: 'Chromepet',
    city: 'Chennai',
    state: 'Tamil Nadu',
    website: 'https://www.mitindia.edu',
    logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=120&auto=format&fit=crop&q=80',
    description: 'Madras Institute of Technology (MIT) is a constituent college of Anna University, established in 1949. It pioneered courses like Aeronautical Engineering and Automobile Engineering in India. Notably, former President Dr. A.P.J. Abdul Kalam is an alumnus.',
    established: 1949,
    accreditation: 'Anna University Constituent - NBA Accredited',
    infrastructure: 'Aviation hangar, advanced automotive labs, central computing center, and specialized research facilities.',
    hostel_info: 'Traditional hostels with focus on discipline, shared study spaces, and good food.',
    fee_structure: 'Government Fees: ₹20,000 - ₹50,000/year.'
  }
];

const SEED_COURSES = [
  {
    id: 'course-1',
    college_id: 'college-id-1',
    course_name: 'Computer Science and Engineering',
    cutoff: 196.5,
    seats: 120,
    duration: '4 Years',
    department: 'Computer Science',
    fee_per_year: 85000,
    created_at: new Date().toISOString()
  },
  {
    id: 'course-2',
    college_id: 'college-id-1',
    course_name: 'Electronics and Communication Engineering',
    cutoff: 195.0,
    seats: 120,
    duration: '4 Years',
    department: 'Electronics',
    fee_per_year: 85000,
    created_at: new Date().toISOString()
  },
  {
    id: 'course-3',
    college_id: 'college-id-1',
    course_name: 'Mechanical Engineering',
    cutoff: 188.0,
    seats: 120,
    duration: '4 Years',
    department: 'Mechanical',
    fee_per_year: 50000,
    created_at: new Date().toISOString()
  },
  {
    id: 'course-4',
    college_id: 'college-id-1',
    course_name: 'Information Technology',
    cutoff: 194.5,
    seats: 60,
    duration: '4 Years',
    department: 'Computer Science',
    fee_per_year: 120000,
    created_at: new Date().toISOString()
  },
  {
    id: 'course-5',
    college_id: 'college-id-2',
    course_name: 'Computer Science and Engineering',
    cutoff: 195.5,
    seats: 180,
    duration: '4 Years',
    department: 'Computer Science',
    fee_per_year: 150000,
    created_at: new Date().toISOString()
  },
  {
    id: 'course-6',
    college_id: 'college-id-2',
    course_name: 'Information Technology',
    cutoff: 193.5,
    seats: 120,
    duration: '4 Years',
    department: 'Computer Science',
    fee_per_year: 145000,
    created_at: new Date().toISOString()
  },
  {
    id: 'course-7',
    college_id: 'college-id-2',
    course_name: 'Chemical Engineering',
    cutoff: 178.0,
    seats: 60,
    duration: '4 Years',
    department: 'Chemical',
    fee_per_year: 120000,
    created_at: new Date().toISOString()
  },
  {
    id: 'course-8',
    college_id: 'college-id-3',
    course_name: 'Aeronautical Engineering',
    cutoff: 194.0,
    seats: 60,
    duration: '4 Years',
    department: 'Aerospace',
    fee_per_year: 35000,
    created_at: new Date().toISOString()
  },
  {
    id: 'course-9',
    college_id: 'college-id-3',
    course_name: 'Computer Science and Engineering',
    cutoff: 198.0,
    seats: 60,
    duration: '4 Years',
    department: 'Computer Science',
    fee_per_year: 35000,
    created_at: new Date().toISOString()
  },
  {
    id: 'course-10',
    college_id: 'college-id-3',
    course_name: 'Automobile Engineering',
    cutoff: 186.5,
    seats: 60,
    duration: '4 Years',
    department: 'Automotive',
    fee_per_year: 30000,
    created_at: new Date().toISOString()
  }
];

const SEED_PLACEMENTS = [
  {
    id: 'placement-1',
    college_id: 'college-id-1',
    year: 2025,
    highest_package: 42.5,
    average_package: 8.2,
    placement_percent: 96.5,
    top_recruiters: 'Microsoft, Amazon, Zoho, Cisco, Qualcomm',
    description: 'Outstanding placement season with over 200 companies visiting campus.',
    created_at: new Date().toISOString()
  },
  {
    id: 'placement-2',
    college_id: 'college-id-1',
    year: 2024,
    highest_package: 38.0,
    average_package: 7.8,
    placement_percent: 94.0,
    top_recruiters: 'Google, Nvidia, Caterpillar, TCS, Infosys',
    description: 'Strong performance across core engineering branches.',
    created_at: new Date().toISOString()
  },
  {
    id: 'placement-3',
    college_id: 'college-id-2',
    year: 2025,
    highest_package: 64.0,
    average_package: 9.1,
    placement_percent: 98.0,
    top_recruiters: 'Apple, Amazon, Adobe, Goldman Sachs, Cognizant',
    description: 'SSN recorded its highest package ever in CSE department this year.',
    created_at: new Date().toISOString()
  },
  {
    id: 'placement-4',
    college_id: 'college-id-3',
    year: 2025,
    highest_package: 36.0,
    average_package: 7.5,
    placement_percent: 92.0,
    top_recruiters: 'ISRO, HAL, Boeing, Ashok Leyland, TCS R&D',
    description: 'Core companies dominated placements in Aeronautical and Automobile fields.',
    created_at: new Date().toISOString()
  }
];

const SEED_EVENTS = [
  {
    id: 'event-1',
    college_id: 'college-id-1',
    name: 'Kriya 2026 - International Tech Fest',
    description: 'Kriya is the biggest student-run tech fest in Coimbatore, attracting participants from all over India for robotics, coding, hackathons, and guest lectures.',
    event_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'PSG Tech Campus, Coimbatore',
    registration_deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    max_participants: 2000,
    created_at: new Date().toISOString()
  },
  {
    id: 'event-2',
    college_id: 'college-id-2',
    name: 'Invente 2026 - National Symposium',
    description: 'Invente is a 2-day national technical symposium by SSN College of Engineering, with technical, non-technical, and gaming events.',
    event_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'SSN Campus, OMR, Chennai',
    registration_deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    max_participants: 1500,
    created_at: new Date().toISOString()
  }
];

const SEED_SCHOLARSHIPS = [
  {
    id: 'scholarship-1',
    college_id: 'college-id-1',
    type: 'merit',
    name: 'PSG Alumni Scholarship',
    description: 'Awarded to students with excellent academic records and a family income under 3 LPA.',
    amount: 50000,
    eligibility: 'Cutoff > 192, Income < 3,00,000 per year',
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: 'scholarship-2',
    college_id: 'college-id-2',
    type: 'merit',
    name: 'SSN Merit Scholarship Scheme',
    description: 'Fully waives tuition fee for students obtaining Anna University ranks or top ranks in qualifying board exams.',
    amount: 150000,
    eligibility: '100% tuition waiver for Board Toppers or Cutoff > 198',
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: 'scholarship-3',
    college_id: null,
    type: 'government',
    name: 'TN First Graduate Scholarship',
    description: 'Government scholarship providing fee concessions for students who are the first in their families to attend college.',
    amount: 25000,
    eligibility: 'First graduate certificate holder, admitting through single window counseling',
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString()
  }
];

const SEED_INTERNSHIPS = [
  {
    id: 'internship-1',
    company_name: 'Zoho Corporation',
    title: 'Software Developer Intern',
    description: 'Work with the Zoho Creator team building cloud computing solutions. Open to final/pre-final year engineering students.',
    stipend: 25000,
    duration: '6 Months',
    location: 'Chennai (Onsite)',
    eligibility: 'Strong knowledge of Java/C++ and database design',
    skills_required: 'Java, Javascript, SQL',
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: 'internship-2',
    company_name: 'Cognizant Technology Solutions',
    title: 'Associate Programmer Intern',
    description: 'Fast-track internship program leading to a full-time role. Work on enterprise Java applications.',
    stipend: 15000,
    duration: '3 Months',
    location: 'Coimbatore (Hybrid)',
    eligibility: 'Graduating in 2026, CSE/IT/ECE branches',
    skills_required: 'Python, Basic programming, OOPs concepts',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString()
  }
];

const SEED_POSTS = [
  {
    id: 'post-1',
    college_id: 'college-id-1',
    type: 'placement',
    title: 'PSG Tech Achieves 96% Placements in 2025!',
    description: 'Congratulations to our engineering batch! The highest package was 42.5 LPA offered by Microsoft. We thank our recruiters and cell coordinators.',
    media_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
    media_type: 'image',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'post-2',
    college_id: 'college-id-1',
    type: 'announcement',
    title: 'Hostel Renovations Completed',
    description: 'The dining halls in block C and D have been upgraded with new equipment and seating capacity has been doubled.',
    media_url: null,
    media_type: 'none',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'post-3',
    college_id: 'college-id-2',
    type: 'event',
    title: 'SSN Invente 2026 Registration is Now Open!',
    description: 'Sign up for paper presentations, robot wars, UI design, and our 24-hour hackathon. Cash prizes worth 2 Lakhs!',
    media_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80',
    media_type: 'image',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_REVIEWS = [
  {
    id: 'review-1',
    student_id: 'student-id-1',
    college_id: 'college-id-1',
    content: 'PSG Tech is excellent for academic learning and industry exposure. Placements are great, but the campus is a bit crowded.',
    rating: 4,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'review-2',
    student_id: 'student-id-1',
    college_id: 'college-id-2',
    content: 'Awesome campus life! SSN provides great opportunities in research and extracurriculars. The library is massive.',
    rating: 5,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_NOTIFICATIONS = [
  {
    id: 'notification-1',
    user_id: 'student-id-1',
    title: 'Welcome to InfoHub!',
    message: 'Explore engineering colleges in Tamil Nadu, compare features, calculate your cutoff, and apply directly to colleges!',
    is_read: false,
    created_at: new Date().toISOString()
  }
];

const SEED_APPLICATIONS = [
  {
    id: 'app-1',
    student_id: 'student-id-1',
    college_id: 'college-id-1',
    course_id: 'course-1',
    event_id: null,
    type: 'admission',
    status: 'pending',
    message: 'Submitted via InfoHub portal.',
    applied_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_SAVED_ITEMS = [
  {
    id: 'saved-1',
    student_id: 'student-id-1',
    type: 'college',
    item_id: 'college-id-1',
    created_at: new Date().toISOString()
  }
];

const SEED_QUIZ_RESULTS = [];

// ══════════════════════════════════════════════════════════════
// DATABASE CONTROLLERS (LOCAL STORAGE READ/WRITE)
// ══════════════════════════════════════════════════════════════
export const initMockDb = () => {
  const getOrSet = (key, seedData) => {
    const val = localStorage.getItem(key);
    if (!val) {
      localStorage.setItem(key, JSON.stringify(seedData));
      return seedData;
    }
    try {
      return JSON.parse(val);
    } catch (e) {
      localStorage.setItem(key, JSON.stringify(seedData));
      return seedData;
    }
  };

  return {
    profiles:      getOrSet('db_profiles', SEED_PROFILES),
    students:      getOrSet('db_students', SEED_STUDENTS),
    colleges:      getOrSet('db_colleges', SEED_COLLEGES),
    courses:       getOrSet('db_courses', SEED_COURSES),
    placements:    getOrSet('db_placements', SEED_PLACEMENTS),
    events:        getOrSet('db_events', SEED_EVENTS),
    scholarships:  getOrSet('db_scholarships', SEED_SCHOLARSHIPS),
    internships:   getOrSet('db_internships', SEED_INTERNSHIPS),
    posts:         getOrSet('db_posts', SEED_POSTS),
    reviews:       getOrSet('db_reviews', SEED_REVIEWS),
    notifications: getOrSet('db_notifications', SEED_NOTIFICATIONS),
    applications:  getOrSet('db_applications', SEED_APPLICATIONS),
    saved_items:   getOrSet('db_saved_items', SEED_SAVED_ITEMS),
    quiz_results:  getOrSet('db_quiz_results', SEED_QUIZ_RESULTS)
  };
};

export const getDbTable = (table) => {
  const val = localStorage.getItem(`db_${table}`);
  if (!val) {
    const fullDb = initMockDb();
    return fullDb[table];
  }
  try {
    return JSON.parse(val);
  } catch (e) {
    console.error(`Error parsing table db_${table}`, e);
    return [];
  }
};

export const setDbTable = (table, data) => {
  localStorage.setItem(`db_${table}`, JSON.stringify(data));
};

export const resetMockDb = () => {
  localStorage.removeItem('db_profiles');
  localStorage.removeItem('db_students');
  localStorage.removeItem('db_colleges');
  localStorage.removeItem('db_courses');
  localStorage.removeItem('db_placements');
  localStorage.removeItem('db_events');
  localStorage.removeItem('db_scholarships');
  localStorage.removeItem('db_internships');
  localStorage.removeItem('db_posts');
  localStorage.removeItem('db_reviews');
  localStorage.removeItem('db_notifications');
  localStorage.removeItem('db_applications');
  localStorage.removeItem('db_saved_items');
  localStorage.removeItem('db_quiz_results');
  localStorage.removeItem('mock_session');
  return initMockDb();
};

// Auto-run DB init on import
if (typeof window !== 'undefined') {
  initMockDb();
}

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

// Helper to compute stats for colleges dynamically
const computeCollegeStats = (college, courses, placements) => {
  const collegeCourses = courses.filter(co => co.college_id === college.user_id);
  const collegePlacements = placements.filter(pl => pl.college_id === college.user_id);
  
  const cutoffs = collegeCourses.map(co => co.cutoff).filter(x => !isNaN(x) && x !== null);
  const min_cutoff = cutoffs.length > 0 ? Math.min(...cutoffs) : null;
  const course_count = collegeCourses.length;
  
  const sortedPlacements = [...collegePlacements].sort((a, b) => b.year - a.year);
  const latestPlacement = sortedPlacements[0];
  const placement_percent = latestPlacement ? latestPlacement.placement_percent : null;
  const average_package = latestPlacement ? latestPlacement.average_package : null;

  return {
    courses: collegeCourses,
    placements: sortedPlacements,
    min_cutoff,
    course_count,
    placement_percent,
    average_package
  };
};

// ══════════════════════════════════════════════════════════════
// AUTHENTICATION ENDPOINTS
// ══════════════════════════════════════════════════════════════
export const login = async (email, password) => {
  const profiles = getDbTable('profiles');
  const matched = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
  if (!matched) throw new Error('Invalid email or password');
  
  if (matched.id.includes('id-1') || matched.id.includes('id-2') || matched.id.includes('id-3')) {
    if (password !== 'password123') throw new Error('Invalid password. Try password123');
  }

  const sessionUser = {
    id: matched.id,
    email: matched.email,
    role: matched.role,
    name: matched.name,
    phone: matched.phone
  };

  const mockSession = {
    access_token: 'mock-jwt-token-' + matched.id,
    user: sessionUser
  };

  localStorage.setItem('mock_session', JSON.stringify({ session: mockSession, user: sessionUser }));
  window.dispatchEvent(new Event('storage'));

  return { data: { session: mockSession, user: sessionUser }, error: null };
};

export const register = async ({ email, password, role, name, college_name, phone, city, state, address, website }) => {
  const profiles = getDbTable('profiles');
  const exists = profiles.some(p => p.email.toLowerCase() === email.toLowerCase());
  if (exists) throw new Error('Email already registered');

  const userId = generateUUID();
  const newProfile = {
    id: userId,
    role,
    name: role === 'student' ? name : college_name,
    email,
    phone: phone || null,
    created_at: new Date().toISOString()
  };

  profiles.push(newProfile);
  setDbTable('profiles', profiles);

  if (role === 'student') {
    const students = getDbTable('students');
    students.push({
      user_id: userId,
      hsc_marks: null,
      cutoff: null,
      profile_photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      bio: '',
      interests: '',
      skills: '',
      career_goals: '',
      location_pref: '',
      budget_pref: null,
      course_pref: ''
    });
    setDbTable('students', students);
  } else if (role === 'college') {
    const colleges = getDbTable('colleges');
    colleges.push({
      user_id: userId,
      college_name,
      city: city || null,
      state: state || null,
      address: address || null,
      website: website || null,
      logo: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=120&auto=format&fit=crop&q=80',
      description: `${college_name} is an educational institution.`,
      established: new Date().getFullYear(),
      accreditation: 'NAAC A'
    });
    setDbTable('colleges', colleges);
  }

  const sessionUser = {
    id: newProfile.id,
    email: newProfile.email,
    role: newProfile.role,
    name: newProfile.name,
    phone: newProfile.phone
  };

  const mockSession = {
    access_token: 'mock-jwt-token-' + newProfile.id,
    user: sessionUser
  };

  localStorage.setItem('mock_session', JSON.stringify({ session: mockSession, user: sessionUser }));
  window.dispatchEvent(new Event('storage'));

  return { user: sessionUser, session: mockSession };
};

// ══════════════════════════════════════════════════════════════
// STUDENT PROFILE ENDPOINTS
// ══════════════════════════════════════════════════════════════
export const getStudentProfile = async (userId) => {
  const uid = userId || getActiveUserId();
  if (!uid) throw new Error('Not authenticated');
  const students = getDbTable('students');
  const profiles = getDbTable('profiles');
  const student = students.find(s => s.user_id === uid);
  const profile = profiles.find(p => p.id === uid);
  if (!student) throw new Error('Student profile not found');
  
  const result = {
    ...student,
    profiles: profile
  };
  result.student = result;
  result.data = { student: result };
  return result;
};

export const getFullStudentProfile = async (userId) => {
  const uid = userId || getActiveUserId();
  if (!uid) throw new Error('Not authenticated');
  const students = getDbTable('students');
  const profiles = getDbTable('profiles');
  const student = students.find(s => s.user_id === uid) || {};
  const profile = profiles.find(p => p.id === uid) || {};
  
  const result = {
    ...profile,
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
  const { name, phone, bio, hsc_marks, cutoff, interests, skills, career_goals, location_pref, budget_pref, course_pref } = data;

  const profiles = getDbTable('profiles');
  const pIndex = profiles.findIndex(p => p.id === uid);
  if (pIndex !== -1) {
    if (name !== undefined) profiles[pIndex].name = name;
    if (phone !== undefined) profiles[pIndex].phone = phone;
    setDbTable('profiles', profiles);
  }

  const students = getDbTable('students');
  const sIndex = students.findIndex(s => s.user_id === uid);
  if (sIndex !== -1) {
    const s = students[sIndex];
    students[sIndex] = {
      ...s,
      bio: bio !== undefined ? bio : s.bio,
      hsc_marks: hsc_marks !== undefined ? (hsc_marks ? parseFloat(hsc_marks) : null) : s.hsc_marks,
      cutoff: cutoff !== undefined ? (cutoff ? parseFloat(cutoff) : null) : s.cutoff,
      interests: interests !== undefined ? interests : s.interests,
      skills: skills !== undefined ? skills : s.skills,
      career_goals: career_goals !== undefined ? career_goals : s.career_goals,
      location_pref: location_pref !== undefined ? location_pref : s.location_pref,
      budget_pref: budget_pref !== undefined ? (budget_pref ? parseFloat(budget_pref) : null) : s.budget_pref,
      course_pref: course_pref !== undefined ? course_pref : s.course_pref,
    };
    setDbTable('students', students);
  }
};

export const uploadStudentPhoto = async (userIdOrFile, file) => {
  let uid = userIdOrFile;
  if (userIdOrFile instanceof File || (userIdOrFile && typeof userIdOrFile === 'object' && !file)) {
    uid = getActiveUserId();
  }
  if (!uid) throw new Error('Not authenticated');
  const url = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop=q=80';
  const students = getDbTable('students');
  const sIndex = students.findIndex(s => s.user_id === uid);
  if (sIndex !== -1) {
    students[sIndex].profile_photo = url;
    setDbTable('students', students);
  }
  return url;
};

// ══════════════════════════════════════════════════════════════
// COLLEGE LISTING ENDPOINTS
// ══════════════════════════════════════════════════════════════
export const getColleges = async ({ search = '', city = '', cutoff = '', page = 1, limit = 12 } = {}) => {
  const colleges = getDbTable('colleges');
  const courses = getDbTable('courses');
  const placements = getDbTable('placements');

  let filtered = colleges.map(c => {
    const stats = computeCollegeStats(c, courses, placements);
    const mapped = {
      ...c,
      id: c.user_id,
      ...stats
    };
    mapped.college = mapped;
    return mapped;
  });

  if (search) {
    filtered = filtered.filter(c => c.college_name.toLowerCase().includes(search.toLowerCase()));
  }
  if (city) {
    filtered = filtered.filter(c => c.city.toLowerCase().includes(city.toLowerCase()));
  }
  if (cutoff) {
    const cutVal = parseFloat(cutoff);
    filtered = filtered.filter(c => c.courses?.some(co => co.cutoff <= cutVal));
  }

  const count = filtered.length;
  const from = (page - 1) * limit;
  const to = from + limit;
  const paginated = filtered.slice(from, to);

  const result = { colleges: paginated, pagination: { total: count, pages: Math.ceil(count / limit) } };
  result.data = result;
  return result;
};

export const getCollegeById = async (id) => {
  const colleges = getDbTable('colleges');
  const courses = getDbTable('courses');
  const placements = getDbTable('placements');
  const events = getDbTable('events');
  const scholarships = getDbTable('scholarships');
  const posts = getDbTable('posts');
  const profiles = getDbTable('profiles');

  const college = colleges.find(c => c.user_id === id);
  if (!college) throw new Error('College not found');

  const profile = profiles.find(p => p.id === id);
  const collegeEvents = events.filter(ev => ev.college_id === id);
  const collegeScholarships = scholarships.filter(sc => sc.college_id === id);
  const collegePosts = posts.filter(po => po.college_id === id);

  const stats = computeCollegeStats(college, courses, placements);

  const result = {
    ...college,
    id: college.user_id,
    email: profile?.email || null,
    profiles: profile,
    events: collegeEvents,
    scholarships: collegeScholarships,
    posts: collegePosts,
    ...stats
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

  const colleges = getDbTable('colleges');
  const cIndex = colleges.findIndex(c => c.user_id === uid);
  if (cIndex !== -1) {
    colleges[cIndex] = {
      ...colleges[cIndex],
      college_name: college_name !== undefined ? college_name : colleges[cIndex].college_name,
      city: city !== undefined ? city : colleges[cIndex].city,
      state: state !== undefined ? state : colleges[cIndex].state,
      address: address !== undefined ? address : colleges[cIndex].address,
      description: description !== undefined ? description : colleges[cIndex].description,
      website: website !== undefined ? website : colleges[cIndex].website,
      accreditation: accreditation !== undefined ? accreditation : colleges[cIndex].accreditation,
      established: established !== undefined ? parseInt(established) : colleges[cIndex].established
    };
    setDbTable('colleges', colleges);
  }

  if (college_name) {
    const profiles = getDbTable('profiles');
    const pIndex = profiles.findIndex(p => p.id === uid);
    if (pIndex !== -1) {
      profiles[pIndex].name = college_name;
      setDbTable('profiles', profiles);
    }
  }
};

export const uploadCollegeLogo = async (userIdOrFile, file) => {
  let uid = userIdOrFile;
  if (userIdOrFile instanceof File || (userIdOrFile && typeof userIdOrFile === 'object' && !file)) {
    uid = getActiveUserId();
  }
  if (!uid) throw new Error('Not authenticated');
  const logoUrl = 'https://images.unsplash.com/photo-1562774053-701939374585?w=120&auto=format&fit=crop&q=80';
  const colleges = getDbTable('colleges');
  const cIndex = colleges.findIndex(c => c.user_id === uid);
  if (cIndex !== -1) {
    colleges[cIndex].logo = logoUrl;
    setDbTable('colleges', colleges);
  }
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
  const courses = getDbTable('courses');
  courses.push({
    id: generateUUID(),
    college_id: uid,
    course_name: data.course_name,
    cutoff: parseFloat(data.cutoff),
    seats: parseInt(data.seats) || 60,
    duration: data.duration || '4 Years',
    department: data.department || 'General',
    fee_per_year: parseFloat(data.fee_per_year) || 0,
    created_at: new Date().toISOString()
  });
  setDbTable('courses', courses);
};

export const updateCourse = async (id, data) => {
  const courses = getDbTable('courses');
  const index = courses.findIndex(c => c.id === id);
  if (index !== -1) {
    courses[index] = {
      ...courses[index],
      course_name: data.course_name !== undefined ? data.course_name : courses[index].course_name,
      cutoff: data.cutoff !== undefined ? parseFloat(data.cutoff) : courses[index].cutoff,
      seats: data.seats !== undefined ? parseInt(data.seats) : courses[index].seats,
      duration: data.duration !== undefined ? data.duration : courses[index].duration,
      department: data.department !== undefined ? data.department : courses[index].department,
      fee_per_year: data.fee_per_year !== undefined ? parseFloat(data.fee_per_year) : courses[index].fee_per_year,
    };
    setDbTable('courses', courses);
  }
};

export const deleteCourse = async (id) => {
  const courses = getDbTable('courses');
  const filtered = courses.filter(c => c.id !== id);
  setDbTable('courses', filtered);
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

  const posts = getDbTable('posts');
  posts.push({
    id: generateUUID(),
    college_id: uid,
    type: data.type || 'general',
    title: data.title,
    description: data.description || null,
    media_url: mediaFile ? 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80' : null,
    media_type: mediaFile ? 'image' : 'none',
    created_at: new Date().toISOString()
  });
  setDbTable('posts', posts);
};

export const deletePost = async (id) => {
  const posts = getDbTable('posts');
  const filtered = posts.filter(p => p.id !== id);
  setDbTable('posts', filtered);
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

  const events = getDbTable('events');
  events.push({
    id: generateUUID(),
    college_id: uid,
    name: data.name,
    description: data.description || '',
    event_date: new Date(data.event_date).toISOString(),
    location: data.location || '',
    created_at: new Date().toISOString()
  });
  setDbTable('events', events);
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

  const placements = getDbTable('placements');
  placements.push({
    id: generateUUID(),
    college_id: uid,
    year: parseInt(pData.year),
    highest_package: parseFloat(pData.highest_package),
    average_package: parseFloat(pData.average_package),
    placement_percent: parseFloat(pData.placement_percent),
    top_recruiters: pData.top_recruiters || '',
    description: pData.description || '',
    created_at: new Date().toISOString()
  });
  setDbTable('placements', placements);
};

export const addScholarship = async (userIdOrData, data) => {
  let uid = userIdOrData;
  let sData = data;
  if (typeof userIdOrData === 'object') {
    sData = userIdOrData;
    uid = getActiveUserId();
  }
  if (!uid) throw new Error('Not authenticated');

  const scholarships = getDbTable('scholarships');
  scholarships.push({
    id: generateUUID(),
    college_id: uid,
    name: sData.name,
    description: sData.description || '',
    amount: parseFloat(sData.amount) || 0,
    eligibility: sData.eligibility || '',
    deadline: sData.deadline ? new Date(sData.deadline).toISOString() : null,
    created_at: new Date().toISOString()
  });
  setDbTable('scholarships', scholarships);
};

// ══════════════════════════════════════════════════════════════
// APPLICATIONS ENDPOINTS
// ══════════════════════════════════════════════════════════════
export const getCollegeApplications = async (userId) => {
  const uid = userId || getActiveUserId();
  if (!uid) throw new Error('Not authenticated');
  const apps = getDbTable('applications');
  const students = getDbTable('students');
  const profiles = getDbTable('profiles');
  const courses = getDbTable('courses');

  const collegeApps = apps.filter(a => a.college_id === uid);
  return collegeApps.map(a => {
    const student = students.find(s => s.user_id === a.student_id);
    const profile = profiles.find(p => p.id === a.student_id);
    const course = courses.find(c => c.id === a.course_id);

    return {
      id: a.id,
      type: a.type,
      status: a.status,
      applied_at: a.applied_at,
      course_name: course?.course_name || null,
      student_name: profile?.name || 'Anonymous Student',
      student_phone: profile?.phone || 'N/A',
      hsc_marks: student?.hsc_marks || null,
      cutoff: student?.cutoff || null,
    };
  });
};

export const updateAppStatus = async (appId, status) => {
  const apps = getDbTable('applications');
  const index = apps.findIndex(a => a.id === appId);
  if (index !== -1) {
    apps[index].status = status;
    setDbTable('applications', apps);

    const notifications = getDbTable('notifications');
    const colleges = getDbTable('colleges');
    const app = apps[index];
    const college = colleges.find(c => c.user_id === app.college_id);
    notifications.push({
      id: generateUUID(),
      user_id: app.student_id,
      title: `Application ${status.toUpperCase()}`,
      message: `Your application to ${college?.college_name || 'College'} has been ${status}.`,
      is_read: false,
      created_at: new Date().toISOString()
    });
    setDbTable('notifications', notifications);
  }
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

  const apps = getDbTable('applications');
  const existing = apps.find(a =>
    a.student_id === uid &&
    a.college_id === college_id &&
    a.type === (type || 'admission') &&
    (type === 'admission' ? a.course_id === course_id : true)
  );

  if (existing) throw new Error('Already applied');

  apps.push({
    id: generateUUID(),
    student_id: uid,
    college_id,
    course_id: course_id || null,
    event_id: event_id || null,
    type: type || 'admission',
    status: 'pending',
    applied_at: new Date().toISOString()
  });
  setDbTable('applications', apps);
};

export const getMyApplications = async (userId) => {
  const uid = userId || getActiveUserId();
  if (!uid) throw new Error('Not authenticated');
  const apps = getDbTable('applications');
  const colleges = getDbTable('colleges');
  const courses = getDbTable('courses');
  const events = getDbTable('events');

  const myApps = apps.filter(a => a.student_id === uid);
  const list = myApps.map(a => {
    const college = colleges.find(c => c.user_id === a.college_id);
    const course = courses.find(c => c.id === a.course_id);
    const event = events.find(e => e.id === a.event_id);

    return {
      id: a.id,
      type: a.type,
      status: a.status,
      applied_at: a.applied_at,
      college_name: college?.college_name || 'Unknown College',
      course_name: course?.course_name || null,
      event_name: event?.name || null
    };
  });

  list.data = { applications: list };
  return list;
};

// ══════════════════════════════════════════════════════════════
// PUBLIC EVENTS & SCHOLARSHIPS
// ══════════════════════════════════════════════════════════════
export const getEvents = async ({ search = '', page = 1, limit = 12 } = {}) => {
  const events = getDbTable('events');
  const colleges = getDbTable('colleges');

  let filtered = events.map(ev => {
    const college = colleges.find(c => c.user_id === ev.college_id);
    return {
      ...ev,
      colleges: college,
      college_name: college?.college_name || 'Unknown College',
      city: college?.city || 'Unknown City'
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
  const events = getDbTable('events');
  const colleges = getDbTable('colleges');
  const ev = events.find(e => e.id === id);
  if (!ev) throw new Error('Event not found');

  const college = colleges.find(c => c.user_id === ev.college_id);
  const result = {
    ...ev,
    colleges: college,
    college_name: college?.college_name || 'Unknown College',
    city: college?.city || 'Unknown City',
    logo: college?.logo || null
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
  const scholarships = getDbTable('scholarships');
  const colleges = getDbTable('colleges');

  let filtered = scholarships.map(s => {
    const college = colleges.find(c => c.user_id === s.college_id);
    return {
      ...s,
      colleges: college,
      college_name: college?.college_name || 'InfoHub General'
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
  const internships = getDbTable('internships');
  let filtered = [...internships];
  if (search) {
    filtered = filtered.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.company_name.toLowerCase().includes(search.toLowerCase()));
  }
  const result = [...filtered];
  result.data = { internships: filtered };
  return result;
};

export const createInternship = async (data) => {
  const internships = getDbTable('internships');
  internships.push({
    id: generateUUID(),
    company_name: data.company_name,
    title: data.title,
    description: data.description || '',
    stipend: parseFloat(data.stipend) || 0,
    duration: data.duration || '',
    location: data.location || '',
    created_at: new Date().toISOString()
  });
  setDbTable('internships', internships);
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

  const results = getDbTable('quiz_results');
  results.push({
    id: generateUUID(),
    student_id: uid,
    ...payload,
    created_at: new Date().toISOString()
  });
  setDbTable('quiz_results', results);
};

export const getMyQuizResults = async (userId) => {
  const uid = userId || getActiveUserId();
  if (!uid) throw new Error('Not authenticated');
  const results = getDbTable('quiz_results');
  const myResults = results.filter(r => r.student_id === uid);
  myResults.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  const result = [...myResults];
  result.data = { quiz_results: myResults };
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

  const saved = getDbTable('saved_items');
  const existing = saved.find(s => s.student_id === uid && s.type === type && s.item_id === id);
  if (existing) {
    const wrap = { ...existing };
    wrap.saved = wrap;
    wrap.data = { saved: wrap };
    return wrap;
  }

  const newItem = {
    id: generateUUID(),
    student_id: uid,
    type,
    item_id: id,
    created_at: new Date().toISOString()
  };
  saved.push(newItem);
  setDbTable('saved_items', saved);

  const wrap = { ...newItem };
  wrap.saved = wrap;
  wrap.data = { saved: wrap };
  return wrap;
};

export const getSavedItems = async (userId) => {
  const uid = userId || getActiveUserId();
  if (!uid) throw new Error('Not authenticated');
  const saved = getDbTable('saved_items');
  const colleges = getDbTable('colleges');

  const mySaved = saved.filter(s => s.student_id === uid);
  const list = mySaved.map(item => {
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
  const saved = getDbTable('saved_items');
  const filtered = saved.filter(s => s.id !== id);
  setDbTable('saved_items', filtered);
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

  const reviews = getDbTable('reviews');
  reviews.push({
    id: generateUUID(),
    student_id: uid,
    college_id: cid,
    content: rData.content,
    rating: rData.rating || 5,
    created_at: new Date().toISOString()
  });
  setDbTable('reviews', reviews);
};

// ══════════════════════════════════════════════════════════════
// NOTIFICATIONS ENDPOINTS
// ══════════════════════════════════════════════════════════════
export const getNotifications = async (userId) => {
  const uid = userId || getActiveUserId();
  if (!uid) throw new Error('Not authenticated');
  const notifications = getDbTable('notifications');
  const myNotifs = notifications.filter(n => n.user_id === uid);
  myNotifs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return myNotifs;
};

export const markNotificationAsRead = async (id) => {
  const notifications = getDbTable('notifications');
  const index = notifications.findIndex(n => n.id === id);
  if (index !== -1) {
    notifications[index].is_read = true;
    setDbTable('notifications', notifications);
  }
};

// ══════════════════════════════════════════════════════════════
// RECOMMENDATIONS ENDPOINTS
// ══════════════════════════════════════════════════════════════
export const getRecommendations = async (userId) => {
  const uid = userId || getActiveUserId();
  if (!uid) throw new Error('Not authenticated');
  const students = getDbTable('students');
  const student = students.find(s => s.user_id === uid);

  if (!student?.cutoff) return { eligible_colleges: [], scholarships: [], data: { eligible_colleges: [], scholarships: [] } };

  const colleges = getDbTable('colleges');
  const courses = getDbTable('courses');
  const placements = getDbTable('placements');
  const scholarships = getDbTable('scholarships');

  const eligible_colleges = [];
  colleges.forEach(college => {
    const collegeCourses = courses.filter(co => co.college_id === college.user_id);
    const collegePlacements = placements.filter(pl => pl.college_id === college.user_id);

    collegeCourses.forEach(course => {
      if (course.cutoff <= student.cutoff) {
        eligible_colleges.push({
          college_name: college.college_name,
          city: college.city,
          state: college.state,
          accreditation: college.accreditation,
          course_name: course.course_name,
          course_cutoff: course.cutoff,
          placement_percent: collegePlacements[0]?.placement_percent || null
        });
      }
    });
  });

  const matchedScholarships = scholarships.map(s => {
    const college = colleges.find(c => c.user_id === s.college_id);
    return {
      ...s,
      college_name: college?.college_name || 'InfoHub General'
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
    const colleges = getDbTable('colleges');
    const list = colleges.slice(0, 5).map(c => `• ${c.college_name} – ${c.city} (${c.accreditation || 'N/A'})`).join('\n');
    reply = `🏛️ **Top Colleges on InfoHub:**\n\n${list || 'No colleges found yet.'}\n\nVisit the Colleges page for full details, cutoffs, and placements!`;
  } else if (msg.includes('scholarship')) {
    const scholarships = getDbTable('scholarships');
    const list = scholarships.slice(0, 5).map(s => `• ${s.name} – ₹${s.amount?.toLocaleString() || 'N/A'}`).join('\n');
    reply = `🎖️ **Available Scholarships:**\n\n${list || 'Check back soon – new scholarships are added regularly!'}\n\nApply early – deadlines may be soon!`;
  } else if (msg.includes('internship')) {
    const internships = getDbTable('internships');
    const list = internships.slice(0, 5).map(i => `• ${i.title} at ${i.company_name}`).join('\n');
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
// ADMIN ENDPOINTS
// ══════════════════════════════════════════════════════════════
export const getAdminStats = async () => {
  const students = getDbTable('students');
  const colleges = getDbTable('colleges');
  const apps = getDbTable('applications');
  const events = getDbTable('events');
  const scholarships = getDbTable('scholarships');
  const internships = getDbTable('internships');

  return {
    students: students.length,
    colleges: colleges.length,
    applications: apps.length,
    events: events.length,
    scholarships: scholarships.length,
    internships: internships.length
  };
};

export const getAdminStudents = async () => {
  const profiles = getDbTable('profiles');
  const students = getDbTable('students');

  const studentProfiles = profiles.filter(p => p.role === 'student');
  return studentProfiles.map(p => {
    const student = students.find(s => s.user_id === p.id);
    return {
      id: p.id,
      name: p.name,
      phone: p.phone,
      cutoff: student?.cutoff || null
    };
  });
};

export const getAdminColleges = async () => {
  const colleges = getDbTable('colleges');
  const profiles = getDbTable('profiles');

  return colleges.map(c => {
    const profile = profiles.find(p => p.id === c.user_id);
    return {
      id: c.user_id,
      college_name: c.college_name,
      city: c.city,
      accreditation: c.accreditation,
      phone: profile?.phone || 'N/A'
    };
  });
};

export const addCollegeByAdmin = async (collegeData) => {
  const { college_name, email, password, phone, established, accreditation, city, state, website, address, description } = collegeData;

  const profiles = getDbTable('profiles');
  const exists = profiles.some(p => p.email.toLowerCase() === email.toLowerCase());
  if (exists) throw new Error('Email already registered');

  const userId = generateUUID();
  const newProfile = {
    id: userId,
    role: 'college',
    name: college_name,
    email,
    phone: phone || null,
    created_at: new Date().toISOString()
  };

  profiles.push(newProfile);
  setDbTable('profiles', profiles);

  const colleges = getDbTable('colleges');
  colleges.push({
    user_id: userId,
    college_name,
    city: city || null,
    state: state || null,
    address: address || null,
    website: website || null,
    logo: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=120&auto=format&fit=crop&q=80',
    description: description || `${college_name} is an educational institution.`,
    established: established ? parseInt(established) : new Date().getFullYear(),
    accreditation: accreditation || 'NAAC A'
  });
  setDbTable('colleges', colleges);
};

export const broadcastNotification = async (data) => {
  const { title, message } = data;
  const profiles = getDbTable('profiles');
  const notifications = getDbTable('notifications');

  profiles.forEach(p => {
    notifications.push({
      id: generateUUID(),
      user_id: p.id,
      title,
      message,
      is_read: false,
      created_at: new Date().toISOString()
    });
  });

  setDbTable('notifications', notifications);
};
