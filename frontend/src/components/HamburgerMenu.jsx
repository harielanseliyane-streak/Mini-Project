import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const HamburgerMenu = ({ open, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const items = [
    { icon: '🏛️', label: 'About Us',     desc: 'Learn about InfoHub mission',    to: '/about' },
    { icon: '📞', label: 'Contact',       desc: 'Get in touch with our team',     to: '/contact' },
    { icon: '❓', label: 'Help & Support', desc: 'FAQs and support resources',    to: '/help' },
    { icon: '📜', label: 'Privacy Policy', desc: 'Our data privacy commitment',   to: '/privacy' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />

      {/* Drawer */}
      <div className="relative ml-auto w-full max-w-xs h-full bg-white border-l border-slate-200 flex flex-col shadow-2xl animate-slide-up"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-sm">🎓</span>
            </div>
            <span className="font-heading font-bold text-slate-800">InfoHub</span>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-all">
            ✕
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-6 space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Navigation</p>
          {items.map(item => (
            <Link key={item.to} to={item.to} onClick={onClose}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
              <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100">
          <p className="text-xs text-slate-400 text-center">© 2026 InfoHub Platform. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default HamburgerMenu;
