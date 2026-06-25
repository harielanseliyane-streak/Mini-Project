const fs = require('fs');

const colleges = [
    // Chennai
    { name: "IIT Madras (Indian Institute of Technology)", email: "deanadmn@iitm.ac.in", address: "Indian Institute of Technology Madras, IIT P.O., Chennai 600 036, INDIA", city: "Chennai", state: "Tamil Nadu" },
    { name: "College of Engineering, Guindy (CEG)", email: "cegdeanoffice@gmail.com", address: "CEG Campus, Guindy Anna University, Chennai, Tamil Nadu 600025", city: "Chennai", state: "Tamil Nadu" },
    { name: "Madras Institute of Technology (MIT)", email: "dean@mitindia.edu", address: "Anna University, MIT Campus Chromepet, Chennai 600044", city: "Chennai", state: "Tamil Nadu" },
    { name: "IIITDM Kancheepuram", email: "office@iiitdm.ac.in", address: "Melakkottaiyur, off Vandalur-Kelambakkam Road, Chennai - 600127, Tamil Nadu, India", city: "Chennai", state: "Tamil Nadu" },
    { name: "SSN College of Engineering", email: "info@ssn.edu.in", address: "Rajiv Gandhi Salai (OMR), Kalavakkam, Chennai - 603 110", city: "Chennai", state: "Tamil Nadu" },
    { name: "Chennai Institute of Technology (CIT)", email: "info@citchennai.net", address: "Sarathy Nagar, Kundrathur, Chennai-600069, TamilNadu, India.", city: "Chennai", state: "Tamil Nadu" },
    { name: "SRM Easwari Engineering College", email: "principal@eec.srmrmp.edu.in", address: "162, Bharathi Salai, Ramapuram, Chennai, Tamil Nadu 600089, India", city: "Chennai", state: "Tamil Nadu" },
    { name: "Sri Sairam Engineering College", email: "sairam@sairam.edu.in", address: "No.31, Madley Road, T.Nagar, Chennai - 600 017, Tamilnadu, India.", city: "Chennai", state: "Tamil Nadu" },
    { name: "Rajalakshmi Engineering College (REC)", email: "cityoffice@rajalakshmi.edu.in", address: "# 69 New Avadi Road, Kilpauk, Chennai - 600 010.", city: "Chennai", state: "Tamil Nadu" },
    { name: "St. Joseph's College of Engineering", email: "jprstjosephs@stjosephs.ac.in", address: "St. Joseph's College of Engineering, OMR, Chennai - 119", city: "Chennai", state: "Tamil Nadu" },
    { name: "Saveetha Engineering College", email: "admission@saveetha.ac.in", address: "Saveetha Nagar, Thandalam, Chennai - 602105", city: "Chennai", state: "Tamil Nadu" },
    { name: "KCG College of Technology", email: "principal@kcgcollege.com", address: "KCG Nagar, Rajiv Gandhi Salai, Karapakkam, Chennai - 600 097, Tamil Nadu, India.", city: "Chennai", state: "Tamil Nadu" },
    { name: "Loyola-ICAM College of Engineering (LICET)", email: "licet@licet.ac.in", address: "Loyola Campus Nungambakkam, Chennai - 600034.", city: "Chennai", state: "Tamil Nadu" },
    { name: "Meenakshi Sundararajan Engineering College", email: "principal@msec.edu.in", address: "363, Arcot Road, Kodambakkam, Chennai, Tamil Nadu 600024", city: "Chennai", state: "Tamil Nadu" },
    { name: "Sri Venkateswara College of Engineering (SVCE)", email: "principal@svce.ac.in", address: "1/3A River View Road, Sector 3, Kotturpuram, Chennai, Tamil Nadu 600085", city: "Chennai", state: "Tamil Nadu" },
    { name: "Panimalar Engineering College", email: "info@panimalar.ac.in", address: "Bangalore Trunk Road, Varadharajapuram, Poonamallee, Chennai - 600 123.", city: "Chennai", state: "Tamil Nadu" },
    { name: "Velammal Engineering College", email: "velammal@velammal.edu.in", address: "Ambattur Red Hills Rd, Velammal Nagar, Surapet, Chennai, Tamil Nadu 600066", city: "Chennai", state: "Tamil Nadu" },
    { name: "Jeppiaar Engineering College", email: "dean@jeppiaarcollege.org", address: "Old Mamallapuram Road, Rajiv Gandhi Salai, Semmencherry, Chennai, Tamil Nadu - 600119.", city: "Chennai", state: "Tamil Nadu" },
    { name: "Vel Tech Rangarajan Dr. Sagunthala R&D Institute", email: "admission@veltech.edu.in", address: "No. 42, Avadi-Vel Tech Road, Vel Nagar, Avadi, Chennai - 600 062, Tamil Nadu, India", city: "Chennai", state: "Tamil Nadu" },
    { name: "B.S. Abdur Rahman Crescent Institute of Science and Technology", email: "admissions@crescent.education", address: "120 Seethakathi Estate, GST Rd, Vandalur, Tamil Nadu 600048", city: "Chennai", state: "Tamil Nadu" },
    { name: "Dhaanish Ahmed College of Engineering", email: "info@dhaanishcollege.co.in", address: "Dhaanish Nagar, Vanchuvancherry, Padappai, near Tambaram, Chennai - 601301, Tamil Nadu", city: "Chennai", state: "Tamil Nadu" },
    { name: "Sree Sastha Institute of Engineering & Technology", email: "headadmission@ssiet.in", address: "Sree Sastha Nagar, Chennai - Bangalore Highway, Chembarambakkam, Chennai - 600123.", city: "Chennai", state: "Tamil Nadu" },
    { name: "SRM Institute of Science and Technology (SRMIST)", email: "infodesk@srmist.edu.in", address: "SRM Nagar, Kattankulathur, Chengalpattu District, Tamil Nadu, 603203", city: "Chennai", state: "Tamil Nadu" },
    { name: "VIT Chennai Campus", email: "admin.chennai@vit.ac.in", address: "Vandalur Kelambakkam Road, Chennai, Tamil Nadu - 600 127", city: "Chennai", state: "Tamil Nadu" },
    { name: "Sathyabama Institute of Science and Technology", email: "johnbruce@sathyabama.ac.in", address: "Jeppiaar Nagar, Rajiv Gandhi Salai, Chennai - 600 119. Tamilnadu, INDIA.", city: "Chennai", state: "Tamil Nadu" },
    { name: "Dr. M.G.R. Educational and Research Institute", email: "contact@drmgrdu.ac.in", address: "E.V.R Periyar Salai (NH4 Highway), Maduravoyal, Chennai - 600095. Tamilnadu, India.", city: "Chennai", state: "Tamil Nadu" },
    { name: "VELS Institute of Science, Technology and Advanced Studies", email: "vels@vistas.ac.in", address: "No.521/2, Anna Salai (Opp. G.R. Complex), Nandanam, Chennai - 600 035, Tamil Nadu, India", city: "Chennai", state: "Tamil Nadu" },

    // Coimbatore
    { name: "PSG College of Technology (PSGCT)", email: "principal@psgtech.ac.in", address: "PSG College of Technology, Peelamedu, Coimbatore - 641 004", city: "Coimbatore", state: "Tamil Nadu" },
    { name: "Government College of Technology", email: "principal@gct.ac.in", address: "Thadagam Road, G.C.T Post, Coimbatore, Tamil Nadu, 641013", city: "Coimbatore", state: "Tamil Nadu" },
    { name: "Coimbatore Institute of Technology (CIT)", email: "principal.citoffice@cit.edu.in", address: "Civil Aerodrome Post, Coimbatore, Tamilnadu, India - 641 014", city: "Coimbatore", state: "Tamil Nadu" },
    { name: "Kumaraguru College of Technology (KCT)", email: "info@kct.ac.in", address: "Kumaraguru Campus, Chinnavedampatti, Coimbatore 641049, Tamil Nadu, India.", city: "Coimbatore", state: "Tamil Nadu" },
    { name: "Amrita School of Engineering", email: "univhq@amrita.edu", address: "Amrita Vishwa Vidyapeetham, Coimbatore Campus, Amritanagar, Coimbatore - 641 112, Tamilnadu, India", city: "Coimbatore", state: "Tamil Nadu" },
    { name: "Karunya Institute of Technology and Sciences", email: "info@karunya.edu", address: "Karunya Nagar, Coimbatore - 641 114, Tamil Nadu, India", city: "Coimbatore", state: "Tamil Nadu" },
    { name: "Sri Krishna College of Engineering and Technology", email: "placement@skcet.ac.in", address: "Kuniamuthur, Coimbatore, Tamil Nadu - 641008", city: "Coimbatore", state: "Tamil Nadu" },
    { name: "Sri Ramakrishna Engineering College (SREC)", email: "principal@srec.ac.in", address: "Vattamalaipalayam, N.G.G.O Colony P.O, Coimbatore - 641 022", city: "Coimbatore", state: "Tamil Nadu" },
    { name: "Sri Ramakrishna Institute of Technology (Autonomous)", email: "sritech@sriindia.net", address: "SF No. 162, Athipalayam, Thudiyalur to Kovil Palayam Road, Coimbatore - 641110, Tamil Nadu.", city: "Coimbatore", state: "Tamil Nadu" },
    { name: "Sri Ranganathar Institute of Engineering and Technology", email: "principal@srit.org", address: "Pachapalayam (Post), Perur Chettipalayam, Coimbatore - 641 010, Tamil Nadu, India.", city: "Coimbatore", state: "Tamil Nadu" },
    { name: "Sri Sai Ranganathan Engineering College", email: "rec.cbe@gmail.com", address: "REC Kalvi Nagar, Viraliyur Post, Thondamuthur (via), Coimbatore - 641109, Tamil Nadu.", city: "Coimbatore", state: "Tamil Nadu" },
    { name: "Sri Shakthi Institute of Engineering and Technology (Autonomous)", email: "admissions@siet.ac.in", address: "L&T Bypass Road, Venkitapuram Post, Neelambur, Coimbatore - 641062", city: "Coimbatore", state: "Tamil Nadu" },
    { name: "Sriguru Institute of Technology", email: "sriguru@sriguru.ac.in", address: "Varathaiyangar Palayam, Kondayampalayam (P.O), Near Saravanampatti, Coimbatore - 641110.", city: "Coimbatore", state: "Tamil Nadu" },
    { name: "Suguna College of Engineering", email: "sugucoe@gmail.com", address: "Nehru Nagar, Kalapatti Road, Civil Aerodrome Post, Coimbatore - 641014.", city: "Coimbatore", state: "Tamil Nadu" },
    { name: "Tamilnadu College of Engineering", email: "principal@tnce.in", address: "Palanisame Ravi Nagar, Karumathampatti, Coimbatore - 641659, Tamil Nadu", city: "Coimbatore", state: "Tamil Nadu" },
    { name: "VSB College of Engineering Technical Campus", email: "admission@vsbcetc.com", address: "NH-209, Coimbatore-Pollachi Main Road, Arasampalayam, Coimbatore - 64210", city: "Coimbatore", state: "Tamil Nadu" },

    // Erode
    { name: "Aishwarya College of Engineering and Technology", email: "admissions@aishwaryaenggcollege.ac.in", address: "Errattaikaradu, Paruvachi (Post), Anthiyur, Bhavani (Taluk), Erode District - 638312", city: "Erode", state: "Tamil Nadu" },
    { name: "Al-Ameen Engineering College", email: "alameenengg@yahoo.com", address: "Karundevanpalayam, Erode-Modakurichi Main Road, Nanjaluthukuli (PO), Erode - 638104", city: "Erode", state: "Tamil Nadu" },
    { name: "Bannari Amman Institute of Technology (Autonomous)", email: "stayahead@bitsathy.ac.in", address: "Sathy-Bhavani State Highway, Alathukombai (Post), Sathyamangalam, Erode District - 638401", city: "Erode", state: "Tamil Nadu" },
    { name: "Erode Sengunthar Engineering College (Autonomous)", email: "esec@esec.ac.in", address: "Erode-Perundurai Road, Thudupathi Post, Perundurai, Erode - 638057", city: "Erode", state: "Tamil Nadu" },
    { name: "Institute of Road and Transport Technology", email: "gceeprincipal@gmail.com", address: "Spanning a 350-acre campus. It is located approximately 15 km from Erode Railway Station", city: "Erode", state: "Tamil Nadu" },
    { name: "JKK Muniraja College of Technology", email: "principal@jkkmct.edu.in", address: "T.N. Palayam (Post), Thookkanaickenpalayam, Gobi Taluk, Erode District - 638506", city: "Erode", state: "Tamil Nadu" },
    { name: "Kongu Engineering College (Autonomous)", email: "principal@kongu.ac.in", address: "Perundurai Railway Station Road, Thoppupalayam, Perundurai, Erode - 638060", city: "Erode", state: "Tamil Nadu" },
    { name: "MP Nachimuthu M Jagannathan Engineering College", email: "mpnmjec@mpnmjec.ac.in", address: "Sudhanandhen Kalvi Nagar, Chennimalai, Erode District - 638112", city: "Erode", state: "Tamil Nadu" },
    { name: "Nandha Engineering College (Autonomous)", email: "principal@nandhaengg.org", address: "Erode - Perundurai Main Road, Vaikkaalmedu, Pitchandampalayam (PO), Erode - 638052", city: "Erode", state: "Tamil Nadu" },
    { name: "Shree Venkateshwara Hi-Tech Engineering College", email: "principal@svhec.com", address: "Othakuthirai, Gobi-Sathy Main Road, Gobichettipalayam, Erode District - 638455", city: "Erode", state: "Tamil Nadu" },
    { name: "Surya Engineering College", email: "secerode@gmail.com", address: "Erode - Perundurai Road, Kathirampatti, Mettukadai, Erode District - 638107", city: "Erode", state: "Tamil Nadu" },
    { name: "Velalar College of Engineering and Technology", email: "principal@velalarengg.ac.in", address: "Maruthi Nagar, Thindal Post, Erode - 638012", city: "Erode", state: "Tamil Nadu" },

    // Namakkal
    { name: "Annai Mathammal Sheela", email: "amsec.principal@gmail.com", address: "Erumapatty, Namakkal - 637013", city: "Namakkal", state: "Tamil Nadu" },
    { name: "Excel College of Engg & Tech", email: "admission@excelcolleges.com", address: "NH-544, Pallakkapalayam, Komarapalayam - 637303", city: "Namakkal", state: "Tamil Nadu" },
    { name: "Excel Engineering College (A)", email: "principal@excelengg.com", address: "NH-544, Pallakkapalayam, Komarapalayam - 637303", city: "Namakkal", state: "Tamil Nadu" },
    { name: "Gnanamani College of Engg", email: "info@gce.org.in", address: "NH-7, Pachal, Namakkal - 637018", city: "Namakkal", state: "Tamil Nadu" },
    { name: "Gnanamani College of Tech", email: "gctinfo@gce.org.in", address: "NH-7, Pachal, Namakkal - 637018", city: "Namakkal", state: "Tamil Nadu" },
    { name: "JKK Nataraja College of Engg", email: "principal@jkkn.ac.in", address: "Natarajapuram, Komarapalayam - 638183", city: "Namakkal", state: "Tamil Nadu" },
    { name: "KSR College of Engg (A)", email: "info@ksrce.ac.in", address: "K.S.R. Kalvi Nagar, Tiruchengode - 637215", city: "Namakkal", state: "Tamil Nadu" },
    { name: "KSR Inst. for Engg & Tech", email: "info@ksriet.ac.in", address: "K.S.R. Kalvi Nagar, Tiruchengode - 637215", city: "Namakkal", state: "Tamil Nadu" },
    { name: "KS Rangasamy Coll of Tech", email: "principal@ksrct.ac.in", address: "K.S.R. Kalvi Nagar, Tiruchengode - 637215", city: "Namakkal", state: "Tamil Nadu" },
    { name: "Mahendra Engg College (A)", email: "info@mahendra.info", address: "Mahendhirapuri, Mallasamudram - 637503", city: "Namakkal", state: "Tamil Nadu" },
    { name: "Mahendra Inst of Engg & Tech", email: "miet@mahendra.info", address: "Mahendhirapuri, Mallasamudram - 637503", city: "Namakkal", state: "Tamil Nadu" },
    { name: "Mahendra Inst of Technology", email: "mit@mahendra.info", address: "Mahendhirapuri, Mallasamudram - 637503", city: "Namakkal", state: "Tamil Nadu" },
    { name: "Muthayammal College of Engg", email: "info@mce.ac.in", address: "Rasipuram, Namakkal - 637408", city: "Namakkal", state: "Tamil Nadu" },
    { name: "Muthayammal Engg Coll (A)", email: "met.principal@gmail.com", address: "Rasipuram, Namakkal - 637408", city: "Namakkal", state: "Tamil Nadu" },
    { name: "PGP College of Engg & Tech", email: "pgpcet@pgpcolleges.com", address: "NH-7, Karur Main Road, Namakkal - 637207", city: "Namakkal", state: "Tamil Nadu" },
    { name: "Paavai College of Engg", email: "pecprincipal@paavai.edu.in", address: "NH-7, Pachal, Namakkal - 637018", city: "Namakkal", state: "Tamil Nadu" },
    { name: "Paavai College of Technology", email: "pctprincipal@paavai.edu.in", address: "NH-7, Pachal, Namakkal - 637018", city: "Namakkal", state: "Tamil Nadu" },
    { name: "Paavai Engg College (A)", email: "pecprincipal@paavai.edu.in", address: "NH-7, Pachal, Namakkal - 637018", city: "Namakkal", state: "Tamil Nadu" },
    { name: "SSM College of Engineering", email: "ssmceadmission@gmail.com", address: "NH-544, Komarapalayam - 638183", city: "Namakkal", state: "Tamil Nadu" },
    { name: "Selvam College of Technology", email: "principal@selvamtech.edu.in", address: "Salem Road (NH-7), Namakkal - 637003", city: "Namakkal", state: "Tamil Nadu" },
    { name: "Sengunthar College of Engg", email: "info@sengunthar.org", address: "Kosavampalayam, Tiruchengode - 637205", city: "Namakkal", state: "Tamil Nadu" },
    { name: "Sengunthar Engg College (A)", email: "principal@sectgc.ac.in", address: "Kosavampalayam, Tiruchengode - 637205", city: "Namakkal", state: "Tamil Nadu" },
    { name: "SRG Engineering College", email: "srgprincipal@gmail.com", address: "SH-95, Aniyapuram, Namakkal - 637017", city: "Namakkal", state: "Tamil Nadu" },
    { name: "Vidyaa Vikas Coll of Engg", email: "principal@vvct.ac.in", address: "Tiruchengode Road, Tiruchengode - 637214", city: "Namakkal", state: "Tamil Nadu" },
    { name: "Vivekanandha Coll (Women)", email: "principal@vcew.ac.in", address: "Elayampalayam, Tiruchengode - 637205", city: "Namakkal", state: "Tamil Nadu" },
    { name: "Vivekanandha Tech (Women)", email: "principal@vctw.ac.in", address: "Elayampalayam, Tiruchengode - 637205", city: "Namakkal", state: "Tamil Nadu" },

    // Salem
    { name: "AVS Engineering College", email: "principal@avsenggcollege.ac.in", address: "Military Road, Ammapet, Salem - 636003", city: "Salem", state: "Tamil Nadu" },
    { name: "Annapoorana Engineering College", email: "support@aecsalem.edu.in", address: "NH-47, Sankari Main Road, Periyaseeragapadi - 636308", city: "Salem", state: "Tamil Nadu" },
    { name: "AVS College of Technology", email: "info@avstech.ac.in", address: "Chinnagoundapuram, Salem - 636106", city: "Salem", state: "Tamil Nadu" },
    { name: "Dhirajlal Gandhi College of Tech", email: "info@dgct.ac.in", address: "Opposite Airport, Sikkanampatty, Salem - 636309", city: "Salem", state: "Tamil Nadu" },
    { name: "Ganesh College of Engineering", email: "principal@ganeshenggcollege.org", address: "Attur Main Road, Mettupatty, Salem - 636111", city: "Salem", state: "Tamil Nadu" },
    { name: "GCE Salem (Autonomous)", email: "principal@ganeshenggcollege.org", address: "NH-44, Karuppur, Salem - 636011", city: "Salem", state: "Tamil Nadu" },
    { name: "Knowledge Institute of Tech", email: "klot@klot.ac.in", address: "KIOT Campus, Kakapalayam, Salem - 637504", city: "Salem", state: "Tamil Nadu" },
    { name: "Mahendra College of Engineering", email: "info@mahendraarts.org", address: "Minnampalli, Salem - 636106", city: "Salem", state: "Tamil Nadu" },
    { name: "Narasu's Sarathy Inst. of Tech", email: "admin@nsit.edu.in", address: "Poosaripatty, Kadayampatty, Salem - 636305", city: "Salem", state: "Tamil Nadu" },
    { name: "Salem College of Engg & Tech", email: "info@salemcollege.org", address: "NH-68, Mettupatty, Salem - 636111", city: "Salem", state: "Tamil Nadu" },
    { name: "Shree Sathyam College of Engg", email: "info@shreesathyam.edu.in", address: "NH-47, Sankari Main Road, Kuppanur - 637301", city: "Salem", state: "Tamil Nadu" },
    { name: "Sona College of Tech (Autonomous)", email: "info@sonatech.ac.in", address: "Sona Nagar, Junction Main Road, Salem - 636005", city: "Salem", state: "Tamil Nadu" },
    { name: "Sri Shanmugha College of Engg", email: "info@shanmugha.edu.in", address: "Tiruchengode-Sankari Road, Pullipalayam - 637304", city: "Salem", state: "Tamil Nadu" },
    { name: "Tagore Institute of Engg & Tech", email: "principaltiet@tagoreiet.ac", address: "Deviyakurichi, Attur, Salem - 636112", city: "Salem", state: "Tamil Nadu" },
    { name: "The Kavery College of Engineering", email: "tketoffice@gmail.com", address: "Mecheri, Salem - 636453", city: "Salem", state: "Tamil Nadu" },
    { name: "The Kavery Engineering College", email: "tkce_education@rediffmail.com", address: "Mecheri, Salem - 636 453, TamilNadu", city: "Salem", state: "Tamil Nadu" },
    { name: "VSA Group of Institutions", email: "dsvakoia@gmail.com", address: "NH-47, Uthamasolapuram, Salem - 636010", city: "Salem", state: "Tamil Nadu" }
];

