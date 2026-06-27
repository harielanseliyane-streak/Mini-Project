import React from 'react';

const Logo = ({ className = "h-9", showText = true }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* SVG Icon */}
      <svg className="w-10 h-10 flex-shrink-0" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Rounded square border */}
        <rect x="15" y="15" width="170" height="170" rx="42" stroke="url(#logo-grad)" strokeWidth="8" fill="none" />
        
        {/* Graduation cap */}
        {/* Cap Diamond */}
        <path d="M100 48L142 68L100 88L58 68Z" fill="url(#cap-grad)" />
        {/* Cap skullcap */}
        <path d="M82 78V85C82 96 118 96 118 85V78" fill="#C59B27" />
        {/* Cap Tassel */}
        <path d="M100 68L132 80C134 85 134 92 134 100" stroke="#C59B27" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <circle cx="134" cy="102" r="4.5" fill="#C59B27" />

        {/* Stylized torso / lapels */}
        {/* Left Lapel */}
        <path d="M50 112H85C93 112 95 118 95 125L100 185C100 185 60 135 50 112Z" fill="url(#logo-grad)" />
        {/* Right Lapel */}
        <path d="M150 112H115C107 112 105 118 105 125L100 185C100 185 140 135 150 112Z" fill="url(#logo-grad)" />
        
        {/* Gradients */}
        <defs>
          <linearGradient id="logo-grad" x1="15" y1="15" x2="185" y2="185" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1B365D" />
            <stop offset="100%" stopColor="#C59B27" />
          </linearGradient>
          <linearGradient id="cap-grad" x1="58" y1="48" x2="142" y2="98" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2C3E50" />
            <stop offset="100%" stopColor="#C59B27" />
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="font-heading font-extrabold text-xl tracking-tight text-slate-800">
            <span className="text-[#1B365D]">Info</span>
            <span className="text-[#C59B27] font-semibold">-Hub</span>
          </div>
          <span className="text-[7px] uppercase font-bold tracking-[0.22em] text-[#C59B27] mt-1.5">
            Explore • Learn • Succeed
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
