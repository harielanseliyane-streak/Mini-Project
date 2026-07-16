import { useState, useEffect } from 'react';
import { Megaphone, X, Check, CalendarClock, Bell } from 'lucide-react';

const bulletinsList = [
  {
    id: 'placement_2026',
    type: '💼 Placement Drive',
    title: 'Mega Campus Drive 2026',
    desc: 'Amazon, Zoho, and 15+ top tech MNCs are recruiting final-year students. Cutoff >= 185 eligible.',
    date: 'Aug 15, 2026'
  },
  {
    id: 'hackathon_2026',
    type: '🚀 Hackathon',
    title: 'TCS Smart Hackathon 2026',
    desc: 'National level hackathon on Web & AI student solutions. Register to represent your college.',
    date: 'July 10, 2026'
  },
  {
    id: 'contest_2026',
    type: '🏆 Coding Contest',
    title: 'Tamil Nadu Code Battle',
    desc: 'State-wide speed coding battle hosted by PSG Tech. Grand cash prizes up to ₹1,00,000.',
    date: 'Sept 05, 2026'
  }
];

const LiveBulletins = () => {
  const [showBulletin, setShowBulletin] = useState(false);
  const [reminders, setReminders] = useState({});
  const [toastMsg, setToastMsg] = useState('');
  const [reminderModal, setReminderModal] = useState(null); // { id, title, type } | null
  const [pickedDate, setPickedDate] = useState('');

  useEffect(() => {
    // Load reminders from localStorage
    const savedReminders = localStorage.getItem('bulletin_reminders');
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders));
    }

    // Load state from local storage or slide in after 1.5 seconds on first load
    const dismissed = sessionStorage.getItem('bulletins_dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => {
        setShowBulletin(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleToggleReminder = (id, title, type) => {
    if (reminders[id]) {
      // Cancel reminder
      setReminders(prev => {
        const updated = { ...prev };
        delete updated[id];
        localStorage.setItem('bulletin_reminders', JSON.stringify(updated));
        window.dispatchEvent(new Event('bulletin_reminders_changed'));
        return updated;
      });
      showToast(`🔕 Reminder cancelled for: ${title}`);
    } else {
      // Open date picker modal
      setPickedDate('');
      setReminderModal({ id, title, type });
    }
  };

  const handleConfirmReminder = () => {
    if (!pickedDate) {
      showToast('⚠️ Please pick a date & time first.');
      return;
    }
    const { id, title, type } = reminderModal;
    setReminders(prev => {
      const updated = { ...prev, [id]: { date: pickedDate, title, type } };
      localStorage.setItem('bulletin_reminders', JSON.stringify(updated));
      window.dispatchEvent(new Event('bulletin_reminders_changed'));
      return updated;
    });
    showToast(`🔔 Reminder set for: ${new Date(pickedDate).toLocaleString('en-IN')}`);
    setReminderModal(null);
  };

  const handleCloseBulletin = () => {
    setShowBulletin(false);
    sessionStorage.setItem('bulletins_dismissed', 'true');
  };

  return (
    <>
      {/* Bulletins Popup Drawer */}
      {showBulletin && (
        <div className="fixed bottom-6 left-6 z-50 w-full max-w-sm md:max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 animate-slide-up flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-secondary" />
              <h3 className="font-heading font-bold text-slate-800 text-sm md:text-base">📢 InfoHub Live Bulletins</h3>
            </div>
            <button onClick={handleCloseBulletin} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-premium pr-1">
            {bulletinsList.map(bulletin => (
              <div key={bulletin.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-secondary">{bulletin.type}</span>
                  <span className="text-[10px] font-semibold text-slate-400">{bulletin.date}</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm leading-snug">{bulletin.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{bulletin.desc}</p>
                <button
                  onClick={() => handleToggleReminder(bulletin.id, bulletin.title, bulletin.type)}
                  className={`mt-2 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                    reminders[bulletin.id]
                      ? 'bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20 w-full'
                      : 'btn-primary w-full shadow-sm text-white'
                  }`}
                >
                  {reminders[bulletin.id] ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Reminder: {new Date(reminders[bulletin.id].date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}</span>
                    </>
                  ) : (
                    <>
                      <CalendarClock className="w-3.5 h-3.5" /> Set Reminder Date
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Bulletins Trigger button (re-opens after closing) ── */}
      {!showBulletin && (
        <button
          onClick={() => setShowBulletin(true)}
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          <Megaphone className="w-5 h-5 animate-bounce" />
          <span className="text-sm">Live Bulletins ({bulletinsList.length})</span>
        </button>
      )}

      {/* ── Reminder Date-Picker Modal ── */}
      {reminderModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-secondary" />
                <h3 className="font-heading font-bold text-slate-800 text-base">Set Reminder</h3>
              </div>
              <button onClick={() => setReminderModal(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-1 font-semibold">Event</p>
            <p className="text-sm font-bold text-slate-800 mb-4 leading-snug">{reminderModal.title}</p>

            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Choose your reminder date &amp; time</label>
            <input
              type="datetime-local"
              value={pickedDate}
              min={new Date().toISOString().slice(0, 16)}
              onChange={e => setPickedDate(e.target.value)}
              className="input mb-4 text-sm"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setReminderModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReminder}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
              >
                <Bell className="w-3.5 h-3.5 inline mr-1" /> Confirm Reminder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white font-medium px-5 py-3 rounded-xl shadow-premium border border-slate-800 text-sm flex items-center gap-2 animate-fade-in">
          <span>🔔</span> {toastMsg}
        </div>
      )}
    </>
  );
};

export default LiveBulletins;
