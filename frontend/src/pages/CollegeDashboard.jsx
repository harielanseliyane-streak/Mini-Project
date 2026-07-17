import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getCollegeProfile, updateCollegeProfile, uploadCollegeLogo,
  addCourse, deleteCourse, createPost, deletePost,
  createEvent, addPlacement, addScholarship,
  getCollegeApplications, updateAppStatus,
  getCollegeCampusBuddyRequests, approveCampusBuddyRequest, rejectCampusBuddyRequest,
} from '../api';

const TabBtn = ({ active, onClick, children }) => (
  <button onClick={onClick} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${active ? 'bg-primary/20 text-primary border border-primary/30' : 'text-slate-500 hover:text-primary hover:bg-slate-100'}`}>
    {children}
  </button>
);

const CollegeDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [applications, setApplications] = useState([]);
  const [msg, setMsg] = useState('');

  const [courseForm, setCourseForm] = useState({ course_name: '', cutoff: '', seats: '', duration: '4 Years', department: '', fee_per_year: '' });
  const [postForm, setPostForm] = useState({ type: 'general', title: '', description: '' });
  const [postFile, setPostFile] = useState(null);
  const [eventForm, setEventForm] = useState({ name: '', description: '', event_date: '', location: '', max_participants: '' });
  const [placForm, setPlacForm] = useState({ year: new Date().getFullYear(), highest_package: '', average_package: '', placement_percent: '', top_recruiters: '' });
  const [scholForm, setScholForm] = useState({ name: '', description: '', amount: '', eligibility: '' });

  // Campus Buddy state
  const [buddyRequests,  setBuddyRequests]  = useState([]);
  const [buddyLoading,   setBuddyLoading]   = useState(false);
  const [rejectModal,    setRejectModal]    = useState(null);  // { id, name }
  const [rejectReason,   setRejectReason]   = useState('');
  const [customReason,   setCustomReason]   = useState('');
  const REJECT_REASONS = ['Invalid ID Card','Incorrect Roll Number','Student Not Found','Expired ID Card','Blurry / Unreadable ID Card','Other'];

  const loadProfile = () => {
    if (!user?.id) return;
    getCollegeProfile(user.id)
      .then(p => { setProfile(p); setEditForm(p); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const loadBuddyRequests = () => {
    if (!user?.id) return;
    setBuddyLoading(true);
    getCollegeCampusBuddyRequests(user.id)
      .then(setBuddyRequests)
      .catch(() => {})
      .finally(() => setBuddyLoading(false));
  };

  useEffect(() => { loadProfile(); }, [user?.id]);

  useEffect(() => {
    if (tab === 'applications' && user?.id) {
      getCollegeApplications(user.id)
        .then(apps => setApplications(apps))
        .catch(() => {});
    }
    if (tab === 'buddy' && user?.id) {
      loadBuddyRequests();
    }
  }, [tab, user?.id]);

  const notify = (m) => { setMsg(m); setTimeout(() => setMsg(''), 4000); };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await updateCollegeProfile(user.id, editForm);
      setProfile(p => ({ ...p, ...editForm }));
      setEditMode(false);
      notify('✅ Profile updated!');
    } catch (e) { notify(`❌ ${e.message || 'Failed'}`); }
    finally { setSaving(false); }
  };

  const handleLogoChange = async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    try {
      const url = await uploadCollegeLogo(user.id, f);
      setProfile(p => ({ ...p, logo: url }));
      notify('✅ Logo updated!');
    } catch { notify('❌ Logo upload failed'); }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      await addCourse(user.id, { ...courseForm, cutoff: parseFloat(courseForm.cutoff), seats: parseInt(courseForm.seats) || null, fee_per_year: parseFloat(courseForm.fee_per_year) || null });
      notify('✅ Course added!');
      setCourseForm({ course_name: '', cutoff: '', seats: '', duration: '4 Years', department: '', fee_per_year: '' });
      loadProfile();
    } catch (e) { notify(`❌ ${e.message || 'Failed'}`); }
  };

  const handleDeleteCourse = async (id) => {
    try {
      await deleteCourse(id);
      notify('✅ Course deleted');
      setProfile(p => ({ ...p, courses: p.courses.filter(c => c.id !== id) }));
    } catch { notify('❌ Delete failed'); }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      await createPost(user.id, postForm, postFile || null);
      notify('✅ Post published!');
      setPostForm({ type: 'general', title: '', description: '' });
      setPostFile(null);
      loadProfile();
    } catch (e) { notify(`❌ ${e.message || 'Failed'}`); }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await createEvent(user.id, eventForm);
      notify('✅ Event created!');
      setEventForm({ name: '', description: '', event_date: '', location: '', max_participants: '' });
      loadProfile();
    } catch (e) { notify(`❌ ${e.message || 'Failed'}`); }
  };

  const handleAddPlacement = async (e) => {
    e.preventDefault();
    try {
      await addPlacement(user.id, { ...placForm, year: parseInt(placForm.year) });
      notify('✅ Placement record added!');
      loadProfile();
    } catch (e) { notify(`❌ ${e.message || 'Failed'}`); }
  };

  const handleAddScholarship = async (e) => {
    e.preventDefault();
    try {
      await addScholarship(user.id, { ...scholForm, amount: parseFloat(scholForm.amount) || null });
      notify('✅ Scholarship added!');
      loadProfile();
    } catch (e) { notify(`❌ ${e.message || 'Failed'}`); }
  };

  const handleAppStatus = async (id, status) => {
    try {
      await updateAppStatus(id, status);
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      notify(`✅ Application ${status}`);
    } catch { notify('❌ Update failed'); }
  };

  const handleBuddyApprove = async (id) => {
    try {
      await approveCampusBuddyRequest(id);
      setBuddyRequests(prev => prev.map(r => r.id === id ? { ...r, verification_status: 'approved' } : r));
      notify('✅ Campus Buddy approved! Student has been notified.');
    } catch { notify('❌ Approval failed'); }
  };

  const handleBuddyReject = async () => {
    if (!rejectModal) return;
    const reason = rejectReason === 'Other' ? customReason : rejectReason;
    if (!reason.trim()) { notify('❌ Please select or enter a rejection reason'); return; }
    try {
      await rejectCampusBuddyRequest(rejectModal.id, reason);
      setBuddyRequests(prev => prev.map(r => r.id === rejectModal.id ? { ...r, verification_status: 'rejected', rejection_reason: reason } : r));
      notify('✅ Request rejected. Student has been notified.');
      setRejectModal(null); setRejectReason(''); setCustomReason('');
    } catch { notify('❌ Rejection failed'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-16"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-5 mb-8">
          <label className="relative cursor-pointer">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
              {profile?.logo ? <img src={profile.logo} className="w-full h-full object-cover" alt="Logo" /> : <span className="text-2xl">🏛️</span>}
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-all rounded-2xl"><span className="text-white text-xs">📷</span></div>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
          </label>
          <div>
            <h1 className="font-heading text-2xl font-bold text-slate-800">{profile?.college_name}</h1>
            <p className="text-slate-500 text-sm">{profile?.city}, {profile?.state}</p>
            {profile?.accreditation && <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">{profile.accreditation}</span>}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            ['profile','⚙️ Profile'],
            ['courses','📚 Courses'],
            ['posts','📢 Posts'],
            ['events','🎪 Events'],
            ['placements','💼 Placements'],
            ['scholarships','🎖️ Scholarships'],
            ['applications','📋 Applications'],
          ].map(([t, l]) => (
            <TabBtn key={t} active={tab === t} onClick={() => setTab(t)}>{l}</TabBtn>
          ))}
          {/* Campus Buddy tab with live count badge */}
          <button
            onClick={() => setTab('buddy')}
            className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === 'buddy' ? 'bg-indigo-100 text-indigo-600 border border-indigo-300' : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100'
            }`}
          >
            🏅 Campus Buddy Requests
            {buddyRequests.filter(r => r.verification_status === 'pending').length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {buddyRequests.filter(r => r.verification_status === 'pending').length}
              </span>
            )}
          </button>
        </div>

        {msg && <div className={`mb-4 p-3 rounded-xl text-sm text-center ${msg.startsWith('✅') ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>{msg}</div>}

        {/* ── PROFILE ── */}
        {tab === 'profile' && (
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-bold text-slate-800 text-lg">College Profile</h2>
              <button onClick={() => setEditMode(m => !m)} className={editMode ? 'btn-danger text-sm px-3 py-1.5' : 'btn-secondary text-sm px-3 py-1.5'}>{editMode ? 'Cancel' : '✏️ Edit'}</button>
            </div>
            {editMode ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[['College Name','college_name'],['City','city'],['State','state'],['Phone','phone'],['Website','website'],['Accreditation','accreditation']].map(([label, field]) => (
                  <div key={field}><label className="label">{label}</label><input className="input" value={editForm[field] || ''} onChange={e => setEditForm(p => ({ ...p, [field]: e.target.value }))} /></div>
                ))}
                <div className="md:col-span-2"><label className="label">Address</label><input className="input" value={editForm.address || ''} onChange={e => setEditForm(p => ({ ...p, address: e.target.value }))} /></div>
                <div className="md:col-span-2"><label className="label">Description</label><textarea className="input resize-none" rows={3} value={editForm.description || ''} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} /></div>
                <div className="md:col-span-2"><button onClick={saveProfile} disabled={saving} className="btn-primary w-full py-3">{saving ? 'Saving...' : '💾 Save Changes'}</button></div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                {[['🏛️ College','college_name'],['📍 City','city'],['🗺️ State','state'],['📞 Phone','phone'],['🌐 Website','website'],['🏆 Accreditation','accreditation']].map(([label, field]) => (
                  <div key={field} className="flex gap-3">
                    <span className="text-slate-500 text-sm w-36 flex-shrink-0">{label}</span>
                    <span className="text-slate-800 text-sm break-all">{profile?.[field] || '—'}</span>
                  </div>
                ))}
                <div className="md:col-span-2 flex gap-3"><span className="text-slate-500 text-sm w-36 flex-shrink-0">📝 Description</span><span className="text-slate-800 text-sm">{profile?.description || '—'}</span></div>
              </div>
            )}
          </div>
        )}

        {/* ── COURSES ── */}
        {tab === 'courses' && (
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <h2 className="font-heading font-bold text-slate-800 text-lg mb-5">Add Course</h2>
              <form onSubmit={handleAddCourse} className="grid md:grid-cols-2 gap-4">
                {[['Course Name','course_name','text',true],['Cutoff (out of 200)','cutoff','number',true],['Seats','seats','number',false],['Duration','duration','text',false],['Department','department','text',false],['Fee/Year (₹)','fee_per_year','number',false]].map(([label, field, type, req]) => (
                  <div key={field}><label className="label">{label}{req && <span className="text-red-400">*</span>}</label><input type={type} className="input" value={courseForm[field]} onChange={e => setCourseForm(p => ({ ...p, [field]: e.target.value }))} required={req} /></div>
                ))}
                <div className="md:col-span-2"><button type="submit" className="btn-primary px-8 py-2.5">➕ Add Course</button></div>
              </form>
            </div>
            <div className="glass rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>{['Course','Dept','Cutoff','Seats','Fee/Year',''].map(h => <th key={h} className="text-left text-slate-500 font-medium px-4 py-3">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {profile?.courses?.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-800 font-medium">{c.course_name}</td>
                      <td className="px-4 py-3 text-slate-500">{c.department || '—'}</td>
                      <td className="px-4 py-3 text-primary font-bold">{c.cutoff}</td>
                      <td className="px-4 py-3 text-slate-600">{c.seats || '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{c.fee_per_year ? `₹${Number(c.fee_per_year).toLocaleString()}` : '—'}</td>
                      <td className="px-4 py-3"><button onClick={() => handleDeleteCourse(c.id)} className="text-red-400 hover:text-red-300 transition-colors">🗑️</button></td>
                    </tr>
                  ))}
                  {!profile?.courses?.length && <tr><td colSpan={6} className="px-4 py-8 text-slate-500 text-center">No courses added yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── POSTS ── */}
        {tab === 'posts' && (
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <h2 className="font-heading font-bold text-slate-800 text-lg mb-5">Create Post</h2>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Post Type</label>
                    <select className="input" value={postForm.type} onChange={e => setPostForm(p => ({ ...p, type: e.target.value }))}>
                      {['general','course','event','placement','infrastructure'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                    </select>
                  </div>
                  <div><label className="label">Title <span className="text-red-400">*</span></label><input required className="input" value={postForm.title} onChange={e => setPostForm(p => ({ ...p, title: e.target.value }))} /></div>
                </div>
                <div><label className="label">Description</label><textarea className="input resize-none" rows={3} value={postForm.description} onChange={e => setPostForm(p => ({ ...p, description: e.target.value }))} /></div>
                <div><label className="label">Media (Image/Video)</label><input type="file" accept="image/*,video/*" className="input py-2" onChange={e => setPostFile(e.target.files?.[0])} /></div>
                <button type="submit" className="btn-primary px-8 py-2.5">📢 Publish Post</button>
              </form>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {profile?.posts?.map(p => (
                <div key={p.id} className="glass rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20 capitalize">{p.type}</span>
                      <h3 className="font-semibold text-slate-800 mt-2">{p.title}</h3>
                      {p.description && <p className="text-slate-400 text-sm mt-1 line-clamp-2">{p.description}</p>}
                      {p.media_url && p.media_type === 'image' && <img src={p.media_url} className="mt-2 rounded-lg h-28 object-cover w-full" alt={p.title} />}
                    </div>
                    <button onClick={() => deletePost(p.id).then(() => setProfile(pr => ({ ...pr, posts: pr.posts.filter(x => x.id !== p.id) })))} className="text-red-400 hover:text-red-300 ml-2">🗑️</button>
                  </div>
                  <p className="text-slate-500 text-xs mt-2">{new Date(p.created_at).toLocaleDateString()}</p>
                </div>
              ))}
              {!profile?.posts?.length && <p className="text-slate-500 col-span-2 text-center py-10">No posts yet</p>}
            </div>
          </div>
        )}

        {/* ── EVENTS ── */}
        {tab === 'events' && (
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <h2 className="font-heading font-bold text-slate-800 text-lg mb-5">Create Event</h2>
              <form onSubmit={handleCreateEvent} className="grid md:grid-cols-2 gap-4">
                {[['Event Name','name','text',true],['Date','event_date','date',true],['Location','location','text',false],['Max Participants','max_participants','number',false]].map(([label, field, type, req]) => (
                  <div key={field}><label className="label">{label}{req && <span className="text-red-400">*</span>}</label><input type={type} required={req} className="input" value={eventForm[field]} onChange={e => setEventForm(p => ({ ...p, [field]: e.target.value }))} /></div>
                ))}
                <div className="md:col-span-2"><label className="label">Description</label><textarea className="input resize-none" rows={2} value={eventForm.description} onChange={e => setEventForm(p => ({ ...p, description: e.target.value }))} /></div>
                <div><button type="submit" className="btn-primary px-8 py-2.5">🎪 Create Event</button></div>
              </form>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {profile?.events?.map(ev => (
                <div key={ev.id} className="glass rounded-xl p-4">
                  <h3 className="font-semibold text-slate-800">{ev.name}</h3>
                  <div className="flex gap-4 mt-2 text-xs text-slate-500">
                    <span>📅 {new Date(ev.event_date).toLocaleDateString()}</span>
                    {ev.location && <span>📍 {ev.location}</span>}
                    {ev.max_participants && <span>👥 {ev.max_participants} max</span>}
                  </div>
                  {ev.description && <p className="text-slate-500 text-sm mt-2 line-clamp-2">{ev.description}</p>}
                </div>
              ))}
              {!profile?.events?.length && <p className="text-slate-500 col-span-2 text-center py-10">No events yet</p>}
            </div>
          </div>
        )}

        {/* ── PLACEMENTS ── */}
        {tab === 'placements' && (
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <h2 className="font-heading font-bold text-slate-800 text-lg mb-5">Add Placement Record</h2>
              <form onSubmit={handleAddPlacement} className="grid md:grid-cols-2 gap-4">
                {[['Year','year','number'],['Highest Package (LPA)','highest_package','number'],['Average Package (LPA)','average_package','number'],['Placement %','placement_percent','number']].map(([label, field, type]) => (
                  <div key={field}><label className="label">{label}</label><input type={type} className="input" value={placForm[field]} onChange={e => setPlacForm(p => ({ ...p, [field]: e.target.value }))} /></div>
                ))}
                <div className="md:col-span-2"><label className="label">Top Recruiters (comma-separated)</label><input className="input" value={placForm.top_recruiters} onChange={e => setPlacForm(p => ({ ...p, top_recruiters: e.target.value }))} placeholder="Google, Microsoft, Zoho" /></div>
                <div><button type="submit" className="btn-primary px-8 py-2.5">💼 Add Record</button></div>
              </form>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {profile?.placements?.map(pl => (
                <div key={pl.id} className="glass rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-heading font-bold text-slate-800 text-lg">{pl.year}</span>
                    <span className="text-emerald-500 font-semibold">{pl.placement_percent}% placed</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="glass rounded-lg p-3 text-center"><p className="text-xs text-slate-500">Highest</p><p className="text-primary font-bold">{pl.highest_package} LPA</p></div>
                    <div className="glass rounded-lg p-3 text-center"><p className="text-xs text-slate-500">Average</p><p className="text-secondary font-bold">{pl.average_package} LPA</p></div>
                  </div>
                  {pl.top_recruiters && <p className="text-slate-500 text-xs mt-3">🏢 {pl.top_recruiters}</p>}
                </div>
              ))}
              {!profile?.placements?.length && <p className="text-slate-500 col-span-2 text-center py-10">No placement records yet</p>}
            </div>
          </div>
        )}

        {/* ── SCHOLARSHIPS ── */}
        {tab === 'scholarships' && (
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <h2 className="font-heading font-bold text-slate-800 text-lg mb-5">Add Scholarship</h2>
              <form onSubmit={handleAddScholarship} className="grid md:grid-cols-2 gap-4">
                {[['Name','name',true],['Amount (₹)','amount',false]].map(([label, field, req]) => (
                  <div key={field}><label className="label">{label}{req && <span className="text-red-400">*</span>}</label><input required={req} className="input" value={scholForm[field]} onChange={e => setScholForm(p => ({ ...p, [field]: e.target.value }))} /></div>
                ))}
                <div className="md:col-span-2"><label className="label">Eligibility Criteria</label><textarea className="input resize-none" rows={2} value={scholForm.eligibility} onChange={e => setScholForm(p => ({ ...p, eligibility: e.target.value }))} /></div>
                <div className="md:col-span-2"><label className="label">Description</label><textarea className="input resize-none" rows={2} value={scholForm.description} onChange={e => setScholForm(p => ({ ...p, description: e.target.value }))} /></div>
                <div><button type="submit" className="btn-primary px-8 py-2.5">🎖️ Add Scholarship</button></div>
              </form>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {profile?.scholarships?.map(s => (
                <div key={s.id} className="glass rounded-xl p-4 border border-slate-200">
                  <h3 className="font-semibold text-slate-800">{s.name}</h3>
                  {s.amount && <p className="text-secondary font-bold mt-1">₹{Number(s.amount).toLocaleString()}/year</p>}
                  {s.eligibility && <p className="text-slate-500 text-xs mt-2">{s.eligibility}</p>}
                </div>
              ))}
              {!profile?.scholarships?.length && <p className="text-slate-500 col-span-2 text-center py-10">No scholarships added yet</p>}
            </div>
          </div>
        )}

        {/* ── CAMPUS BUDDY REQUESTS ── */}
        {tab === 'buddy' && (
          <div>
            {/* Reject Modal */}
            {rejectModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 animate-slide-up">
                  <h3 className="font-bold text-slate-800 mb-1">Reject: {rejectModal.name}</h3>
                  <p className="text-xs text-slate-400 mb-4">Select or enter the reason for rejection. The student will be notified.</p>
                  <div className="space-y-2 mb-4">
                    {REJECT_REASONS.map(r => (
                      <button key={r} onClick={() => setRejectReason(r)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm border transition-all ${
                          rejectReason === r ? 'bg-red-50 border-red-300 text-red-700 font-semibold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}>{r}</button>
                    ))}
                    {rejectReason === 'Other' && (
                      <input
                        value={customReason}
                        onChange={e => setCustomReason(e.target.value)}
                        placeholder="Enter custom rejection reason..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
                      />
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setRejectModal(null); setRejectReason(''); setCustomReason(''); }}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50">Cancel</button>
                    <button onClick={handleBuddyReject}
                      className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors">Reject</button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-bold text-slate-800 text-xl">
                Campus Buddy Requests ({buddyRequests.length})
              </h2>
              <div className="flex gap-2 text-xs">
                {[['pending','🟡 Pending'],['approved','🟢 Approved'],['rejected','🔴 Rejected']].map(([s,l]) => (
                  <span key={s} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-semibold">
                    {l}: {buddyRequests.filter(r => r.verification_status === s).length}
                  </span>
                ))}
              </div>
            </div>

            {buddyLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : buddyRequests.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <span className="text-4xl block mb-3">🏅</span>
                <p className="text-slate-500 font-semibold">No Campus Buddy requests yet</p>
                <p className="text-slate-400 text-xs mt-1">When students from your college apply, they'll appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {buddyRequests.map(req => {
                  const statusCfg = {
                    pending:  { dot: 'bg-amber-400 animate-pulse', badge: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Pending' },
                    approved: { dot: 'bg-emerald-400', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Approved' },
                    rejected: { dot: 'bg-red-400', badge: 'bg-red-100 text-red-700 border-red-200', label: 'Rejected' },
                  }[req.verification_status] || {};

                  return (
                    <div key={req.id} className="glass rounded-2xl p-5 border border-slate-200">
                      {/* Header row */}
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {(req.profiles?.name || 'S')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{req.profiles?.name || '—'}</p>
                            <p className="text-slate-400 text-xs">{req.profiles?.email}</p>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${statusCfg.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                          {statusCfg.label}
                        </div>
                      </div>

                      {/* Details grid */}
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-4 text-xs border-t border-slate-100 pt-3">
                        {[['📚 Dept', req.department],['📅 Year', req.year],['🔢 Roll', req.roll_number],['✉️ Email', req.college_email],['🕐 Applied', new Date(req.created_at).toLocaleDateString('en-IN')]].map(([label, val]) => (
                          <div key={label} className="flex gap-1.5">
                            <span className="text-slate-400 flex-shrink-0">{label}:</span>
                            <span className="font-semibold text-slate-700 truncate">{val || '—'}</span>
                          </div>
                        ))}
                        {req.rejection_reason && (
                          <div className="col-span-2 flex gap-1.5">
                            <span className="text-red-400 flex-shrink-0">⚠️ Reason:</span>
                            <span className="font-semibold text-red-600">{req.rejection_reason}</span>
                          </div>
                        )}
                      </div>

                      {/* Action row */}
                      <div className="flex flex-wrap gap-2 items-center border-t border-slate-100 pt-3">
                        {req.student_id_url && (
                          <a href={req.student_id_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all">
                            🪪 View ID Card
                          </a>
                        )}
                        {req.verification_status === 'pending' && (
                          <>
                            <button onClick={() => handleBuddyApprove(req.id)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-sm">
                              ✅ Accept
                            </button>
                            <button onClick={() => { setRejectModal({ id: req.id, name: req.profiles?.name || 'Student' }); setRejectReason(''); }}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-600 text-white transition-all shadow-sm">
                              ❌ Reject
                            </button>
                          </>
                        )}
                        {req.why_buddy && (
                          <details className="w-full mt-1">
                            <summary className="text-[11px] text-indigo-500 font-semibold cursor-pointer hover:text-indigo-700">Why Campus Buddy? →</summary>
                            <p className="mt-1.5 text-xs text-slate-600 bg-indigo-50 rounded-xl p-3 border border-indigo-100 leading-relaxed">{req.why_buddy}</p>
                          </details>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}


        {/* ── APPLICATIONS ── */}
        {tab === 'applications' && (
          <div>
            <h2 className="font-heading font-bold text-slate-800 text-xl mb-5">Student Applications ({applications.length})</h2>
            {applications.length === 0 ? (
              <div className="glass rounded-2xl p-10 text-center text-slate-450"><span className="text-4xl block mb-3">📋</span>No applications yet</div>
            ) : (
              <div className="space-y-3">
                {applications.map(app => (
                  <div key={app.id} className="glass rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-800">{app.student_name}</h3>
                      <p className="text-slate-500 text-sm">{app.student_phone}</p>
                      <div className="flex gap-4 mt-1.5 text-xs text-slate-500">
                        <span>📚 {app.course_name || 'General'}</span>
                        {app.hsc_marks && <span>HSC: {app.hsc_marks}%</span>}
                        {app.cutoff && <span>Cutoff: {app.cutoff}</span>}
                        <span>🕐 {new Date(app.applied_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`badge-${app.status}`}>{app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span>
                      {app.status === 'pending' && (
                        <>
                          <button onClick={() => handleAppStatus(app.id, 'accepted')} className="btn-success text-xs px-3 py-1.5">✅ Accept</button>
                          <button onClick={() => handleAppStatus(app.id, 'rejected')} className="btn-danger text-xs px-3 py-1.5">❌ Reject</button>
                        </>
                      )}
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

export default CollegeDashboard;
