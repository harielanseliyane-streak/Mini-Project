import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { register as apiRegister } from '../api';
import { useAuth } from '../context/AuthContext';

const Field = ({ label, value, onChange, type = 'text', placeholder, required }) => (
  <div>
    <label className="label">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="input" />
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
    <div className="min-h-screen flex items-center justify-center px-4 py-20 pt-24">
      <div className="fixed top-1/4 right-1/4 w-64 h-64 rounded-full bg-purple/10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-xl">🎓</span>
            </div>
            <span className="font-heading font-bold text-2xl text-slate-800">InfoHub</span>
          </Link>
          <h1 className="font-heading text-3xl font-bold text-slate-800">Create Account</h1>
          <p className="text-slate-500 mt-2">Join the InfoHub community today</p>
        </div>

        <div className="glass rounded-2xl p-8 border border-slate-200/80">
          {/* Role Toggle */}
          <div className="flex p-1 bg-black/5 rounded-xl mb-6 border border-black/5">
            {['student', 'college'].map(r => (
              <button key={r} onClick={() => setRole(r)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${
                  role === r ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg' : 'text-slate-500 hover:text-primary'
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
              <label className="label">Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  placeholder="Min 6 characters" className="input pr-12" />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary text-sm">
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-2">
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
            <Link to="/login" className="text-primary hover:text-secondary font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
