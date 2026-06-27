import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPublicColleges, saveItem, getSavedItems, removeSavedItem } from '../api';
import CollegeCard from '../components/CollegeCard';
import { useAuth } from '../context/AuthContext';
import { Bell, BellOff, X, Megaphone, Check, CalendarClock } from 'lucide-react';
import BirdCanvas from '../components/BirdCanvas';
import collegeBgTeal from '../college-bg-teal.png';

const StatCard = ({ value, label, icon }) => (
  <div className="glass rounded-2xl p-6 text-center">
    <div className="text-3xl mb-2">{icon}</div>
    <div className="font-heading text-3xl font-bold gradient-text">{value}</div>
    <div className="text-slate-500 text-sm mt-1">{label}</div>
  </div>
);

const bulletinsList = [
  {
    id: 'placement_2026',
    type: '💼 Placement Drive',
    title: 'Mega Campus Drive 2026',
    desc: 'Amazon, Zoho, and 15+ top tech MNCs are recruiting final-year students. Cutoff >= 185 eligible.',
    date: 'Aug 15, 2026'
  },
  {
    id: 'hackathon_2026',
    type: '🚀 Hackathon',
    title: 'TCS Smart Hackathon 2026',
    desc: 'National level hackathon on Web & AI student solutions. Register to represent your college.',
    date: 'July 10, 2026'
  },
  {
    id: 'contest_2026',
    type: '🏆 Coding Contest',
    title: 'Tamil Nadu Code Battle',
    desc: 'State-wide speed coding battle hosted by PSG Tech. Grand cash prizes up to ₹1,00,000.',
    date: 'Sept 05, 2026'
  }
];

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  
  // Favorites state
  const [favoritesMap, setFavoritesMap] = useState({}); // collegeId -> savedItemId

  // Bulletins state
  const [showBulletin, setShowBulletin] = useState(false);
  // reminders: { [id]: { date: ISO string } } or {} if not set
  const [reminders, setReminders] = useState({});
  const [toastMsg, setToastMsg] = useState('');
  // Reminder date-picker modal
  const [reminderModal, setReminderModal] = useState(null); // { id, title } | null
  const [pickedDate, setPickedDate] = useState('');

  // Real-time analog clock state
  const [clockTime, setClockTime] = useState(new Date());

  useEffect(() => {
    getPublicColleges()
      .then(res => setColleges(res.data.colleges || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    // Load saved favorites if student
    if (isAuthenticated && user?.role === 'student') {
      getSavedItems()
        .then(res => {
          const items = res.data.saved_items || [];
          const mapping = {};
          items.forEach(item => {
            if (item.type === 'college') {
              mapping[item.item_id] = item.id;
            }
          });
          setFavoritesMap(mapping);
        })
        .catch(() => {});
    }

    // Load reminders from localStorage
    const savedReminders = localStorage.getItem('bulletin_reminders');
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders));
    }

    // Slide in bulletin popup after 1.5 seconds
    const timer = setTimeout(() => {
      setShowBulletin(true);
    }, 1500);

    // Real-time clock tick — every second
    const clockTick = setInterval(() => setClockTime(new Date()), 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(clockTick);
    };
  }, [isAuthenticated, user]);

  // Clock hand angle calculations
  const clockSec  = clockTime.getSeconds();
  const clockMin  = clockTime.getMinutes();
  const clockHr   = clockTime.getHours() % 12;
  const secDeg    = clockSec  * 6;                          // 360/60
  const minDeg    = clockMin  * 6  + clockSec  * 0.1;       // smooth
  const hourDeg   = clockHr   * 30 + clockMin  * 0.5;       // smooth

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Open date-picker modal to choose reminder date
  const handleToggleReminder = (id, title, type) => {
    if (reminders[id]) {
      // Already set — cancel it
      setReminders(prev => {
        const updated = { ...prev };
        delete updated[id];
        localStorage.setItem('bulletin_reminders', JSON.stringify(updated));
        window.dispatchEvent(new Event('bulletin_reminders_changed'));
        return updated;
      });
      showToast(`🔕 Reminder cancelled for: ${title}`);
    } else {
      // Open date picker
      setPickedDate('');
      setReminderModal({ id, title, type });
    }
  };

  const handleConfirmReminder = () => {
    if (!pickedDate) { showToast('⚠️ Please pick a date & time first.'); return; }
    const { id, title, type } = reminderModal;
    setReminders(prev => {
      const updated = { ...prev, [id]: { date: pickedDate, title, type } };
      localStorage.setItem('bulletin_reminders', JSON.stringify(updated));
      window.dispatchEvent(new Event('bulletin_reminders_changed'));
      return updated;
    });
    showToast(`🔔 Reminder set for: ${new Date(pickedDate).toLocaleString('en-IN')}`);
    setReminderModal(null);
  };

  const handleToggleFavorite = async (collegeId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'student') return;

    const savedId = favoritesMap[collegeId];
    if (savedId) {
      try {
        await removeSavedItem(savedId);
        setFavoritesMap(prev => {
          const updated = { ...prev };
          delete updated[collegeId];
          return updated;
        });
        showToast("Removed from favorites");
      } catch (e) {
        showToast("Failed to remove favorite");
      }
    } else {
      try {
        const res = await saveItem('college', collegeId);
        const newItem = res.data.saved;
        setFavoritesMap(prev => ({
          ...prev,
          [collegeId]: newItem.id
        }));
        showToast("Added to favorites! ❤️");
      } catch (e) {
        showToast("Failed to add to favorites");
      }
    }
  };

  const filtered = colleges.filter(c =>
    c.college_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.city?.toLowerCase().includes(search.toLowerCase())
  );



  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero Section ──────────────────────────────────── */}
      <section 
        className="relative min-h-screen flex items-center overflow-hidden pt-16 bg-white"
      >
        {/* ── Subtle teal glow layer ── */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: 'radial-gradient(ellipse 60% 70% at 80% 60%, rgba(0,179,165,0.06) 0%, transparent 70%)',
          }}
        />

        {/* ── Flying Birds Layer ── */}
        <BirdCanvas />

        {/* ── Floating Dust / Light Particles ── */}
        <div aria-hidden="true" className="hero-particles">
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className="hero-particle" style={{
              left: `${5 + (i * 5.3) % 95}%`,
              animationDelay: `${(i * 0.43) % 6}s`,
              animationDuration: `${7 + (i * 1.1) % 8}s`,
              width:  `${3 + (i * 0.7) % 5}px`,
              height: `${3 + (i * 0.7) % 5}px`,
              opacity: 0.12 + (i % 5) * 0.06,
            }} />
          ))}
        </div>

        {/* ── Hero Content (2-column grid) ── */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 grid lg:grid-cols-2 gap-8 items-center py-16">

          {/* Left column – text & CTAs */}
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-8 animate-fade-in">
              <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
              AI-Powered Discovery Engine
            </div>

            {/* Headline */}
            <h1 className="font-heading text-4xl md:text-6xl font-bold text-slate-800 leading-tight mb-6 animate-slide-up">
              Find the Best College for Your
              <span className="block gradient-text mt-1">Bright Future</span>
            </h1>
            <p className="text-slate-500 text-base md:text-lg max-w-xl mb-10 leading-relaxed animate-fade-in">
              InfoHub connects school students with the right higher education institutions using smart score and cutoff-based matching.
            </p>

            {/* Search Bar */}
            <div className="flex gap-3 max-w-lg mb-12 animate-slide-up">
              <div className="relative flex-1">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input 
                  value={search} 
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search colleges by name or city..."
                  className="input pl-12 shadow-sm" 
                />
              </div>
              <Link to="/colleges" className="btn-primary whitespace-nowrap px-6 py-3.5 shadow-md">
                Explore
              </Link>
            </div>

            {/* CTAs */}
            {!isAuthenticated && (
              <div className="flex flex-wrap gap-4 animate-fade-in">
                <Link to="/register" className="btn-primary px-8 py-3.5 text-base shadow-lg shadow-primary/20">
                  🎓 Student Sign Up
                </Link>
                <Link to="/register?role=college" className="btn-secondary px-8 py-3.5 text-base">
                  🏛️ Register College
                </Link>
              </div>
            )}
            {isAuthenticated && (
              <Link to={user?.role === 'student' ? '/student/dashboard' : '/college/dashboard'}
                className="btn-primary px-8 py-3.5 text-base inline-block shadow-lg shadow-primary/20">
                Go to Dashboard →
              </Link>
            )}
          </div>

          {/* Right column – College illustration */}
          <div className="hidden lg:flex items-center justify-center relative animate-fade-in">
            {/* Glow circle behind image */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 85% 85% at 50% 50%, rgba(0,179,165,0.10) 0%, transparent 75%)',
              }}
            />
            <img
              src={collegeBgTeal}
              alt="College building illustration"
              className="relative w-full object-contain select-none pointer-events-none"
              style={{
                maxHeight: '600px',
                animation: 'float 7s ease-in-out infinite',
                animationDelay: '0.3s',
                filter: 'drop-shadow(0 16px 48px rgba(0,154,142,0.18))',
              }}
              draggable={false}
            />
          </div>

        </div>
      </section>

      {/* ── Stats Section ─────────────────────────────────── */}
      <section className="py-16 px-4 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard value="50+"  label="Partner Colleges"    icon="🏛️" />
          <StatCard value="500+" label="Courses Listed"      icon="📚" />
          <StatCard value="10K+" label="Students Helped"     icon="🎓" />
          <StatCard value="95%"  label="Placement Success"   icon="💼" />
        </div>
      </section>

      {/* ── Featured Colleges ─────────────────────────────── */}
      <section className="py-20 px-6">
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
                <CollegeCard 
                  key={college.id} 
                  college={college} 
                  isFavorited={!!favoritesMap[college.id]} 
                  onToggleFavorite={() => handleToggleFavorite(college.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <span className="text-5xl block mb-4">🔍</span>
              No colleges found matching "{search}"
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/colleges" className="btn-secondary px-8 py-3 shadow-sm">
              View All Colleges →
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="py-20 px-6 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
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
              <div key={item.step} className="card-premium p-8 text-center group hover:-translate-y-1 transition-all">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-5 group-hover:border-primary/40 transition-all text-3xl">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-secondary mb-2 font-mono">{item.step}</div>
                <h3 className="font-heading font-bold text-slate-800 text-lg mb-3">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="card-premium p-12 text-center relative overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 border border-slate-200 shadow-lg">
            <div className="relative z-10">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                Ready to find your <span className="gradient-text">dream college</span>?
              </h2>
              <p className="text-slate-500 mb-8 max-w-lg mx-auto">Join thousands of students who found their perfect academic match on InfoHub.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/register" className="btn-primary px-8 py-3.5 shadow-md">Get Started Free</Link>
                <Link to="/colleges" className="btn-secondary px-8 py-3.5">Browse Colleges</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 py-10 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎓</span>
            <span className="font-heading font-bold text-slate-800">InfoHub</span>
          </div>
          <p className="text-slate-400 text-sm">© 2026 InfoHub Platform. Built for Tamil Nadu students.</p>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link to="/about"   className="hover:text-primary transition-colors font-medium">About</Link>
            <Link to="/contact" className="hover:text-primary transition-colors font-medium">Contact</Link>
            <Link to="/help"    className="hover:text-primary transition-colors font-medium">Help</Link>
          </div>
        </div>
      </footer>

      {/* Bulletins Popup Drawer */}
      {showBulletin && (
        <div className="fixed bottom-6 left-6 z-50 w-full max-w-sm md:max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 animate-slide-up flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-primary" />
              <h3 className="font-heading font-bold text-slate-800 text-sm md:text-base">📢 InfoHub Live Bulletins</h3>
            </div>
            <button onClick={() => setShowBulletin(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-premium pr-1">
            {bulletinsList.map(bulletin => (
              <div key={bulletin.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-primary">{bulletin.type}</span>
                  <span className="text-[10px] font-semibold text-slate-400">{bulletin.date}</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm leading-snug">{bulletin.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{bulletin.desc}</p>
                <button
                  onClick={() => handleToggleReminder(bulletin.id, bulletin.title, bulletin.type)}
                  className={`mt-2 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                    reminders[bulletin.id]
                      ? 'bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20 w-full'
                      : 'bg-primary text-white hover:bg-primary/90 shadow-sm w-full'
                  }`}
                >
                  {reminders[bulletin.id] ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Reminder: {new Date(reminders[bulletin.id].date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}</span>
                    </>
                  ) : (
                    <>
                      <CalendarClock className="w-3.5 h-3.5" /> Set Reminder Date
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* ── Bulletins Trigger button (re-opens after closing) ── */}
      {!showBulletin && (
        <button
          onClick={() => setShowBulletin(true)}
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          <Megaphone className="w-5 h-5 animate-bounce" />
          <span className="text-sm">Live Bulletins ({bulletinsList.length})</span>
        </button>
      )}

      {/* ── Reminder Date-Picker Modal ── */}
      {reminderModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-bold text-slate-800 text-base">Set Reminder</h3>
              </div>
              <button onClick={() => setReminderModal(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-1 font-semibold">Event</p>
            <p className="text-sm font-bold text-slate-800 mb-4 leading-snug">{reminderModal.title}</p>

            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Choose your reminder date &amp; time</label>
            <input
              type="datetime-local"
              value={pickedDate}
              min={new Date().toISOString().slice(0, 16)}
              onChange={e => setPickedDate(e.target.value)}
              className="input mb-4 text-sm"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setReminderModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReminder}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
              >
                <Bell className="w-3.5 h-3.5 inline mr-1" /> Confirm Reminder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast alert popup */}

      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white font-medium px-5 py-3 rounded-xl shadow-premium border border-slate-800 text-sm flex items-center gap-2 animate-fade-in">
          <span>🔔</span> {toastMsg}
        </div>
      )}
    </div>
  );
};

export default Home;
