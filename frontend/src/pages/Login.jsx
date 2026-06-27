import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import BirdCanvas from '../components/BirdCanvas';

const Login = () => {
  const [role,     setRole]     = useState('student');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    if (params.get('role')) setRole(params.get('role'));
  }, [params]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin')   navigate('/admin/dashboard',   { replace: true });
      else if (user.role === 'college') navigate('/college/dashboard', { replace: true });
      else navigate('/student/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const { error: authErr } = await login(email, password);
      if (authErr) throw authErr;
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
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

      <div className="relative w-full max-w-md animate-slide-up z-10">
        {/* Logo Header */}
        <div className="text-center mb-6 flex flex-col items-center">
          <Link to="/" className="inline-flex items-center gap-3 mb-3 group">
            <Logo showText={false} />
            <span className="font-heading font-extrabold text-3xl tracking-tight text-slate-800">
              <span className="text-[#009A8E]">Info</span>
              <span className="text-[#009A8E] font-semibold">-Hub</span>
            </span>
          </Link>
          <h1 className="font-heading text-3xl font-bold text-slate-800 tracking-wide">Welcome back</h1>
          <p className="text-slate-500 mt-1.5 text-sm">Sign in to access your dashboard and explore colleges</p>
        </div>

        {/* Form Card with Premium Glassmorphism */}
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

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm shadow-sm" autoComplete="email" />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password" className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm pr-12 shadow-sm" autoComplete="current-password" />
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

            {/* Submit Button */}
            <button type="submit" disabled={loading} className="btn-primary w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-base mt-2 flex items-center justify-center">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:text-secondary font-semibold transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

