-- ─────────────────────────────────────────────────────────────
-- InfoHub Chat and Student Enrollment Migration (Combined)
-- Run this in your Supabase SQL Editor to apply DB changes.
-- ─────────────────────────────────────────────────────────────

-- ── 1. UPDATE STUDENTS TABLE ──
ALTER TABLE students ADD COLUMN IF NOT EXISTS is_college_student BOOLEAN DEFAULT FALSE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES colleges(user_id) ON DELETE SET NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS college_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS branch TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS batch TEXT;

-- ── 2. CREATE MESSAGES TABLE ──
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for speedy lookups of conversation threads
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- ── 3. ROW LEVEL SECURITY (RLS) FOR MESSAGES ──
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Select Policy: Users can view messages they sent or received
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Allow users to view own messages'
    ) THEN
        CREATE POLICY "Allow users to view own messages"
            ON messages FOR SELECT
            USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
    END IF;
END
$$;

-- Insert Policy: Users can only send messages as themselves
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Allow users to send messages'
    ) THEN
        CREATE POLICY "Allow users to send messages"
            ON messages FOR INSERT
            WITH CHECK (auth.uid() = sender_id);
    END IF;
END
$$;

-- ── 4. RLS SELECT POLICY FOR STUDENTS ──
-- Allows seeker students to view profiles of students who are registered as college students/alumni
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'students' AND policyname = 'Allow all users to view college student profiles'
    ) THEN
        CREATE POLICY "Allow all users to view college student profiles" 
            ON students FOR SELECT 
            USING (is_college_student = true OR auth.uid() = user_id);
    END IF;
END
$$;

-- ── 5. RPC: GET ACTIVE CHAT PARTNERS ──
CREATE OR REPLACE FUNCTION get_active_chat_partners(p_user_id UUID)
RETURNS TABLE (
    partner_id UUID,
    partner_name TEXT,
    partner_role TEXT,
    last_message TEXT,
    last_message_time TIMESTAMPTZ
) SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    WITH last_msgs AS (
        SELECT 
            CASE 
                WHEN sender_id = p_user_id THEN receiver_id 
                ELSE sender_id 
            END AS partner_uuid,
            content,
            created_at,
            ROW_NUMBER() OVER(PARTITION BY CASE WHEN sender_id = p_user_id THEN receiver_id ELSE sender_id END ORDER BY created_at DESC) as rn
        FROM messages
        WHERE sender_id = p_user_id OR receiver_id = p_user_id
    )
    SELECT 
        p.id AS partner_id,
        p.name AS partner_name,
        p.role AS partner_role,
        m.content AS last_message,
        m.created_at AS last_message_time
    FROM last_msgs m
    JOIN profiles p ON p.id = m.partner_uuid
    WHERE m.rn = 1
    ORDER BY m.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ── 6. RPC: REGISTER USER (Corrected variable qualifiers) ──
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
    -- Check email existence (Fully qualified table alias 'p' to prevent variable ambiguity)
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
            user_id, profile_photo, bio, interests, skills, career_goals, location_pref, budget_pref, course_pref,
            is_college_student, college_id, college_name, branch, batch
        ) VALUES (
            v_user_id,
            COALESCE(p_metadata->>'profile_photo', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
            COALESCE(p_metadata->>'bio', ''),
            COALESCE(p_metadata->>'interests', ''),
            COALESCE(p_metadata->>'skills', ''),
            COALESCE(p_metadata->>'career_goals', ''),
            COALESCE(p_metadata->>'location_pref', ''),
            (p_metadata->>'budget_pref')::NUMERIC,
            COALESCE(p_metadata->>'course_pref', ''),
            COALESCE((p_metadata->>'is_college_student')::BOOLEAN, FALSE),
            (p_metadata->>'college_id')::UUID,
            p_metadata->>'college_name',
            p_metadata->>'branch',
            p_metadata->>'batch'
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

-- ── 7. ENABLE REALTIME REPLICATION FOR MESSAGES TABLE ──
begin;
  -- If publication is present, modify it. Otherwise create it or let Supabase default work
  alter publication supabase_realtime add table messages;
commit;
