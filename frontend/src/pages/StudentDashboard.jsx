import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getStudentProfile, updateStudentProfile, uploadStudentPhoto,
  getColleges, getRecommendations, getMyApplications, applyToCollege,
  getSavedItems, removeSavedItem, saveItem
} from '../api';
import CollegeCard from '../components/CollegeCard';

const TabBtn = ({ active, onClick, children }) => (
  <button onClick={onClick}
    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      active ? 'bg-primary/20 text-primary border border-primary/30'
             : 'text-slate-500 hover:text-primary hover:bg-slate-100'
    }`}>
    {children}
  </button>
);

const StudentDashboard = () => {
  const { user, updateUser } = useAuth();
  const [tab,             setTab]             = useState('profile');
  const [profile,         setProfile]         = useState(null);
  const [editMode,        setEditMode]        = useState(false);
  const [editForm,        setEditForm]        = useState({});
  const [colleges,        setColleges]        = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [applications,    setApplications]    = useState([]);
  const [savedItems,      setSavedItems]      = useState([]);
  const [favoritesMap,    setFavoritesMap]    = useState({});
  const [loading,         setLoading]         = useState(true);
  const [saving,          setSaving]          = useState(false);
  const [search,          setSearch]          = useState('');
  const [cutoffFilter,    setCutoffFilter]    = useState('');
  const [msg,             setMsg]             = useState('');
  const photoRef = useRef(null);

  // Load profile on mount
  useEffect(() => {
    getStudentProfile()
      .then(r => { setProfile(r.data.student); setEditForm(r.data.student); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Lazy-load tabs
  useEffect(() => {
    if (tab === 'colleges') {
      getColleges({ search, cutoff: cutoffFilter })
        .then(r => setColleges(r.data.colleges || []))
        .catch(() => {});
      
      getSavedItems()
        .then(res => {
          const items = res.data.saved_items || [];
          const mapping = {};
          items.forEach(item => {
            if (item.type === 'college') mapping[item.item_id] = item.id;
          });
          setFavoritesMap(mapping);
        })
        .catch(() => {});
    }
    if (tab === 'recommendations') {
      getRecommendations()
        .then(r => setRecommendations(r.data.recommendations))
        .catch(() => {});
    }
    if (tab === 'applications') {
      getMyApplications()
        .then(r => setApplications(r.data.applications || []))
        .catch(() => {});
    }
    if (tab === 'favorites') {
      getSavedItems()
        .then(res => {
          const items = res.data.saved_items || [];
          setSavedItems(items);
          const mapping = {};
          items.forEach(item => {
            if (item.type === 'college') mapping[item.item_id] = item.id;
          });
          setFavoritesMap(mapping);
        })
        .catch(() => {});
    }
  }, [tab]);

  const handleToggleFavorite = async (collegeId) => {
    const savedId = favoritesMap[collegeId];
    if (savedId) {
      try {
        await removeSavedItem(savedId);
        setFavoritesMap(prev => {
          const updated = { ...prev };
          delete updated[collegeId];
          return updated;
        });
        setSavedItems(prev => prev.filter(item => item.id !== savedId));
        setMsg("✅ Removed from favorites");
      } catch (e) {
        setMsg("❌ Failed to remove favorite");
      }
    } else {
      try {
        const res = await saveItem('college', collegeId);
        const newItem = res.data.saved;
        setFavoritesMap(prev => ({
          ...prev,
          [collegeId]: newItem.id
        }));
        setMsg("✅ Added to favorites! ❤️");
        // Re-load saved list to refresh layout if favorited
        getSavedItems().then(res => setSavedItems(res.data.saved_items || []));
      } catch (e) {
        setMsg("❌ Failed to add favorite");
      }
    }
    setTimeout(() => setMsg(''), 3000);
  };

  const handleRemoveFavorite = async (savedId) => {
    try {
      await removeSavedItem(savedId);
      setSavedItems(prev => prev.filter(item => item.id !== savedId));
      // update map
      setFavoritesMap(prev => {
        const updated = { ...prev };
        const key = Object.keys(updated).find(k => updated[k] === savedId);
        if (key) delete updated[key];
        return updated;
      });
      setMsg("✅ Removed from favorites");
    } catch {
      setMsg("❌ Failed to remove favorite");
    }
    setTimeout(() => setMsg(''), 3000);
  };

  const searchColleges = () => {
    getColleges({ search, cutoff: cutoffFilter })
      .then(r => setColleges(r.data.colleges || []))
      .catch(() => {});
  };

  const saveProfile = async () => {
    setSaving(true); setMsg('');
    try {
      await updateStudentProfile(editForm);
      setProfile(prev => ({ ...prev, ...editForm }));
      updateUser({ name: editForm.name });
      setEditMode(false);
      setMsg('✅ Profile updated successfully!');
    } catch (err) {
      setMsg(`❌ ${err.response?.data?.message || 'Update failed'}`);
    } finally { setSaving(false); }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const fd = new FormData(); fd.append('profile_photo', file);
    try {
      const r = await uploadStudentPhoto(fd);
      setProfile(prev => ({ ...prev, profile_photo_url: r.data.url }));
      setMsg('✅ Photo updated!');
    } catch { setMsg('❌ Photo upload failed'); }
  };

  const handleApply = async (college) => {
    try {
      await applyToCollege({ college_id: college.id, type: 'admission' });
      setMsg(`✅ Applied to ${college.college_name}`);
    } catch (err) {
      setMsg(`❌ ${err.response?.data?.message || 'Application failed'}`);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ────────────────────────────────────── */}
        <div className="flex items-center gap-5 mb-8">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden cursor-pointer"
              onClick={() => photoRef.current?.click()}>
              {profile?.profile_photo_url
                ? <img src={profile.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                : <span className="text-2xl font-bold text-white">{user?.name?.[0]?.toUpperCase()}</span>
              }
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-all">
                <span className="text-white text-xs">📷</span>
              </div>
            </div>
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-slate-800">{profile?.name || user?.name}</h1>
            <p className="text-slate-500 text-sm">{profile?.email || user?.email}</p>
            {profile?.cutoff && (
              <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
                Cutoff: {profile.cutoff}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {[['profile','👤 Profile'], ['colleges','🏛️ Colleges'], ['recommendations','🤖 Recommendations'], ['applications','📋 Applications'], ['favorites','❤️ Favorites']].map(([t, label]) => (
            <TabBtn key={t} active={tab === t} onClick={() => setTab(t)}>{label}</TabBtn>
          ))}
        </div>

        {/* Message */}
        {msg && <div className={`mb-4 p-3 rounded-xl text-sm text-center ${msg.startsWith('✅') ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>{msg}</div>}

        {/* ── Profile Tab ───────────────────────────────── */}
        {tab === 'profile' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Personal Info */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading font-bold text-slate-800 text-lg">Personal Info</h2>
                <button onClick={() => setEditMode(m => !m)}
                  className={editMode ? 'btn-danger text-sm px-3 py-1.5' : 'btn-secondary text-sm px-3 py-1.5'}>
                  {editMode ? 'Cancel' : '✏️ Edit'}
                </button>
              </div>
              <div className="space-y-4">
                {editMode ? (
                  <>
                    {[['Full Name','name','text'],['Email','email','email'],['Phone','phone','tel']].map(([label, field, type]) => (
                      <div key={field}>
                        <label className="label">{label}</label>
                        <input type={type} value={editForm[field] || ''} onChange={e => setEditForm(p => ({ ...p, [field]: e.target.value }))} className="input" />
                      </div>
                    ))}
                    <div>
                      <label className="label">Bio</label>
                      <textarea value={editForm.bio || ''} onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))} rows={3} className="input resize-none" placeholder="Tell us about yourself..." />
                    </div>
                  </>
                ) : (
                  <>
                    {[['👤 Name', profile?.name], ['📧 Email', profile?.email], ['📞 Phone', profile?.phone || '—'], ['📝 Bio', profile?.bio || '—']].map(([label, val]) => (
                      <div key={label} className="flex items-start gap-3">
                        <span className="text-slate-500 text-sm w-28 flex-shrink-0">{label}</span>
                        <span className="text-slate-800 text-sm">{val}</span>
                      </div>
                    ))}
                  </>
                )}
                {editMode && (
                  <button onClick={saveProfile} disabled={saving} className="btn-primary w-full py-3 mt-2">
                    {saving ? 'Saving...' : '💾 Save Changes'}
                  </button>
                )}
              </div>
            </div>

            {/* Academic Info */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-heading font-bold text-slate-800 text-lg mb-5">Academic Details</h2>
              <div className="space-y-4">
                {editMode ? (
                  <>
                    <div>
                      <label className="label">HSC Marks (%)</label>
                      <input type="number" min="0" max="100" step="0.01" value={editForm.hsc_marks || ''} onChange={e => setEditForm(p => ({ ...p, hsc_marks: e.target.value }))} className="input" placeholder="e.g. 92.5" />
                    </div>
                    <div>
                      <label className="label">Cutoff Marks (out of 200)</label>
                      <input type="number" min="0" max="200" step="0.01" value={editForm.cutoff || ''} onChange={e => setEditForm(p => ({ ...p, cutoff: e.target.value }))} className="input" placeholder="e.g. 185.5" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="glass rounded-xl p-4 text-center">
                        <p className="text-slate-500 text-xs mb-1">HSC Marks</p>
                        <p className="text-2xl font-bold gradient-text">{profile?.hsc_marks || '—'}<span className="text-sm text-slate-400">%</span></p>
                      </div>
                      <div className="glass rounded-xl p-4 text-center">
                        <p className="text-slate-500 text-xs mb-1">Cutoff</p>
                        <p className="text-2xl font-bold gradient-text">{profile?.cutoff || '—'}<span className="text-sm text-slate-400">/200</span></p>
                      </div>
                    </div>
                    {!profile?.cutoff && (
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm text-center">
                        💡 Click Edit to add your HSC marks and cutoff for college recommendations!
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Colleges Tab ──────────────────────────────── */}
        {tab === 'colleges' && (
          <div>
            {/* Search / Filter */}
            <div className="flex gap-3 mb-6 flex-wrap">
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && searchColleges()}
                placeholder="Search by college name..." 
                className="input max-w-sm border border-slate-200" 
              />
              <input 
                value={cutoffFilter} 
                onChange={e => setCutoffFilter(e.target.value)} 
                type="number" 
                placeholder="Max cutoff filter" 
                className="input max-w-[180px] border border-slate-200" 
              />
              <button onClick={searchColleges} className="btn-primary px-5 shadow-sm">Search</button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {colleges.map(college => (
                <CollegeCard
                  key={college.id}
                  college={college}
                  onApply={handleApply}
                  isFavorited={!!favoritesMap[college.id]}
                  onToggleFavorite={() => handleToggleFavorite(college.id)}
                />
              ))}
              {colleges.length === 0 && (
                <p className="text-slate-400 col-span-3 text-center py-10 font-semibold">No colleges found. Try searching!</p>
              )}
            </div>
          </div>
        )}

        {/* ── Recommendations Tab ───────────────────────── */}
        {tab === 'recommendations' && (
          <div>
            {!recommendations ? (
              <div className="text-center py-16 text-slate-400">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                Loading recommendations...
              </div>
            ) : !profile?.cutoff ? (
              <div className="card-premium p-10 text-center">
                <span className="text-5xl block mb-4">🎯</span>
                <h3 className="font-heading text-xl font-bold text-slate-800 mb-2">Update Your Cutoff</h3>
                <p className="text-slate-500 mb-6">Go to the Profile tab and enter your HSC marks and cutoff to get personalized recommendations.</p>
                <button onClick={() => setTab('profile')} className="btn-primary shadow-sm">Update Profile</button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="card-premium p-6 border-l-4 border-primary shadow-sm">
                  <p className="text-slate-400 text-sm font-semibold">Your Cutoff Score</p>
                  <p className="text-3xl font-bold gradient-text">{profile.cutoff}<span className="text-slate-400 text-base font-normal">/200</span></p>
                </div>

                <div>
                  <h2 className="font-heading text-xl font-bold text-slate-800 mb-4">🏛️ Eligible Colleges ({recommendations.eligible_colleges?.length})</h2>
                  <div className="grid md:grid-cols-2 gap-5">
                    {recommendations.eligible_colleges?.map((c, i) => (
                      <div key={i} className="card-premium p-5 hover:border-primary/20 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-slate-800 text-sm">{c.college_name}</h3>
                          {c.accreditation && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
                              {c.accreditation}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-xs mb-3">{c.city}, {c.state}</p>
                        <div className="flex gap-3 text-xs font-semibold">
                          <span className="text-primary">📚 {c.course_name}</span>
                          <span className="text-slate-400">Cutoff: {c.course_cutoff}</span>
                          {c.placement_percent && <span className="text-emerald-500">✅ {c.placement_percent}% placed</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {recommendations.scholarships?.length > 0 && (
                  <div>
                    <h2 className="font-heading text-xl font-bold text-slate-800 mb-4">🎖️ Available Scholarships</h2>
                    <div className="grid md:grid-cols-2 gap-5">
                      {recommendations.scholarships.map((s, i) => (
                        <div key={i} className="card-premium p-5 border border-slate-200">
                          <h3 className="font-semibold text-slate-800 text-sm mb-1">{s.name}</h3>
                          <p className="text-slate-400 text-xs mb-2">{s.college_name}</p>
                          {s.amount && <p className="text-secondary text-sm font-bold">₹{s.amount.toLocaleString()}/year</p>}
                          {s.eligibility && <p className="text-slate-500 text-xs mt-1 leading-relaxed">{s.eligibility}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Applications Tab ──────────────────────────── */}
        {tab === 'applications' && (
          <div>
            <h2 className="font-heading text-xl font-bold text-slate-800 mb-5">My Applications ({applications.length})</h2>
            {applications.length === 0 ? (
              <div className="card-premium p-10 text-center text-slate-400">
                <span className="text-4xl block mb-3">📋</span>
                <p className="text-slate-500">No applications yet. Browse colleges and apply!</p>
                <button onClick={() => setTab('colleges')} className="btn-primary mt-4 px-6 shadow-sm">Browse Colleges</button>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map(app => (
                  <div key={app.id} className="card-premium p-5 flex items-center justify-between border border-slate-200">
                    <div>
                      <h3 className="font-semibold text-slate-800">{app.college_name}</h3>
                      <p className="text-slate-500 text-sm mt-0.5">
                        {app.type === 'event' ? `Event: ${app.event_name}` : `Course: ${app.course_name || 'General Admission'}`}
                      </p>
                      <p className="text-slate-400 text-xs mt-1">Applied {new Date(app.applied_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`badge-${app.status}`}>{app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Favorites Tab ────────────────────────────── */}
        {tab === 'favorites' && (
          <div>
            <h2 className="font-heading text-xl font-bold text-slate-800 mb-5">❤️ My Saved Colleges ({savedItems.filter(item => item.type === 'college').length})</h2>
            {savedItems.filter(item => item.type === 'college').length === 0 ? (
              <div className="card-premium p-10 text-center text-slate-400">
                <span className="text-4xl block mb-3">❤️</span>
                <p className="text-slate-500">You haven't saved any colleges yet. Click the heart on college listings to save them!</p>
                <button onClick={() => setTab('colleges')} className="btn-primary mt-4 px-6 shadow-sm">Explore Colleges</button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedItems.filter(item => item.type === 'college').map(item => (
                  <div key={item.id} className="card-premium p-5 flex flex-col justify-between hover:border-primary/20 transition-all">
                    <div>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-slate-100 flex items-center justify-center text-xl flex-shrink-0">
                          {item.details?.logo ? (
                            <img src={`/uploads/logos/${item.details.logo}`} alt={item.details.collegeName} className="w-full h-full object-cover" />
                          ) : (
                            <span>🏛️</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2">{item.details?.collegeName}</h3>
                          <p className="text-slate-400 text-xs mt-0.5">{item.details?.city}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                      <Link 
                        to={`/colleges/${item.item_id}`} 
                        className="flex-1 text-center py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 border border-slate-200/40 text-slate-800 transition-all"
                      >
                        View Details
                      </Link>
                      <button 
                        onClick={() => handleRemoveFavorite(item.id)} 
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-danger/10 text-danger hover:bg-danger/25 transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
