import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { login as apiLogin } from '../api';
import { useAuth } from '../context/AuthContext';

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
    if (isAuthenticated) navigate(user?.role === 'student' ? '/student/dashboard' : '/college/dashboard', { replace: true });
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const { data } = await apiLogin({ email, password, role });
      login(data.user, data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
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
      <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#00a896]/20 blur-3xl pointer-events-none animate-pulse" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#028090]/25 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md animate-slide-up z-10">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00a896] to-[#028090] flex items-center justify-center shadow-lg shadow-[#00a896]/30 group-hover:scale-105 transition-transform">
              <span className="text-2xl">🎓</span>
            </div>
            <span className="font-heading font-bold text-3xl text-white tracking-tight">InfoHub</span>
          </Link>
          <h1 className="font-heading text-3xl font-bold text-white tracking-wide">Welcome back</h1>
          <p className="text-teal-100/70 mt-2 text-sm">Sign in to access your dashboard and explore colleges</p>
        </div>

        {/* Form Card with Premium Glassmorphism */}
        <div className="bg-slate-900/75 backdrop-blur-xl rounded-3xl p-8 border border-teal-500/20 shadow-2xl shadow-black/60">
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

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-200/80 mb-2">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" className="w-full px-4 py-3.5 rounded-xl bg-slate-950/80 border border-teal-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-[#00a896] focus:ring-2 focus:ring-[#00a896]/20 transition-all text-sm" autoComplete="email" />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-200/80 mb-2">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password" className="w-full px-4 py-3.5 rounded-xl bg-slate-950/80 border border-teal-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-[#00a896] focus:ring-2 focus:ring-[#00a896]/20 transition-all text-sm pr-12" autoComplete="current-password" />
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

            {/* Submit Button */}
            <button type="submit" disabled={loading} className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#00a896] to-[#028090] hover:from-[#028090] hover:to-[#00a896] shadow-lg shadow-[#00a896]/30 hover:shadow-xl hover:shadow-[#00a896]/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-base mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-teal-100/60 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#00a896] hover:text-white font-semibold transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
