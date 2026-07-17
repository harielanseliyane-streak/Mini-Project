import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { getColleges } from '../api';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import CampusBuddyRequestForm from '../components/CampusBuddyRequestForm';

// ─── Reusable Field ───────────────────────────────────────────────────────────
const Field = ({ label, value, onChange, type = 'text', placeholder, required, icon }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
      {icon && <span className="text-slate-400">{icon}</span>}
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all text-sm shadow-sm"
    />
  </div>
);

// ─── Custom Dropdown (always opens downward) ──────────────────────────────────
const DEGREE_GROUPS = [
  { group: 'Undergraduate', items: ['B.Tech / BE','B.Sc','BCA','BBA','B.Com','BA','B.Arch','B.Pharm','MBBS','BDS','B.Ed','LLB'] },
  { group: 'Postgraduate',  items: ['M.Tech / ME','M.Sc','MCA','MBA','M.Com','MA','M.Pharm','MD / MS','LLM','M.Ed'] },
  { group: 'Doctoral',      items: ['Ph.D','M.Phil'] },
  { group: 'Diploma',       items: ['Diploma (Engineering)','Diploma (Other)','Polytechnic'] },
  { group: '',              items: ['Other'] },
];

const CustomDropdown = ({ value, onChange, placeholder = '-- Select --', label, required }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const allItems = DEGREE_GROUPS.flatMap(g => g.items);
  const displayValue = allItems.includes(value) ? value : '';

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full px-4 py-3 rounded-xl bg-white border text-sm shadow-sm text-left flex items-center justify-between transition-all ${
          open
            ? 'border-indigo-400 ring-2 ring-indigo-400/20'
            : 'border-slate-200 hover:border-indigo-300'
        }`}
      >
        <span className={displayValue ? 'text-slate-800' : 'text-slate-400'}>
          {displayValue || placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown list — always below */}
      {open && (
        <div
          className="absolute left-0 right-0 z-50 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden"
          style={{ maxHeight: '220px', overflowY: 'auto' }}
        >
          {DEGREE_GROUPS.map((grp, gi) => (
            <div key={gi}>
              {grp.group && (
                <div className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 border-b border-slate-100">
                  {grp.group}
                </div>
              )}
              {grp.items.map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => { onChange(item); setOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    value === item
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


// ─── Main Register Component ──────────────────────────────────────────────────
const Register = () => {
  const [role,         setRole]         = useState('student');
  const [form,         setForm]         = useState({
    name: '', email: '', password: '', phone: '', college_name: '',
    address: '', city: '', state: '', website: '',
    is_college_student: false, college_id: '', branch: '', batch: '',
    // Buddy details
    buddy_department: '',
    buddy_year: '',
    buddy_roll: '',
    buddy_college_email: '',
    buddy_why: '',
  });
  const [showPw,       setShowPw]       = useState(false);
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [collegesList, setCollegesList] = useState([]);
  
  // Campus Buddy form upload states
  const [idCardFile,    setIdCardFile]    = useState(null);
  const [idCardPreview, setIdCardPreview] = useState(null);
  const [dragOver,      setDragOver]      = useState(false);
  const fileInputRef = useRef(null);

  // Loading animation states
  const [loadStep,     setLoadStep]     = useState(0);
  const [loadProgress, setLoadProgress] = useState(0);
  const [successMsg,   setSuccessMsg]   = useState('');

  const LOAD_STEPS = [
    { label: 'Uploading Student ID...', icon: '📤' },
    { label: 'Verifying Details...', icon: '🔍' },
    { label: 'Sending Request to College...', icon: '🏫' },
  ];

  const FLOW_STEPS = [
    { icon: '☑️', label: 'Check Box' },
    { icon: '📝', label: 'Fill Details' },
    { icon: '📤', label: 'Submit' },
    { icon: '⏳', label: 'Pending' },
    { icon: '🏫', label: 'College Reviews' },
    { icon: '✅', label: 'Approved' },
  ];

  const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Final Year', 'Post Graduate'];

  const { isAuthenticated, user, signUp } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => { if (params.get('role')) setRole(params.get('role')); }, [params]);

  useEffect(() => {
    if (role === 'student') {
      getColleges({ limit: 100 })
        .then(res => setCollegesList(res.colleges || []))
        .catch(() => {});
    }
  }, [role]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin')        navigate('/admin/dashboard',   { replace: true });
      else if (user.role === 'college') navigate('/college/dashboard', { replace: true });
      else                              navigate('/student/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));



  // File drop helpers
  const handleFileChange = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('ID card file must be under 5 MB.'); return; }
    setIdCardFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setIdCardPreview(e.target.result);
    reader.readAsDataURL(file);
    setError('');
  };

  // Run progress load visual steps
  const runLoadAnimation = () =>
    new Promise((resolve) => {
      let step = 0;
      setLoadStep(0);
      setLoadProgress(5);
      const advance = () => {
        step += 1;
        if (step >= LOAD_STEPS.length) {
          setLoadProgress(100);
          setTimeout(resolve, 350);
          return;
        }
        setLoadStep(step);
        setLoadProgress(Math.round(((step + 1) / LOAD_STEPS.length) * 95));
        setTimeout(advance, 850);
      };
      setTimeout(advance, 800);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!form.email || !form.password) { setError('Email and password are required'); return; }
    if (form.password.length < 6)      { setError('Password must be at least 6 characters'); return; }
    if (role === 'student' && !form.name)          { setError('Name is required'); return; }
    
    if (role === 'student' && form.is_college_student) {
      if (!form.college_name)        { setError('College name is required'); return; }
      if (!form.branch)              { setError('Branch / Degree is required'); return; }
      if (!form.batch)               { setError('Batch / Year is required'); return; }
      if (!form.buddy_department)    { setError('Department is required for Campus Buddy'); return; }
      if (!form.buddy_year)          { setError('Year of study is required for Campus Buddy'); return; }
      if (!form.buddy_roll)          { setError('Roll number is required for Campus Buddy'); return; }
      if (!form.buddy_college_email) { setError('Official college email is required'); return; }
      if (!idCardFile)               { setError('Please upload your Student ID Card'); return; }
    }
    if (role === 'college' && !form.college_name)  { setError('College name is required'); return; }

    setLoading(true);
    try {
      const payload = { ...form, role };
      if (payload.college_id === 'other' || !payload.college_id) payload.college_id = null;

      // ── Step 1: Create Account ──────────────────────────────
      const result = await signUp(payload.email, payload.password, payload);
      const newUser = result?.data?.user;

      if (form.is_college_student && newUser?.id) {
        // ── Step 2: Run verification animations & submit ──────
        const submitPromise = (async () => {
          const { submitCampusBuddyRequest } = await import('../api');
          return submitCampusBuddyRequest({
            userId: newUser.id,
            college_id: payload.college_id,
            college_name: form.college_name,
            department: form.buddy_department,
            year: form.buddy_year,
            roll_number: form.buddy_roll,
            college_email: form.buddy_college_email,
            why_buddy: form.buddy_why || null,
            idCardFile,
          });
        })();

        await Promise.all([runLoadAnimation(), submitPromise]);

        setSuccessMsg("Please wait while we submit your verification request. Your account will remain inactive until it is approved by your college administration.");
        setTimeout(() => {
          navigate('/student/dashboard', { replace: true });
        }, 5000);
      } else {
        // Simple redirect for college profiles or non-buddy students
        navigate(role === 'student' ? '/student/dashboard' : '/college/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16 px-4 bg-[#F8FAFC]">


      {/* Floating Particles */}
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
              <span className="text-[#4F46E5]">Info</span>
              <span className="text-[#06B6D4] font-semibold">-Hub</span>
            </span>
          </Link>
          <h1 className="font-heading text-3xl font-bold text-slate-800 tracking-wide">Create Account</h1>
          <p className="text-slate-500 mt-1.5 text-sm">Join the InfoHub smart connectivity platform</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/80 shadow-2xl shadow-slate-200/60">

          {/* Role Toggle */}
          <div className="flex p-1.5 bg-slate-100/80 rounded-2xl mb-6 border border-slate-200/80">
            {['student', 'college'].map(r => (
              <button key={r} type="button" onClick={() => setRole(r)}
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
                <Field label="Full Name"    value={form.name}  onChange={set('name')}  placeholder="John Doe"          required />
                <Field label="Email"        value={form.email} onChange={set('email')} type="email" placeholder="you@example.com" required />
                <Field label="Phone Number" value={form.phone} onChange={set('phone')} type="tel"   placeholder="+91 9876543210" />

                {/* ── Checkbox ─────────────────────────────────────────── */}
                <div className="flex items-center gap-2.5 my-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <input
                    type="checkbox"
                    id="is_college_student"
                    checked={form.is_college_student}
                    onChange={(e) => setForm(prev => ({ ...prev, is_college_student: e.target.checked }))}
                    className="w-4 h-4 text-indigo-500 focus:ring-indigo-400 rounded border-slate-300"
                  />
                  <label htmlFor="is_college_student" className="text-sm font-semibold text-slate-700 select-none cursor-pointer">
                    Are you currently a college student?
                  </label>
                </div>

                {/* ── College + Campus Buddy fields ───────────────────── */}
                {form.is_college_student && (
                  <div className="animate-fade-in space-y-4">

                    {/* ── Info Banner ─────────────────────────────────── */}
                    <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] flex items-center justify-center text-white shadow-md text-base">
                          🏅
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm mb-0.5 flex items-center gap-2">
                            Become a Campus Buddy!
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 font-semibold border border-indigo-200">Beta</span>
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Help aspiring students make informed decisions by sharing your real college experiences.
                            Only <strong>verified students</strong> can participate. All registrations undergo verification
                            via your college email, student ID, and admin approval.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ── Verification Workflow ────────────────────────── */}
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Verification Workflow</p>
                      <div className="flex items-center gap-1 flex-wrap">
                        {FLOW_STEPS.map((step, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <div className="flex flex-col items-center gap-1">
                              <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-xs shadow-sm">
                                {step.icon}
                              </div>
                              <span className="text-[9px] font-semibold text-slate-400 text-center leading-tight w-10">{step.label}</span>
                            </div>
                            {i < FLOW_STEPS.length - 1 && (
                              <svg className="w-3 h-3 text-slate-300 flex-shrink-0 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
                          <span className="text-xs">✓</span>
                          <span className="text-[10px] font-bold text-emerald-700">Verified Student</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200">
                          <span className="text-xs">🏅</span>
                          <span className="text-[10px] font-bold text-indigo-700">Campus Buddy Badge</span>
                        </div>
                      </div>
                    </div>

                    {/* ── Warning ──────────────────────────────────────── */}
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5">
                      <p className="font-bold text-amber-800 text-xs mb-2 flex items-center gap-1.5">⚠️ Important</p>
                      <ul className="space-y-1">
                        {[
                          'Fake registrations are strictly prohibited.',
                          'Only enrolled students are eligible.',
                          'False information may result in permanent account suspension.',
                          'All conversations are monitored for safety.',
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11px] text-amber-700">
                            <span className="flex-shrink-0 w-1 h-1 rounded-full bg-amber-500 mt-1.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* ── Divider ───────────────────────────────────────── */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">College Details</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                    </div>

                    {/* ── College Name ─────────────────────────────────── */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                        College Name <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                        value={form.college_id}
                        onChange={(e) => {
                          const val = e.target.value;
                          const selected = collegesList.find(c => (c.user_id || c.id) === val);
                          setForm(prev => ({
                            ...prev,
                            college_id: val,
                            college_name: val === 'other' ? '' : (selected ? selected.college_name : '')
                          }));
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all text-sm shadow-sm"
                      >
                        <option value="">-- Select Your College --</option>
                        {collegesList.map(c => (
                          <option key={c.user_id || c.id} value={c.user_id || c.id}>{c.college_name}</option>
                        ))}
                        <option value="other">Other (Specify below)</option>
                      </select>
                    </div>

                    {(form.college_id === 'other' || !form.college_id) && (
                      <Field
                        label="Specify College Name"
                        value={form.college_name}
                        onChange={set('college_name')}
                        placeholder="e.g. ABC Engineering College"
                        required
                      />
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      {/* Branch / Degree — custom dropdown, always opens downward */}
                      <CustomDropdown
                        label="Branch / Degree"
                        required
                        value={form.branch}
                        onChange={(val) => setForm(prev => ({ ...prev, branch: val }))}
                        placeholder="-- Select Degree --"
                      />
                      <Field label="Batch / Year" value={form.batch} onChange={set('batch')} placeholder="e.g. 2022–2026" required />
                    </div>

                    {/* ── Campus Buddy Fields Divider ───────────────────── */}
                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Campus Buddy Verification Details</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
                    </div>

                    {/* ── Department ───────────────────────────────────── */}
                    <Field
                      label="Department"
                      value={form.buddy_department}
                      onChange={set('buddy_department')}
                      placeholder="e.g. Computer Science & Engineering"
                      required
                    />

                    {/* ── Year & Roll Number ────────────────────────────── */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                          Year of Study <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                          value={form.buddy_year}
                          onChange={set('buddy_year')}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all text-sm shadow-sm"
                        >
                          <option value="">-- Select Year --</option>
                          {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                      <Field
                        label="Roll Number"
                        value={form.buddy_roll}
                        onChange={set('buddy_roll')}
                        placeholder="e.g. ADS23105"
                        required
                      />
                    </div>

                    {/* ── Official College Email ─────────────────────────── */}
                    <Field
                      label="Official College Email"
                      value={form.buddy_college_email}
                      onChange={set('buddy_college_email')}
                      type="email"
                      placeholder="e.g. hari@college.edu"
                      required
                      icon="✉️"
                    />

                    {/* ── Student ID Card Upload ─────────────────────────── */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                        🪪 Upload Student ID Card <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files[0]); }}
                        className={`w-full rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
                          dragOver
                            ? 'border-indigo-400 bg-indigo-50'
                            : idCardFile
                            ? 'border-emerald-400 bg-emerald-50'
                            : 'border-slate-300 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50'
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => handleFileChange(e.target.files[0])}
                        />
                        <div className="flex flex-col items-center justify-center gap-2 py-5 px-4">
                          {idCardPreview ? (
                            <div className="flex flex-col items-center gap-2">
                              <img src={idCardPreview} alt="ID Preview" className="w-16 h-16 object-cover rounded-xl border border-emerald-300 shadow-sm" />
                              <span className="text-xs text-emerald-700 font-semibold">✓ {idCardFile.name}</span>
                              <span className="text-xs text-slate-400">Click to change</span>
                            </div>
                          ) : (
                            <>
                              <div className="text-slate-400">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-semibold text-slate-600">
                                  {dragOver ? 'Drop your ID card here' : 'Drag & drop or click to upload'}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">JPG, PNG or PDF (max 5 MB)</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ── Why Campus Buddy ──────────────────────────────── */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                        Why Campus Buddy? <span className="text-slate-400 normal-case font-normal">(Optional)</span>
                      </label>
                      <textarea
                        value={form.buddy_why}
                        onChange={set('buddy_why')}
                        rows={3}
                        placeholder="Share your motivation..."
                        className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all text-sm shadow-sm resize-none leading-relaxed"
                      />
                    </div>

                  </div>
                )}
              </>
            ) : (
              <>
                <Field label="College Name" value={form.college_name} onChange={set('college_name')} placeholder="ABC Engineering College" required />
                <Field label="Email"        value={form.email}        onChange={set('email')}        type="email" placeholder="admin@college.edu" required />
                <Field label="Phone"        value={form.phone}        onChange={set('phone')}        type="tel"   placeholder="+91 9876543210" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="City"  value={form.city}  onChange={set('city')}  placeholder="Chennai" />
                  <Field label="State" value={form.state} onChange={set('state')} placeholder="Tamil Nadu" />
                </div>
                <Field label="Address"     value={form.address} onChange={set('address')} placeholder="123 College Road" />
                <Field label="Website URL" value={form.website} onChange={set('website')} type="url" placeholder="https://college.edu" />
              </>
            )}

            {/* ── Password ────────────────────────────────────────────── */}
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

            {/* ── Error ────────────────────────────────────────────────── */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-sm text-center font-medium">
                {error}
              </div>
            )}

            {/* ── Loading Animation overlay inside form card during signup ── */}
            {loading && form.is_college_student && (
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5 mt-4 animate-fade-in space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
                  <p className="font-bold text-indigo-800 text-xs">{LOAD_STEPS[loadStep]?.label}</p>
                </div>
                <div className="h-1.5 rounded-full bg-indigo-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-700 ease-out"
                    style={{ width: `${loadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {successMsg && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed mt-4 animate-fade-in">
                <p className="font-bold mb-1">⏳ Request Pending</p>
                {successMsg}
              </div>
            )}

            {/* ── Submit ───────────────────────────────────────────────── */}
            {!successMsg && (
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-base mt-3 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing Account...
                  </>
                ) : (
                  form.is_college_student
                    ? '🏅 Create Campus Buddy Account'
                    : `Create ${role === 'student' ? 'Student' : 'College'} Account`
                )}
              </button>
            )}
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
