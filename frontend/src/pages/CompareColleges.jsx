import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getCollegeById } from '../api';
import { ArrowLeft, GitCompare, Globe, MapPin, Award, BookOpen, ShieldAlert } from 'lucide-react';

const CompareColleges = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const ids = searchParams.get('ids')?.split(',') || [];

  useEffect(() => {
    if (ids.length === 0) {
      setLoading(false);
      setError('No colleges selected for comparison.');
      return;
    }

    setLoading(true);
    setError('');

    // Fetch details for all selected colleges
    Promise.all(ids.map(id => getCollegeById(id)))
      .then(responses => {
        setColleges(responses);
      })
      .catch(() => {
        setError('Failed to fetch details for one or more colleges.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-textSecondaryDark">Fetching comparison details...</p>
        </div>
      </div>
    );
  }

  if (error || colleges.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 px-4">
        <div className="max-w-md w-full card-premium p-8 text-center flex flex-col items-center gap-4">
          <ShieldAlert className="w-12 h-12 text-danger" />
          <h2 className="font-heading text-lg font-bold text-slate-800">Comparison Error</h2>
          <p className="text-sm text-textSecondaryDark">{error || 'Please select at least one college to compare.'}</p>
          <button onClick={() => navigate('/colleges')} className="btn-primary mt-2">
            Back to Colleges
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/colleges')}
            className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-800 transition-all"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase mb-1">
              <GitCompare className="w-4 h-4" /> Compare
            </div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-slate-800">Compare Colleges</h1>
          </div>
        </div>
        <p className="text-xs text-textSecondaryDark font-mono bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
          Comparing {colleges.length} Institutions
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="overflow-x-auto scrollbar-premium">
        <table className="w-full border-collapse card-premium overflow-hidden">
          <thead>
            <tr className="border-b border-borderDark bg-surfaceDark/50">
              <th className="p-6 text-left text-sm font-bold text-slate-800 min-w-[200px] w-1/5">Details</th>
              {colleges.map(c => (
                <th key={c.user_id} className="p-6 text-left min-w-[250px] w-1/4 border-l border-borderDark">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-slate-200 flex items-center justify-center text-2xl font-bold text-primary flex-shrink-0">
                      {c.logo ? (
                        <img src={c.logo.startsWith('http') ? c.logo : `/uploads/logos/${c.logo}`} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        c.college_name[0]
                      )}
                    </div>
                    <div>
                      <h3 className="font-heading text-sm font-bold text-slate-800 leading-tight">{c.college_name}</h3>
                      <p className="text-xs text-textSecondaryDark mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-primary" /> {c.city}, {c.state}
                      </p>
                    </div>
                  </div>
                  <a 
                    href={c.website} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-secondary hover:underline"
                  >
                    <Globe className="w-3 h-3" /> Visit Website
                  </a>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm text-textSecondaryDark divide-y divide-borderDark">
            {/* established */}
            <tr>
              <td className="p-6 font-semibold text-slate-800 bg-slate-50/50">Established</td>
              {colleges.map(c => (
                <td key={c.user_id} className="p-6 border-l border-borderDark font-mono">{c.established || '—'}</td>
              ))}
            </tr>
            {/* Accreditation */}
            <tr>
              <td className="p-6 font-semibold text-slate-800 bg-slate-50/50">Accreditation</td>
              {colleges.map(c => (
                <td key={c.user_id} className="p-6 border-l border-borderDark">
                  {c.accreditation ? (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      <Award className="w-3 h-3" /> {c.accreditation}
                    </span>
                  ) : '—'}
                </td>
              ))}
            </tr>
            {/* Placement statistics */}
            <tr>
              <td className="p-6 font-semibold text-slate-800 bg-slate-50/50">Average Placement Package</td>
              {colleges.map(c => {
                const latest = c.placements?.[0];
                return (
                  <td key={c.user_id} className="p-6 border-l border-borderDark font-mono text-emerald-600 font-bold">
                    {latest?.average_package ? `${latest.average_package} LPA` : '—'}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="p-6 font-semibold text-slate-800 bg-slate-50/50">Highest Package</td>
              {colleges.map(c => {
                const latest = c.placements?.[0];
                return (
                  <td key={c.user_id} className="p-6 border-l border-borderDark font-mono text-slate-800 font-bold">
                    {latest?.highest_package ? `${latest.highest_package} LPA` : '—'}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="p-6 font-semibold text-slate-800 bg-slate-50/50">Placement success</td>
              {colleges.map(c => {
                const latest = c.placements?.[0];
                return (
                  <td key={c.user_id} className="p-6 border-l border-borderDark">
                    {latest?.placement_percent ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${latest.placement_percent}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-800 font-mono">{latest.placement_percent}%</span>
                      </div>
                    ) : '—'}
                  </td>
                );
              })}
            </tr>
            {/* Hostel infrastructure */}
            <tr>
              <td className="p-6 font-semibold text-slate-800 bg-slate-50/50">Hostel Facilities</td>
              {colleges.map(c => (
                <td key={c.user_id} className="p-6 border-l border-borderDark leading-relaxed">{c.hostel_info || 'Information not listed.'}</td>
              ))}
            </tr>
            {/* Infrastructure details */}
            <tr>
              <td className="p-6 font-semibold text-slate-800 bg-slate-50/50">Campus Amenities</td>
              {colleges.map(c => (
                <td key={c.user_id} className="p-6 border-l border-borderDark leading-relaxed">{c.infrastructure || 'Campus amenities not listed.'}</td>
              ))}
            </tr>
            {/* Courses and Cutoffs list */}
            <tr>
              <td className="p-6 font-semibold text-slate-800 bg-slate-50/50 valign-top">Key Courses &amp; Cutoffs</td>
              {colleges.map(c => (
                <td key={c.user_id} className="p-6 border-l border-borderDark">
                  {c.courses && c.courses.length > 0 ? (
                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 scrollbar-premium">
                      {c.courses.map(cr => (
                        <div key={cr.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-secondary" /> {cr.course_name}
                          </span>
                          <div className="flex justify-between text-[10px] text-textSecondaryDark mt-1">
                            <span>Cutoff: <strong className="text-primary">{cr.cutoff}</strong></span>
                            <span>Fee: <strong>₹{cr.fee_per_year?.toLocaleString() || '—'}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-textSecondaryDark italic">No courses listed.</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompareColleges;
