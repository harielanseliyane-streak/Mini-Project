-- ═══════════════════════════════════════════════════════════════════════════
-- Campus Buddy Verification System — Migration V2
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Extend campus_buddies with routing + rejection columns ────────────────
ALTER TABLE campus_buddies
    ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES colleges(user_id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Index for college dashboard queries
CREATE INDEX IF NOT EXISTS idx_campus_buddies_college_id ON campus_buddies(college_id);

-- ── 2. Notifications table ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info'      -- 'success' | 'error' | 'info' | 'warning'
        CHECK (type IN ('success','error','info','warning')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read  ON notifications(user_id, is_read);

-- ── 3. RLS for notifications ─────────────────────────────────────────────────
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can mark own notifications read"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- ── 4. RLS additions for campus_buddies (college can read their requests) ────
-- Drop old policies first to avoid conflicts
DROP POLICY IF EXISTS "Allow students to view own campus buddy application" ON campus_buddies;
DROP POLICY IF EXISTS "Allow students to register as campus buddy" ON campus_buddies;
DROP POLICY IF EXISTS "Allow admins to update campus buddy status" ON campus_buddies;
DROP POLICY IF EXISTS "Allow admins to delete campus buddy records" ON campus_buddies;

-- Re-create with college access
CREATE POLICY "campus_buddies_select"
    ON campus_buddies FOR SELECT
    USING (
        auth.uid() = user_id
        OR auth.uid() = college_id
        OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    );

CREATE POLICY "campus_buddies_insert"
    ON campus_buddies FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "campus_buddies_update"
    ON campus_buddies FOR UPDATE
    USING (
        auth.uid() = college_id
        OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    );

CREATE POLICY "campus_buddies_delete"
    ON campus_buddies FOR DELETE
    USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- ── 5. Supabase Storage bucket ───────────────────────────────────────────────
-- Create in Dashboard → Storage → New Bucket:
--   Name:           student-ids
--   Public:         true
--   Max file size:  5 MB
--   MIME types:     image/jpeg, image/png, image/webp, application/pdf
