import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, LogOut, Menu, X, HelpCircle, PhoneCall, Info } from 'lucide-react';
import Logo from './Logo';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
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
        ? 'bg-white/90 border-b border-slate-200 backdrop-blur-md shadow-sm' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Logo />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  location.pathname === link.to
                    ? 'text-primary bg-primary/10'
                    : 'text-slate-600 hover:text-primary hover:bg-primary/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Controls & User drop down */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(p => !p)}
                  className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-white shadow-primary-glow">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block text-xs font-bold text-slate-800 max-w-[100px] truncate">
                    {user?.name}
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 card-premium py-1 animate-slide-up border border-slate-200 shadow-premium-light">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-wider">{user?.role} Profile</p>
                    </div>
                    <Link
                      to={dashboardUrl}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-primary hover:bg-primary/5 transition-all"
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
              className="md:hidden p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-all"
              aria-label="Toggle Navigation Menu"
            >
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {menuOpen && (
          <div className="md:hidden pb-4 animate-slide-up">
            <div className="card-premium p-2 mt-2 space-y-1 border border-slate-200">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:text-primary hover:bg-primary/5 transition-all"
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <>
                  <Link
                    to={dashboardUrl}
                    className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:text-primary hover:bg-primary/5 transition-all"
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
