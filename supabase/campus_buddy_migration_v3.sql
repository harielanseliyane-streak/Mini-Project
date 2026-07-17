-- ═══════════════════════════════════════════════════════════════════════════
-- Campus Buddy Verification System — Migration V3
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Create campus_buddy_requests table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS campus_buddy_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    college_id UUID REFERENCES colleges(user_id) ON DELETE SET NULL,
    college_name TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    student_id_url TEXT,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for dashboard filtering
CREATE INDEX IF NOT EXISTS idx_campus_buddy_requests_college ON campus_buddy_requests(college_id, status);

-- ── 2. Enable RLS for campus_buddy_requests ──────────────────────────────────
ALTER TABLE campus_buddy_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert for registration requests"
    ON campus_buddy_requests FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow college admin to read requests for their college"
    ON campus_buddy_requests FOR SELECT
    USING (
        auth.uid() = college_id 
        OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    );

CREATE POLICY "Allow college admin to update request status"
    ON campus_buddy_requests FOR UPDATE
    USING (
        auth.uid() = college_id 
        OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    );

-- ── 3. Notification system updates ───────────────────────────────────────────
-- Ensure notifications can have target type or warning categories
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'info';
