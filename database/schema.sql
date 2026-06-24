-- ============================================================
-- InfoHub – Smart Student & College Connectivity Platform
-- Supabase PostgreSQL Schema (converted from MySQL)
-- Run this in Supabase SQL Editor → New Query
-- ============================================================

-- ─────────────────────────────────────────
-- 1. USERS (base auth table for both roles)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  role          TEXT NOT NULL CHECK (role IN ('student','college','admin')),
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone         VARCHAR(20),
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-update updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────
-- 2. STUDENTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  user_id       INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  hsc_marks     DECIMAL(5,2) DEFAULT NULL,
  cutoff        DECIMAL(6,2) DEFAULT NULL,
  profile_photo TEXT DEFAULT NULL,
  bio           TEXT DEFAULT NULL,
  interests     TEXT DEFAULT NULL,
  skills        TEXT DEFAULT NULL,
  career_goals  TEXT DEFAULT NULL,
  location_pref TEXT DEFAULT NULL,
  budget_pref   DECIMAL(10,2) DEFAULT NULL,
  course_pref   TEXT DEFAULT NULL
);

-- ─────────────────────────────────────────
-- 3. COLLEGES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS colleges (
  user_id       INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  college_name  VARCHAR(255) NOT NULL,
  address       TEXT,
  city          VARCHAR(100),
  state         VARCHAR(100),
  website       TEXT,
  logo          TEXT DEFAULT NULL,
  description   TEXT DEFAULT NULL,
  established   INTEGER DEFAULT NULL,
  accreditation VARCHAR(100) DEFAULT NULL,
  infrastructure TEXT DEFAULT NULL,
  hostel_info   TEXT DEFAULT NULL,
  fee_structure TEXT DEFAULT NULL
);

-- ─────────────────────────────────────────
-- 4. COURSES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
  id            SERIAL PRIMARY KEY,
  college_id    INTEGER NOT NULL REFERENCES colleges(user_id) ON DELETE CASCADE,
  course_name   VARCHAR(255) NOT NULL,
  cutoff        DECIMAL(6,2) NOT NULL,
  seats         INTEGER DEFAULT NULL,
  duration      VARCHAR(50) DEFAULT NULL,
  department    VARCHAR(100) DEFAULT NULL,
  fee_per_year  DECIMAL(10,2) DEFAULT NULL,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 5. POSTS (college feed / announcements)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id            SERIAL PRIMARY KEY,
  college_id    INTEGER NOT NULL REFERENCES colleges(user_id) ON DELETE CASCADE,
  type          TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('course','event','placement','infrastructure','general')),
  title         VARCHAR(255) NOT NULL,
  description   TEXT,
  media_url     TEXT DEFAULT NULL,
  media_type    TEXT DEFAULT 'none' CHECK (media_type IN ('image','video','none')),
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 6. EVENTS / SYMPOSIUMS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id                   SERIAL PRIMARY KEY,
  college_id           INTEGER NOT NULL REFERENCES colleges(user_id) ON DELETE CASCADE,
  name                 VARCHAR(255) NOT NULL,
  description          TEXT,
  event_date           DATE NOT NULL,
  location             VARCHAR(255) DEFAULT NULL,
  poster_url           TEXT DEFAULT NULL,
  registration_deadline DATE DEFAULT NULL,
  max_participants     INTEGER DEFAULT NULL,
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 7. EVENT REGISTRATIONS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_registrations (
  id            SERIAL PRIMARY KEY,
  event_id      INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  student_id    INTEGER NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (event_id, student_id)
);

