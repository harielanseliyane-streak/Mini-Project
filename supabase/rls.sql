-- ─────────────────────────────────────────────────────────────
-- Row Level Security (RLS) Policies
-- ─────────────────────────────────────────────────────────────

-- ── 1. PROFILES ──────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on college and admin profiles" 
    ON profiles FOR SELECT 
    USING (role = 'college' OR role = 'admin' OR auth.uid() = id);

CREATE POLICY "Allow users to update own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Allow public insert (registration)" 
    ON profiles FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow users to delete own profile" 
    ON profiles FOR DELETE 
    USING (auth.uid() = id);

-- ── 2. STUDENTS ──────────────────────────────────────────────
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow student, colleges, or admin to view profiles" 
    ON students FOR SELECT 
    USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('college', 'admin')));

CREATE POLICY "Allow students to update own profile" 
    ON students FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Allow public insert for student profiles" 
    ON students FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow students to delete own profile" 
    ON students FOR DELETE 
    USING (auth.uid() = user_id);

-- ── 3. COLLEGES ──────────────────────────────────────────────
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to college details" 
    ON colleges FOR SELECT 
    USING (true);

CREATE POLICY "Allow colleges to update own details" 
    ON colleges FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Allow public insert for college details" 
    ON colleges FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow colleges to delete own details" 
    ON colleges FOR DELETE 
    USING (auth.uid() = user_id);

-- ── 4. COURSES ───────────────────────────────────────────────
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to courses" 
    ON courses FOR SELECT 
    USING (true);

CREATE POLICY "Allow college owner or admin to manage courses" 
    ON courses FOR ALL 
    USING (auth.uid() = college_id OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- ── 5. PLACEMENTS ────────────────────────────────────────────
ALTER TABLE placements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to placements" 
    ON placements FOR SELECT 
    USING (true);

CREATE POLICY "Allow college owner or admin to manage placements" 
    ON placements FOR ALL 
    USING (auth.uid() = college_id OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- ── 6. EVENTS ────────────────────────────────────────────────
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to events" 
    ON events FOR SELECT 
    USING (true);

CREATE POLICY "Allow college owner or admin to manage events" 
    ON events FOR ALL 
    USING (auth.uid() = college_id OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- ── 7. SCHOLARSHIPS ──────────────────────────────────────────
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to scholarships" 
    ON scholarships FOR SELECT 
    USING (true);

CREATE POLICY "Allow college owner or admin to manage scholarships" 
    ON scholarships FOR ALL 
    USING (
        auth.uid() = college_id 
        OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin') 
        OR (college_id IS NULL AND auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'))
    );

-- ── 8. INTERNSHIPS ───────────────────────────────────────────
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to internships" 
    ON internships FOR SELECT 
    USING (true);

CREATE POLICY "Allow admin to manage internships" 
    ON internships FOR ALL 
    USING (auth.uid() = '00000000-0000-0000-0000-000000000999' OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- ── 9. POSTS ─────────────────────────────────────────────────
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to posts" 
    ON posts FOR SELECT 
    USING (true);

CREATE POLICY "Allow college owner or admin to manage posts" 
    ON posts FOR ALL 
    USING (auth.uid() = college_id OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- ── 10. REVIEWS ──────────────────────────────────────────────
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to reviews" 
    ON reviews FOR SELECT 
    USING (true);

CREATE POLICY "Allow students to write reviews" 
    ON reviews FOR INSERT 
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Allow student authors or admins to delete reviews" 
    ON reviews FOR DELETE 
    USING (auth.uid() = student_id OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- ── 11. NOTIFICATIONS ────────────────────────────────────────
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read own notifications" 
    ON notifications FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Allow users to update own notifications" 
    ON notifications FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Allow inserting notifications" 
    ON notifications FOR INSERT 
    WITH CHECK (true);

-- ── 12. APPLICATIONS ─────────────────────────────────────────
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow applicant, college, or admin to view applications" 
    ON applications FOR SELECT 
    USING (auth.uid() = student_id OR auth.uid() = college_id OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Allow students to apply" 
    ON applications FOR INSERT 
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Allow colleges or admins to update applications" 
    ON applications FOR UPDATE 
    USING (auth.uid() = college_id OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- ── 13. SAVED ITEMS ──────────────────────────────────────────
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow students to manage saved items" 
    ON saved_items FOR ALL 
    USING (auth.uid() = student_id);

-- ── 14. QUIZ RESULTS ─────────────────────────────────────────
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow students to manage quiz results" 
    ON quiz_results FOR ALL 
    USING (auth.uid() = student_id);

ALTER TABLE auth_settings ENABLE ROW LEVEL SECURITY;
-- No policies defined, blocking any access via standard client REST API.

-- ── 16. CAMPUS BUDDIES ───────────────────────────────────────
ALTER TABLE campus_buddies ENABLE ROW LEVEL SECURITY;

-- Students can view their own application
CREATE POLICY "Allow students to view own campus buddy application"
    ON campus_buddies FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Students can insert their own application
CREATE POLICY "Allow students to register as campus buddy"
    ON campus_buddies FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins can update verification status
CREATE POLICY "Allow admins to update campus buddy status"
    ON campus_buddies FOR UPDATE
    USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Admins can delete
CREATE POLICY "Allow admins to delete campus buddy records"
    ON campus_buddies FOR DELETE
    USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

