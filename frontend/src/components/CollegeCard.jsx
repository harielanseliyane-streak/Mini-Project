import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CollegeCard = ({ college, onApply }) => {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  const placementColor = college.placement_percent >= 90 ? 'text-emerald-400'
    : college.placement_percent >= 75 ? 'text-amber-400' : 'text-slate-400';

  return (
    <div className="glass-hover rounded-2xl overflow-hidden group flex flex-col">
      {/* Card Header */}
      <div className="relative p-5 pb-4 border-b border-white/10">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {college.logo ? (
              <img src={`/uploads/logos/${college.logo}`} alt={college.college_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">🏛️</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-semibold text-white text-base leading-snug line-clamp-2 group-hover:text-indigo-300 transition-colors">
              {college.college_name}
            </h3>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              {college.city}, {college.state}
            </p>
          </div>
        </div>

        {/* Accreditation badge */}
        {college.accreditation && (
          <span className="absolute top-4 right-4 text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
            {college.accreditation}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-white/10 border-b border-white/10">
        <div className="p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Min Cutoff</p>
          <p className="text-sm font-bold text-indigo-300">{college.min_cutoff ?? '—'}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Courses</p>
          <p className="text-sm font-bold text-white">{college.course_count ?? '—'}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Placement</p>
          <p className={`text-sm font-bold ${placementColor}`}>
            {college.placement_percent ? `${college.placement_percent}%` : '—'}
          </p>
        </div>
      </div>

      {/* Description */}
      {college.description && (
        <div className="px-5 py-3">
          <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{college.description}</p>
        </div>
      )}

      {/* Actions */}
      <div className="p-4 pt-3 mt-auto flex gap-2">
        <Link to={`/colleges/${college.id || college.user_id}`}
          className="flex-1 text-center py-2 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
          View Details
        </Link>
        {isStudent && (
          <button onClick={() => onApply?.(college)}
            className="flex-1 btn-primary text-sm py-2">
            Apply
          </button>
        )}
      </div>
    </div>
  );
};

export default CollegeCard;