const mockCourses = [
    { name: "B.E. Computer Science", dept: "CSE", baseFee: 85000 },
    { name: "B.E. Information Technology", dept: "IT", baseFee: 85000 },
    { name: "B.E. Electronics & Communication", dept: "ECE", baseFee: 75000 },
    { name: "B.E. Mechanical Engineering", dept: "MECH", baseFee: 65000 },
    { name: "B.E. Civil Engineering", dept: "CIVIL", baseFee: 60000 },
    { name: "B.Tech Artificial Intelligence", dept: "AI&DS", baseFee: 95000 }
];

const topRecruiters = [
    "TCS, Infosys, Wipro, HCL, Cognizant",
    "Google, Microsoft, Amazon, Zoho, Freshworks",
    "TCS, Infosys, CTS, L&T Infotech",
    "Accenture, Capgemini, IBM, Tech Mahindra",
    "Zoho, TCS, Wipro, Amazon"
];

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function generateSQL() {
    let sql = `-- ============================================================
-- Auto-generated Seed Data for Colleges, Courses, Placements, and Events
-- ============================================================

`;

    // 1. GENERATE USERS
    sql += `-- 1. USERS\nINSERT INTO users (id, role, name, email, password_hash, phone) VALUES\n`;
    
    // We will start user ID from 100 to avoid conflicts with seed data 1, 2, 3
    let userId = 100;
    let userValues = [];
    
    colleges.forEach(college => {
        college.id = userId++;
        // Use a generic bcrypt hash for "college123"
        let hash = "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImSgoeVW";
        let phone = `044${Math.floor(10000000 + Math.random() * 90000000)}`;
        userValues.push(`(${college.id}, 'college', '${college.name.replace(/'/g, "''")}', '${college.email.replace(/'/g, "''")}', '${hash}', '${phone}')`);
    });
    
    sql += userValues.join(",\n") + "\nON CONFLICT (email) DO NOTHING;\n\n";

    // 2. GENERATE COLLEGES
    sql += `-- 2. COLLEGES\nINSERT INTO colleges (user_id, college_name, address, city, state, website, description, established, accreditation) VALUES\n`;
    let collegeValues = [];
    colleges.forEach(college => {
        let est = Math.floor(getRandom(1950, 2015));
        let acc = Math.random() > 0.5 ? "NAAC A" : (Math.random() > 0.5 ? "NAAC A+" : "NAAC A++");
        let website = `https://www.${college.name.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "")}.edu.in`;
        let desc = `One of the top institutions in ${college.city}, offering quality engineering education with excellent infrastructure.`;
        collegeValues.push(`(${college.id}, '${college.name.replace(/'/g, "''")}', '${college.address.replace(/'/g, "''")}', '${college.city}', '${college.state}', '${website}', '${desc}', ${est}, '${acc}')`);
    });
    sql += collegeValues.join(",\n") + "\nON CONFLICT (user_id) DO NOTHING;\n\n";

    // 3. GENERATE COURSES
    sql += `-- 3. COURSES\nINSERT INTO courses (college_id, course_name, cutoff, seats, duration, department, fee_per_year) VALUES\n`;
    let courseValues = [];
    colleges.forEach(college => {
        // Pick 3-4 random courses
        let numCourses = Math.floor(getRandom(3, 6));
        let selectedCourses = [...mockCourses].sort(() => 0.5 - Math.random()).slice(0, numCourses);
        
        selectedCourses.forEach(c => {
            let cutoff = getRandom(150, 198).toFixed(2);
            let seats = Math.floor(getRandom(1, 3)) * 60;
            let fee = c.baseFee + (Math.floor(getRandom(-10, 20)) * 1000);
            courseValues.push(`(${college.id}, '${c.name}', ${cutoff}, ${seats}, '4 Years', '${c.dept}', ${fee})`);
        });
    });
    sql += courseValues.join(",\n") + ";\n\n";

    // 4. GENERATE PLACEMENTS
    sql += `-- 4. PLACEMENTS\nINSERT INTO placements (college_id, year, highest_package, average_package, placement_percent, top_recruiters) VALUES\n`;
    let placementValues = [];
    colleges.forEach(college => {
        let isTopTier = college.name.includes("IIT") || college.name.includes("PSG") || college.name.includes("SSN");
        let maxLpa = isTopTier ? getRandom(35, 60) : getRandom(8, 25);
        let avgLpa = isTopTier ? getRandom(8, 15) : getRandom(3.5, 6);
        let placementPct = getRandom(75, 98).toFixed(2);
        let recruiters = topRecruiters[Math.floor(Math.random() * topRecruiters.length)];
        
        placementValues.push(`(${college.id}, 2024, ${maxLpa.toFixed(2)}, ${avgLpa.toFixed(2)}, ${placementPct}, '${recruiters}')`);
    });
    sql += placementValues.join(",\n") + ";\n\n";

    // 5. GENERATE EVENTS
    sql += `-- 5. EVENTS\nINSERT INTO events (college_id, name, description, event_date, location, max_participants) VALUES\n`;
    let eventValues = [];
    colleges.forEach(college => {
        let hasEvent = Math.random() > 0.3; // 70% chance to have an event
        if (hasEvent) {
            let eventNames = ["Tech Symposium 2025", "Hackathon 2025", "CodeFest", "Innovate " + college.city, "Open Day 2025"];
            let eName = eventNames[Math.floor(Math.random() * eventNames.length)];
            let eDesc = `Annual technical event at ${college.name.replace(/'/g, "''")} featuring multiple competitions.`;
            let m = Math.floor(getRandom(6, 11)).toString().padStart(2, '0');
            let d = Math.floor(getRandom(1, 28)).toString().padStart(2, '0');
            let date = `2025-${m}-${d}`;
            let loc = `Main Campus, ${college.city}`;
            let maxP = Math.floor(getRandom(200, 1000));
            eventValues.push(`(${college.id}, '${eName}', '${eDesc}', '${date}', '${loc}', ${maxP})`);
        }
    });
    sql += eventValues.join(",\n") + ";\n\n";

    const path = require('path');
    const outPath = path.join(__dirname, 'seed_colleges.sql');
    fs.writeFileSync(outPath, sql);
    console.log("Successfully generated seed_colleges.sql with " + colleges.length + " colleges.");
}

generateSQL();
