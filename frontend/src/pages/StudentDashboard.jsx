import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getStudentProfile, updateStudentProfile, uploadStudentPhoto,
  getColleges, getRecommendations, getMyApplications, applyToCollege
} from '../api';
// getColleges → calls /api/colleges/search (public)

const TabBtn = ({ active, onClick, children }) => (
  <button onClick={onClick}
    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      active ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
             : 'text-slate-400 hover:text-white hover:bg-white/5'
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
    if (tab === 'colleges' && colleges.length === 0) {
      getColleges({ search, cutoff: cutoffFilter })
        .then(r => setColleges(r.data.colleges || []))
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
  }, [tab]);

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
      <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ────────────────────────────────────── */}
        <div className="flex items-center gap-5 mb-8">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden cursor-pointer"
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
            <h1 className="font-heading text-2xl font-bold text-white">{profile?.name || user?.name}</h1>
            <p className="text-slate-400 text-sm">{profile?.email || user?.email}</p>
            {profile?.cutoff && (
              <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Cutoff: {profile.cutoff}
              </span>
            )}
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────── */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[['profile','👤 Profile'], ['colleges','🏛️ Colleges'], ['recommendations','🤖 Recommendations'], ['applications','📋 Applications']].map(([t, label]) => (
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
                <h2 className="font-heading font-bold text-white text-lg">Personal Info</h2>
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
                        <span className="text-white text-sm">{val}</span>
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
              <h2 className="font-heading font-bold text-white text-lg mb-5">Academic Details</h2>
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
              <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchColleges()}
                placeholder="Search by college name..." className="input max-w-sm" />
              <input value={cutoffFilter} onChange={e => setCutoffFilter(e.target.value)} type="number" placeholder="Max cutoff filter" className="input max-w-[180px]" />
              <button onClick={searchColleges} className="btn-primary px-5">🔍 Search</button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {colleges.map(college => {
                const { CollegeCard: _CC, ...rest } = { CollegeCard: null, ...college };
                return (
                  <div key={college.id} className="glass-hover rounded-2xl overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-xl">🏛️</div>
                        <div>
                          <h3 className="font-semibold text-white text-sm">{college.college_name}</h3>
                          <p className="text-slate-400 text-xs mt-0.5">{college.city}, {college.state}</p>
                        </div>
                        {college.accreditation && <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">{college.accreditation}</span>}
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                        <div className="glass rounded-lg p-2"><p className="text-xs text-slate-500">Cutoff</p><p className="text-sm font-bold text-indigo-300">{college.min_cutoff ?? '—'}</p></div>
                        <div className="glass rounded-lg p-2"><p className="text-xs text-slate-500">Courses</p><p className="text-sm font-bold text-white">{college.course_count ?? '—'}</p></div>
                        <div className="glass rounded-lg p-2"><p className="text-xs text-slate-500">Placed</p><p className="text-sm font-bold text-emerald-400">{college.placement_percent ? `${college.placement_percent}%` : '—'}</p></div>
                      </div>
                      <button onClick={() => handleApply(college)} className="btn-primary w-full text-sm py-2">Apply Now</button>
                    </div>
                  </div>
                );
              })}
              {colleges.length === 0 && <p className="text-slate-500 col-span-3 text-center py-10">No colleges found. Try searching!</p>}
            </div>
          </div>
        )}

        {/* ── Recommendations Tab ───────────────────────── */}
        {tab === 'recommendations' && (
          <div>
            {!recommendations ? (
              <div className="text-center py-16 text-slate-400">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                Loading recommendations...
              </div>
            ) : !profile?.cutoff ? (
              <div className="glass rounded-2xl p-10 text-center">
                <span className="text-5xl block mb-4">🎯</span>
                <h3 className="font-heading text-xl font-bold text-white mb-2">Update Your Cutoff</h3>
                <p className="text-slate-400 mb-6">Go to the Profile tab and enter your HSC marks and cutoff to get personalized recommendations.</p>
                <button onClick={() => setTab('profile')} className="btn-primary">Update Profile</button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="glass rounded-2xl p-5 border-l-4 border-indigo-500">
                  <p className="text-slate-400 text-sm">Your Cutoff Score</p>
                  <p className="text-3xl font-bold gradient-text">{profile.cutoff}<span className="text-slate-400 text-base font-normal">/200</span></p>
                </div>

                <div>
                  <h2 className="font-heading text-xl font-bold text-white mb-4">🏛️ Eligible Colleges ({recommendations.eligible_colleges?.length})</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {recommendations.eligible_colleges?.map((c, i) => (
                      <div key={i} className="glass-hover rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-white text-sm">{c.college_name}</h3>
                          {c.accreditation && <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">{c.accreditation}</span>}
                        </div>
                        <p className="text-slate-400 text-xs mb-3">{c.city}, {c.state}</p>
                        <div className="flex gap-3 text-xs">
                          <span className="text-indigo-300">📚 {c.course_name}</span>
                          <span className="text-slate-400">Cutoff: {c.course_cutoff}</span>
                          {c.placement_percent && <span className="text-emerald-400">✅ {c.placement_percent}% placed</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {recommendations.scholarships?.length > 0 && (
                  <div>
                    <h2 className="font-heading text-xl font-bold text-white mb-4">🎖️ Available Scholarships</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {recommendations.scholarships.map((s, i) => (
                        <div key={i} className="glass rounded-xl p-4 border border-amber-500/20">
                          <h3 className="font-semibold text-white text-sm mb-1">{s.name}</h3>
                          <p className="text-slate-400 text-xs mb-2">{s.college_name}</p>
                          {s.amount && <p className="text-amber-400 text-sm font-bold">₹{s.amount.toLocaleString()}/year</p>}
                          {s.eligibility && <p className="text-slate-500 text-xs mt-1">{s.eligibility}</p>}
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
            <h2 className="font-heading text-xl font-bold text-white mb-5">My Applications ({applications.length})</h2>
            {applications.length === 0 ? (
              <div className="glass rounded-2xl p-10 text-center text-slate-400">
                <span className="text-4xl block mb-3">📋</span>
                <p>No applications yet. Browse colleges and apply!</p>
                <button onClick={() => setTab('colleges')} className="btn-primary mt-4 px-6">Browse Colleges</button>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map(app => (
                  <div key={app.id} className="glass rounded-xl p-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{app.college_name}</h3>
                      <p className="text-slate-400 text-sm mt-0.5">
                        {app.type === 'event' ? `Event: ${app.event_name}` : `Course: ${app.course_name || 'General Admission'}`}
                      </p>
                      <p className="text-slate-500 text-xs mt-1">Applied {new Date(app.applied_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`badge-${app.status}`}>{app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span>
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
