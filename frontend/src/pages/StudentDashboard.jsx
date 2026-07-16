import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getFullStudentProfile, updateStudentProfile, uploadStudentPhoto,
  getColleges, getRecommendations, getMyApplications, applyToCollege,
  getSavedItems, removeSavedItem, saveItem,
  getActiveChatPartners, getChatHistory, sendPeerMessage
} from '../api';
import { supabase } from '../lib/supabaseClient';
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

  // Chat-specific states
  const [activePartners, setActivePartners] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  
  // Colleges list for dropdown selection
  const [collegesList, setCollegesList] = useState([]);

  // Load profile on mount
  useEffect(() => {
    if (!user?.id) return;
    getFullStudentProfile(user.id)
      .then(p => { setProfile(p); setEditForm(p); })
      .catch(() => {})
      .finally(() => setLoading(false));

    getColleges({ limit: 100 })
      .then(res => setCollegesList(res.colleges || []))
      .catch(() => {});
  }, [user?.id]);

  // Lazy-load tabs
  useEffect(() => {
    if (!user?.id) return;
    if (tab === 'colleges') {
      getColleges({ search, cutoff: cutoffFilter })
        .then(r => setColleges(r.colleges || []))
        .catch(() => {});
      getSavedItems(user.id)
        .then(items => {
          const mapping = {};
          items.filter(i => i.type === 'college').forEach(item => { mapping[item.item_id] = item.id; });
          setFavoritesMap(mapping);
        })
        .catch(() => {});
    }
    if (tab === 'recommendations') {
      getRecommendations(user.id)
        .then(r => setRecommendations(r))
        .catch(() => {});
    }
    if (tab === 'applications') {
      getMyApplications(user.id)
        .then(apps => setApplications(apps))
        .catch(() => {});
    }
    if (tab === 'favorites') {
      getSavedItems(user.id)
        .then(items => {
          setSavedItems(items);
          const mapping = {};
          items.filter(i => i.type === 'college').forEach(item => { mapping[item.item_id] = item.id; });
          setFavoritesMap(mapping);
        })
        .catch(() => {});
    }
    if (tab === 'chats') {
      getActiveChatPartners()
        .then(partners => {
          setActivePartners(partners);
          if (partners.length > 0 && !activePartner) {
            setActivePartner(partners[0]);
          }
        })
        .catch(() => {});
    }
  }, [tab, user?.id]);

  // Chat message fetch and realtime listener
  useEffect(() => {
    if (!activePartner?.partner_id || tab !== 'chats' || !user?.id) return;
    getChatHistory(activePartner.partner_id)
      .then(msgs => setChatMessages(msgs))
      .catch(() => {});

    // Setup realtime subscription
    const channel = supabase
      .channel(`room:${activePartner.partner_id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        const msg = payload.new;
        if (
          (msg.sender_id === user.id && msg.receiver_id === activePartner.partner_id) ||
          (msg.sender_id === activePartner.partner_id && msg.receiver_id === user.id)
        ) {
          setChatMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activePartner, user?.id, tab]);

  const handleSendMsg = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activePartner) return;
    try {
      const sent = await sendPeerMessage(activePartner.partner_id, newMsg.trim());
      setChatMessages(prev => [...prev, sent]);
      setNewMsg('');
      
      // Update the active partners list snippet
      setActivePartners(prev => prev.map(p => {
        if (p.partner_id === activePartner.partner_id) {
          return {
            ...p,
            last_message: sent.content,
            last_message_time: sent.created_at
          };
        }
        return p;
      }));
    } catch (err) {
      setMsg(`❌ Failed to send message: ${err.message}`);
    }
  };

  const handleToggleFavorite = async (collegeId) => {
    const savedId = favoritesMap[collegeId];
    if (savedId) {
      try {
        await removeSavedItem(savedId);
        setFavoritesMap(prev => { const u = { ...prev }; delete u[collegeId]; return u; });
        setSavedItems(prev => prev.filter(item => item.id !== savedId));
        setMsg('✅ Removed from favorites');
      } catch { setMsg('❌ Failed to remove favorite'); }
    } else {
      try {
        const newItem = await saveItem(user.id, 'college', collegeId);
        setFavoritesMap(prev => ({ ...prev, [collegeId]: newItem.id }));
        setMsg('✅ Added to favorites! ❤️');
        getSavedItems(user.id).then(setSavedItems).catch(() => {});
      } catch { setMsg('❌ Failed to add favorite'); }
    }
    setTimeout(() => setMsg(''), 3000);
  };

  const handleRemoveFavorite = async (savedId) => {
    try {
      await removeSavedItem(savedId);
      setSavedItems(prev => prev.filter(item => item.id !== savedId));
      setFavoritesMap(prev => {
        const u = { ...prev };
        const key = Object.keys(u).find(k => u[k] === savedId);
        if (key) delete u[key];
        return u;
      });
      setMsg('✅ Removed from favorites');
    } catch { setMsg('❌ Failed to remove favorite'); }
    setTimeout(() => setMsg(''), 3000);
  };

  const searchColleges = () => {
    getColleges({ search, cutoff: cutoffFilter })
      .then(r => setColleges(r.colleges || []))
      .catch(() => {});
  };

  const saveProfile = async () => {
    setSaving(true); setMsg('');
    try {
      await updateStudentProfile(user.id, editForm);
      setProfile(prev => ({ ...prev, ...editForm }));
      updateUser({ name: editForm.name });
      setEditMode(false);
      setMsg('✅ Profile updated successfully!');
    } catch (err) {
      setMsg(`❌ ${err.message || 'Update failed'}`);
    } finally { setSaving(false); }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const url = await uploadStudentPhoto(user.id, file);
      setProfile(prev => ({ ...prev, profile_photo: url }));
      setMsg('✅ Photo updated!');
    } catch { setMsg('❌ Photo upload failed'); }
  };

  const handleApply = async (college) => {
    try {
      await applyToCollege(user.id, { college_id: college.user_id || college.id, type: 'admission' });
      setMsg(`✅ Applied to ${college.college_name}`);
    } catch (err) {
      setMsg(`❌ ${err.message || 'Application failed'}`);
    }
    setTimeout(() => setMsg(''), 3000);
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
              {profile?.profile_photo
                ? <img src={profile.profile_photo} alt="Profile" className="w-full h-full object-cover" />
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
            <p className="text-slate-500 text-sm">{user?.email}</p>
            {profile?.cutoff && (
              <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
                Cutoff: {profile.cutoff}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {[['profile','👤 Profile'], ['colleges','🏛️ Colleges'], ['recommendations','🤖 Recommendations'], ['applications','📋 Applications'], ['favorites','❤️ Favorites'], ['chats', '💬 Chats']].map(([t, label]) => (
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
                    {[['Full Name','name','text'],['Phone','phone','tel']].map(([label, field, type]) => (
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
                    {[['👤 Name', profile?.name], ['📧 Email', user?.email], ['📞 Phone', profile?.phone || '—'], ['📝 Bio', profile?.bio || '—']].map(([label, val]) => (
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

            {/* College Enrollment Details */}
            <div className="glass rounded-2xl p-6 lg:col-span-2">
              <h2 className="font-heading font-bold text-slate-800 text-lg mb-5">College Enrollment Details</h2>
              <div className="space-y-4">
                {editMode ? (
                  <>
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60 shadow-2xs mb-4">
                      <input 
                        type="checkbox" 
                        id="edit_is_college_student" 
                        checked={editForm.is_college_student || false}
                        onChange={(e) => setEditForm(p => ({ ...p, is_college_student: e.target.checked }))}
                        className="w-4 h-4 text-primary focus:ring-primary rounded border-slate-300"
                      />
                      <label htmlFor="edit_is_college_student" className="text-sm font-semibold text-slate-700 select-none cursor-pointer">
                        I am currently a college student / alumnus
                      </label>
                    </div>

                    {editForm.is_college_student && (
                      <div className="space-y-4 border-l-2 border-primary/30 pl-4 my-3 animate-fade-in">
                        <div>
                          <label className="label">Select College</label>
                          <select 
                            value={editForm.college_id || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const selected = collegesList.find(c => (c.user_id || c.id) === val);
                              setEditForm(p => ({ 
                                ...p, 
                                college_id: val, 
                                college_name: val === 'other' ? '' : (selected ? selected.college_name : '') 
                              }));
                            }}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm shadow-sm"
                          >
                            <option value="">-- Select Your College --</option>
                            {collegesList.map(c => (
                              <option key={c.user_id || c.id} value={c.user_id || c.id}>{c.college_name}</option>
                            ))}
                            <option value="other">Other (Specify below)</option>
                          </select>
                        </div>

                        {(editForm.college_id === 'other' || !editForm.college_id) && (
                          <div>
                            <label className="label">Specify College Name</label>
                            <input 
                              type="text" 
                              value={editForm.college_name || ''} 
                              onChange={e => setEditForm(p => ({ ...p, college_name: e.target.value }))} 
                              placeholder="e.g. ABC Engineering College" 
                              className="input" 
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="label">Branch</label>
                            <input 
                              type="text" 
                              value={editForm.branch || ''} 
                              onChange={e => setEditForm(p => ({ ...p, branch: e.target.value }))} 
                              placeholder="e.g. Computer Science" 
                              className="input" 
                            />
                          </div>
                          <div>
                            <label className="label">Batch / Year</label>
                            <input 
                              type="text" 
                              value={editForm.batch || ''} 
                              onChange={e => setEditForm(p => ({ ...p, batch: e.target.value }))} 
                              placeholder="e.g. 2022 - 2026" 
                              className="input" 
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-slate-500 text-sm w-36 flex-shrink-0">Status:</span>
                      <span className="font-semibold text-sm">
                        {profile?.is_college_student ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            🎓 Enrolled College Student / Alumnus
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#4F46E5]/10 text-[#4F46E5] border border-[#4F46E5]/20">
                            🔎 Seeking Admission
                          </span>
                        )}
                      </span>
                    </div>

                    {profile?.is_college_student && (
                      <>
                        <div className="flex items-start gap-3 mt-2">
                          <span className="text-slate-500 text-sm w-36 flex-shrink-0">College Name:</span>
                          <span className="text-slate-800 text-sm font-semibold">{profile.college_name}</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-slate-500 text-sm w-36 flex-shrink-0">Branch:</span>
                          <span className="text-slate-800 text-sm">{profile.branch || '—'}</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-slate-500 text-sm w-36 flex-shrink-0">Batch / Year:</span>
                          <span className="text-slate-800 text-sm">{profile.batch || '—'}</span>
                        </div>
                      </>
                    )}

                    {!profile?.is_college_student && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-500 text-xs mt-2">
                        💡 Are you already in college? Click **Edit** above and check *"I am currently a college student"* to switch your profile and help upcoming seekers as an alumnus!
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Colleges Tab ──────────────────────────────── */}
        {tab === 'colleges' && (
          <div>
            <div className="flex gap-3 mb-6 flex-wrap">
              <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchColleges()} placeholder="Search by college name..." className="input max-w-sm border border-slate-200" />
              <input value={cutoffFilter} onChange={e => setCutoffFilter(e.target.value)} type="number" placeholder="Max cutoff filter" className="input max-w-[180px] border border-slate-200" />
              <button onClick={searchColleges} className="btn-primary px-5 shadow-sm">Search</button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {colleges.map(college => (
                <CollegeCard
                  key={college.user_id || college.id}
                  college={college}
                  onApply={handleApply}
                  isFavorited={!!favoritesMap[college.user_id || college.id]}
                  onToggleFavorite={() => handleToggleFavorite(college.user_id || college.id)}
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
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-slate-100 flex items-center justify-center text-xl flex-shrink-0 overflow-hidden shadow-sm">
                          <img 
                            src={item.details?.logo ? (item.details.logo.startsWith('http') ? item.details.logo : `/uploads/logos/${item.details.logo}`) : 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=300&q=80'} 
                            alt={item.details?.collegeName || item.details?.college_name || 'College'} 
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=300&q=80'; }}
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2">{item.details?.college_name}</h3>
                          <p className="text-slate-400 text-xs mt-0.5">{item.details?.city}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                      <Link to={`/colleges/${item.item_id}`} className="flex-1 text-center py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 border border-slate-200/40 text-slate-800 transition-all">
                        View Details
                      </Link>
                      <button onClick={() => handleRemoveFavorite(item.id)} className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-danger/10 text-danger hover:bg-danger/25 transition-all">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Chats Tab ─────────────────────────────────── */}
        {tab === 'chats' && (
          <div className="glass rounded-2xl overflow-hidden grid md:grid-cols-3 min-h-[500px] shadow-lg border border-slate-200/80 animate-slide-up">
            {/* Left Pane - Partners List */}
            <div className="md:col-span-1 border-r border-slate-200 bg-slate-50/50 flex flex-col">
              <div className="p-4 border-b border-slate-200 bg-white">
                <h3 className="font-heading font-bold text-slate-800">Conversations</h3>
                <p className="text-slate-400 text-xs mt-0.5">Chat with peers and alumni</p>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 scrollbar-premium">
                {activePartners.map(p => (
                  <button
                    key={p.partner_id}
                    onClick={() => setActivePartner(p)}
                    className={`w-full p-4 text-left flex items-start gap-3 transition-colors ${
                      activePartner?.partner_id === p.partner_id
                        ? 'bg-primary/5 border-l-4 border-primary'
                        : 'hover:bg-slate-100 bg-white'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                      {p.partner_name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h4 className="text-sm font-bold text-slate-800 truncate">{p.partner_name}</h4>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {p.last_message_time ? new Date(p.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 capitalize font-bold">{p.partner_role || 'Student'}</p>
                      <p className="text-xs text-slate-500 truncate mt-1">{p.last_message || 'No messages yet'}</p>
                    </div>
                  </button>
                ))}
                {activePartners.length === 0 && (
                  <div className="p-8 text-center text-slate-400 my-auto">
                    <span className="text-4xl block mb-2">💬</span>
                    <p className="text-xs font-semibold">No active chats yet.</p>
                    <p className="text-[11px] text-slate-500 mt-1">Visit a college detail page's "People" tab to start chatting with alumni!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Pane - Chat Window */}
            <div className="md:col-span-2 flex flex-col bg-white">
              {activePartner ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/30">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-white">
                      {activePartner.partner_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm leading-snug">{activePartner.partner_name}</h3>
                      <p className="text-[11px] text-slate-400 capitalize font-bold">Active {activePartner.partner_role}</p>
                    </div>
                  </div>

                  {/* Messages list */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F8FAFC]/40 scrollbar-premium flex flex-col">
                    {chatMessages.map(m => {
                      const isMe = m.sender_id === user.id;
                      return (
                        <div
                          key={m.id}
                          className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-2xs ${
                            isMe
                              ? 'bg-gradient-to-br from-[#0F172A] to-[#4F46E5] text-white self-end rounded-tr-none'
                              : 'bg-white border border-slate-200 text-slate-800 self-start rounded-tl-none'
                          }`}
                        >
                          <p className="leading-relaxed">{m.content}</p>
                          <span
                            className={`block text-[9px] mt-1 text-right ${
                              isMe ? 'text-white/70' : 'text-slate-400'
                            }`}
                          >
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })}
                    {chatMessages.length === 0 && (
                      <div className="text-center text-slate-400 my-auto py-8">
                        <p className="text-xs font-semibold">Send a message to start the conversation!</p>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMsg} className="p-4 border-t border-slate-200 flex gap-2">
                    <input
                      type="text"
                      value={newMsg}
                      onChange={e => setNewMsg(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 input border border-slate-200 px-4 py-2.5 rounded-xl text-sm"
                    />
                    <button type="submit" className="btn-primary px-5 py-2.5 rounded-xl text-sm shadow-md">
                      Send
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                  <span className="text-5xl mb-3">💬</span>
                  <p className="text-sm font-semibold">Select a conversation to start chatting</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
