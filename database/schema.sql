-- ============================================================
-- InfoHub - Main Database Schema (Supabase PostgreSQL)
-- Run this first in: Supabase → SQL Editor → New Query → Run
-- ============================================================

-- ── 1. DROP EXISTING TABLES (for a clean reset) ──
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.ai_recommendations CASCADE;
DROP TABLE IF EXISTS public.saved_items CASCADE;
DROP TABLE IF EXISTS public.quiz_results CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.placements CASCADE;
DROP TABLE IF EXISTS public.internships CASCADE;
DROP TABLE IF EXISTS public.scholarships CASCADE;
DROP TABLE IF EXISTS public.event_registrations CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.colleges CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 2. CREATE SCHEMAS & TABLES ──

-- A. PROFILES (Extends Supabase auth.users)
CREATE TABLE public.profiles (
  id         UUID PRIMARY KEY, -- Maps to auth.users.id (removed FK constraint for seeding/flexibility)
  role       TEXT NOT NULL CHECK (role IN ('student', 'college', 'admin')),
  name       TEXT NOT NULL,
  email      TEXT UNIQUE,
  phone      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- B. STUDENTS
CREATE TABLE public.students (
  user_id       UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  hsc_marks     NUMERIC(5,2),
  cutoff        NUMERIC(6,2),
  profile_photo TEXT,
  bio           TEXT,
  interests     TEXT,
  skills        TEXT,
  career_goals  TEXT,
  location_pref TEXT,
  budget_pref   NUMERIC(12,2),
  course_pref   TEXT
);

-- C. COLLEGES
CREATE TABLE public.colleges (
  user_id        UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  college_name   TEXT NOT NULL,
  address        TEXT,
  city           TEXT,
  state          TEXT,
  website        TEXT,
  logo           TEXT,
  description    TEXT,
  established    INT,
  accreditation  TEXT,
  infrastructure TEXT,
  hostel_info    TEXT,
  fee_structure  TEXT
);

-- D. COURSES
CREATE TABLE public.courses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id   UUID NOT NULL REFERENCES public.colleges(user_id) ON DELETE CASCADE,
  course_name  TEXT NOT NULL,
  cutoff       NUMERIC(6,2) NOT NULL,
  seats        INT,
  duration     TEXT,
  department   TEXT,
  fee_per_year NUMERIC(12,2),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- E. POSTS
CREATE TABLE public.posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id  UUID NOT NULL REFERENCES public.colleges(user_id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'general',
  title       TEXT NOT NULL,
  description TEXT,
  media_url   TEXT,
  media_type  TEXT DEFAULT 'none',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- F. EVENTS
CREATE TABLE public.events (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id            UUID NOT NULL REFERENCES public.colleges(user_id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  description           TEXT,
  event_date            TIMESTAMPTZ NOT NULL,
  location              TEXT,
  poster_url            TEXT,
  registration_deadline TIMESTAMPTZ,
  max_participants      INT,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- G. EVENT REGISTRATIONS
CREATE TABLE public.event_registrations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  student_id    UUID NOT NULL REFERENCES public.students(user_id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (event_id, student_id)
);

-- H. SCHOLARSHIPS
CREATE TABLE public.scholarships (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id  UUID REFERENCES public.colleges(user_id) ON DELETE CASCADE,
  type        TEXT DEFAULT 'private',
  name        TEXT NOT NULL,
  description TEXT,
  amount      NUMERIC(12,2),
  eligibility TEXT,
  deadline    TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- I. INTERNSHIPS
CREATE TABLE public.internships (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name    TEXT NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  stipend         NUMERIC(12,2),
  duration        TEXT,
  location        TEXT,
  eligibility     TEXT,
  skills_required TEXT,
  deadline        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- J. APPLICATIONS
CREATE TABLE public.applications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL REFERENCES public.students(user_id) ON DELETE CASCADE,
  college_id   UUID NOT NULL REFERENCES public.colleges(user_id) ON DELETE CASCADE,
  course_id    UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  event_id     UUID REFERENCES public.events(id) ON DELETE SET NULL,
  internship_id UUID REFERENCES public.internships(id) ON DELETE SET NULL,
  type         TEXT DEFAULT 'admission',
  status       TEXT DEFAULT 'pending',
  message      TEXT,
  applied_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- K. REVIEWS
CREATE TABLE public.reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(user_id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES public.colleges(user_id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  rating     INT DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- L. NOTIFICATIONS
CREATE TABLE public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- M. QUIZ RESULTS
CREATE TABLE public.quiz_results (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID NOT NULL REFERENCES public.students(user_id) ON DELETE CASCADE,
  career_path      TEXT NOT NULL,
  personality      TEXT NOT NULL,
  aptitude_score   NUMERIC(5,2) NOT NULL,
  interest_mapping TEXT,
  skills_analysis  TEXT,
  recommendations  TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- N. PLACEMENTS
CREATE TABLE public.placements (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id        UUID NOT NULL REFERENCES public.colleges(user_id) ON DELETE CASCADE,
  year              INT NOT NULL,
  highest_package   NUMERIC(10,2),
  average_package   NUMERIC(10,2),
  placement_percent NUMERIC(5,2),
  top_recruiters    TEXT,
  description       TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- O. AI RECOMMENDATIONS
CREATE TABLE public.ai_recommendations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL REFERENCES public.students(user_id) ON DELETE CASCADE,
  colleges     TEXT,
  scholarships TEXT,
  careers      TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- P. SAVED ITEMS
CREATE TABLE public.saved_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(user_id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  item_id    UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, type, item_id)
);

-- Q. ACTIVITY LOGS
CREATE TABLE public.activity_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action     TEXT NOT NULL,
  details    TEXT,
  timestamp  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. PERFORMANCE INDEXES ──
CREATE INDEX IF NOT EXISTS idx_courses_college      ON public.courses(college_id);
CREATE INDEX IF NOT EXISTS idx_courses_cutoff       ON public.courses(cutoff);
CREATE INDEX IF NOT EXISTS idx_posts_college        ON public.posts(college_id);
CREATE INDEX IF NOT EXISTS idx_events_college       ON public.events(college_id);
CREATE INDEX IF NOT EXISTS idx_apps_student         ON public.applications(student_id);
CREATE INDEX IF NOT EXISTS idx_apps_college         ON public.applications(college_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user    ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_student  ON public.saved_items(student_id);

-- ── 4. AUTO-UPDATE UPDATED_AT TRIGGER ──
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_applications_modtime BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION update_modified_column();
