import { useState, useEffect } from 'react';
import { getColleges } from '../api';
import CollegeCard from '../components/CollegeCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applyToCollege } from '../api';

const Colleges = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [colleges,  setColleges]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [city,      setCity]      = useState('');
  const [cutoff,    setCutoff]    = useState('');
  const [page,      setPage]      = useState(1);
  const [pagination,setPagination]= useState({});
  const [msg,       setMsg]       = useState('');

  const fetchColleges = (p = 1) => {
    setLoading(true);
    const params = { page: p, limit: 12 };
    if (search) params.search = search;
    if (city)   params.city   = city;
    if (cutoff) params.cutoff = cutoff;
    getColleges(params)
      .then(r => { setColleges(r.data.colleges || []); setPagination(r.data.pagination || {}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchColleges(1); }, []);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchColleges(1); };
  const handleApply  = async (college) => {
    if (!user) { navigate('/login'); return; }
    try { await applyToCollege({ college_id: college.id, type: 'admission' }); setMsg(`✅ Applied to ${college.college_name}!`); }
    catch (e)  { setMsg(`❌ ${e.response?.data?.message || 'Failed'}`); }
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="section-title">Explore <span className="gradient-text">Colleges</span></h1>
          <p className="section-sub mx-auto">Browse and filter colleges across Tamil Nadu</p>
        </div>

        {/* Search / Filter */}
        <form onSubmit={handleSearch} className="glass rounded-2xl p-5 mb-8 flex flex-wrap gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search college name..." className="input flex-1 min-w-[200px]" />
          <input value={city}   onChange={e => setCity(e.target.value)}   placeholder="City"  className="input w-36" />
          <input value={cutoff} onChange={e => setCutoff(e.target.value)} placeholder="My cutoff" type="number" className="input w-36" />
          <button type="submit" className="btn-primary px-6">🔍 Search</button>
          <button type="button" onClick={() => { setSearch(''); setCity(''); setCutoff(''); fetchColleges(1); }} className="btn-secondary px-4">Clear</button>
        </form>

        {msg && <div className={`mb-5 p-3 rounded-xl text-sm text-center ${msg.startsWith('✅') ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>{msg}</div>}

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => <div key={i} className="glass rounded-2xl h-64 shimmer" />)}
          </div>
        ) : colleges.length > 0 ? (
          <>
            <p className="text-slate-400 text-sm mb-4">{pagination.total} colleges found</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {colleges.map(c => <CollegeCard key={c.id} college={c} onApply={handleApply} />)}
            </div>
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {[...Array(pagination.pages)].map((_, i) => (
                  <button key={i} onClick={() => { setPage(i+1); fetchColleges(i+1); }}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${page === i+1 ? 'bg-indigo-500 text-white' : 'glass text-slate-400 hover:text-white'}`}>
                    {i+1}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-slate-500">
            <span className="text-5xl block mb-4">🔍</span>
            <p className="text-lg">No colleges found. Try different filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Colleges;
