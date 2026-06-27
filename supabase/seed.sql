-- ─────────────────────────────────────────────────────────────
-- Database Seeds (InfoHub Sample Data)
-- ─────────────────────────────────────────────────────────────

-- Disable triggers/constraints check temporarily if needed, but not necessary here
-- Clean existing data
TRUNCATE saved_items, applications, notifications, reviews, posts, scholarships, events, placements, courses, students, colleges, profiles, auth_settings RESTART IDENTITY CASCADE;

-- ── 1. AUTH SETTINGS ─────────────────────────────────────────
INSERT INTO auth_settings (key, value) VALUES
('jwt_secret', 'your-supabase-jwt-secret-placeholder');

-- ── 2. PROFILES ──────────────────────────────────────────────
-- Password is 'password123' for all seeded users
INSERT INTO profiles (id, role, name, email, password, phone, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'student', 'Hari Elanseliyan', 'student@infohub.com', 'password123', '+91 9876543210', now()),
('00000000-0000-0000-0000-000000000101', 'college', 'PSG College of Technology', 'college@infohub.com', 'password123', '+91 422 2572177', now()),
('00000000-0000-0000-0000-000000000102', 'college', 'SSN College of Engineering', 'ssn@infohub.com', 'password123', '+91 44 27469700', now()),
('00000000-0000-0000-0000-000000000103', 'college', 'Madras Institute of Technology', 'mit@infohub.com', 'password123', '+91 44 22516002', now()),
('00000000-0000-0000-0000-000000000999', 'admin', 'InfoHub Administrator', 'admin@infohub.com', 'password123', '+91 9999999999', now());

-- ── 3. STUDENTS ──────────────────────────────────────────────
INSERT INTO students (user_id, hsc_marks, cutoff, profile_photo, bio, interests, skills, career_goals, location_pref, budget_pref, course_pref) VALUES
(
    '00000000-0000-0000-0000-000000000001', 
    92.5, 
    185.0, 
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    'Aspiring Computer Science student with a strong interest in Web Development and Machine Learning.',
    'Coding, UI/UX Design, Open Source Contributions',
    'HTML, CSS, JavaScript, React, Python',
    'Software Architect or AI Engineer',
    'Chennai, Coimbatore',
    150000,
    'Computer Science and Engineering, Information Technology'
);

-- ── 4. COLLEGES ──────────────────────────────────────────────
INSERT INTO colleges (user_id, college_name, address, city, state, website, logo, description, established, accreditation, infrastructure, hostel_info, fee_structure) VALUES
(
    '00000000-0000-0000-0000-000000000101',
    'PSG College of Technology',
    'Avinashi Road, Peelamedu',
    'Coimbatore',
    'Tamil Nadu',
    'https://www.psgtech.edu',
    'https://images.unsplash.com/photo-1562774053-701939374585?w=120&auto=format&fit=crop&q=80',
    'PSG College of Technology, established in 1951, is an ISO 9001:2015 certified government-aided institution. Popularly known as PSG Tech, it is one of the most prestigious engineering institutions in India, offering world-class infrastructure and top-tier industry collaborations.',
    1951,
    'NAAC A++',
    'Modern laboratory setups, high-tech research centers, fully automated central library, multi-purpose sports complex, and Wi-Fi enabled smart classrooms.',
    'Spacious on-campus hostels for boys and girls with fully equipped mess facilities, gyms, and recreational halls.',
    'Aided Courses: ₹25,000 - ₹40,000/year. Self-Financed Courses: ₹1,500,000 - ₹2,00,000/year.'
),
(
    '00000000-0000-0000-0000-000000000102',
    'SSN College of Engineering',
    'Rajiv Gandhi Salai (OMR), Kalavakkam',
    'Chennai',
    'Tamil Nadu',
    'https://www.ssn.edu.in',
    'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=120&auto=format&fit=crop&q=80',
    'Sri Sivasubramaniya Nadar (SSN) College of Engineering, founded by Dr. Shiv Nadar (Chairman, HCL Technologies), is a highly acclaimed private institution known for its state-of-the-art infrastructure, research focus, and lush green campus.',
    1996,
    'NAAC A+',
    '250-acre green campus, advanced research facilities, fully computerized air-conditioned library, indoor stadium, and high-speed Wi-Fi.',
    'Excellent hostel facilities with internet, laundry, and delicious food options.',
    'Management/Merit Quota: ₹1,20,000 - ₹2,20,000/year.'
),
(
    '00000000-0000-0000-0000-000000000103',
    'Madras Institute of Technology',
    'Chromepet',
    'Chennai',
    'Tamil Nadu',
    'https://www.mitindia.edu',
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=120&auto=format&fit=crop&q=80',
    'Madras Institute of Technology (MIT) is a constituent college of Anna University, established in 1949. It pioneered courses like Aeronautical Engineering and Automobile Engineering in India. Notably, former President Dr. A.P.J. Abdul Kalam is an alumnus.',
    1949,
    'Anna University Constituent - NBA Accredited',
    'Aviation hangar, advanced automotive labs, central computing center, and specialized research facilities.',
    'Traditional hostels with focus on discipline, shared study spaces, and good food.',
    'Government Fees: ₹20,000 - ₹50,000/year.'
);

