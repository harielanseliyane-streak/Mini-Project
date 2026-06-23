-- ============================================================
-- InfoHub – Smart Student & College Connectivity Platform
-- MySQL Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS infohub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE infohub;

-- ─────────────────────────────────────────
-- 1. USERS (base auth table for both roles)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  role          ENUM('student','college') NOT NULL,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone         VARCHAR(20),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
-- 2. STUDENTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  user_id       INT PRIMARY KEY,
  hsc_marks     DECIMAL(5,2) DEFAULT NULL,      -- percentage out of 100
  cutoff        DECIMAL(6,2) DEFAULT NULL,       -- cutoff out of 200
  profile_photo VARCHAR(500) DEFAULT NULL,
  bio           TEXT DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- 3. COLLEGES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS colleges (
  user_id       INT PRIMARY KEY,
  college_name  VARCHAR(255) NOT NULL,
  address       TEXT,
  city          VARCHAR(100),
  state         VARCHAR(100),
  website       VARCHAR(500),
  logo          VARCHAR(500) DEFAULT NULL,
  description   TEXT DEFAULT NULL,
  established   YEAR DEFAULT NULL,
  accreditation VARCHAR(100) DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- 4. COURSES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  college_id    INT NOT NULL,
  course_name   VARCHAR(255) NOT NULL,
  cutoff        DECIMAL(6,2) NOT NULL,           -- minimum cutoff required
  seats         INT DEFAULT NULL,
  duration      VARCHAR(50) DEFAULT NULL,        -- e.g. "4 Years"
  department    VARCHAR(100) DEFAULT NULL,
  fee_per_year  DECIMAL(10,2) DEFAULT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (college_id) REFERENCES colleges(user_id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- 5. POSTS (college feed / announcements)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  college_id    INT NOT NULL,
  type          ENUM('course','event','placement','infrastructure','general') NOT NULL DEFAULT 'general',
  title         VARCHAR(255) NOT NULL,
  description   TEXT,
  media_url     VARCHAR(500) DEFAULT NULL,
  media_type    ENUM('image','video','none') DEFAULT 'none',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (college_id) REFERENCES colleges(user_id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- 6. EVENTS / SYMPOSIUMS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  college_id    INT NOT NULL,
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  event_date    DATE NOT NULL,
  location      VARCHAR(255) DEFAULT NULL,
  poster_url    VARCHAR(500) DEFAULT NULL,
  registration_deadline DATE DEFAULT NULL,
  max_participants INT DEFAULT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (college_id) REFERENCES colleges(user_id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- 7. SCHOLARSHIPS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scholarships (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  college_id    INT NOT NULL,
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  amount        DECIMAL(10,2) DEFAULT NULL,
  eligibility   TEXT,
  deadline      DATE DEFAULT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (college_id) REFERENCES colleges(user_id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- 8. PLACEMENT DETAILS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS placements (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  college_id     INT NOT NULL,
  year           YEAR NOT NULL,
  highest_package DECIMAL(10,2) DEFAULT NULL,   -- in LPA
  average_package DECIMAL(10,2) DEFAULT NULL,
  placement_percent DECIMAL(5,2) DEFAULT NULL,  -- percentage placed
  top_recruiters TEXT DEFAULT NULL,             -- comma-separated
  description    TEXT,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (college_id) REFERENCES colleges(user_id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- 9. APPLICATIONS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  student_id    INT NOT NULL,
  college_id    INT NOT NULL,
  course_id     INT DEFAULT NULL,
  type          ENUM('admission','event') NOT NULL DEFAULT 'admission',
  event_id      INT DEFAULT NULL,
  status        ENUM('pending','accepted','rejected') DEFAULT 'pending',
  message       TEXT DEFAULT NULL,             -- student's message/SOP
  applied_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE,
  FOREIGN KEY (college_id) REFERENCES colleges(user_id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────
-- INDEXES for performance
-- ─────────────────────────────────────────
CREATE INDEX idx_courses_college ON courses(college_id);
CREATE INDEX idx_courses_cutoff  ON courses(cutoff);
CREATE INDEX idx_posts_college   ON posts(college_id);
CREATE INDEX idx_events_college  ON events(college_id);
CREATE INDEX idx_events_date     ON events(event_date);
CREATE INDEX idx_apps_student    ON applications(student_id);
CREATE INDEX idx_apps_college    ON applications(college_id);
CREATE INDEX idx_apps_status     ON applications(status);

-- ─────────────────────────────────────────
-- SEED DATA – 3 sample colleges
-- ─────────────────────────────────────────

-- College user accounts (password: "college123" bcrypt hash)
INSERT INTO users (role, name, email, password_hash, phone, updated_at) VALUES
('college', 'Anna University',      'admin@annauniv.edu',  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImSgoeVW', '04422357004', NOW()),
('college', 'PSG College of Tech',  'admin@psgtech.ac.in', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImSgoeVW', '04222572477', NOW()),
('college', 'Coimbatore Inst. of Tech','admin@citcbe.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImSgoeVW', '04222574071', NOW());

INSERT INTO colleges (user_id, college_name, address, city, state, website, description, established, accreditation) VALUES
(1, 'Anna University', 'Sardar Patel Road, Guindy', 'Chennai', 'Tamil Nadu', 'https://www.annauniv.edu',
 'Premier technical university in Tamil Nadu offering undergraduate and postgraduate programs.', 1978, 'NAAC A++'),
(2, 'PSG College of Technology', 'Peelamedu', 'Coimbatore', 'Tamil Nadu', 'https://www.psgtech.ac.in',
 'One of the top engineering institutions in South India with excellent placements.', 1951, 'NAAC A'),
(3, 'Coimbatore Institute of Technology', 'Civil Aerodrome Post', 'Coimbatore', 'Tamil Nadu', 'https://www.citcbe.com',
 'Autonomous institution affiliated to Anna University with diverse engineering programs.', 1956, 'NAAC A');

INSERT INTO courses (college_id, course_name, cutoff, seats, duration, department, fee_per_year) VALUES
(1, 'B.E. Computer Science', 197.00, 60, '4 Years', 'CSE', 25000.00),
(1, 'B.E. Electronics & Communication', 194.00, 60, '4 Years', 'ECE', 25000.00),
(1, 'B.E. Mechanical Engineering', 188.00, 60, '4 Years', 'MECH', 25000.00),
(2, 'B.E. Computer Science', 195.50, 60, '4 Years', 'CSE', 95000.00),
(2, 'B.E. Information Technology', 193.00, 60, '4 Years', 'IT', 95000.00),
(2, 'B.Tech Artificial Intelligence', 196.00, 30, '4 Years', 'AI&DS', 110000.00),
(3, 'B.E. Computer Science', 186.00, 60, '4 Years', 'CSE', 85000.00),
(3, 'B.E. Civil Engineering', 175.00, 60, '4 Years', 'CIVIL', 75000.00),
(3, 'B.E. Electrical Engineering', 178.00, 60, '4 Years', 'EEE', 75000.00);

INSERT INTO placements (college_id, year, highest_package, average_package, placement_percent, top_recruiters) VALUES
(1, 2024, 42.00, 8.50, 85.00, 'TCS, Infosys, Wipro, HCL, Zoho'),
(2, 2024, 55.00, 12.00, 92.00, 'Google, Microsoft, Amazon, Zoho, Freshworks'),
(3, 2024, 28.00, 7.00, 78.00, 'TCS, Infosys, CTS, L&T Infotech');

INSERT INTO posts (college_id, type, title, description, media_type) VALUES
(1, 'placement', 'Record Placements 2024', 'Anna University achieves 85% placement with highest package of 42 LPA at Google.', 'none'),
(2, 'event', 'Techno Fest 2025', 'Annual technical symposium with competitions in coding, robotics, and paper presentation.', 'none'),
(3, 'course', 'New AI & Data Science Batch', 'Admissions open for the new B.Tech AI & Data Science program for 2025-26.', 'none');

INSERT INTO events (college_id, name, description, event_date, location, max_participants) VALUES
(1, 'Open Day 2025', 'Campus tour and interaction with faculty for prospective students.', '2025-06-15', 'Main Campus, Chennai', 500),
(2, 'Techno Fest 2025', 'Annual technical symposium with paper presentations, coding contests, and robotics.', '2025-07-20', 'PSG Tech Campus, Coimbatore', 1000),
(3, 'Industry Connect 2025', 'Interaction with industry experts and placement talks.', '2025-06-28', 'CIT Campus, Coimbatore', 300);

INSERT INTO scholarships (college_id, name, description, amount, eligibility) VALUES
(1, 'Merit Scholarship', 'Full fee waiver for students with cutoff above 198.', 25000.00, 'Cutoff >= 198, First generation learner preferred'),
(2, 'Excellence Award', '50% fee concession for top 5 rank holders.', 47500.00, 'Cutoff >= 197, State rank below 500'),
(3, 'Need-Based Grant', 'Financial assistance for economically weaker sections.', 30000.00, 'Annual family income < 2.5 LPA');
