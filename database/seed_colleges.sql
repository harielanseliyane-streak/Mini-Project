-- ============================================================
-- Auto-generated Seed Data for Colleges, Courses, Placements, and Events
-- ============================================================

-- 1. USERS
INSERT INTO users (id, role, name, email, password_hash, phone) VALUES
(100, 'college', 'IIT Madras (Indian Institute of Technology)', 'deanadmn@iitm.ac.in', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImSgoeVW', '04420000001'),
(101, 'college', 'College of Engineering, Guindy (CEG)', 'cegdeanoffice@gmail.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImSgoeVW', '04420000002'),
(102, 'college', 'Madras Institute of Technology (MIT)', 'dean@mitindia.edu', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImSgoeVW', '04420000003'),
(103, 'college', 'IIITDM Kancheepuram', 'office@iiitdm.ac.in', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImSgoeVW', '04420000004'),
(104, 'college', 'SSN College of Engineering', 'info@ssn.edu.in', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImSgoeVW', '04420000005'),
(105, 'college', 'Chennai Institute of Technology (CIT)', 'info@citchennai.net', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImSgoeVW', '04420000006'),
(106, 'college', 'PSG College of Technology (PSGCT)', 'principal@psgtech.ac.in', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImSgoeVW', '04420000007'),
(107, 'college', 'Government College of Technology', 'principal@gct.ac.in', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImSgoeVW', '04420000008'),
(108, 'college', 'Coimbatore Institute of Technology (CIT)', 'principal.citoffice@cit.edu.in', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImSgoeVW', '04420000009'),
(109, 'college', 'Kumaraguru College of Technology (KCT)', 'info@kct.ac.in', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImSgoeVW', '04420000010'),
(110, 'college', 'Aishwarya College of Engineering and Technology', 'admissions@aishwaryaenggcollege.ac.in', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImSgoeVW', '04420000011'),
(111, 'college', 'Bannari Amman Institute of Technology (Autonomous)', 'stayahead@bitsathy.ac.in', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImSgoeVW', '04420000012'),
(112, 'college', 'Kongu Engineering College (Autonomous)', 'principal@kongu.ac.in', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImSgoeVW', '04420000013'),
(113, 'college', 'Annai Mathammal Sheela', 'amsec.principal@gmail.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImSgoeVW', '04420000014'),
(114, 'college', 'KSR College of Engg (A)', 'info@ksrce.ac.in', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImSgoeVW', '04420000015'),
(115, 'college', 'Mahendra Engg College (A)', 'info@mahendra.info', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImSgoeVW', '04420000016'),
(116, 'college', 'AVS Engineering College', 'principal@avsenggcollege.ac.in', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImSgoeVW', '04420000017'),
(117, 'college', 'Sona College of Tech (Autonomous)', 'info@sonatech.ac.in', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImSgoeVW', '04420000018'),
(118, 'college', 'SRM Institute of Science and Technology (SRMIST)', 'infodesk@srmist.edu.in', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImSgoeVW', '04420000019'),
(119, 'college', 'VIT Chennai Campus', 'admin.chennai@vit.ac.in', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImSgoeVW', '04420000020')
ON CONFLICT (email) DO NOTHING;

-- 2. COLLEGES
INSERT INTO colleges (user_id, college_name, address, city, state, website, description, established, accreditation) VALUES
(100, 'IIT Madras (Indian Institute of Technology)', 'Indian Institute of Technology Madras, IIT P.O., Chennai 600 036, INDIA', 'Chennai', 'Tamil Nadu', 'https://www.iitm.ac.in', 'Premier institute offering world-class engineering education and research.', 1959, 'NAAC A++'),
(101, 'College of Engineering, Guindy (CEG)', 'CEG Campus, Guindy Anna University, Chennai, Tamil Nadu 600025', 'Chennai', 'Tamil Nadu', 'https://www.ceg.annauniv.edu', 'One of the oldest and highly reputed engineering colleges in India.', 1794, 'NAAC A++'),
(102, 'Madras Institute of Technology (MIT)', 'Anna University, MIT Campus Chromepet, Chennai 600044', 'Chennai', 'Tamil Nadu', 'https://www.mitindia.edu', 'Known for pioneering aeronautical and automobile engineering.', 1949, 'NAAC A+'),
(103, 'IIITDM Kancheepuram', 'Melakkottaiyur, off Vandalur-Kelambakkam Road, Chennai - 600127, Tamil Nadu, India', 'Chennai', 'Tamil Nadu', 'https://www.iiitdm.ac.in', 'Institute of national importance for IT and Design.', 2007, 'NAAC A'),
(104, 'SSN College of Engineering', 'Rajiv Gandhi Salai (OMR), Kalavakkam, Chennai - 603 110', 'Chennai', 'Tamil Nadu', 'https://www.ssn.edu.in', 'Top private engineering college with excellent infrastructure and placements.', 1996, 'NAAC A++'),
(105, 'Chennai Institute of Technology (CIT)', 'Sarathy Nagar, Kundrathur, Chennai-600069, TamilNadu, India.', 'Chennai', 'Tamil Nadu', 'https://www.citchennai.edu.in', 'Leading engineering college focusing on industry-ready graduates.', 2010, 'NAAC A+'),
(106, 'PSG College of Technology (PSGCT)', 'PSG College of Technology, Peelamedu, Coimbatore - 641 004', 'Coimbatore', 'Tamil Nadu', 'https://www.psgtech.edu', 'Top engineering college in South India with a strong alumni network.', 1951, 'NAAC A'),
(107, 'Government College of Technology', 'Thadagam Road, G.C.T Post, Coimbatore, Tamil Nadu, 641013', 'Coimbatore', 'Tamil Nadu', 'https://www.gct.ac.in', 'Premier government institute offering state-of-the-art facilities.', 1945, 'NAAC A'),
(108, 'Coimbatore Institute of Technology (CIT)', 'Civil Aerodrome Post, Coimbatore, Tamilnadu, India - 641 014', 'Coimbatore', 'Tamil Nadu', 'https://www.cit.edu.in', 'Autonomous engineering college with high academic standards.', 1956, 'NAAC A'),
(109, 'Kumaraguru College of Technology (KCT)', 'Kumaraguru Campus, Chinnavedampatti, Coimbatore 641049, Tamil Nadu, India.', 'Coimbatore', 'Tamil Nadu', 'https://www.kct.ac.in', 'Renowned for innovation and excellent placement record.', 1984, 'NAAC A++'),
(110, 'Aishwarya College of Engineering and Technology', 'Errattaikaradu, Paruvachi (Post), Anthiyur, Bhavani (Taluk), Erode District - 638312', 'Erode', 'Tamil Nadu', 'https://www.aishwaryaengg.edu.in', 'Providing quality education with a strong emphasis on placements.', 2011, 'NAAC B+'),
(111, 'Bannari Amman Institute of Technology (Autonomous)', 'Sathy-Bhavani State Highway, Alathukombai (Post), Sathyamangalam, Erode District - 638401', 'Erode', 'Tamil Nadu', 'https://www.bitsathy.ac.in', 'Autonomous institute known for its sprawling campus and tech clubs.', 1996, 'NAAC A++'),
(112, 'Kongu Engineering College (Autonomous)', 'Perundurai Railway Station Road, Thoppupalayam, Perundurai, Erode - 638060', 'Erode', 'Tamil Nadu', 'https://www.kongu.ac.in', 'Top autonomous engineering college in Erode.', 1984, 'NAAC A++'),
(113, 'Annai Mathammal Sheela', 'Erumapatty, Namakkal - 637013', 'Namakkal', 'Tamil Nadu', 'https://www.amsheela.edu.in', 'Dedicated to producing technically skilled professionals.', 1996, 'NAAC B'),
(114, 'KSR College of Engg (A)', 'K.S.R. Kalvi Nagar, Tiruchengode - 637215', 'Namakkal', 'Tamil Nadu', 'https://www.ksrce.ac.in', 'A leading technical institution in Namakkal district.', 2001, 'NAAC A'),
(115, 'Mahendra Engg College (A)', 'Mahendhirapuri, Mallasamudram - 637503', 'Namakkal', 'Tamil Nadu', 'https://www.mahendra.info', 'Known for holistic engineering education.', 1995, 'NAAC A'),
(116, 'AVS Engineering College', 'Military Road, Ammapet, Salem - 636003', 'Salem', 'Tamil Nadu', 'https://www.avsenggcollege.ac.in', 'Prominent engineering college in Salem with robust placement training.', 2001, 'NAAC A'),
(117, 'Sona College of Tech (Autonomous)', 'Sona Nagar, Junction Main Road, Salem - 636005', 'Salem', 'Tamil Nadu', 'https://www.sonatech.ac.in', 'Leading autonomous technical institution in Salem.', 1997, 'NAAC A++'),
(118, 'SRM Institute of Science and Technology (SRMIST)', 'SRM Nagar, Kattankulathur, Chengalpattu District, Tamil Nadu, 603203', 'Chennai', 'Tamil Nadu', 'https://www.srmist.edu.in', 'One of the top ranking private universities in India.', 1985, 'NAAC A++'),
(119, 'VIT Chennai Campus', 'Vandalur Kelambakkam Road, Chennai, Tamil Nadu - 600 127', 'Chennai', 'Tamil Nadu', 'https://www.vit.ac.in', 'Chennai campus of Vellore Institute of Technology.', 2010, 'NAAC A++')
ON CONFLICT (user_id) DO NOTHING;

-- 3. COURSES
INSERT INTO courses (college_id, course_name, cutoff, seats, duration, department, fee_per_year) VALUES
(100, 'B.Tech Computer Science and Engineering', 199.50, 60, '4 Years', 'CSE', 200000),
(100, 'B.Tech Electrical Engineering', 198.00, 60, '4 Years', 'EEE', 200000),
(101, 'B.E. Computer Science', 198.50, 120, '4 Years', 'CSE', 50000),
(101, 'B.E. Electronics & Communication', 197.00, 120, '4 Years', 'ECE', 50000),
(102, 'B.Tech Information Technology', 196.00, 60, '4 Years', 'IT', 60000),
(102, 'B.E. Aeronautical Engineering', 195.50, 60, '4 Years', 'AERO', 60000),
(103, 'B.Tech Computer Science and Engineering', 195.00, 120, '4 Years', 'CSE', 150000),
(104, 'B.E. Computer Science', 196.50, 120, '4 Years', 'CSE', 180000),
(104, 'B.E. Information Technology', 195.50, 120, '4 Years', 'IT', 180000),
(105, 'B.E. Computer Science', 194.00, 120, '4 Years', 'CSE', 160000),
(106, 'B.E. Computer Science', 198.00, 120, '4 Years', 'CSE', 95000),
(106, 'B.E. Mechanical Engineering', 195.00, 120, '4 Years', 'MECH', 95000),
(107, 'B.E. Civil Engineering', 190.00, 60, '4 Years', 'CIVIL', 40000),
(108, 'B.E. Electronics & Communication', 194.00, 120, '4 Years', 'ECE', 80000),
(109, 'B.E. Computer Science', 193.50, 120, '4 Years', 'CSE', 160000),
(110, 'B.E. Mechanical Engineering', 160.00, 60, '4 Years', 'MECH', 70000),
(111, 'B.Tech Artificial Intelligence', 194.50, 120, '4 Years', 'AI&DS', 150000),
(111, 'B.E. Computer Science', 193.00, 180, '4 Years', 'CSE', 150000),
(112, 'B.E. Computer Science', 192.50, 240, '4 Years', 'CSE', 140000),
(113, 'B.E. Electronics & Communication', 150.00, 60, '4 Years', 'ECE', 60000),
(114, 'B.E. Computer Science', 180.00, 120, '4 Years', 'CSE', 90000),
(115, 'B.E. Information Technology', 175.00, 60, '4 Years', 'IT', 85000),
(116, 'B.E. Computer Science', 185.00, 120, '4 Years', 'CSE', 100000),
(117, 'B.Tech Artificial Intelligence', 190.00, 60, '4 Years', 'AI&DS', 120000),
(118, 'B.Tech Computer Science and Engineering', 190.00, 600, '4 Years', 'CSE', 350000),
(118, 'B.Tech Information Technology', 188.00, 240, '4 Years', 'IT', 350000),
(119, 'B.Tech Computer Science and Engineering', 195.00, 480, '4 Years', 'CSE', 250000),
(119, 'B.Tech Electronics & Communication', 192.00, 240, '4 Years', 'ECE', 250000);

-- 4. PLACEMENTS
INSERT INTO placements (college_id, year, highest_package, average_package, placement_percent, top_recruiters) VALUES
(100, 2024, 60.50, 20.00, 98.00, 'Google, Microsoft, Amazon, Optiver, Apple'),
(101, 2024, 45.00, 12.50, 95.00, 'Amazon, Zoho, Microsoft, TCS, Infosys'),
(102, 2024, 40.00, 10.00, 92.00, 'Zoho, TCS, Wipro, L&T, HCL'),
(103, 2024, 35.00, 11.00, 90.00, 'TCS, Infosys, CTS, Amazon'),
(104, 2024, 42.00, 10.50, 96.00, 'Amazon, Zoho, TCS, HCL, Optum'),
(105, 2024, 38.00, 8.50, 93.00, 'TCS, Infosys, CTS, Zoho, Capgemini'),
(106, 2024, 55.00, 12.00, 97.00, 'Google, Microsoft, Amazon, Zoho, DE Shaw'),
(107, 2024, 25.00, 7.50, 85.00, 'TCS, Infosys, L&T, Zoho'),
(108, 2024, 28.00, 7.00, 88.00, 'TCS, Infosys, CTS, L&T Infotech'),
(109, 2024, 30.00, 8.00, 90.00, 'Zoho, TCS, Amazon, Wipro'),
(110, 2024, 12.00, 4.00, 75.00, 'TCS, Wipro, Infosys'),
(111, 2024, 32.00, 7.50, 94.00, 'Zoho, TCS, Infosys, Wipro'),
(112, 2024, 28.00, 7.00, 92.00, 'TCS, Infosys, Wipro, HCL'),
(113, 2024, 10.00, 3.50, 70.00, 'Local Tech Companies, BPOs'),
(114, 2024, 18.00, 5.00, 85.00, 'TCS, Wipro, Infosys, Tech Mahindra'),
(115, 2024, 15.00, 4.50, 80.00, 'Infosys, Wipro, TCS'),
(116, 2024, 20.00, 5.50, 88.00, 'TCS, Wipro, Infosys, HCL'),
(117, 2024, 24.00, 6.50, 91.00, 'TCS, Infosys, Zoho, Capgemini'),
(118, 2024, 50.00, 9.50, 95.00, 'Amazon, Microsoft, TCS, Infosys, Wipro, Cognizant'),
(119, 2024, 45.00, 9.00, 96.00, 'Amazon, Microsoft, TCS, Infosys, Cognizant');

-- 5. EVENTS
INSERT INTO events (college_id, name, description, event_date, location, max_participants) VALUES
(100, 'Shaastra 2025', 'Annual technical festival of IIT Madras featuring competitions, lectures, and workshops.', '2025-01-15', 'IIT Madras Campus', 5000),
(101, 'Kurukshetra 2025', 'International techno-management fest of CEG.', '2025-02-20', 'CEG Campus', 4000),
(104, 'Instincts 2025', 'Annual cultural and technical fest of SSN.', '2025-03-10', 'SSN Campus', 3000),
(106, 'Kriya 2025', 'The global techno-management fest of PSG College of Technology.', '2025-02-28', 'PSG Tech Campus', 3500),
(109, 'Yugam 2025', 'Annual techno-cultural fest at Kumaraguru.', '2025-03-05', 'KCT Campus', 4000),
(111, 'BITFest 2025', 'National level technical symposium.', '2025-04-12', 'BIT Sathy Campus', 2000),
(118, 'Aaruush 2025', 'National Level Techno-Management Fest.', '2025-09-15', 'SRM Kattankulathur', 8000),
(119, 'Vibrance 2025', 'Annual cultural and sports festival at VIT Chennai.', '2025-02-14', 'VIT Chennai Campus', 5000);
