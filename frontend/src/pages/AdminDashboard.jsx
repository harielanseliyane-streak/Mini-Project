import { useState, useEffect } from 'react';
import { getAdminStats, getAdminStudents, getAdminColleges, broadcastNotification, deleteReviewByAdmin } from '../api';
import { Users, GraduationCap, School, ShieldAlert, FileText, Send, Trash2, Calendar, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const TabBtn = ({ active, onClick, children }) => (
  <button 
    onClick={onClick}
    className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
      active ? 'bg-primary/20 text-primary border border-primary/30 shadow-primary-glow'
             : 'text-textSecondaryDark hover:text-white hover:bg-white/5'
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
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    // Load initial stats
    getAdminStats()
      .then(res => {
        setStats(res.data.stats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === 'users') {
      getAdminStudents().then(res => setStudents(res.data.students)).catch(() => {});
      getAdminColleges().then(res => setColleges(res.data.colleges)).catch(() => {});
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-textSecondaryDark">Loading administration console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-danger/20 to-primary/20 border border-danger/30 flex items-center justify-center text-danger">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-white">Super Admin Dashboard</h1>
          <p className="text-sm text-textSecondaryDark mt-0.5">Control center and moderation panel</p>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Students', value: stats.students, icon: GraduationCap, color: 'text-primary' },
            { label: 'Colleges', value: stats.colleges, icon: School, color: 'text-secondary' },
            { label: 'Applications', value: stats.applications, icon: FileText, color: 'text-accent' },
            { label: 'Events', value: stats.events, icon: Calendar, color: 'text-success' },
            { label: 'Scholarships', value: stats.scholarships, icon: Award, color: 'text-warning' },
            { label: 'Internships', value: stats.internships, icon: Users, color: 'text-danger' },
          ].map((item, idx) => (
            <div key={idx} className="card-premium p-4 text-center">
              <div className={`inline-flex p-2 rounded-xl bg-white/5 ${item.color} mb-2`}>
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold font-mono text-white leading-none mb-1">{item.value}</h3>
              <p className="text-[10px] uppercase font-bold tracking-wider text-textSecondaryDark">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-borderDark pb-4 overflow-x-auto">
        <TabBtn active={tab === 'users'} onClick={() => setTab('users')}>👤 Users Directories</TabBtn>
        <TabBtn active={tab === 'broadcast'} onClick={() => setTab('broadcast')}>📢 Broadcast Alert</TabBtn>
      </div>

      {msg.text && (
        <div className={`mb-6 p-4 rounded-xl text-sm border text-center ${
          msg.type === 'success' ? 'bg-success/10 border-success/30 text-success' : 'bg-danger/10 border-danger/30 text-danger'
        }`}>
          {msg.text}
        </div>
      )}

      {/* Tab Content */}
      <div className="space-y-8">
        {tab === 'users' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Students List */}
            <div className="card-premium p-6">
              <h2 className="font-heading text-lg font-bold text-white mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" /> Active Students ({students.length})
              </h2>
              <div className="overflow-y-auto max-h-[400px] scrollbar-premium pr-2 space-y-3">
                {students.map(s => (
                  <div key={s.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-white text-sm">{s.name}</h4>
                      <p className="text-xs text-textSecondaryDark mt-0.5">{s.email} | {s.phone || 'No phone'}</p>
                    </div>
                    {s.cutoff && (
                      <span className="text-xs font-mono font-bold bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-lg">
                        Cutoff: {s.cutoff}
                      </span>
                    )}
                  </div>
                ))}
                {students.length === 0 && (
                  <p className="text-xs text-textSecondaryDark text-center py-8">No registered students yet.</p>
                )}
              </div>
            </div>

            {/* Colleges List */}
            <div className="card-premium p-6">
              <h2 className="font-heading text-lg font-bold text-white mb-4 flex items-center gap-2">
                <School className="w-5 h-5 text-secondary" /> Registered Colleges ({colleges.length})
              </h2>
              <div className="overflow-y-auto max-h-[400px] scrollbar-premium pr-2 space-y-3">
                {colleges.map(c => (
                  <div key={c.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-white text-sm">{c.college_name}</h4>
                      <p className="text-xs text-textSecondaryDark mt-0.5">{c.email} | {c.city || 'No Location'}</p>
                    </div>
                    {c.accreditation && (
                      <span className="text-xs font-mono font-bold bg-secondary/10 border border-secondary/20 text-secondary px-2.5 py-1 rounded-lg">
                        {c.accreditation}
                      </span>
                    )}
                  </div>
                ))}
                {colleges.length === 0 && (
                  <p className="text-xs text-textSecondaryDark text-center py-8">No registered colleges yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'broadcast' && (
          <div className="max-w-xl mx-auto card-premium p-8">
            <h2 className="font-heading text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" /> Broadcast System Alert
            </h2>
            <form onSubmit={handleBroadcast} className="space-y-6">
              <div>
                <label className="label-premium">Announcement Title</label>
                <input 
                  type="text" 
                  value={broadcastForm.title} 
                  onChange={e => setBroadcastForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Scholarship Application Deadline Extension" 
                  className="input-premium"
                  required
                />
              </div>
              <div>
                <label className="label-premium">Notification Message</label>
                <textarea 
                  value={broadcastForm.message} 
                  onChange={e => setBroadcastForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Write the detailed bulletin announcement here..." 
                  rows={4}
                  className="input-premium resize-none"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={btnLoading} 
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
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
