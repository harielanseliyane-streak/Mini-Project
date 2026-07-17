import { useState, useRef, useEffect } from 'react';
import { registerCampusBuddy } from '../api';

// ─── SVG Icon Helpers ───────────────────────────────────────────────
const CollegeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422A12.083 12.083 0 0121 12c0 5.523-4.477 10-10 10S1 17.523 1 12c0-.637.065-1.26.184-1.862L12 14z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14V21" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5V17" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 10.5V17" />
  </svg>
);

const EmailIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const IdCardIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" />
  </svg>
);

const BadgeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-16 h-16 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// ─── Year Options ────────────────────────────────────────────────────
const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Final Year', 'Post Graduate'];

// ─── Verification Flow Steps ─────────────────────────────────────────
const FLOW_STEPS = [
  { icon: '☑️', label: 'Check Checkbox' },
  { icon: '📝', label: 'Fill Details' },
  { icon: '📤', label: 'Submit Form' },
  { icon: '⏳', label: 'Pending Verification' },
  { icon: '🏫', label: 'Admin Reviews' },
  { icon: '✅', label: 'Approved / Rejected' },
];

// ─── Main Component ──────────────────────────────────────────────────
const CampusBuddySection = ({ userId, collegeName, onSuccess }) => {
  const [buddyForm, setBuddyForm] = useState({
    department: '',
    year: '',
    roll_number: '',
    college_email: '',
    why_buddy: '',
  });
  const [idCardFile, setIdCardFile] = useState(null);
  const [idCardPreview, setIdCardPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const sectionRef = useRef(null);

  // Animate height in
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    el.style.maxHeight = '0';
    el.style.opacity = '0';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = 'max-height 0.6s cubic-bezier(0.4,0,0.2,1), opacity 0.5s ease';
        el.style.maxHeight = '2000px';
        el.style.opacity = '1';
      });
    });
  }, []);

  const set = (field) => (e) =>
    setBuddyForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleFileChange = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5 MB.');
      return;
    }
    setIdCardFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setIdCardPreview(e.target.result);
    reader.readAsDataURL(file);
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!buddyForm.department) return setError('Department is required.');
    if (!buddyForm.year) return setError('Year of study is required.');
    if (!buddyForm.roll_number) return setError('Roll number is required.');
    if (!buddyForm.college_email) return setError('Official college email is required.');
    if (!/\S+@\S+\.\S+/.test(buddyForm.college_email))
      return setError('Please enter a valid college email address.');

    setLoading(true);
    try {
      await registerCampusBuddy({
        userId,
        college_name: collegeName,
        department: buddyForm.department,
        year: buddyForm.year,
        roll_number: buddyForm.roll_number,
        college_email: buddyForm.college_email,
        why_buddy: buddyForm.why_buddy || null,
        idCardFile,
      });
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Campus Buddy registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success State ────────────────────────────────────────────────
  if (success) {
    return (
      <div ref={sectionRef} className="overflow-hidden">
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-cyan-50 p-6 text-center animate-fade-in">
          <div className="flex justify-center mb-3">
            <CheckCircleIcon />
          </div>
          <h3 className="font-bold text-lg text-slate-800 mb-2">Campus Buddy Registration Submitted! 🎉</h3>
          <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            Thank you for registering as a Campus Buddy! Your profile is currently under verification.
            Once approved, students from across the platform will be able to connect with you and learn
            about your college experience.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 border border-amber-200 text-amber-700 text-xs font-bold">
            <span>⏳</span> Status: Pending Verification
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={sectionRef} className="overflow-hidden">
      <div className="mt-4 space-y-4">

        {/* ── Info Banner ─────────────────────────────────────────── */}
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] flex items-center justify-center text-white shadow-md">
              <BadgeIcon />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-1.5">
                Become a Campus Buddy!
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 font-semibold border border-indigo-200">Beta</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Help aspiring students make informed decisions by sharing your real college experiences.
                Only <strong>verified students</strong> will be allowed to participate in the Campus Buddy program.
              </p>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                To ensure authenticity and prevent misinformation, all registrations will undergo a
                verification process using your college email, student ID card, and administrator approval.
              </p>
            </div>
          </div>
        </div>

        {/* ── Verification Workflow ────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Verification Workflow</p>
          <div className="flex items-center gap-1 flex-wrap">
            {FLOW_STEPS.map((step, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-sm shadow-sm">
                    {step.icon}
                  </div>
                  <span className="text-[9px] font-semibold text-slate-500 text-center leading-tight w-12">{step.label}</span>
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
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-sm">✓</span>
              <span className="text-[10px] font-bold text-emerald-700">Verified Student Badge</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200">
              <span className="text-sm">🏅</span>
              <span className="text-[10px] font-bold text-indigo-700">Campus Buddy Badge</span>
            </div>
          </div>
        </div>

        {/* ── Warning Box ──────────────────────────────────────────── */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-amber-600">
              <WarningIcon />
            </div>
            <span className="font-bold text-amber-800 text-sm">Important</span>
          </div>
          <ul className="space-y-1.5">
            {[
              'Fake registrations are strictly prohibited.',
              'Only students currently enrolled in a college are eligible.',
              'Providing false information may result in permanent account suspension.',
              'All conversations are monitored and moderated to maintain a safe and professional environment.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-amber-700">
                <span className="flex-shrink-0 w-1 h-1 rounded-full bg-amber-500 mt-1.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Campus Buddy Form ─────────────────────────────────────── */}
        <form id="campus-buddy-form" onSubmit={handleSubmit} className="space-y-4 border-l-2 border-indigo-300 pl-4">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
            <BadgeIcon />
            Campus Buddy Details
          </p>

          {/* College Name (prefilled / read-only from main form) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
              <CollegeIcon />
              College Name <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-sm shadow-sm flex items-center gap-2">
              <span className="text-indigo-500">🏛️</span>
              <span className="font-medium">{collegeName || 'From your college selection above'}</span>
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Department <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              id="buddy_department"
              value={buddyForm.department}
              onChange={set('department')}
              placeholder="e.g. Computer Science & Engineering"
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all text-sm shadow-sm"
            />
          </div>

          {/* Year of Study & Roll Number */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Year of Study <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="buddy_year"
                value={buddyForm.year}
                onChange={set('year')}
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all text-sm shadow-sm"
              >
                <option value="">-- Select Year --</option>
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Roll Number <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="buddy_roll_number"
                value={buddyForm.roll_number}
                onChange={set('roll_number')}
                placeholder="e.g. CS2022001"
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all text-sm shadow-sm"
              />
            </div>
          </div>

          {/* Official College Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
              <EmailIcon />
              Official College Email <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="email"
              id="buddy_college_email"
              value={buddyForm.college_email}
              onChange={set('college_email')}
              placeholder="e.g. cs2022001@college.edu.in"
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all text-sm shadow-sm"
            />
          </div>

          {/* Student ID Card Upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
              <IdCardIcon />
              Student ID Card Upload
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`relative w-full rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
                ${dragOver
                  ? 'border-indigo-400 bg-indigo-50'
                  : idCardFile
                  ? 'border-emerald-400 bg-emerald-50'
                  : 'border-slate-300 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50'
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                id="buddy_id_card"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files[0])}
              />
              <div className="flex flex-col items-center justify-center gap-2 py-5 px-4">
                {idCardPreview ? (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={idCardPreview}
                      alt="ID Preview"
                      className="w-20 h-20 object-cover rounded-xl border border-emerald-300 shadow-sm"
                    />
                    <span className="text-xs text-emerald-700 font-semibold">✓ {idCardFile.name}</span>
                    <span className="text-xs text-slate-400">Click to change</span>
                  </div>
                ) : (
                  <>
                    <div className={`text-slate-400 ${dragOver ? 'text-indigo-500' : ''}`}>
                      <UploadIcon />
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

          {/* Why Campus Buddy (Optional) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Why do you want to become a Campus Buddy?{' '}
              <span className="text-slate-400 normal-case font-normal">(Optional)</span>
            </label>
            <textarea
              id="buddy_why"
              value={buddyForm.why_buddy}
              onChange={set('why_buddy')}
              rows={3}
              placeholder="Share your motivation — e.g. 'I want to help incoming students avoid the mistakes I made and guide them with honest, first-hand experience...'"
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all text-sm shadow-sm resize-none leading-relaxed"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)' }}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting Campus Buddy Application...
              </>
            ) : (
              <>
                <BadgeIcon />
                Register as Campus Buddy
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CampusBuddySection;
