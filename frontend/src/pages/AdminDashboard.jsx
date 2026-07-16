import { useState, useEffect } from 'react';
import { getAdminStats, getAdminStudents, getAdminColleges, broadcastNotification, addCollegeByAdmin } from '../api';
import { Users, GraduationCap, School, ShieldAlert, FileText, Send, Calendar, Award, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const TabBtn = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
      active ? 'bg-primary/20 text-primary border border-primary/30 shadow-sm'
             : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
    }`}
  >
    {children}
  </button>
);

const AdminDashboard = () => {
  const [tab, setTab] = useState('users');
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '' });
  const [collegeForm, setCollegeForm] = useState({
    college_name: '', email: '', password: '', phone: '',
    established: '', accreditation: '', city: '', state: '',
    website: '', address: '', description: '',
  });
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    getAdminStats()
      .then(s => setStats(s))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === 'users') {
      getAdminStudents().then(s => setStudents(s)).catch(() => {});
      getAdminColleges().then(c => setColleges(c)).catch(() => {});
    }
  }, [tab]);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) return;
    setBtnLoading(true);
    setMsg({ text: '', type: '' });
    try {
      await broadcastNotification(broadcastForm);
      setMsg({ text: '✅ Announcement broadcasted successfully to all users!', type: 'success' });
      setBroadcastForm({ title: '', message: '' });
    } catch {
      setMsg({ text: '❌ Failed to broadcast notification.', type: 'danger' });
    } finally {
      setBtnLoading(false);
    }
  };

  const handleCreateCollege = async (e) => {
    e.preventDefault();
    if (!collegeForm.college_name || !collegeForm.email || !collegeForm.password) return;
    setBtnLoading(true);
    setMsg({ text: '', type: '' });
    try {
      await addCollegeByAdmin(collegeForm);
      setMsg({ text: `✅ College "${collegeForm.college_name}" added successfully!`, type: 'success' });
      setCollegeForm({ college_name: '', email: '', password: '', phone: '', established: '', accreditation: '', city: '', state: '', website: '', address: '', description: '' });
      getAdminStats().then(s => setStats(s)).catch(() => {});
      getAdminColleges().then(c => setColleges(c)).catch(() => {});
    } catch (err) {
      setMsg({ text: `❌ Failed to create college: ${err.message}`, type: 'danger' });
    } finally {
      setBtnLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 bg-transparent">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-500 font-semibold">Loading administration console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto bg-transparent">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary/15 to-primary/15 border border-primary/20 flex items-center justify-center text-primary">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-slate-800 animate-slide-up">Super Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5 font-semibold">Control center and moderation panel</p>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Students', value: stats.students, icon: GraduationCap, color: 'text-primary' },
            { label: 'Colleges', value: stats.colleges, icon: School, color: 'text-secondary' },
            { label: 'Applications', value: stats.applications, icon: FileText, color: 'text-purple' },
            { label: 'Events', value: stats.events, icon: Calendar, color: 'text-success' },
            { label: 'Scholarships', value: stats.scholarships, icon: Award, color: 'text-warning' },
            { label: 'Internships', value: stats.internships, icon: Users, color: 'text-danger' },
          ].map((item, idx) => (
            <div key={idx} className="card-premium p-4 text-center border border-slate-200 shadow-sm">
              <div className={`inline-flex p-2 rounded-xl bg-slate-50 border border-slate-100 ${item.color} mb-2`}>
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold font-mono text-slate-800 leading-none mb-1">{item.value}</h3>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-slate-200 pb-4 overflow-x-auto">
        <TabBtn active={tab === 'users'}       onClick={() => setTab('users')}>👤 Users Directories</TabBtn>
        <TabBtn active={tab === 'add-college'} onClick={() => setTab('add-college')}>🏛️ Add College</TabBtn>
        <TabBtn active={tab === 'broadcast'}   onClick={() => setTab('broadcast')}>📢 Broadcast Alert</TabBtn>
      </div>

      {msg.text && (
        <div className={`mb-6 p-4 rounded-xl text-sm border text-center ${
          msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-red-500/10 border-red-500/20 text-red-600'
        }`}>
          {msg.text}
        </div>
      )}

      {/* Tab Content */}
      <div className="space-y-8">
        {tab === 'users' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Students */}
            <div className="card-premium p-6 border border-slate-200">
              <h2 className="font-heading text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" /> Active Students ({students.length})
              </h2>
              <div className="overflow-y-auto max-h-[400px] scrollbar-premium pr-2 space-y-3">
                {students.map(s => (
                  <div key={s.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{s.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 font-semibold">{s.phone || 'No phone'}</p>
                    </div>
                    {s.cutoff && (
                      <span className="text-xs font-mono font-bold bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-lg">
                        Cutoff: {s.cutoff}
                      </span>
                    )}
                  </div>
                ))}
                {students.length === 0 && <p className="text-xs text-slate-400 text-center py-8">No registered students yet.</p>}
              </div>
            </div>

            {/* Colleges */}
            <div className="card-premium p-6 border border-slate-200">
              <h2 className="font-heading text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <School className="w-5 h-5 text-secondary" /> Registered Colleges ({colleges.length})
              </h2>
              <div className="overflow-y-auto max-h-[400px] scrollbar-premium pr-2 space-y-3">
                {colleges.map(c => (
                  <div key={c.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{c.college_name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 font-semibold">{c.city || 'No Location'}</p>
                    </div>
                    {c.accreditation && (
                      <span className="text-xs font-mono font-bold bg-secondary/10 border border-secondary/20 text-secondary px-2.5 py-1 rounded-lg">
                        {c.accreditation}
                      </span>
                    )}
                  </div>
                ))}
                {colleges.length === 0 && <p className="text-xs text-slate-400 text-center py-8">No registered colleges yet.</p>}
              </div>
            </div>
          </div>
        )}

        {/* Add College Form */}
        {tab === 'add-college' && (
          <div className="max-w-3xl mx-auto card-premium p-8 border border-slate-200">
            <h2 className="font-heading text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-primary" /> Create College Profile
            </h2>
            <form onSubmit={handleCreateCollege} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  ['College Name *', 'college_name', 'text', true],
                  ['Admin Email Address *', 'email', 'email', true],
                  ['Account Password *', 'password', 'password', true],
                  ['Contact Phone Number', 'phone', 'text', false],
                  ['Established Year', 'established', 'number', false],
                  ['Accreditation Rating', 'accreditation', 'text', false],
                  ['City', 'city', 'text', false],
                  ['State', 'state', 'text', false],
                ].map(([label, field, type, req]) => (
                  <div key={field}>
                    <label className="label-premium">{label}</label>
                    <input
                      type={type}
                      required={req}
                      value={collegeForm[field]}
                      onChange={e => setCollegeForm(prev => ({ ...prev, [field]: e.target.value }))}
                      className="input-premium border border-slate-200"
                    />
                  </div>
                ))}
                <div className="md:col-span-2">
                  <label className="label-premium">Official Website Link</label>
                  <input type="url" value={collegeForm.website} onChange={e => setCollegeForm(prev => ({ ...prev, website: e.target.value }))} className="input-premium border border-slate-200" />
                </div>
                <div className="md:col-span-2">
                  <label className="label-premium">Detailed Campus Address</label>
                  <textarea value={collegeForm.address} onChange={e => setCollegeForm(prev => ({ ...prev, address: e.target.value }))} rows={2} className="input-premium resize-none border border-slate-200" />
                </div>
                <div className="md:col-span-2">
                  <label className="label-premium">College Description & Details</label>
                  <textarea value={collegeForm.description} onChange={e => setCollegeForm(prev => ({ ...prev, description: e.target.value }))} rows={4} className="input-premium resize-none border border-slate-200" />
                </div>
              </div>
              <button type="submit" disabled={btnLoading} className="btn-primary w-full flex items-center justify-center gap-2 shadow-md mt-4">
                {btnLoading ? 'Creating Profile...' : 'Create College Profile'}
              </button>
            </form>
          </div>
        )}

        {tab === 'broadcast' && (
          <div className="max-w-xl mx-auto card-premium p-8 border border-slate-200">
            <h2 className="font-heading text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" /> Broadcast System Alert
            </h2>
            <form onSubmit={handleBroadcast} className="space-y-6">
              <div>
                <label className="label-premium">Announcement Title</label>
                <input type="text" value={broadcastForm.title} onChange={e => setBroadcastForm(prev => ({ ...prev, title: e.target.value }))} className="input-premium border border-slate-200" required />
              </div>
              <div>
                <label className="label-premium">Notification Message</label>
                <textarea value={broadcastForm.message} onChange={e => setBroadcastForm(prev => ({ ...prev, message: e.target.value }))} rows={4} className="input-premium resize-none border border-slate-200" required />
              </div>
              <button type="submit" disabled={btnLoading} className="btn-primary w-full flex items-center justify-center gap-2 shadow-md">
                {btnLoading ? 'Broadcasting...' : 'Broadcast Alert'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
