import { useState, useEffect } from 'react';
import { getColleges, applyToCollege, saveItem, getSavedItems, removeSavedItem } from '../api';
import CollegeCard from '../components/CollegeCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Colleges = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [colleges,   setColleges]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [city,       setCity]       = useState('');
  const [cutoff,     setCutoff]     = useState('');
  const [page,       setPage]       = useState(1);
  const [pagination, setPagination] = useState({});
  const [msg,        setMsg]        = useState('');
  const [favoritesMap, setFavoritesMap] = useState({});

  const fetchColleges = (p = 1) => {
    setLoading(true);
    const params = { page: p, limit: 12 };
    if (search) params.search = search;
    if (city)   params.city   = city;
    if (cutoff) params.cutoff = cutoff;
    getColleges(params)
      .then(r => { setColleges(r.colleges || []); setPagination(r.pagination || {}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchColleges(1);
    if (isAuthenticated && user?.role === 'student') {
      getSavedItems(user.id)
        .then(items => {
          const mapping = {};
          items.filter(i => i.type === 'college').forEach(item => { mapping[item.item_id] = item.id; });
          setFavoritesMap(mapping);
        })
        .catch(() => {});
    }
  }, [isAuthenticated, user]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchColleges(1); };

  const handleApply = async (college) => {
    if (!user) { navigate('/login'); return; }
    try {
      await applyToCollege(user.id, { college_id: college.user_id || college.id, type: 'admission' });
      setMsg(`✅ Applied to ${college.college_name}!`);
    } catch (e) { setMsg(`❌ ${e.message || 'Failed'}`); }
    setTimeout(() => setMsg(''), 3000);
  };

  const handleToggleFavorite = async (collegeId) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (user?.role !== 'student') return;

    const savedId = favoritesMap[collegeId];
    if (savedId) {
      try {
        await removeSavedItem(savedId);
        setFavoritesMap(prev => { const u = { ...prev }; delete u[collegeId]; return u; });
        setMsg('✅ Removed from favorites');
      } catch { setMsg('❌ Failed to remove favorite'); }
    } else {
      try {
        const newItem = await saveItem(user.id, 'college', collegeId);
        setFavoritesMap(prev => ({ ...prev, [collegeId]: newItem.id }));
        setMsg('✅ Added to favorites! ❤️');
      } catch { setMsg('❌ Failed to add to favorites'); }
    }
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="section-title">Explore <span className="gradient-text">Colleges</span></h1>
          <p className="section-sub mx-auto">Browse and filter colleges across Tamil Nadu</p>
        </div>

        {/* Search / Filter */}
        <form onSubmit={handleSearch} className="card-premium p-5 mb-8 flex flex-wrap gap-3 border border-slate-200">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search college name..." className="input flex-1 min-w-[200px]" />
          <input value={city}   onChange={e => setCity(e.target.value)}   placeholder="City"  className="input w-36" />
          <input value={cutoff} onChange={e => setCutoff(e.target.value)} placeholder="My cutoff" type="number" className="input w-36" />
          <button type="submit" className="btn-primary px-6 shadow-sm">Search</button>
          <button type="button" onClick={() => { setSearch(''); setCity(''); setCutoff(''); fetchColleges(1); }} className="btn-secondary px-4">Clear</button>
        </form>

        {msg && (
          <div className={`mb-5 p-3 rounded-xl text-sm text-center border ${
            msg.startsWith('✅') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-red-500/10 border-red-500/20 text-red-600'
          }`}>
            {msg}
          </div>
        )}

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => <div key={i} className="card-premium h-64 shimmer" />)}
          </div>
        ) : colleges.length > 0 ? (
          <>
            <p className="text-slate-400 text-sm mb-4 font-semibold">{pagination.total} colleges found</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {colleges.map(c => (
                <CollegeCard
                  key={c.user_id || c.id}
                  college={c}
                  onApply={handleApply}
                  isFavorited={!!favoritesMap[c.user_id || c.id]}
                  onToggleFavorite={() => handleToggleFavorite(c.user_id || c.id)}
                />
              ))}
            </div>
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {[...Array(pagination.pages)].map((_, i) => (
                  <button key={i} onClick={() => { setPage(i+1); fetchColleges(i+1); }}
                    className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                      page === i+1
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {i+1}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-slate-500">
            <span className="text-5xl block mb-4">🔍</span>
            <p className="text-lg font-medium">No colleges found. Try different filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Colleges;