-- ── 5. COURSES ───────────────────────────────────────────────
INSERT INTO courses (id, college_id, course_name, cutoff, seats, duration, department, fee_per_year, created_at) VALUES
('00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000000101', 'Computer Science and Engineering', 196.5, 120, '4 Years', 'Computer Science', 85000, now()),
('00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000000101', 'Electronics and Communication Engineering', 195.0, 120, '4 Years', 'Electronics', 85000, now()),
('00000000-0000-0000-0000-000000001003', '00000000-0000-0000-0000-000000000101', 'Mechanical Engineering', 188.0, 120, '4 Years', 'Mechanical', 50000, now()),
('00000000-0000-0000-0000-000000001004', '00000000-0000-0000-0000-000000000101', 'Information Technology', 194.5, 60, '4 Years', 'Computer Science', 120000, now()),
('00000000-0000-0000-0000-000000001005', '00000000-0000-0000-0000-000000000102', 'Computer Science and Engineering', 195.5, 180, '4 Years', 'Computer Science', 150000, now()),
('00000000-0000-0000-0000-000000001006', '00000000-0000-0000-0000-000000000102', 'Information Technology', 193.5, 120, '4 Years', 'Computer Science', 145000, now()),
('00000000-0000-0000-0000-000000001007', '00000000-0000-0000-0000-000000000102', 'Chemical Engineering', 178.0, 60, '4 Years', 'Chemical', 120000, now()),
('00000000-0000-0000-0000-000000001008', '00000000-0000-0000-0000-000000000103', 'Aeronautical Engineering', 194.0, 60, '4 Years', 'Aerospace', 35000, now()),
('00000000-0000-0000-0000-000000001009', '00000000-0000-0000-0000-000000000103', 'Computer Science and Engineering', 198.0, 60, '4 Years', 'Computer Science', 35000, now()),
('00000000-0000-0000-0000-000000001010', '00000000-0000-0000-0000-000000000103', 'Automobile Engineering', 186.5, 60, '4 Years', 'Automotive', 30000, now());

-- ── 6. PLACEMENTS ────────────────────────────────────────────
INSERT INTO placements (id, college_id, year, highest_package, average_package, placement_percent, top_recruiters, description, created_at) VALUES
('00000000-0000-0000-0000-000000002001', '00000000-0000-0000-0000-000000000101', 2025, 42.5, 8.2, 96.5, 'Microsoft, Amazon, Zoho, Cisco, Qualcomm', 'Outstanding placement season with over 200 companies visiting campus.', now()),
('00000000-0000-0000-0000-000000002002', '00000000-0000-0000-0000-000000000101', 2024, 38.0, 7.8, 94.0, 'Google, Nvidia, Caterpillar, TCS, Infosys', 'Strong performance across core engineering branches.', now()),
('00000000-0000-0000-0000-000000002003', '00000000-0000-0000-0000-000000000102', 2025, 64.0, 9.1, 98.0, 'Apple, Amazon, Adobe, Goldman Sachs, Cognizant', 'SSN recorded its highest package ever in CSE department this year.', now()),
('00000000-0000-0000-0000-000000002004', '00000000-0000-0000-0000-000000000103', 2025, 36.0, 7.5, 92.0, 'ISRO, HAL, Boeing, Ashok Leyland, TCS R&D', 'Core companies dominated placements in Aeronautical and Automobile fields.', now());

-- ── 7. EVENTS ────────────────────────────────────────────────
INSERT INTO events (id, college_id, name, description, event_date, location, registration_deadline, max_participants, created_at) VALUES
('00000000-0000-0000-0000-000000003001', '00000000-0000-0000-0000-000000000101', 'Kriya 2026 - International Tech Fest', 'Kriya is the biggest student-run tech fest in Coimbatore, attracting participants from all over India for robotics, coding, hackathons, and guest lectures.', now() + interval '30 days', 'PSG Tech Campus, Coimbatore', now() + interval '25 days', 2000, now()),
('00000000-0000-0000-0000-000000003002', '00000000-0000-0000-0000-000000000102', 'Invente 2026 - National Symposium', 'Invente is a 2-day national technical symposium by SSN College of Engineering, with technical, non-technical, and gaming events.', now() + interval '15 days', 'SSN Campus, OMR, Chennai', now() + interval '10 days', 1500, now());

