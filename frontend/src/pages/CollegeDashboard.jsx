import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getCollegeProfile, updateCollegeProfile, uploadCollegeLogo,
  addCourse, deleteCourse, createPost, deletePost,
  createEvent, addPlacement, addScholarship,
  getCollegeApplications, updateAppStatus
} from '../api';

const TabBtn = ({ active, onClick, children }) => (
  <button onClick={onClick} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${active ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
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

  // Course form
  const [courseForm, setCourseForm] = useState({ course_name: '', cutoff: '', seats: '', duration: '4 Years', department: '', fee_per_year: '' });
  // Post form
  const [postForm, setPostForm] = useState({ type: 'general', title: '', description: '' });
  const [postFile, setPostFile] = useState(null);
  // Event form
  const [eventForm, setEventForm] = useState({ name: '', description: '', event_date: '', location: '', max_participants: '' });
  // Placement form
  const [placForm, setPlacForm] = useState({ year: new Date().getFullYear(), highest_package: '', average_package: '', placement_percent: '', top_recruiters: '' });
  // Scholarship form
  const [scholForm, setScholForm] = useState({ name: '', description: '', amount: '', eligibility: '' });

  useEffect(() => {
    getCollegeProfile()
      .then(r => { setProfile(r.data.college); setEditForm(r.data.college); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === 'applications') {
      getCollegeApplications().then(r => setApplications(r.data.applications || [])).catch(() => {});
    }
  }, [tab]);

  const notify = (m) => { setMsg(m); setTimeout(() => setMsg(''), 4000); };

  const saveProfile = async () => {
    setSaving(true);
    try { await updateCollegeProfile(editForm); setProfile(p => ({ ...p, ...editForm })); setEditMode(false); notify('✅ Profile updated!'); }
    catch (e) { notify(`❌ ${e.response?.data?.message || 'Failed'}`); }
    finally { setSaving(false); }
  };

  const handleLogoChange = async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const fd = new FormData(); fd.append('logo', f);
    try { const r = await uploadCollegeLogo(fd); setProfile(p => ({ ...p, logo: r.data.url })); notify('✅ Logo updated!'); }
    catch { notify('❌ Logo upload failed'); }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    try { await addCourse(courseForm); notify('✅ Course added!'); setCourseForm({ course_name: '', cutoff: '', seats: '', duration: '4 Years', department: '', fee_per_year: '' }); getCollegeProfile().then(r => setProfile(r.data.college)); }
    catch (e) { notify(`❌ ${e.response?.data?.message || 'Failed'}`); }
  };

  const handleDeleteCourse = async (id) => {
    try { await deleteCourse(id); notify('✅ Course deleted'); setProfile(p => ({ ...p, courses: p.courses.filter(c => c.id !== id) })); }
    catch { notify('❌ Delete failed'); }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(postForm).forEach(([k, v]) => fd.append(k, v));
    if (postFile) fd.append('media', postFile);
    try { await createPost(fd); notify('✅ Post published!'); setPostForm({ type: 'general', title: '', description: '' }); setPostFile(null); getCollegeProfile().then(r => setProfile(r.data.college)); }
    catch (e) { notify(`❌ ${e.response?.data?.message || 'Failed'}`); }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(eventForm).forEach(([k, v]) => fd.append(k, v));
    try { await createEvent(fd); notify('✅ Event created!'); setEventForm({ name: '', description: '', event_date: '', location: '', max_participants: '' }); getCollegeProfile().then(r => setProfile(r.data.college)); }
    catch (e) { notify(`❌ ${e.response?.data?.message || 'Failed'}`); }
  };

  const handleAddPlacement = async (e) => {
    e.preventDefault();
    try { await addPlacement(placForm); notify('✅ Placement record added!'); getCollegeProfile().then(r => setProfile(r.data.college)); }
    catch (e) { notify(`❌ ${e.response?.data?.message || 'Failed'}`); }
  };

  const handleAddScholarship = async (e) => {
    e.preventDefault();
    try { await addScholarship(scholForm); notify('✅ Scholarship added!'); getCollegeProfile().then(r => setProfile(r.data.college)); }
    catch (e) { notify(`❌ ${e.response?.data?.message || 'Failed'}`); }
  };

  const handleAppStatus = async (id, status) => {
    try { await updateAppStatus(id, status); setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a)); notify(`✅ Application ${status}`); }
    catch { notify('❌ Update failed'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-16"><div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;

  const set = (setter) => (field) => (e) => setter(p => ({ ...p, [field]: e.target.value }));
  const inp = (val, onChange, placeholder, type = 'text') => (
    <input type={type} value={val} onChange={onChange} placeholder={placeholder} className="input" />
  );

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-5 mb-8">
          <label className="relative cursor-pointer">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
              {profile?.logo ? <img src={profile.logo} className="w-full h-full object-cover" alt="Logo" /> : <span className="text-2xl">🏛️</span>}
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-all rounded-2xl"><span className="text-white text-xs">📷</span></div>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
          </label>
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">{profile?.college_name}</h1>
            <p className="text-slate-400 text-sm">{profile?.city}, {profile?.state}</p>
            {profile?.accreditation && <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">{profile.accreditation}</span>}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[['profile','⚙️ Profile'],['courses','📚 Courses'],['posts','📢 Posts'],['events','🎪 Events'],['placements','💼 Placements'],['scholarships','🎖️ Scholarships'],['applications','📋 Applications']].map(([t, l]) => (
            <TabBtn key={t} active={tab === t} onClick={() => setTab(t)}>{l}</TabBtn>
          ))}
        </div>

        {msg && <div className={`mb-4 p-3 rounded-xl text-sm text-center ${msg.startsWith('✅') ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>{msg}</div>}

        {/* ── PROFILE ── */}
        {tab === 'profile' && (
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-bold text-white text-lg">College Profile</h2>
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
                {[['🏛️ College','college_name'],['📍 City','city'],['🗺️ State','state'],['📧 Email','email'],['📞 Phone','phone'],['🌐 Website','website'],['🏆 Accreditation','accreditation']].map(([label, field]) => (
                  <div key={field} className="flex gap-3">
                    <span className="text-slate-500 text-sm w-36 flex-shrink-0">{label}</span>
                    <span className="text-white text-sm break-all">{profile?.[field] || '—'}</span>
                  </div>
                ))}
                <div className="md:col-span-2 flex gap-3"><span className="text-slate-500 text-sm w-36 flex-shrink-0">📝 Description</span><span className="text-white text-sm">{profile?.description || '—'}</span></div>
              </div>
            )}
          </div>
        )}

        {/* ── COURSES ── */}
        {tab === 'courses' && (
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <h2 className="font-heading font-bold text-white text-lg mb-5">Add Course</h2>
              <form onSubmit={handleAddCourse} className="grid md:grid-cols-2 gap-4">
                {[['Course Name','course_name','text',true],['Cutoff (out of 200)','cutoff','number',true],['Seats','seats','number',false],['Duration','duration','text',false],['Department','department','text',false],['Fee/Year (₹)','fee_per_year','number',false]].map(([label, field, type, req]) => (
                  <div key={field}><label className="label">{label}{req && <span className="text-red-400">*</span>}</label><input type={type} className="input" value={courseForm[field]} onChange={e => setCourseForm(p => ({ ...p, [field]: e.target.value }))} required={req} /></div>
                ))}
                <div className="md:col-span-2"><button type="submit" className="btn-primary px-8 py-2.5">➕ Add Course</button></div>
              </form>
            </div>
            <div className="glass rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-white/10 bg-white/5">
                  <tr>{['Course','Dept','Cutoff','Seats','Fee/Year',''].map(h => <th key={h} className="text-left text-slate-400 font-medium px-4 py-3">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {profile?.courses?.map(c => (
                    <tr key={c.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-white font-medium">{c.course_name}</td>
                      <td className="px-4 py-3 text-slate-400">{c.department || '—'}</td>
                      <td className="px-4 py-3 text-indigo-300 font-bold">{c.cutoff}</td>
                      <td className="px-4 py-3 text-slate-300">{c.seats || '—'}</td>
                      <td className="px-4 py-3 text-slate-300">{c.fee_per_year ? `₹${Number(c.fee_per_year).toLocaleString()}` : '—'}</td>
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
              <h2 className="font-heading font-bold text-white text-lg mb-5">Create Post</h2>
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
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 capitalize">{p.type}</span>
                      <h3 className="font-semibold text-white mt-2">{p.title}</h3>
                      {p.description && <p className="text-slate-400 text-sm mt-1 line-clamp-2">{p.description}</p>}
                      {p.media_url && p.media_type === 'image' && <img src={`/uploads/media/${p.media_url}`} className="mt-2 rounded-lg h-28 object-cover w-full" alt={p.title} />}
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
              <h2 className="font-heading font-bold text-white text-lg mb-5">Create Event</h2>
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
                  <h3 className="font-semibold text-white">{ev.name}</h3>
                  <div className="flex gap-4 mt-2 text-xs text-slate-400">
                    <span>📅 {new Date(ev.event_date).toLocaleDateString()}</span>
                    {ev.location && <span>📍 {ev.location}</span>}
                    {ev.max_participants && <span>👥 {ev.max_participants} max</span>}
                  </div>
                  {ev.description && <p className="text-slate-400 text-sm mt-2 line-clamp-2">{ev.description}</p>}
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
              <h2 className="font-heading font-bold text-white text-lg mb-5">Add Placement Record</h2>
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
                    <span className="font-heading font-bold text-white text-lg">{pl.year}</span>
                    <span className="text-emerald-400 font-semibold">{pl.placement_percent}% placed</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="glass rounded-lg p-3 text-center"><p className="text-xs text-slate-500">Highest</p><p className="text-indigo-300 font-bold">{pl.highest_package} LPA</p></div>
                    <div className="glass rounded-lg p-3 text-center"><p className="text-xs text-slate-500">Average</p><p className="text-purple-300 font-bold">{pl.average_package} LPA</p></div>
                  </div>
                  {pl.top_recruiters && <p className="text-slate-400 text-xs mt-3">🏢 {pl.top_recruiters}</p>}
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
              <h2 className="font-heading font-bold text-white text-lg mb-5">Add Scholarship</h2>
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
                <div key={s.id} className="glass rounded-xl p-4 border border-amber-500/15">
                  <h3 className="font-semibold text-white">{s.name}</h3>
                  {s.amount && <p className="text-amber-400 font-bold mt-1">₹{Number(s.amount).toLocaleString()}/year</p>}
                  {s.eligibility && <p className="text-slate-400 text-xs mt-2">{s.eligibility}</p>}
                </div>
              ))}
              {!profile?.scholarships?.length && <p className="text-slate-500 col-span-2 text-center py-10">No scholarships added yet</p>}
            </div>
          </div>
        )}

        {/* ── APPLICATIONS ── */}
        {tab === 'applications' && (
          <div>
            <h2 className="font-heading font-bold text-white text-xl mb-5">Student Applications ({applications.length})</h2>
            {applications.length === 0 ? (
              <div className="glass rounded-2xl p-10 text-center text-slate-400"><span className="text-4xl block mb-3">📋</span>No applications yet</div>
            ) : (
              <div className="space-y-3">
                {applications.map(app => (
                  <div key={app.id} className="glass rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-white">{app.student_name}</h3>
                      <p className="text-slate-400 text-sm">{app.student_email} · {app.student_phone}</p>
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
