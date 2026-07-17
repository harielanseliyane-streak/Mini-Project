-- ─────────────────────────────────────────────────────────────
-- InfoHub Database Schema
-- ─────────────────────────────────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. PROFILES TABLE ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL CHECK (role IN ('student', 'college', 'admin')),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Plain text password for custom credentials check
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 2. STUDENTS TABLE ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    hsc_marks NUMERIC CHECK (hsc_marks >= 0 AND hsc_marks <= 100),
    cutoff NUMERIC CHECK (cutoff >= 0 AND cutoff <= 200),
    profile_photo TEXT,
    bio TEXT,
    interests TEXT,
    skills TEXT,
    career_goals TEXT,
    location_pref TEXT,
    budget_pref NUMERIC,
    course_pref TEXT
);

-- ── 3. COLLEGES TABLE ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS colleges (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    college_name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    website TEXT,
    logo TEXT,
    description TEXT,
    established INTEGER,
    accreditation TEXT,
    infrastructure TEXT,
    hostel_info TEXT,
    fee_structure TEXT
);

-- ── 4. COURSES TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES colleges(user_id) ON DELETE CASCADE,
    course_name TEXT NOT NULL,
    cutoff NUMERIC NOT NULL CHECK (cutoff >= 0 AND cutoff <= 200),
    seats INTEGER NOT NULL DEFAULT 60,
    duration TEXT NOT NULL DEFAULT '4 Years',
    department TEXT,
    fee_per_year NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 5. PLACEMENTS TABLE ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS placements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES colleges(user_id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    highest_package NUMERIC NOT NULL,
    average_package NUMERIC NOT NULL,
    placement_percent NUMERIC NOT NULL CHECK (placement_percent >= 0 AND placement_percent <= 100),
    top_recruiters TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(college_id, year)
);

-- ── 6. EVENTS TABLE ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES colleges(user_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMPTZ NOT NULL,
    location TEXT,
    registration_deadline TIMESTAMPTZ,
    max_participants INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 7. SCHOLARSHIPS TABLE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS scholarships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID REFERENCES colleges(user_id) ON DELETE CASCADE, -- Can be NULL for general/government scholarships
    type TEXT NOT NULL CHECK (type IN ('merit', 'government', 'sports', 'need-based', 'other')),
    name TEXT NOT NULL,
    description TEXT,
    amount NUMERIC NOT NULL DEFAULT 0,
    eligibility TEXT,
    deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 8. INTERNSHIPS TABLE ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS internships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    stipend NUMERIC NOT NULL DEFAULT 0,
    duration TEXT NOT NULL,
    location TEXT NOT NULL,
    eligibility TEXT,
    skills_required TEXT,
    deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 9. POSTS TABLE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES colleges(user_id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('placement', 'announcement', 'event', 'general')),
    title TEXT NOT NULL,
    description TEXT,
    media_url TEXT,
    media_type TEXT NOT NULL DEFAULT 'none' CHECK (media_type IN ('none', 'image', 'video')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 10. REVIEWS TABLE ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
    college_id UUID NOT NULL REFERENCES colleges(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 11. NOTIFICATIONS TABLE ───────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 12. APPLICATIONS TABLE ────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
    college_id UUID NOT NULL REFERENCES colleges(user_id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('admission', 'event')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    message TEXT,
    applied_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, college_id, type, course_id)
);

-- ── 13. SAVED_ITEMS TABLE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('college', 'course', 'scholarship', 'internship')),
    item_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, type, item_id)
);

-- ── 14. QUIZ_RESULTS TABLE ────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
    career_path TEXT NOT NULL,
    personality TEXT NOT NULL,
    aptitude_score INTEGER NOT NULL,
    interest_mapping JSONB NOT NULL,
    skills_analysis JSONB NOT NULL,
    recommendations TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 15. AUTH_SETTINGS TABLE (Internal Use) ─────────────────────
