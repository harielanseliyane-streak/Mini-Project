import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, MapPin } from 'lucide-react';

const CollegeCard = ({ college, onApply, isFavorited, onToggleFavorite }) => {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  const placementColor = college.placement_percent >= 90 ? 'text-emerald-500'
    : college.placement_percent >= 75 ? 'text-amber-500' : 'text-slate-500';

  return (
    <div className="card-premium flex flex-col relative group">
      {/* Favorite Button (floating absolute top-right) */}
      {isStudent && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite?.();
          }}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-100 hover:bg-slate-50 shadow-sm transition-all duration-300 group-hover:scale-105"
          aria-label="Add to Favorites"
        >
          <Heart 
            className={`w-4 h-4 transition-colors ${
              isFavorited ? 'fill-[#06B6D4] text-[#06B6D4]' : 'text-slate-400 hover:text-[#06B6D4]'
            }`} 
          />
        </button>
      )}

      {/* Card Header */}
      <div className="p-5 pb-4 border-b border-slate-100">
        <div className="flex items-start gap-4">
          {/* Logo with dummy image fallback */}
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
            <img 
              src={college.logo ? (college.logo.startsWith('http') ? college.logo : `/uploads/logos/${college.logo}`) : 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=300&q=80'} 
              alt={college.college_name} 
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=300&q=80'; }}
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <h3 className="font-heading font-semibold text-slate-800 text-base leading-snug line-clamp-2 hover:text-primary transition-colors">
              {college.college_name}
            </h3>
            <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              {college.city}, {college.state}
            </p>
            {college.accreditation && (
              <div className="mt-2">
                <span className="inline-block text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-semibold shadow-2xs">
                  🏆 {college.accreditation}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/50">
        <div className="p-3 text-center">
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">Min Cutoff</p>
          <p className="text-sm font-bold text-primary">{college.min_cutoff ?? '—'}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">Courses</p>
          <p className="text-sm font-bold text-slate-700">{college.course_count ?? '—'}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">Placement</p>
          <p className={`text-sm font-bold ${placementColor}`}>
            {college.placement_percent ? `${college.placement_percent}%` : '—'}
          </p>
        </div>
      </div>

      {/* Description */}
      {college.description && (
        <div className="px-5 py-3">
          <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{college.description}</p>
        </div>
      )}

      {/* Actions */}
      <div className="p-4 pt-3 mt-auto flex gap-2">
        <Link 
          to={`/colleges/${college.id || college.user_id}`}
          className="flex-1 text-center py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 border border-slate-200/40 text-slate-800 transition-all"
        >
          View Details
        </Link>
        {isStudent && (
          <button 
            onClick={() => onApply?.(college)}
            className="flex-1 btn-primary text-xs py-2.5 shadow-sm"
          >
            Apply
          </button>
        )}
      </div>
    </div>
  );
};

export default CollegeCard;
