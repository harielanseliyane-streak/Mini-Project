import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, GraduationCap, LayoutDashboard, LogOut, Menu, X, HelpCircle, PhoneCall, Info } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  const profileRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'light') {
      document.body.classList.add('light');
      document.documentElement.classList.add('light');
    } else {
      document.body.classList.remove('light');
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', nextTheme);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardUrl = 
    user?.role === 'student' 
      ? '/student/dashboard' 
      : user?.role === 'college' 
      ? '/college/dashboard' 
      : '/admin/dashboard';

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/colleges', label: 'Colleges' },
    ...(user?.role === 'student' ? [{ to: '/quiz', label: '🎯 Career Quiz' }] : []),
    ...(isAuthenticated ? [] : [
      { to: '/login', label: 'Login' },
      { to: '/register', label: 'Register' },
    ]),
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-bgDark/90 border-b border-borderDark backdrop-blur-md shadow-premium body-light:bg-bgLight/90 body-light:border-borderLight' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-primary-glow group-hover:scale-105 transition-all duration-300">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl text-white body-light:text-textPrimaryLight">
              Info<span className="text-primary">Hub</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  location.pathname === link.to
                    ? 'text-white bg-white/10 body-light:text-primary body-light:bg-primary/10'
                    : 'text-textSecondaryDark hover:text-white hover:bg-white/5 body-light:text-textSecondaryLight body-light:hover:text-primary body-light:hover:bg-primary/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Controls & User drop down */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-borderDark hover:bg-white/5 text-textSecondaryDark hover:text-white transition-all duration-200 body-light:border-borderLight body-light:text-textSecondaryLight body-light:hover:bg-black/5 body-light:hover:text-textPrimaryLight"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(p => !p)}
                  className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-white/5 border border-borderDark hover:bg-white/10 transition-all duration-200 body-light:bg-black/5 body-light:border-borderLight"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-white shadow-primary-glow">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block text-xs font-bold text-white body-light:text-textPrimaryLight max-w-[100px] truncate">
                    {user?.name}
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 card-premium py-1 animate-slide-up border border-borderDark shadow-premium">
                    <div className="px-4 py-3 border-b border-borderDark">
                      <p className="text-xs font-bold text-white body-light:text-textPrimaryLight truncate">{user?.name}</p>
                      <p className="text-[10px] font-bold text-textSecondaryDark uppercase mt-0.5 tracking-wider">{user?.role} Profile</p>
                    </div>
                    <Link
                      to={dashboardUrl}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-textSecondaryDark hover:text-white hover:bg-white/10 body-light:hover:text-primary body-light:hover:bg-primary/5 transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-danger hover:bg-danger/10 transition-all"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-xs py-2.5 px-4">Login</Link>
                <Link to="/register" className="btn-primary text-xs py-2.5 px-4">Get Started</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(m => !m)}
              className="md:hidden p-2 rounded-xl border border-borderDark hover:bg-white/5 text-textSecondaryDark hover:text-white transition-all body-light:border-borderLight body-light:text-textSecondaryLight"
              aria-label="Toggle Navigation Menu"
            >
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {menuOpen && (
          <div className="md:hidden pb-4 animate-slide-up">
            <div className="card-premium p-2 mt-2 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-textSecondaryDark hover:text-white hover:bg-white/5 body-light:hover:text-primary body-light:hover:bg-primary/5 transition-all"
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <>
                  <Link
                    to={dashboardUrl}
                    className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-textSecondaryDark hover:text-white hover:bg-white/5 body-light:hover:text-primary body-light:hover:bg-primary/5 transition-all"
                  >
                    📊 Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-danger hover:bg-danger/10 transition-all"
                  >
                    🚪 Sign Out
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