-- ─────────────────────────────────────────
-- 8. SCHOLARSHIPS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scholarships (
  id            SERIAL PRIMARY KEY,
  college_id    INTEGER DEFAULT NULL REFERENCES colleges(user_id) ON DELETE CASCADE,
  type          TEXT NOT NULL DEFAULT 'private' CHECK (type IN ('government','private','international')),
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  amount        DECIMAL(10,2) DEFAULT NULL,
  eligibility   TEXT,
  deadline      DATE DEFAULT NULL,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 9. INTERNSHIPS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS internships (
  id             SERIAL PRIMARY KEY,
  company_name   VARCHAR(255) NOT NULL,
  title          VARCHAR(255) NOT NULL,
  description    TEXT,
  stipend        DECIMAL(10,2) DEFAULT NULL,
  duration       VARCHAR(50) DEFAULT NULL,
  location       VARCHAR(255) DEFAULT NULL,
  eligibility    TEXT DEFAULT NULL,
  skills_required TEXT DEFAULT NULL,
  deadline       DATE DEFAULT NULL,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 10. PLACEMENT DETAILS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS placements (
  id                SERIAL PRIMARY KEY,
  college_id        INTEGER NOT NULL REFERENCES colleges(user_id) ON DELETE CASCADE,
  year              INTEGER NOT NULL,
  highest_package   DECIMAL(10,2) DEFAULT NULL,
  average_package   DECIMAL(10,2) DEFAULT NULL,
  placement_percent DECIMAL(5,2) DEFAULT NULL,
  top_recruiters    TEXT DEFAULT NULL,
  description       TEXT,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 11. APPLICATIONS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id            SERIAL PRIMARY KEY,
  student_id    INTEGER NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  college_id    INTEGER NOT NULL REFERENCES colleges(user_id) ON DELETE CASCADE,
  course_id     INTEGER DEFAULT NULL REFERENCES courses(id) ON DELETE SET NULL,
  type          TEXT NOT NULL DEFAULT 'admission' CHECK (type IN ('admission','internship','event')),
  event_id      INTEGER DEFAULT NULL REFERENCES events(id) ON DELETE SET NULL,
  internship_id INTEGER DEFAULT NULL REFERENCES internships(id) ON DELETE SET NULL,
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  message       TEXT DEFAULT NULL,
  applied_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────
-- 12. REVIEWS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id         SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  college_id INTEGER NOT NULL REFERENCES colleges(user_id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  rating     INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 13. RATINGS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ratings (
  id         SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  college_id INTEGER NOT NULL REFERENCES colleges(user_id) ON DELETE CASCADE,
  score      INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5)
);

-- ─────────────────────────────────────────
-- 14. NOTIFICATIONS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      VARCHAR(255) NOT NULL,
  message    TEXT NOT NULL,
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 15. QUIZ RESULTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_results (
  id               SERIAL PRIMARY KEY,
  student_id       INTEGER NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  career_path      VARCHAR(255) NOT NULL,
  personality      VARCHAR(255) NOT NULL,
  aptitude_score   DECIMAL(5,2) NOT NULL,
  interest_mapping TEXT DEFAULT NULL,
  skills_analysis  TEXT DEFAULT NULL,
  recommendations  TEXT DEFAULT NULL,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 16. SAVED ITEMS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_items (
  id         SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN ('college','scholarship','internship','event')),
  item_id    INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (student_id, type, item_id)
);

-- ─────────────────────────────────────────
-- 17. AI RECOMMENDATIONS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id           SERIAL PRIMARY KEY,
  student_id   INTEGER NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
  colleges     TEXT DEFAULT NULL,
  scholarships TEXT DEFAULT NULL,
  careers      TEXT DEFAULT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 18. ACTIVITY LOGS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_logs (
  id        SERIAL PRIMARY KEY,
  user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action    VARCHAR(255) NOT NULL,
  details   TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- INDEXES for performance
-- ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_courses_college   ON courses(college_id);
CREATE INDEX IF NOT EXISTS idx_courses_cutoff    ON courses(cutoff);
CREATE INDEX IF NOT EXISTS idx_posts_college     ON posts(college_id);
CREATE INDEX IF NOT EXISTS idx_events_college    ON events(college_id);
CREATE INDEX IF NOT EXISTS idx_events_date       ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_apps_student      ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_apps_college      ON applications(college_id);
CREATE INDEX IF NOT EXISTS idx_apps_status       ON applications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_student ON saved_items(student_id);

-- ─────────────────────────────────────────
-- SEED DATA – 3 sample colleges
-- password: "college123" bcrypt hash
-- ─────────────────────────────────────────
INSERT INTO users (role, name, email, password_hash, phone) VALUES
('college', 'Anna University',                  'admin@annauniv.edu',  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImSgoeVW', '04422357004'),
('college', 'PSG College of Tech',              'admin@psgtech.ac.in', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImSgoeVW', '04222572477'),
('college', 'Coimbatore Inst. of Tech',         'admin@citcbe.com',    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImSgoeVW', '04222574071')
ON CONFLICT (email) DO NOTHING;

INSERT INTO colleges (user_id, college_name, address, city, state, website, description, established, accreditation) VALUES
(1, 'Anna University',                    'Sardar Patel Road, Guindy',  'Chennai',    'Tamil Nadu', 'https://www.annauniv.edu',
 'Premier technical university in Tamil Nadu offering undergraduate and postgraduate programs.', 1978, 'NAAC A++'),
(2, 'PSG College of Technology',          'Peelamedu',                  'Coimbatore', 'Tamil Nadu', 'https://www.psgtech.ac.in',
 'One of the top engineering institutions in South India with excellent placements.', 1951, 'NAAC A'),
(3, 'Coimbatore Institute of Technology', 'Civil Aerodrome Post',       'Coimbatore', 'Tamil Nadu', 'https://www.citcbe.com',
 'Autonomous institution affiliated to Anna University with diverse engineering programs.', 1956, 'NAAC A')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO courses (college_id, course_name, cutoff, seats, duration, department, fee_per_year) VALUES
(1, 'B.E. Computer Science',            197.00, 60, '4 Years', 'CSE',   25000.00),
(1, 'B.E. Electronics & Communication', 194.00, 60, '4 Years', 'ECE',   25000.00),
(1, 'B.E. Mechanical Engineering',      188.00, 60, '4 Years', 'MECH',  25000.00),
(2, 'B.E. Computer Science',            195.50, 60, '4 Years', 'CSE',   95000.00),
(2, 'B.E. Information Technology',      193.00, 60, '4 Years', 'IT',    95000.00),
(2, 'B.Tech Artificial Intelligence',   196.00, 30, '4 Years', 'AI&DS', 110000.00),
(3, 'B.E. Computer Science',            186.00, 60, '4 Years', 'CSE',   85000.00),
(3, 'B.E. Civil Engineering',           175.00, 60, '4 Years', 'CIVIL', 75000.00),
(3, 'B.E. Electrical Engineering',      178.00, 60, '4 Years', 'EEE',   75000.00);

INSERT INTO placements (college_id, year, highest_package, average_package, placement_percent, top_recruiters) VALUES
(1, 2024, 42.00,  8.50, 85.00, 'TCS, Infosys, Wipro, HCL, Zoho'),
(2, 2024, 55.00, 12.00, 92.00, 'Google, Microsoft, Amazon, Zoho, Freshworks'),
(3, 2024, 28.00,  7.00, 78.00, 'TCS, Infosys, CTS, L&T Infotech');

INSERT INTO posts (college_id, type, title, description, media_type) VALUES
(1, 'placement', 'Record Placements 2024', 'Anna University achieves 85% placement with highest package of 42 LPA at Google.', 'none'),
(2, 'event',     'Techno Fest 2025',       'Annual technical symposium with competitions in coding, robotics, and paper presentation.', 'none'),
(3, 'course',    'New AI & Data Science Batch', 'Admissions open for the new B.Tech AI & Data Science program for 2025-26.', 'none');

INSERT INTO events (college_id, name, description, event_date, location, max_participants) VALUES
(1, 'Open Day 2025',           'Campus tour and interaction with faculty for prospective students.', '2025-06-15', 'Main Campus, Chennai', 500),
(2, 'Techno Fest 2025',        'Annual technical symposium with paper presentations, coding contests, and robotics.', '2025-07-20', 'PSG Tech Campus, Coimbatore', 1000),
(3, 'Industry Connect 2025',   'Interaction with industry experts and placement talks.', '2025-06-28', 'CIT Campus, Coimbatore', 300);

INSERT INTO scholarships (college_id, name, description, amount, eligibility) VALUES
(1, 'Merit Scholarship',  'Full fee waiver for students with cutoff above 198.',         25000.00, 'Cutoff >= 198, First generation learner preferred'),
(2, 'Excellence Award',   '50% fee concession for top 5 rank holders.',                 47500.00, 'Cutoff >= 197, State rank below 500'),
(3, 'Need-Based Grant',   'Financial assistance for economically weaker sections.',     30000.00, 'Annual family income < 2.5 LPA');
