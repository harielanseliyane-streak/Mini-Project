import { useState, useRef, useEffect } from 'react';
import { submitCampusBuddyRequest } from '../api';

// ─── Constants ────────────────────────────────────────────────────────────────
const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Final Year', 'Post Graduate'];

const REJECTION_REASONS = [
  'Invalid ID Card',
  'Incorrect Roll Number',
  'Student Not Found',
  'Expired ID Card',
  'Blurry / Unreadable ID Card',
  'Other',
];

const LOAD_STEPS = [
  { label: 'Uploading Student ID...', icon: '📤' },
  { label: 'Verifying Details...', icon: '🔍' },
  { label: 'Sending Request to College...', icon: '🏫' },
];

// ─── Upload Icon ──────────────────────────────────────────────────────────────
const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = ({ size = 'md' }) => {
  const sz = size === 'sm' ? 'w-4 h-4 border-2' : 'w-8 h-8 border-[3px]';
  return (
    <div className={`${sz} rounded-full border-indigo-200 border-t-indigo-500 animate-spin`} />
  );
};

// ─── Verification Workflow Steps ──────────────────────────────────────────────
const FLOW_STEPS = [
  { icon: '☑️', label: 'Check Box' },
  { icon: '📝', label: 'Fill Details' },
  { icon: '📤', label: 'Submit' },
  { icon: '⏳', label: 'Pending' },
  { icon: '🏫', label: 'College Reviews' },
  { icon: '✅', label: 'Approved' },
];

// ─── Main Component ───────────────────────────────────────────────────────────
/**
 * CampusBuddyRequestForm
 *
 * Props:
 *   userId       – the newly registered user's ID
 *   college_id   – UUID of selected college (may be null for "Other")
 *   college_name – college display name pre-filled
 *   onSuccess    – called after successful submission
 */
