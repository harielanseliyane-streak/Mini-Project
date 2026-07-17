-- ─────────────────────────────────────────────────────────────────────────
-- Migration: Add Campus Buddy Feature
-- Run this in your Supabase SQL Editor or via CLI
-- ─────────────────────────────────────────────────────────────────────────

-- ── 1. Extend students table with campus buddy tracking columns ───────────
ALTER TABLE students
    ADD COLUMN IF NOT EXISTS is_college_student BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES colleges(user_id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS college_name TEXT,
    ADD COLUMN IF NOT EXISTS branch TEXT,
    ADD COLUMN IF NOT EXISTS batch TEXT;

-- ── 2. Create campus_buddies table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campus_buddies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    college_name TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    college_email TEXT NOT NULL,
    student_id_url TEXT,
    why_buddy TEXT,
    verification_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    admin_note TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- ── 3. Indexes ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_campus_buddies_user_id ON campus_buddies(user_id);
CREATE INDEX IF NOT EXISTS idx_campus_buddies_status  ON campus_buddies(verification_status);

-- ── 4. Enable RLS ──────────────────────────────────────────────────────────
ALTER TABLE campus_buddies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow students to view own campus buddy application"
    ON campus_buddies FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Allow students to register as campus buddy"
    ON campus_buddies FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow admins to update campus buddy status"
    ON campus_buddies FOR UPDATE
    USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Allow admins to delete campus buddy records"
    ON campus_buddies FOR DELETE
    USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- ── 5. Storage bucket ─────────────────────────────────────────────────────
-- Create a bucket named "student-ids" in Supabase Storage Dashboard:
--   Dashboard → Storage → New Bucket
--   Name: student-ids
--   Public: true
--   Max upload size: 5 MB
--   Allowed MIME types: image/jpeg, image/png, image/webp, application/pdf