-- ── 8. SCHOLARSHIPS ──────────────────────────────────────────
INSERT INTO scholarships (id, college_id, type, name, description, amount, eligibility, deadline, created_at) VALUES
('00000000-0000-0000-0000-000000004001', '00000000-0000-0000-0000-000000000101', 'merit', 'PSG Alumni Scholarship', 'Awarded to students with excellent academic records and a family income under 3 LPA.', 50000, 'Cutoff > 192, Income < 3,00,000 per year', now() + interval '45 days', now()),
('00000000-0000-0000-0000-000000004002', '00000000-0000-0000-0000-000000000102', 'merit', 'SSN Merit Scholarship Scheme', 'Fully waives tuition fee for students obtaining Anna University ranks or top ranks in qualifying board exams.', 150000, '100% tuition waiver for Board Toppers or Cutoff > 198', now() + interval '60 days', now()),
('00000000-0000-0000-0000-000000004003', NULL, 'government', 'TN First Graduate Scholarship', 'Government scholarship providing fee concessions for students who are the first in their families to attend college.', 25000, 'First graduate certificate holder, admitting through single window counseling', now() + interval '90 days', now());

-- ── 9. INTERNSHIPS ───────────────────────────────────────────
INSERT INTO internships (id, company_name, title, description, stipend, duration, location, eligibility, skills_required, deadline, created_at) VALUES
('00000000-0000-0000-0000-000000005001', 'Zoho Corporation', 'Software Developer Intern', 'Work with the Zoho Creator team building cloud computing solutions. Open to final/pre-final year engineering students.', 25000, '6 Months', 'Chennai (Onsite)', 'Strong knowledge of Java/C++ and database design', 'Java, Javascript, SQL', now() + interval '20 days', now()),
('00000000-0000-0000-0000-000000005002', 'Cognizant Technology Solutions', 'Associate Programmer Intern', 'Fast-track internship program leading to a full-time role. Work on enterprise Java applications.', 15000, '3 Months', 'Coimbatore (Hybrid)', 'Graduating in 2026, CSE/IT/ECE branches', 'Python, Basic programming, OOPs concepts', now() + interval '30 days', now());

-- ── 10. POSTS ────────────────────────────────────────────────
INSERT INTO posts (id, college_id, type, title, description, media_url, media_type, created_at) VALUES
('00000000-0000-0000-0000-000000006001', '00000000-0000-0000-0000-000000000101', 'placement', 'PSG Tech Achieves 96% Placements in 2025!', 'Congratulations to our engineering batch! The highest package was 42.5 LPA offered by Microsoft. We thank our recruiters and cell coordinators.', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80', 'image', now() - interval '5 days'),
('00000000-0000-0000-0000-000000006002', '00000000-0000-0000-0000-000000000101', 'announcement', 'Hostel Renovations Completed', 'The dining halls in block C and D have been upgraded with new equipment and seating capacity has been doubled.', NULL, 'none', now() - interval '10 days'),
('00000000-0000-0000-0000-000000006003', '00000000-0000-0000-0000-000000000102', 'event', 'SSN Invente 2026 Registration is Now Open!', 'Sign up for paper presentations, robot wars, UI design, and our 24-hour hackathon. Cash prizes worth 2 Lakhs!', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80', 'image', now() - interval '1 days');

-- ── 11. REVIEWS ──────────────────────────────────────────────
INSERT INTO reviews (id, student_id, college_id, content, rating, created_at) VALUES
('00000000-0000-0000-0000-000000007001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', 'PSG Tech is excellent for academic learning and industry exposure. Placements are great, but the campus is a bit crowded.', 4, now() - interval '15 days'),
('00000000-0000-0000-0000-000000007002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000102', 'Awesome campus life! SSN provides great opportunities in research and extracurriculars. The library is massive.', 5, now() - interval '2 days');

-- ── 12. NOTIFICATIONS ────────────────────────────────────────
INSERT INTO notifications (id, user_id, title, message, is_read, created_at) VALUES
('00000000-0000-0000-0000-000000008001', '00000000-0000-0000-0000-000000000001', 'Welcome to InfoHub!', 'Explore engineering colleges in Tamil Nadu, compare features, calculate your cutoff, and apply directly to colleges!', false, now());

-- ── 13. APPLICATIONS ─────────────────────────────────────────
INSERT INTO applications (id, student_id, college_id, course_id, event_id, type, status, message, applied_at) VALUES
('00000000-0000-0000-0000-000000009001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000001001', NULL, 'admission', 'pending', 'Submitted via InfoHub portal.', now() - interval '1 days');

-- ── 14. SAVED ITEMS ──────────────────────────────────────────
INSERT INTO saved_items (id, student_id, type, item_id, created_at) VALUES
('00000000-0000-0000-0000-00000000a001', '00000000-0000-0000-0000-000000000001', 'college', '00000000-0000-0000-0000-000000000101', now());