const CampusBuddyRequestForm = ({ userId, college_id, college_name = '', onSuccess }) => {
  const [buddy, setBuddy] = useState({
    department: '',
    year: '',
    roll_number: '',
    college_email: '',
    why_buddy: '',
  });
  const [idCardFile,    setIdCardFile]    = useState(null);
  const [idPreview,     setIdPreview]     = useState(null);
  const [dragOver,      setDragOver]      = useState(false);
  const [error,         setError]         = useState('');
  const [loading,       setLoading]       = useState(false);
  const [loadStep,      setLoadStep]      = useState(0);   // 0-based index
  const [loadProgress,  setLoadProgress]  = useState(0);   // 0-100
  const [success,       setSuccess]       = useState(false);
  const fileRef = useRef(null);

  const set = (f) => (e) => setBuddy(prev => ({ ...prev, [f]: e.target.value }));

  // ── File helpers ─────────────────────────────────────────────────────────────
  const handleFile = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('File must be under 5 MB'); return; }
    setIdCardFile(file);
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => setIdPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  // ── Animated loading sequence ─────────────────────────────────────────────────
  const runLoadAnimation = () =>
    new Promise((resolve) => {
      let step = 0;
      setLoadStep(0);
      setLoadProgress(5);

      const advance = () => {
        step += 1;
        if (step >= LOAD_STEPS.length) {
          setLoadProgress(100);
          setTimeout(resolve, 400);
          return;
        }
        setLoadStep(step);
        const targetPct = Math.round(((step + 1) / LOAD_STEPS.length) * 95);
        setLoadProgress(targetPct);
        setTimeout(advance, 900);
      };
      setTimeout(advance, 850);
    });

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!buddy.department)    { setError('Department is required'); return; }
    if (!buddy.year)          { setError('Year of study is required'); return; }
    if (!buddy.roll_number)   { setError('Roll number is required'); return; }
    if (!buddy.college_email) { setError('Official college email is required'); return; }
    if (!/\S+@\S+\.\S+/.test(buddy.college_email)) { setError('Enter a valid email'); return; }

    setLoading(true);
    try {
      // Start visual animation concurrently with the actual API call
      await Promise.all([
        runLoadAnimation(),
        submitCampusBuddyRequest({
          userId,
          college_id: college_id || null,
          college_name,
          department: buddy.department,
          year: buddy.year,
          roll_number: buddy.roll_number,
          college_email: buddy.college_email,
          idCardFile,
          why_buddy: buddy.why_buddy || null,
        }),
      ]);
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success State ─────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 text-center animate-fade-in">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg shadow-emerald-200">
          ✓
        </div>
        <h3 className="font-bold text-emerald-800 text-base mb-1">Request Submitted!</h3>
        <p className="text-sm text-emerald-600 leading-relaxed mb-4">
          Your Campus Buddy verification request has been sent to your college administrator.
          You'll be notified once it's reviewed.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 border border-amber-200 text-amber-700 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Status: Pending Verification
        </div>
      </div>
    );
  }

  // ── Loading State ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-6 animate-fade-in">
        {/* Spinner + title */}
        <div className="flex items-center gap-3 mb-5">
          <Spinner />
          <div>
            <p className="font-bold text-indigo-800 text-sm">{LOAD_STEPS[loadStep]?.label}</p>
            <p className="text-[11px] text-indigo-400">Step {loadStep + 1} of {LOAD_STEPS.length}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex justify-between text-[10px] text-indigo-400 mb-1.5">
            <span>Processing</span>
            <span>{loadProgress}%</span>
          </div>
          <div className="h-2 rounded-full bg-indigo-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-blue-500 transition-all duration-700 ease-out"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
        </div>

        {/* Steps list */}
        <div className="space-y-2 mb-5">
          {LOAD_STEPS.map((step, i) => (
            <div key={i} className={`flex items-center gap-3 text-sm transition-all duration-300 ${
              i < loadStep ? 'opacity-50' : i === loadStep ? 'opacity-100' : 'opacity-30'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                i < loadStep
                  ? 'bg-emerald-100 text-emerald-600'
                  : i === loadStep
                  ? 'bg-indigo-200 text-indigo-700'
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {i < loadStep ? '✓' : step.icon}
              </div>
              <span className={`text-xs font-medium ${
                i < loadStep ? 'text-emerald-600 line-through' : i === loadStep ? 'text-indigo-700' : 'text-slate-400'
              }`}>{step.label}</span>
              {i === loadStep && (
                <span className="ml-auto"><Spinner size="sm" /></span>
              )}
            </div>
          ))}
        </div>

        {/* Advisory message */}
        <p className="text-[11px] text-indigo-500 text-center leading-relaxed border-t border-indigo-100 pt-3">
          Please wait while we submit your verification request.<br />
          Your account will remain inactive until it is approved by your college administration.
        </p>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Banner */}
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
              Help aspiring students with real college experiences. Only <strong>verified students</strong> can
              participate. Your request goes to your college for approval.
            </p>
          </div>
        </div>
      </div>

      {/* Verification workflow */}
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
      </div>

      {/* Warning */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5">
        <p className="font-bold text-amber-800 text-xs mb-2">⚠️ Important</p>
        <ul className="space-y-1">
          {[
            'Fake registrations are strictly prohibited.',
            'Only enrolled students are eligible.',
            'False information may result in permanent account suspension.',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-[11px] text-amber-700">
              <span className="w-1 h-1 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Campus Buddy Details</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* College Name (read-only display) */}
        {college_name && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              🏛️ College Name
            </label>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm">
              <span className="text-slate-400 text-base">🏛</span>
              <span className="font-medium">{college_name}</span>
            </div>
          </div>
        )}

        {/* Department */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Department <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            value={buddy.department}
            onChange={set('department')}
            placeholder="e.g. Computer Science & Engineering"
            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all text-sm shadow-sm"
          />
        </div>

        {/* Year & Roll */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Year of Study <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              value={buddy.year}
              onChange={set('year')}
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all text-sm shadow-sm"
            >
              <option value="">-- Select Year --</option>
              {YEAR_OPTIONS.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Roll Number <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              value={buddy.roll_number}
              onChange={set('roll_number')}
              placeholder="e.g. CS2022001"
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all text-sm shadow-sm"
            />
          </div>
        </div>

        {/* College Email */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
            <span>✉️</span> Official College Email <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="email"
            value={buddy.college_email}
            onChange={set('college_email')}
            placeholder="e.g. cs2022001@college.edu.in"
            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all text-sm shadow-sm"
          />
        </div>

        {/* ID Card Upload */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            🪪 Student ID Card Upload
          </label>
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            className={`w-full rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
              dragOver
                ? 'border-indigo-400 bg-indigo-50'
                : idCardFile
                ? 'border-emerald-400 bg-emerald-50'
                : 'border-slate-300 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50'
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <div className="flex flex-col items-center gap-2 py-5 px-4">
              {idPreview ? (
                <>
                  <img src={idPreview} alt="ID Preview" className="w-16 h-16 object-cover rounded-xl border border-emerald-300 shadow-sm" />
                  <span className="text-xs text-emerald-700 font-semibold">✓ {idCardFile.name}</span>
                  <span className="text-xs text-slate-400">Click to change</span>
                </>
              ) : (
                <>
                  <div className="text-slate-400"><UploadIcon /></div>
                  <p className="text-sm font-semibold text-slate-600">
                    {dragOver ? 'Drop here' : 'Drag & drop or click to upload'}
                  </p>
                  <p className="text-xs text-slate-400">JPG, PNG or PDF (max 5 MB)</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Why Campus Buddy */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Why Campus Buddy?{' '}
            <span className="text-slate-400 normal-case font-normal">(Optional)</span>
          </label>
          <textarea
            value={buddy.why_buddy}
            onChange={set('why_buddy')}
            rows={3}
            placeholder="Share your motivation — e.g. 'I want to help incoming students avoid mistakes and guide them...'"
            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all text-sm shadow-sm resize-none leading-relaxed"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm flex items-center justify-center gap-2"
        >
          🏅 Create Campus Buddy Account
        </button>
      </form>
    </div>
  );
};

export default CampusBuddyRequestForm;
