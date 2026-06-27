import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { register as apiRegister } from '../api';
import { useAuth } from '../context/AuthContext';

const Field = ({ label, value, onChange, type = 'text', placeholder, required }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-wider text-teal-200/80 mb-2">
      {label}{required && <span className="text-red-400 ml-1">*</span>}
    </label>
    <input 
      type={type} 
      value={value} 
      onChange={onChange} 
      placeholder={placeholder} 
      className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-teal-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-[#00a896] focus:ring-2 focus:ring-[#00a896]/20 transition-all text-sm" 
    />
  </div>
);

const Register = () => {
  const [role,    setRole]    = useState('student');
  const [form,    setForm]    = useState({ name: '', email: '', password: '', phone: '', college_name: '', address: '', city: '', state: '', website: '' });
  const [showPw,  setShowPw]  = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => { if (params.get('role')) setRole(params.get('role')); }, [params]);
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin')        navigate('/admin/dashboard',   { replace: true });
      else if (user.role === 'college') navigate('/college/dashboard', { replace: true });
      else                              navigate('/student/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Email and password are required'); return; }
    if (form.password.length < 6)      { setError('Password must be at least 6 characters'); return; }
    if (role === 'student' && !form.name)         { setError('Name is required'); return; }
    if (role === 'college' && !form.college_name) { setError('College name is required'); return; }
    setLoading(true);
    try {
      await apiRegister({ ...form, role });
      // AuthContext will auto-detect the new session via onAuthStateChange
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-20 pt-24 bg-slate-900 overflow-hidden">
      {/* Full-bleed college background image with matching teal gradient overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105 transition-transform duration-1000"
        style={{ backgroundImage: "url('/college-bg-teal.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/90 to-teal-950/80 pointer-events-none" />

      {/* Decorative glowing background orbs in teal color palette */}
      <div className="fixed top-1/4 right-1/4 w-96 h-96 rounded-full bg-[#00a896]/20 blur-3xl pointer-events-none animate-pulse" />
      <div className="fixed bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-[#028090]/25 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg animate-slide-up z-10 my-4">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00a896] to-[#028090] flex items-center justify-center shadow-lg shadow-[#00a896]/30 group-hover:scale-105 transition-transform">
              <span className="text-2xl">🎓</span>
            </div>
            <span className="font-heading font-bold text-3xl text-white tracking-tight">InfoHub</span>
          </Link>
          <h1 className="font-heading text-3xl font-bold text-white tracking-wide">Create Account</h1>
          <p className="text-teal-100/70 mt-2 text-sm">Join the InfoHub smart connectivity platform</p>
        </div>

        {/* Form Card with Glassmorphism */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-teal-500/20 shadow-2xl shadow-black/60">
          {/* Role Toggle */}
          <div className="flex p-1.5 bg-slate-950/60 rounded-2xl mb-6 border border-teal-500/20">
            {['student', 'college'].map(r => (
              <button key={r} onClick={() => setRole(r)}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold capitalize transition-all duration-300 ${
                  role === r 
                    ? 'bg-gradient-to-r from-[#00a896] to-[#028090] text-white shadow-md shadow-[#00a896]/30 font-bold' 
                    : 'text-teal-200/60 hover:text-white hover:bg-white/5'
                }`}>
                {r === 'student' ? '🎓 Student' : '🏛️ College'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {role === 'student' ? (
              <>
                <Field label="Full Name"    value={form.name}   onChange={set('name')}   placeholder="John Doe"          required />
                <Field label="Email"        value={form.email}  onChange={set('email')}  type="email" placeholder="you@example.com" required />
                <Field label="Phone Number" value={form.phone}  onChange={set('phone')}  type="tel" placeholder="+91 9876543210" />
              </>
            ) : (
              <>
                <Field label="College Name" value={form.college_name} onChange={set('college_name')} placeholder="ABC Engineering College" required />
                <Field label="Email"        value={form.email}        onChange={set('email')}        type="email" placeholder="admin@college.edu" required />
                <Field label="Phone"        value={form.phone}        onChange={set('phone')}        type="tel" placeholder="+91 9876543210" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="City"  value={form.city}  onChange={set('city')}  placeholder="Chennai" />
                  <Field label="State" value={form.state} onChange={set('state')} placeholder="Tamil Nadu" />
                </div>
                <Field label="Address"     value={form.address} onChange={set('address')} placeholder="123 College Road" />
                <Field label="Website URL" value={form.website} onChange={set('website')} type="url" placeholder="https://college.edu" />
              </>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-200/80 mb-2">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input 
                  type={showPw ? 'text' : 'password'} 
                  value={form.password} 
                  onChange={set('password')}
                  placeholder="Min 6 characters" 
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-teal-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-[#00a896] focus:ring-2 focus:ring-[#00a896]/20 transition-all text-sm pr-12" 
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-200/60 hover:text-white transition-colors text-sm">
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-sm text-center font-medium shadow-inner">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#00a896] to-[#028090] hover:from-[#028090] hover:to-[#00a896] shadow-lg shadow-[#00a896]/30 hover:shadow-xl hover:shadow-[#00a896]/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-base mt-3">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : `Create ${role === 'student' ? 'Student' : 'College'} Account`}
            </button>
          </form>

          <p className="text-center text-teal-100/60 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#00a896] hover:text-white font-semibold transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
