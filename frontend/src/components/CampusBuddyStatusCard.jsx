import { useState, useEffect } from 'react';
import { getStudentCampusBuddyStatus } from '../api';

/**
 * CampusBuddyStatusCard
 * Shown in the Student Dashboard Profile tab.
 * Displays the current Campus Buddy verification status.
 *
 * Props:
 *   userId  – student's user ID
 *   refresh – pass a counter to force re-fetch
 */
const CampusBuddyStatusCard = ({ userId, refresh = 0 }) => {
  const [status,  setStatus]  = useState(null);   // full campus_buddy row
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getStudentCampusBuddyStatus(userId)
      .then(setStatus)
      .catch(() => setError('Could not load Campus Buddy status.'))
      .finally(() => setLoading(false));
  }, [userId, refresh]);

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 flex items-center gap-3">
        <div className="w-6 h-6 rounded-full border-2 border-indigo-200 border-t-indigo-500 animate-spin" />
        <span className="text-slate-400 text-sm">Loading Campus Buddy status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-2xl p-5 border border-red-200 bg-red-50 text-red-500 text-sm">
        {error}
      </div>
    );
  }

  // ── Not applied ──────────────────────────────────────────────────────────────
  if (!status) {
    return (
      <div className="glass rounded-2xl p-5 border border-dashed border-indigo-200 bg-indigo-50/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] flex items-center justify-center text-white text-lg shadow-md">
            🏅
          </div>
          <div>
            <p className="font-bold text-slate-700 text-sm">Campus Buddy Program</p>
            <p className="text-xs text-slate-500 mt-0.5">You haven't applied for the Campus Buddy program yet.</p>
          </div>
        </div>
      </div>
    );
  }

  const { verification_status, college_name, department, year, roll_number, rejection_reason, created_at } = status;

  // ── Status config ────────────────────────────────────────────────────────────
  const configs = {
    pending: {
      dot:      'bg-amber-400 animate-pulse',
      badge:    'bg-amber-100 text-amber-700 border-amber-200',
      ring:     'border-amber-200 bg-amber-50/40',
      icon:     '⏳',
      label:    'Pending Verification',
      message:  'Your request is currently under review by your college administration. You will be notified once a decision is made.',
    },
    approved: {
      dot:      'bg-emerald-400',
      badge:    'bg-emerald-100 text-emerald-700 border-emerald-200',
      ring:     'border-emerald-200 bg-emerald-50/40',
      icon:     '✅',
      label:    'Approved',
      message:  'Congratulations! You are now a verified Campus Buddy. Connect with students and share your experience!',
    },
    rejected: {
      dot:      'bg-red-400',
      badge:    'bg-red-100 text-red-700 border-red-200',
      ring:     'border-red-200 bg-red-50/40',
      icon:     '❌',
      label:    'Rejected',
      message:  rejection_reason
        ? `Your request was rejected. Reason: ${rejection_reason}`
        : 'Your request was rejected. Please verify your details and re-submit.',
    },
  };

  const cfg = configs[verification_status] || configs.pending;

  return (
    <div className={`glass rounded-2xl p-5 border ${cfg.ring} animate-fade-in`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] flex items-center justify-center text-white text-sm shadow-md">
            🏅
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Campus Buddy Status</h3>
        </div>
        {/* Status badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${cfg.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-4 text-xs">
        {[
          ['🏛️ College', college_name],
          ['📚 Department', department],
          ['📅 Year', year],
          ['🔢 Roll Number', roll_number],
          ['📆 Submitted', new Date(created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
        ].map(([label, val]) => (
          <div key={label} className="flex items-start gap-1.5">
            <span className="text-slate-400 flex-shrink-0">{label}:</span>
            <span className="font-semibold text-slate-700 truncate">{val || '—'}</span>
          </div>
        ))}
      </div>

      {/* Message */}
      <div className={`rounded-xl p-3 text-xs leading-relaxed ${
        verification_status === 'approved'
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : verification_status === 'rejected'
          ? 'bg-red-50 text-red-700 border border-red-200'
          : 'bg-amber-50 text-amber-700 border border-amber-200'
      }`}>
        {cfg.message}
      </div>

      {/* Approved badges */}
      {verification_status === 'approved' && (
        <div className="flex gap-2 mt-4 flex-wrap">
          {[
            { icon: '✓', label: 'Verified Student', from: 'from-emerald-500', to: 'to-teal-500' },
            { icon: '🏅', label: 'Campus Buddy',    from: 'from-[#4F46E5]',  to: 'to-[#06B6D4]' },
          ].map(b => (
            <div key={b.label}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r ${b.from} ${b.to} text-white text-xs font-bold shadow-md`}
            >
              <span>{b.icon}</span>
              <span>{b.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Rejected — re-submit hint */}
      {verification_status === 'rejected' && (
        <p className="text-[11px] text-slate-400 mt-3 text-center">
          Please contact your college administration or re-register with correct details.
        </p>
      )}
    </div>
  );
};

export default CampusBuddyStatusCard;
