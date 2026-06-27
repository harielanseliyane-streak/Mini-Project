import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { register as apiRegister } from '../api';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import BirdCanvas from '../components/BirdCanvas';

const Field = ({ label, value, onChange, type = 'text', placeholder, required }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input 
      type={type} 
      value={value} 
      onChange={onChange} 
      placeholder={placeholder} 
      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm shadow-sm" 
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
    <div 
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16 px-4 bg-white"
    >
      {/* Flying Birds Layer */}
      <BirdCanvas />

      {/* Floating Dust / Light Particles */}
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

      <div className="relative w-full max-w-lg animate-slide-up z-10 my-4">
        {/* Logo Header */}
        <div className="text-center mb-6 flex flex-col items-center">
          <Link to="/" className="inline-flex items-center gap-3 mb-3 group">
            <Logo showText={false} />
            <span className="font-heading font-extrabold text-3xl tracking-tight text-slate-800">
              <span className="text-[#009A8E]">Info</span>
              <span className="text-[#00BFA9] font-semibold">-Hub</span>
            </span>
          </Link>
          <h1 className="font-heading text-3xl font-bold text-slate-800 tracking-wide">Create Account</h1>
          <p className="text-slate-500 mt-1.5 text-sm">Join the InfoHub smart connectivity platform</p>
        </div>

        {/* Form Card with Glassmorphism */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/80 shadow-2xl shadow-slate-200/60">
          {/* Role Toggle */}
          <div className="flex p-1.5 bg-slate-100/80 rounded-2xl mb-6 border border-slate-200/80">
            {['student', 'college'].map(r => (
              <button key={r} onClick={() => setRole(r)}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold capitalize transition-all duration-300 ${
                  role === r 
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md shadow-primary/20 font-bold' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
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
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  type={showPw ? 'text' : 'password'} 
                  value={form.password} 
                  onChange={set('password')}
                  placeholder="Min 6 characters" 
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm pr-12 shadow-sm" 
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors text-sm">
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-sm text-center font-medium shadow-inner">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-base mt-3 flex items-center justify-center">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : `Create ${role === 'student' ? 'Student' : 'College'} Account`}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-secondary font-semibold transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

