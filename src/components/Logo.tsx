import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  variant?: 'horizontal' | 'vertical' | 'symbol';
  light?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  variant = 'horizontal', 
  light = true 
}) => {
  const primaryColor = light ? 'text-white' : 'text-navy';
  const subtitleColor = light ? 'text-white/60' : 'text-navy/70';
  const accentColor = 'text-gold'; // Gold accent
  const [imgFailed, setImgFailed] = useState(false);

  // Stylized Vector Symbol (Abstract Wave & Water Drops for Africa Pool & Spa brand identity)
  const Symbol = () => {
    if (imgFailed) {
      return (
        <svg 
          viewBox="0 0 100 100" 
          className="h-11 w-11 flex-shrink-0 text-gold" 
          fill="none" 
          xmlns="https://h5g5-fm.hstgr.io/ad9db43cbed30622/files/public_html/www.svg"
        >
          {/* Golden and White linear outer gradient ring */}
          <circle cx="50" cy="50" r="44" stroke="url(#logoGoldGrad)" strokeWidth="2.5" strokeOpacity="0.9" />
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 2" />
          
          {/* Sleek water ripple / swimming pool lanes flowing through */}
          <path 
            d="M22 55 C 32 45, 42 65, 52 55 C 62 45, 72 65, 82 55" 
            stroke="url(#logoGoldGrad)" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          <path 
            d="M26 65 C 34 58, 42 72, 50 65 C 58 58, 66 72, 74 65" 
            stroke={light ? "#ffffff" : "#0a1f44"} 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          <path 
            d="M32 75 C 38 71, 44 79, 50 75 C 56 71, 62 79, 68 75" 
            stroke="url(#logoGoldGrad)" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            opacity="0.6"
          />
          
          {/* Pristine teardrop for spa and relaxation concept */}
          <path 
            d="M50 18 C 50 18, 38 34, 38 41 C 38 47.6, 43.4 53, 50 53 C 56.6 53, 62 47.6, 62 41 C 62 34, 50 18, 50 18 Z" 
            fill="url(#logoGoldGrad)" 
          />
          
          {/* Inner curved light reflection highlight */}
          <path 
            d="M45.5 35.5 C 43 39.5, 43 42, 43.5 43.5" 
            stroke="#ffffff" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            opacity="0.9"
          />

          <defs>
            <linearGradient id="logoGoldGrad" x1="50" y1="18" x2="50" y2="78" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f7e1a3" />
              <stop offset="50%" stopColor="#c8922a" />
              <stop offset="100%" stopColor="#9a6b18" />
            </linearGradient>
          </defs>
        </svg>
      );
    }

    return (
      <img 
        src="https://h5g5-fm.hstgr.io/ad9db43cbed30622/files/public_html/www.svg"
        alt="Africa Pool & Spa Logo"
        className="h-11 w-auto object-contain flex-shrink-0 bg-transparent transition-opacity duration-300"
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
      />
    );
  };

  if (variant === 'symbol') {
    return <Symbol />;
  }

  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center gap-3 ${className}`} id="logo-branding-vertical">
        <Symbol />
        {imgFailed && (
          <div className="flex flex-col select-none font-sans">
            <span className="text-[11px] text-gold tracking-[0.35em] font-extrabold uppercase leading-none">
              AFRICA POOL &amp; SPA
            </span>
            <div className={`font-serif ${primaryColor} font-black text-3xl leading-tight flex items-center justify-center gap-2 pt-1`}>
              <span>EXPO</span> 
              <span className="text-gold font-sans font-extrabold">2026</span>
            </div>
            <div className="h-[1px] w-12 bg-gold/50 my-2 mx-auto" />
            <span className={`text-[9px] ${subtitleColor} uppercase tracking-[0.2em] font-medium leading-none`}>
              OFEC Casablanca • Maroc
            </span>
          </div>
        )}
      </div>
    );
  }

  // Default: Horizontal Logo (Perfect for navbars)
  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`} id="logo-branding-horizontal">
      <Symbol />
    </div>
  );
};

export default Logo;
