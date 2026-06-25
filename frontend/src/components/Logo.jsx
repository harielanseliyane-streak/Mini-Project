import React from 'react';

const Logo = ({ className = "h-9", showText = true }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* SVG Icon mimicking the uploaded logo */}
      <svg className="w-10 h-10 flex-shrink-0" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Graduation cap */}
        {/* Cap Diamond */}
        <path d="M100 40L160 70L100 100L40 70L100 40Z" fill="#028090" />
        {/* Cap skullcap */}
        <path d="M75 85V105C75 115 85 125 100 125C115 125 125 115 125 105V85" fill="#00525C" />
        {/* Tassel */}
        <path d="M100 70L145 90V115" stroke="#00a896" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="145" cy="115" r="5" fill="#00a896" />
        
        {/* V shape body (Two halves) */}
        <path d="M40 110 C 60 110, 80 120, 95 135 L 100 190 L 40 110 Z" fill="url(#v-grad-left)" />
        <path d="M160 110 C 140 110, 120 120, 105 135 L 100 190 L 160 110 Z" fill="url(#v-grad-right)" />

        <defs>
          <linearGradient id="v-grad-left" x1="40" y1="110" x2="100" y2="190" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#028090" />
            <stop offset="100%" stopColor="#00525C" />
          </linearGradient>
          <linearGradient id="v-grad-right" x1="160" y1="110" x2="100" y2="190" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00a896" />
            <stop offset="100%" stopColor="#006672" />
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="font-heading font-extrabold text-xl tracking-tight text-slate-800">
            <span className="text-primary">Info</span>
            <span className="text-secondary font-semibold">-Hub</span>
          </div>
          <span className="text-[7px] uppercase font-bold tracking-[0.22em] text-primary/80 mt-1.5">
            Explore • Learn • Succeed
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;

