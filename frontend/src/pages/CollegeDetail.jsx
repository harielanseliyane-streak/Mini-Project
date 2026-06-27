import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCollegeById, applyToCollege, sendChatMessage } from '../api';
import { useAuth } from '../context/AuthContext';
import MediaViewer from '../components/MediaViewer';

const CollegeDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [college, setCollege]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [tab,     setTab]       = useState('courses');
  const [viewer,  setViewer]    = useState(null);
  const [msg,     setMsg]       = useState('');

  useEffect(() => {
    getCollegeById(id)
      .then(r => setCollege(r.data.college))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async (course_id) => {
    if (!user) { navigate('/login'); return; }
    try {
      await applyToCollege({ college_id: parseInt(id), course_id, type: 'admission' });
      setMsg('✅ Application submitted!');
    } catch (e) { setMsg(`❌ ${e.response?.data?.message || 'Failed'}`); }
    setTimeout(() => setMsg(''), 3000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-16"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!college) return <div className="min-h-screen flex items-center justify-center pt-16 text-slate-400">College not found.</div>;

  const mediaPosts = college.posts?.filter(p => p.media_url) || [];
  const mediaItems = mediaPosts.map(p => ({ url: p.media_url?.startsWith('http') ? p.media_url : `/uploads/media/${p.media_url}`, type: p.media_type, title: p.title }));

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <div className="glass rounded-2xl p-8 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
          <div className="relative flex flex-wrap items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-slate-200/80 flex items-center justify-center text-4xl overflow-hidden shadow-md flex-shrink-0">
              <img 
                src={college.logo ? (college.logo.startsWith('http') ? college.logo : `/uploads/logos/${college.logo}`) : 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=300&q=80'} 
                className="w-full h-full object-cover rounded-2xl" 
                alt="logo" 
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=300&q=80'; }}
              />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                {college.accreditation && <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold shadow-2xs">🏆 {college.accreditation}</span>}
              </div>
              <h1 className="font-heading text-3xl font-bold text-slate-800">{college.college_name}</h1>
              <p className="text-slate-500 mt-1">📍 {college.address}, {college.city}, {college.state}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
                {college.website && <a href={college.website} target="_blank" rel="noreferrer" className="text-primary hover:text-secondary">🌐 Website</a>}
                {college.email && <span>📧 {college.email}</span>}
                {college.phone && <span>📞 {college.phone}</span>}
              </div>
            </div>
          </div>
          {college.description && <p className="relative text-slate-500 mt-5 text-sm leading-relaxed">{college.description}</p>}

          {/* Stats row */}
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              ['📚', 'Courses', college.courses?.length ?? 0],
              ['🎓', 'Established', college.established || '—'],
              ['💼', 'Placement', college.placements?.[0] ? `${college.placements[0].placement_percent}%` : '—'],
              ['📦', 'Avg Package', college.placements?.[0] ? `${college.placements[0].average_package} LPA` : '—'],
            ].map(([icon, label, val]) => (
              <div key={label} className="glass rounded-xl p-4 text-center">
                <span className="text-2xl">{icon}</span>
                <p className="text-slate-500 text-xs mt-1">{label}</p>
                <p className="font-bold text-slate-800 mt-0.5">{val}</p>
              </div>
            ))}
          </div>
        </div>

        {msg && <div className={`mb-4 p-3 rounded-xl text-sm text-center ${msg.startsWith('✅') ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>{msg}</div>}

        {/* Tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {[['courses','📚 Courses'],['placements','💼 Placements'],['events','🎪 Events'],['posts','📢 Feed'],['media','🖼️ Media']].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t ? 'bg-primary/20 text-primary border border-primary/30' : 'text-slate-500 hover:text-primary hover:bg-slate-100'}`}>{l}</button>
          ))}
        </div>

        {/* Courses */}
        {tab === 'courses' && (
          <div className="glass rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-white/5">
                <tr>{['Course','Dept','Cutoff','Seats','Duration','Fee/Year',''].map(h => <th key={h} className="text-left px-4 py-3 text-slate-400 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {college.courses?.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-800 font-medium">{c.course_name}</td>
                    <td className="px-4 py-3 text-slate-500">{c.department || '—'}</td>
                    <td className="px-4 py-3 text-primary font-bold">{c.cutoff}</td>
                    <td className="px-4 py-3 text-slate-600">{c.seats || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{c.duration || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{c.fee_per_year ? `₹${Number(c.fee_per_year).toLocaleString()}` : '—'}</td>
                    <td className="px-4 py-3">{user?.role === 'student' && <button onClick={() => handleApply(c.id)} className="btn-primary text-xs px-3 py-1.5">Apply</button>}</td>
                  </tr>
                ))}
                {!college.courses?.length && <tr><td colSpan={7} className="px-4 py-8 text-slate-500 text-center">No courses listed</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* Placements */}
        {tab === 'placements' && (
          <div className="grid md:grid-cols-2 gap-4">
            {college.placements?.map(pl => (
              <div key={pl.id} className="glass rounded-xl p-5">
                <div className="flex justify-between mb-3"><span className="font-heading font-bold text-slate-800 text-xl">{pl.year}</span><span className="text-emerald-500 font-bold">{pl.placement_percent}% placed</span></div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="glass rounded-lg p-3 text-center"><p className="text-xs text-slate-500">Highest</p><p className="text-primary font-bold">{pl.highest_package} LPA</p></div>
                  <div className="glass rounded-lg p-3 text-center"><p className="text-xs text-slate-500">Average</p><p className="text-secondary font-bold">{pl.average_package} LPA</p></div>
                </div>
                {pl.top_recruiters && <p className="text-slate-500 text-xs">🏢 {pl.top_recruiters}</p>}
              </div>
            ))}
            {!college.placements?.length && <p className="text-slate-500 col-span-2 text-center py-10">No placement data</p>}
          </div>
        )}

        {/* Events */}
        {tab === 'events' && (
          <div className="grid md:grid-cols-2 gap-4">
            {college.events?.map(ev => (
              <div key={ev.id} className="glass rounded-xl p-5">
                <h3 className="font-semibold text-slate-800">{ev.name}</h3>
                <div className="flex gap-4 mt-2 text-xs text-slate-500">
                  <span>📅 {new Date(ev.event_date).toLocaleDateString()}</span>
                  {ev.location && <span>📍 {ev.location}</span>}
                </div>
                {ev.description && <p className="text-slate-500 text-sm mt-2">{ev.description}</p>}
                {user?.role === 'student' && <button onClick={() => applyToCollege({ college_id: parseInt(id), event_id: ev.id, type: 'event' }).then(() => setMsg('✅ Registered!')).catch(e => setMsg(`❌ ${e.response?.data?.message}`))} className="btn-primary text-xs px-4 py-1.5 mt-3">Register</button>}
              </div>
            ))}
            {!college.events?.length && <p className="text-slate-500 col-span-2 text-center py-10">No upcoming events</p>}
          </div>
        )}

        {/* Posts */}
        {tab === 'posts' && (
          <div className="space-y-4">
            {college.posts?.map(p => (
              <div key={p.id} className="glass rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20 capitalize">{p.type}</span>
                  <span className="text-slate-500 text-xs">{new Date(p.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="font-semibold text-slate-800">{p.title}</h3>
                {p.description && <p className="text-slate-500 text-sm mt-1">{p.description}</p>}
                {p.media_url && p.media_type === 'image' && (
                  <img src={p.media_url?.startsWith('http') ? p.media_url : `/uploads/media/${p.media_url}`} className="mt-3 rounded-xl h-40 object-cover w-full cursor-pointer" onClick={() => setViewer({ items: [{ url: p.media_url?.startsWith('http') ? p.media_url : `/uploads/media/${p.media_url}`, type: 'image', title: p.title }], index: 0 })} alt={p.title} />
                )}
              </div>
            ))}
            {!college.posts?.length && <p className="text-slate-500 text-center py-10">No posts yet</p>}
          </div>
        )}

        {/* Media Gallery */}
        {tab === 'media' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {mediaItems.map((item, i) => (
              <div key={i} className="aspect-video rounded-xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setViewer({ items: mediaItems, index: i })}>
                {item.type === 'video'
                  ? <video src={item.url} className="w-full h-full object-cover" />
                  : <img src={item.url} className="w-full h-full object-cover" alt={item.title} />}
              </div>
            ))}
            {!mediaItems.length && <p className="text-slate-500 col-span-3 text-center py-10">No media uploaded yet</p>}
          </div>
        )}
      </div>

      {viewer && <MediaViewer items={viewer.items} initialIndex={viewer.index} onClose={() => setViewer(null)} />}
    </div>
  );
};

export default CollegeDetail;
