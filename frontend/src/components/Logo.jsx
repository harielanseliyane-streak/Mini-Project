import React from 'react';

const Logo = ({ className = "h-9", showText = true }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* SVG Icon */}
      <svg className="w-10 h-10 flex-shrink-0" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Semicircular arch */}
        <path d="M35 105C35 60 75 25 100 25C125 25 165 60 165 105" stroke="url(#logo-grad)" strokeWidth="8" strokeLinecap="round" />
        
        {/* Graduation cap */}
        {/* Cap Diamond */}
        <path d="M100 50L160 80L100 110L40 80L100 50Z" fill="url(#cap-grad)" />
        {/* Cap skullcap under the diamond */}
        <path d="M70 95V115C70 125 80 135 100 135C120 135 130 125 130 115V95" fill="#00a896" />
        {/* Cap Tassel */}
        <path d="M100 80L145 105V120" stroke="#028090" strokeWidth="4" strokeLinecap="round" />
        <circle cx="145" cy="122" r="5" fill="#028090" />

        {/* Open book */}
        {/* Left page */}
        <path d="M100 145C80 135 45 135 25 145V175C45 165 80 165 100 175" fill="none" stroke="#006672" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        {/* Right page */}
        <path d="M100 145C120 135 155 135 175 145V175C155 165 120 165 100 175" fill="none" stroke="#006672" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Gradients */}
        <defs>
          <linearGradient id="logo-grad" x1="35" y1="25" x2="165" y2="105" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#006672" />
            <stop offset="100%" stopColor="#00a896" />
          </linearGradient>
          <linearGradient id="cap-grad" x1="40" y1="50" x2="160" y2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#028090" />
            <stop offset="100%" stopColor="#00a896" />
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="font-heading font-extrabold text-xl tracking-tight text-slate-800">
            <span className="text-[#006672]">Info</span>
            <span className="text-[#00a896] font-semibold">-Hub</span>
          </div>
          <span className="text-[7px] uppercase font-bold tracking-[0.22em] text-[#028090] mt-1.5">
            Explore • Learn • Succeed
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
