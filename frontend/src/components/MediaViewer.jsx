import { useState, useEffect } from 'react';

const MediaViewer = ({ items = [], initialIndex = 0, onClose }) => {
  const [current, setCurrent] = useState(initialIndex);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape')     onClose?.();
      if (e.key === 'ArrowRight') setCurrent(c => (c + 1) % items.length);
      if (e.key === 'ArrowLeft')  setCurrent(c => (c - 1 + items.length) % items.length);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [items.length, onClose]);

  if (!items.length) return null;
  const item = items[current];
  const isVideo = item.type === 'video' || /\.(mp4|webm|mov)$/i.test(item.url || '');

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in"
      onClick={onClose}>
      <div className="relative max-w-4xl w-full mx-4" onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button onClick={onClose}
          className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all z-10">
          ✕
        </button>

        {/* Counter */}
        {items.length > 1 && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-sm text-slate-400">
            {current + 1} / {items.length}
          </div>
        )}

        {/* Media */}
        <div className="rounded-2xl overflow-hidden bg-slate-900 border border-white/10">
          {isVideo ? (
            <video src={item.url} controls autoPlay className="w-full max-h-[70vh]" />
          ) : (
            <img src={item.url} alt={item.title || 'Media'} className="w-full max-h-[70vh] object-contain" />
          )}
          {item.title && (
            <div className="p-4 border-t border-white/10">
              <p className="text-white font-medium">{item.title}</p>
              {item.description && <p className="text-slate-400 text-sm mt-1">{item.description}</p>}
            </div>
          )}
        </div>

        {/* Navigation */}
        {items.length > 1 && (
          <>
            <button onClick={() => setCurrent(c => (c - 1 + items.length) % items.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-all">
              ‹
            </button>
            <button onClick={() => setCurrent(c => (c + 1) % items.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-all">
              ›
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MediaViewer;
