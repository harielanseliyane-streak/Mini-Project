import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, LogOut, Menu, X, HelpCircle, PhoneCall, Info, User, Edit2, Loader2, Bell } from 'lucide-react';
import Logo from './Logo';
import { getStudentProfile, updateStudentProfile, getCollegeProfile, updateCollegeProfile, getNotifications, markNotificationAsRead } from '../api';
import InstallButton from './InstallButton';

const Navbar = () => {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // ── Notification states ──
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [hasTouched, setHasTouched] = useState(false);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);

  const profileRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const fetchDbNotifications = async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }
    try {
      const res = await getNotifications();
      if (res.data && res.data.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (e) {
      console.error("Failed to fetch notifications:", e);
    }
  };

  const loadLocalReminders = () => {
    try {
      const saved = localStorage.getItem('bulletin_reminders');
      if (saved) {
        const parsed = JSON.parse(saved);
        const arr = Object.keys(parsed).map(id => ({
          id,
          isReminder: true,
          title: parsed[id].title || 'Reminder',
          type: parsed[id].type || '📢 Reminder',
          date: parsed[id].date,
          createdAt: parsed[id].date
        }));
        setReminders(arr);
      } else {
        setReminders([]);
      }
    } catch (e) {
      console.error(e);
      setReminders([]);
    }
  };

  const handleCancelReminder = (id) => {
    try {
      const saved = localStorage.getItem('bulletin_reminders');
      if (saved) {
        const parsed = JSON.parse(saved);
        delete parsed[id];
        localStorage.setItem('bulletin_reminders', JSON.stringify(parsed));
        window.dispatchEvent(new Event('bulletin_reminders_changed'));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error("Failed to mark notification as read:", e);
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Listen for local storage reminder changes
  useEffect(() => {
    loadLocalReminders();
    const handler = () => {
      loadLocalReminders();
    };
    window.addEventListener('bulletin_reminders_changed', handler);
    return () => window.removeEventListener('bulletin_reminders_changed', handler);
  }, []);

  // Fetch db notifications on login change
  useEffect(() => {
    fetchDbNotifications();
  }, [isAuthenticated]);

  // Fetch fresh notifications when dropdown opens
  useEffect(() => {
    if (showNotifications) {
      fetchDbNotifications();
    }
  }, [showNotifications]);

  // Manage shake animation trigger
  const unreadDbCount = notifications.filter(n => !n.isRead).length;
  const totalUnreadCount = unreadDbCount + reminders.length;

  useEffect(() => {
    if (totalUnreadCount > lastNotificationCount) {
      setHasTouched(false); // shake again if new notifications arrive
    }
    setLastNotificationCount(totalUnreadCount);
  }, [totalUnreadCount]);

  // Close notifications on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
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



  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  const fetchProfile = async () => {
    setModalLoading(true);
    setModalError('');
    setModalSuccess('');
    try {
      if (user.role === 'student') {
        const { data } = await getStudentProfile();
        setProfileData(data.student);
        setEditForm(data.student);
      } else if (user.role === 'college') {
        const { data } = await getCollegeProfile();
        setProfileData(data.college);
        setEditForm(data.college);
      } else {
        setProfileData({ name: user.name, email: user.email, phone: user.phone });
        setEditForm({ name: user.name, email: user.email, phone: user.phone });
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to load profile details.');
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    if (showProfileModal && isAuthenticated && user) {
      fetchProfile();
      setIsEditing(false);
    }
  }, [showProfileModal]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');
    setModalSuccess('');
    try {
      if (user.role === 'student') {
        await updateStudentProfile({
          name: editForm.name,
          phone: editForm.phone,
          hsc_marks: editForm.hsc_marks,
          cutoff: editForm.cutoff,
          bio: editForm.bio
        });
        updateUser({ name: editForm.name, phone: editForm.phone });
      } else if (user.role === 'college') {
        await updateCollegeProfile({
          phone: editForm.phone,
          college_name: editForm.college_name,
          address: editForm.address,
          city: editForm.city,
          state: editForm.state,
          website: editForm.website,
          description: editForm.description,
          established: editForm.established,
          accreditation: editForm.accreditation
        });
        updateUser({ name: editForm.college_name, phone: editForm.phone });
      }
      setModalSuccess('Profile updated successfully!');
      setTimeout(() => {
        setIsEditing(false);
        fetchProfile();
      }, 800);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setModalLoading(false);
    }
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
    ...(isAuthenticated ? [] : [{ to: '/register', label: 'Register' }]),
  ];



  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white border-b border-slate-200 backdrop-blur-md shadow-sm">
      <div className="w-full px-6 md:px-10">
        <div className="flex items-center justify-between h-16">

          {/* ── TOP-LEFT: Logo ── */}
          <div className="flex items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <Logo />
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
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

            {/* Notification toggle button */}
            <div className="relative" ref={notificationsRef}>
              <button
                onMouseEnter={() => setHasTouched(true)}
                onClick={() => { setShowNotifications(v => !v); setHasTouched(true); }}
                className={`navbar-clock-btn ${totalUnreadCount > 0 && !hasTouched ? 'bell-shake' : ''}`}
                title={showNotifications ? 'Hide Notifications' : 'Show Notifications'}
                aria-label="Toggle notifications"
              >
                <Bell className="w-[18px] h-[18px]" />
                {totalUnreadCount > 0 && (
                  <span className="navbar-badge">{totalUnreadCount}</span>
                )}
              </button>

              {/* Swing-in notifications dropdown */}
              {showNotifications && (
                <div className="navbar-clock-popup" key={String(showNotifications)}>
                  <div className="navbar-notification-list scrollbar-premium">
                    {/* Combined list of DB notifications & reminders */}
                    {(() => {
                      const dbItems = notifications.map(n => ({
                        id: n.id,
                        isReminder: false,
                        title: n.title,
                        message: n.message,
                        isRead: n.isRead,
                        date: n.createdAt
                      }));
                      
                      const allItems = [...reminders, ...dbItems].sort((a, b) => new Date(b.date) - new Date(a.date));

                      if (allItems.length === 0) {
                        return (
                          <div className="navbar-notification-empty">
                            🔔 No notifications or reminders
                          </div>
                        );
                      }

                      return allItems.map((item, idx) => (
                        <div 
                          key={item.isReminder ? `rem-${item.id}-${idx}` : `db-${item.id}-${idx}`} 
                          className={`navbar-notification-item ${!item.isReminder && !item.isRead ? 'border-l-4 border-l-primary' : ''}`}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <span className="navbar-notification-title">
                              {item.isReminder ? `⏰ ${item.title}` : item.title}
                            </span>
                            {item.isReminder ? (
                              <span className="px-1.5 py-0.5 rounded bg-secondary/15 text-secondary text-[8px] font-extrabold uppercase">
                                Reminder
                              </span>
                            ) : !item.isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="navbar-notification-message text-xs">
                            {item.isReminder 
                              ? `Scheduled for: ${new Date(item.date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}`
                              : item.message
                            }
                          </p>
                          <div className="navbar-notification-meta">
                            <span className="navbar-notification-date">
                              {item.isReminder ? 'Set Locally' : new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </span>
                            {item.isReminder ? (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleCancelReminder(item.id); }}
                                className="navbar-notification-action"
                              >
                                Cancel
                              </button>
                            ) : !item.isRead && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleMarkAsRead(item.id); }}
                                className="navbar-notification-action"
                              >
                                Read
                              </button>
                            )}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden sm:block">
              <InstallButton />
            </div>
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
                      onClick={() => { setShowProfileModal(true); setProfileOpen(false); }}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-primary hover:bg-primary/5 transition-all"
                    >
                      <User className="w-4 h-4" /> My Profile
                    </button>
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
            <div className="md:hidden flex items-center gap-2">
              <div className="sm:hidden block">
                <InstallButton />
              </div>
              <button
                onClick={() => setMenuOpen(m => !m)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-all"
                aria-label="Toggle Navigation Menu"
              >
                {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
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
              {!isAuthenticated && (
                <>
                  <div className="border-t border-slate-100 my-1.5" />
                  <Link
                    to="/login"
                    className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:text-primary hover:bg-primary/5 transition-all"
                  >
                    🔐 Login
                  </Link>
                </>
              )}
              {isAuthenticated && (
                <>
                  <Link
                    to={dashboardUrl}
                    className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:text-primary hover:bg-primary/5 transition-all"
                  >
                    📊 Dashboard
                  </Link>
                  <button
                    onClick={() => { setShowProfileModal(true); setMenuOpen(false); }}
                    className="w-full text-left block px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:text-primary hover:bg-primary/5 transition-all"
                  >
                    👤 My Profile
                  </button>
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
      {/* ── Profile Modal ── */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative scrollbar-premium animate-slide-up text-left">
            {/* Close Button */}
            <button 
              onClick={() => setShowProfileModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-xl hover:bg-slate-50"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl shadow-lg shadow-primary/20">
                👤
              </div>
              <div>
                <h3 className="font-heading font-bold text-slate-800 text-lg md:text-xl">Personal Profile</h3>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{user?.role} details</p>
              </div>
            </div>

            {/* Error & Success Messages */}
            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-semibold text-center">
                {modalError}
              </div>
            )}
            {modalSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-success/10 border border-success/20 text-success text-xs font-semibold text-center">
                {modalSuccess}
              </div>
            )}

            {modalLoading && !profileData ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-xs text-slate-400 font-semibold">Loading profile details...</p>
              </div>
            ) : profileData ? (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                {isEditing ? (
                  // ── EDITING MODE ──
                  <div className="space-y-4">
                    {user.role === 'student' ? (
                      <>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="label">Full Name</label>
                            <input 
                              type="text" 
                              required 
                              value={editForm.name || ''} 
                              onChange={e => setEditForm({ ...editForm, name: e.target.value })} 
                              className="input"
                            />
                          </div>
                          <div>
                            <label className="label">Phone Number</label>
                            <input 
                              type="tel" 
                              value={editForm.phone || ''} 
                              onChange={e => setEditForm({ ...editForm, phone: e.target.value })} 
                              className="input"
                            />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="label">HSC Marks (%)</label>
                            <input 
                              type="number" 
                              step="0.01"
                              min="0"
                              max="100"
                              value={editForm.hsc_marks || ''} 
                              onChange={e => setEditForm({ ...editForm, hsc_marks: e.target.value })} 
                              className="input"
                            />
                          </div>
                          <div>
                            <label className="label">Cutoff Score (out of 200)</label>
                            <input 
                              type="number" 
                              step="0.01"
                              min="0"
                              max="200"
                              value={editForm.cutoff || ''} 
                              onChange={e => setEditForm({ ...editForm, cutoff: e.target.value })} 
                              className="input"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="label">Short Bio</label>
                          <textarea 
                            rows="3"
                            value={editForm.bio || ''} 
                            onChange={e => setEditForm({ ...editForm, bio: e.target.value })} 
                            className="input min-h-[80px]"
                            placeholder="Write a brief intro..."
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="label">College Name</label>
                            <input 
                              type="text" 
                              required 
                              value={editForm.college_name || ''} 
                              onChange={e => setEditForm({ ...editForm, college_name: e.target.value })} 
                              className="input"
                            />
                          </div>
                          <div>
                            <label className="label">Phone</label>
                            <input 
                              type="tel" 
                              value={editForm.phone || ''} 
                              onChange={e => setEditForm({ ...editForm, phone: e.target.value })} 
                              className="input"
                            />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <label className="label">Website URL</label>
                            <input 
                              type="url" 
                              value={editForm.website || ''} 
                              onChange={e => setEditForm({ ...editForm, website: e.target.value })} 
                              className="input"
                              placeholder="https://..."
                            />
                          </div>
                          <div>
                            <label className="label">Established Year</label>
                            <input 
                              type="number" 
                              value={editForm.established || ''} 
                              onChange={e => setEditForm({ ...editForm, established: e.target.value })} 
                              className="input"
                              placeholder="e.g. 1980"
                            />
                          </div>
                          <div>
                            <label className="label">Accreditation</label>
                            <input 
                              type="text" 
                              value={editForm.accreditation || ''} 
                              onChange={e => setEditForm({ ...editForm, accreditation: e.target.value })} 
                              className="input"
                              placeholder="e.g. NAAC A++"
                            />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="label">City</label>
                            <input 
                              type="text" 
                              value={editForm.city || ''} 
                              onChange={e => setEditForm({ ...editForm, city: e.target.value })} 
                              className="input"
                            />
                          </div>
                          <div>
                            <label className="label">State</label>
                            <input 
                              type="text" 
                              value={editForm.state || ''} 
                              onChange={e => setEditForm({ ...editForm, state: e.target.value })} 
                              className="input"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="label">Full Address</label>
                          <textarea 
                            rows="2"
                            value={editForm.address || ''} 
                            onChange={e => setEditForm({ ...editForm, address: e.target.value })} 
                            className="input min-h-[60px]"
                          />
                        </div>
                        <div>
                          <label className="label">Description</label>
                          <textarea 
                            rows="3"
                            value={editForm.description || ''} 
                            onChange={e => setEditForm({ ...editForm, description: e.target.value })} 
                            className="input min-h-[80px]"
                            placeholder="Introduce your institution..."
                          />
                        </div>
                      </>
                    )}

                    <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 mt-6">
                      <button 
                        type="button" 
                        onClick={() => setIsEditing(false)}
                        className="btn-ghost px-5 py-2.5 text-sm"
                        disabled={modalLoading}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2"
                        disabled={modalLoading}
                      >
                        {modalLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  // ── DISPLAY/VIEW MODE ──
                  <div className="space-y-6">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 md:p-6 space-y-4">
                      {user.role === 'student' ? (
                        <div className="grid md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Name</span>
                            <span className="font-semibold text-slate-800 text-base">{profileData.name}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Email Address</span>
                            <span className="font-semibold text-slate-800 text-base">{profileData.email}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Phone Number</span>
                            <span className="font-semibold text-slate-800 text-base">{profileData.phone || 'Not provided'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">HSC Marks / Cutoff Score</span>
                            <span className="font-semibold text-slate-800 text-base">
                              {profileData.hsc_marks ? `${profileData.hsc_marks}%` : 'N/A'} 
                              {profileData.cutoff ? ` / ${profileData.cutoff} (out of 200)` : ''}
                            </span>
                          </div>
                          <div className="md:col-span-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Bio</span>
                            <p className="text-slate-600 mt-1 leading-relaxed text-xs italic">{profileData.bio || 'No bio written yet.'}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">College Name</span>
                            <span className="font-semibold text-slate-800 text-base">{profileData.college_name}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Contact Email</span>
                            <span className="font-semibold text-slate-800 text-base">{profileData.email}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Phone</span>
                            <span className="font-semibold text-slate-800 text-base">{profileData.phone || 'Not provided'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Website</span>
                            {profileData.website ? (
                              <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline text-base block truncate">
                                {profileData.website}
                              </a>
                            ) : (
                              <span className="font-semibold text-slate-800 text-base">Not provided</span>
                            )}
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Established / Accreditation</span>
                            <span className="font-semibold text-slate-800 text-base">
                              {profileData.established || 'N/A'} {profileData.accreditation ? ` (${profileData.accreditation})` : ''}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">City & State</span>
                            <span className="font-semibold text-slate-800 text-base">
                              {profileData.city || 'N/A'}{profileData.state ? `, ${profileData.state}` : ''}
                            </span>
                          </div>
                          <div className="md:col-span-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Address</span>
                            <span className="text-slate-700 block text-xs mt-0.5">{profileData.address || 'Not provided'}</span>
                          </div>
                          <div className="md:col-span-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Institution Description</span>
                            <p className="text-slate-600 mt-1 leading-relaxed text-xs">{profileData.description || 'No description provided.'}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 mt-6">
                      <button 
                        type="button" 
                        onClick={() => setShowProfileModal(false)}
                        className="btn-ghost px-5 py-2.5 text-sm"
                      >
                        Close
                      </button>
                      {user.role !== 'admin' && (
                        <button 
                          type="button" 
                          onClick={() => { setEditForm({ ...profileData }); setIsEditing(true); }}
                          className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Profile
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </form>
            ) : null}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
