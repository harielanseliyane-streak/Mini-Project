-- ============================================================
-- InfoHub - Row Level Security (RLS) & Storage Config
-- Run this second in: Supabase → SQL Editor → New Query → Run
-- ============================================================

-- ── 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES ──
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colleges          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placements        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs     ENABLE ROW LEVEL SECURITY;

-- ── 2. CREATE SECURITY POLICIES ──

-- PROFILES
CREATE POLICY "Profiles readable by anyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- STUDENTS
CREATE POLICY "Students readable by anyone" ON public.students FOR SELECT USING (true);
CREATE POLICY "Students can update own details" ON public.students FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Students can insert own details" ON public.students FOR INSERT WITH CHECK (auth.uid() = user_id);

-- COLLEGES
CREATE POLICY "Colleges readable by anyone" ON public.colleges FOR SELECT USING (true);
CREATE POLICY "Colleges can update own details" ON public.colleges FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Colleges can insert own details" ON public.colleges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- COURSES
CREATE POLICY "Courses readable by anyone" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Colleges can manage courses" ON public.courses FOR ALL USING (auth.uid() = college_id);

-- POSTS
CREATE POLICY "Posts readable by anyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Colleges can manage posts" ON public.posts FOR ALL USING (auth.uid() = college_id);

-- EVENTS
CREATE POLICY "Events readable by anyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Colleges can manage events" ON public.events FOR ALL USING (auth.uid() = college_id);

-- EVENT REGISTRATIONS
CREATE POLICY "Registrations viewable by registered student" ON public.event_registrations FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can register for events" ON public.event_registrations FOR INSERT WITH CHECK (auth.uid() = student_id);

-- SCHOLARSHIPS
CREATE POLICY "Scholarships readable by anyone" ON public.scholarships FOR SELECT USING (true);
CREATE POLICY "Colleges can manage scholarships" ON public.scholarships FOR ALL USING (auth.uid() = college_id);

-- INTERNSHIPS
CREATE POLICY "Internships readable by anyone" ON public.internships FOR SELECT USING (true);
CREATE POLICY "Colleges can manage internships" ON public.internships FOR ALL USING (true);

-- APPLICATIONS
CREATE POLICY "Students can view own applications" ON public.applications FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Colleges can view applications to them" ON public.applications FOR SELECT USING (auth.uid() = college_id);
CREATE POLICY "Students can submit applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Colleges can update application status" ON public.applications FOR UPDATE USING (auth.uid() = college_id);

-- REVIEWS
CREATE POLICY "Reviews readable by anyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Students can post reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = student_id);

-- NOTIFICATIONS
CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow public notifications insert" ON public.notifications FOR INSERT WITH CHECK (true);

-- QUIZ RESULTS
CREATE POLICY "Students can read own quiz results" ON public.quiz_results FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can insert own quiz results" ON public.quiz_results FOR INSERT WITH CHECK (auth.uid() = student_id);

-- PLACEMENTS
CREATE POLICY "Placements readable by anyone" ON public.placements FOR SELECT USING (true);
CREATE POLICY "Colleges can manage placements" ON public.placements FOR ALL USING (auth.uid() = college_id);

-- SAVED ITEMS
CREATE POLICY "Students can view own saved items" ON public.saved_items FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can manage own saved items" ON public.saved_items FOR ALL USING (auth.uid() = student_id);

-- AI RECOMMENDATIONS
CREATE POLICY "Students can view own recommendations" ON public.ai_recommendations FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can save recommendations" ON public.ai_recommendations FOR INSERT WITH CHECK (auth.uid() = student_id);

-- ACTIVITY LOGS
CREATE POLICY "Users can view own logs" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logs" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── 3. SETUP STORAGE BUCKETS ──
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('college-assets', 'college-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS security policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "College assets are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'college-assets');
CREATE POLICY "Authenticated users can upload college assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'college-assets' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update own college assets" ON storage.objects FOR UPDATE USING (bucket_id = 'college-assets' AND auth.role() = 'authenticated');