CREATE TABLE IF NOT EXISTS auth_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- ─────────────────────────────────────────────────────────────
-- INDEXES FOR PERFORMANCE
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_courses_college_id ON courses(college_id);
CREATE INDEX IF NOT EXISTS idx_placements_college_id ON placements(college_id);
CREATE INDEX IF NOT EXISTS idx_events_college_id ON events(college_id);
CREATE INDEX IF NOT EXISTS idx_scholarships_college_id ON scholarships(college_id);
CREATE INDEX IF NOT EXISTS idx_posts_college_id ON posts(college_id);
CREATE INDEX IF NOT EXISTS idx_reviews_college_id ON reviews(college_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_student_id ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_college_id ON applications(college_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_student_id ON saved_items(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_student_id ON quiz_results(student_id);

-- ── 16. CAMPUS BUDDY COLUMNS (added to students) ──────────────
-- These columns track whether a student is enrolled and in which college.
ALTER TABLE students
    ADD COLUMN IF NOT EXISTS is_college_student BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES colleges(user_id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS college_name TEXT,
    ADD COLUMN IF NOT EXISTS branch TEXT,
    ADD COLUMN IF NOT EXISTS batch TEXT;

-- ── 17. CAMPUS BUDDIES TABLE ──────────────────────────────────
-- Stores Campus Buddy verification requests from enrolled students.
CREATE TABLE IF NOT EXISTS campus_buddies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    college_name TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,               -- e.g. "2nd Year", "Final Year"
    roll_number TEXT NOT NULL,
    college_email TEXT NOT NULL,
    student_id_url TEXT,              -- URL to uploaded student ID card in Supabase Storage
    why_buddy TEXT,                   -- Optional motivation text
    verification_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    admin_note TEXT,                  -- Admin's approval/rejection note
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)                   -- One Campus Buddy application per user
);

-- Indexes for campus_buddies
CREATE INDEX IF NOT EXISTS idx_campus_buddies_user_id ON campus_buddies(user_id);
CREATE INDEX IF NOT EXISTS idx_campus_buddies_status ON campus_buddies(verification_status);

-- Note: Create a Supabase Storage bucket named "student-ids" with:
--   - Public access: true (for verified download URLs)
--   - Max file size: 5 MB
--   - Allowed MIME types: image/*, application/pdf



-- ─────────────────────────────────────────────────────────────
-- RPC DATABASE FUNCTIONS (SECURITY DEFINER to bypass RLS)
-- ─────────────────────────────────────────────────────────────

-- ── RPC: Verify User Credentials ──────────────────────────────
CREATE OR REPLACE FUNCTION verify_user_credentials(p_email TEXT, p_password TEXT)
RETURNS TABLE (
    id UUID,
    role TEXT,
    name TEXT,
    email TEXT,
    phone TEXT
) SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.role, p.name, p.email, p.phone
    FROM profiles p
    WHERE lower(p.email) = lower(p_email) AND p.password = p_password;
END;
$$ LANGUAGE plpgsql;

-- ── RPC: Register User ────────────────────────────────────────
CREATE OR REPLACE FUNCTION register_user(
    p_email TEXT,
    p_password TEXT,
    p_role TEXT,
    p_name TEXT,
    p_phone TEXT,
    p_metadata JSONB
)
RETURNS TABLE (
    id UUID,
    role TEXT,
    name TEXT,
    email TEXT,
    phone TEXT
) SECURITY DEFINER AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Check email existence
    IF EXISTS (SELECT 1 FROM profiles p WHERE lower(p.email) = lower(p_email)) THEN
        RAISE EXCEPTION 'Email already registered';
    END IF;

    -- Insert into profiles
    INSERT INTO profiles (role, name, email, password, phone)
    VALUES (p_role, p_name, p_email, p_password, p_phone)
    RETURNING profiles.id INTO v_user_id;

    -- Insert into role-specific tables
    IF p_role = 'student' THEN
        INSERT INTO students (
            user_id, profile_photo, bio, interests, skills, career_goals, location_pref, budget_pref, course_pref
        ) VALUES (
            v_user_id,
            COALESCE(p_metadata->>'profile_photo', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
            COALESCE(p_metadata->>'bio', ''),
            COALESCE(p_metadata->>'interests', ''),
            COALESCE(p_metadata->>'skills', ''),
            COALESCE(p_metadata->>'career_goals', ''),
            COALESCE(p_metadata->>'location_pref', ''),
            (p_metadata->>'budget_pref')::NUMERIC,
            COALESCE(p_metadata->>'course_pref', '')
        );
    ELSIF p_role = 'college' THEN
        INSERT INTO colleges (
            user_id, college_name, logo, description, established, accreditation, city, state, address, website
        ) VALUES (
            v_user_id,
            p_name,
            COALESCE(p_metadata->>'logo', 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=120&auto=format&fit=crop&q=80'),
            COALESCE(p_metadata->>'description', p_name || ' is an educational institution.'),
            COALESCE((p_metadata->>'established')::INTEGER, extract(year from now())::integer),
            COALESCE(p_metadata->>'accreditation', 'NAAC A'),
            p_metadata->>'city',
            p_metadata->>'state',
            p_metadata->>'address',
            p_metadata->>'website'
        );
    END IF;

    RETURN QUERY
    SELECT p.id, p.role, p.name, p.email, p.phone
    FROM profiles p
    WHERE p.id = v_user_id;
END;
$$ LANGUAGE plpgsql;
