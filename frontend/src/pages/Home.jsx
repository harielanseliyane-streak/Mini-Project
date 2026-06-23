import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublicColleges } from '../api';
import CollegeCard from '../components/CollegeCard';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ value, label, icon }) => (
  <div className="glass rounded-2xl p-6 text-center">
    <div className="text-3xl mb-2">{icon}</div>
    <div className="font-heading text-3xl font-bold gradient-text">{value}</div>
    <div className="text-slate-400 text-sm mt-1">{label}</div>
  </div>
);

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [colleges, setColleges] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');

  useEffect(() => {
    getPublicColleges()
      .then(res => setColleges(res.data.colleges || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = colleges.filter(c =>
    c.college_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ──────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-bg pt-16">
        {/* Decorative orbs */}
        <div className="absolute top-32 left-16 w-72 h-72 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute bottom-24 right-16 w-96 h-96 rounded-full bg-purple-600/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-900/20 blur-3xl" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-medium mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            AI-Powered College Recommendations
          </div>

          {/* Headline */}
          <h1 className="font-heading text-5xl md:text-7xl font-bold text-white body-light:text-textPrimaryLight leading-tight mb-6 animate-slide-up">
            Find Your Perfect
            <span className="block gradient-text">College Match</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in">
            InfoHub connects 12th-grade students with the right colleges using AI-powered matching based on your HSC marks and cutoff scores.
          </p>

          {/* Search Bar */}
          <div className="flex gap-3 max-w-xl mx-auto mb-12 animate-slide-up">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search colleges by name or city..."
                className="input pl-12" />
            </div>
            <Link to="/colleges" className="btn-primary whitespace-nowrap px-6 py-3.5">
              Explore
            </Link>
          </div>

          {/* CTAs */}
          {!isAuthenticated && (
            <div className="flex flex-wrap gap-4 justify-center animate-fade-in">
              <Link to="/register" className="btn-primary px-8 py-3.5 text-base">
                🎓 Student Sign Up
              </Link>
              <Link to="/register?role=college" className="btn-secondary px-8 py-3.5 text-base">
                🏛️ Register College
              </Link>
            </div>
          )}
          {isAuthenticated && (
            <Link to={user?.role === 'student' ? '/student/dashboard' : '/college/dashboard'}
              className="btn-primary px-8 py-3.5 text-base inline-block">
              Go to Dashboard →
            </Link>
          )}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </section>

      {/* ── Stats Section ─────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard value="50+"  label="Partner Colleges"    icon="🏛️" />
          <StatCard value="500+" label="Courses Listed"      icon="📚" />
          <StatCard value="10K+" label="Students Helped"     icon="🎓" />
          <StatCard value="95%"  label="Placement Success"   icon="💼" />
        </div>
      </section>

      {/* ── Featured Colleges ─────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">Featured <span className="gradient-text">Colleges</span></h2>
            <p className="section-sub mx-auto">Discover top institutions matching your academic profile</p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass rounded-2xl h-64 shimmer" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.slice(0, 6).map(college => (
                <CollegeCard key={college.id} college={college} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500">
              <span className="text-5xl block mb-4">🔍</span>
              No colleges found matching "{search}"
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/colleges" className="btn-secondary px-8 py-3">
              View All Colleges →
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/20 to-transparent" />
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-14">
            <h2 className="section-title">How <span className="gradient-text">InfoHub Works</span></h2>
            <p className="section-sub mx-auto">Get matched with your dream college in 3 simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: '📝', title: 'Create Your Profile', desc: 'Register and enter your HSC marks and cutoff score to get personalized recommendations.' },
              { step: '02', icon: '🤖', title: 'AI Matching',         desc: 'Our AI analyzes your profile and matches you with eligible colleges and suitable courses.' },
              { step: '03', icon: '🚀', title: 'Apply & Connect',     desc: 'Apply directly to colleges, register for events, and track your application status.' },
            ].map(item => (
              <div key={item.step} className="glass rounded-2xl p-8 text-center group hover:border-indigo-500/30 transition-all">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 mb-5 group-hover:border-indigo-500/40 transition-all">
                  <span className="text-3xl">{item.icon}</span>
                </div>
                <div className="text-xs font-bold text-indigo-400 mb-2 font-mono">{item.step}</div>
                <h3 className="font-heading font-bold text-white body-light:text-textPrimaryLight text-lg mb-3">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="glass rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/10" />
            <div className="relative">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white body-light:text-textPrimaryLight mb-4">
                Ready to find your <span className="gradient-text">dream college</span>?
              </h2>
              <p className="text-slate-400 mb-8">Join thousands of students who found their perfect match on InfoHub.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/register" className="btn-primary px-8 py-3.5">Get Started Free</Link>
                <Link to="/colleges" className="btn-secondary px-8 py-3.5">Browse Colleges</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎓</span>
            <span className="font-heading font-bold text-white body-light:text-textPrimaryLight">InfoHub</span>
          </div>
          <p className="text-slate-500 text-sm">© 2025 InfoHub Platform. Built for Tamil Nadu students.</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link to="/about"   className="hover:text-white body-light:hover:text-textPrimaryLight transition-colors">About</Link>
            <Link to="/contact" className="hover:text-white body-light:hover:text-textPrimaryLight transition-colors">Contact</Link>
            <Link to="/help"    className="hover:text-white body-light:hover:text-textPrimaryLight transition-colors">Help</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
