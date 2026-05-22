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

  // Stylized Vector Symbol (Abstract Golden Water Drop & Wave in a Shield/Circle)
  const Symbol = () => {
    if (imgFailed) {
      return (
        <svg 
          viewBox="0 0 100 100" 
          className="h-11 w-11 flex-shrink-0" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer elegant thin golden hexagonal or circular frame */}
          <circle cx="50" cy="50" r="45" stroke="#c8922a" strokeWidth="1.5" strokeOpacity="0.6" strokeDasharray="2 1" />
          <circle cx="50" cy="50" r="41" stroke="#c8922a" strokeWidth="1.5" />
          
          {/* Abstract Water Waves (Pool) & Rising Drop (Spa / Wellbeing) */}
          <path 
            d="M25 65 C 35 55, 40 75, 50 65 C 60 55, 65 75, 75 65" 
            stroke="#c8922a" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          <path 
            d="M30 75 C 38 68, 42 82, 50 75 C 58 68, 62 82, 70 75" 
            stroke={light ? "#ffffff" : "#0a1f44"} 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          
          {/* Golden Water Drop */}
          <path 
            d="M50 22 C 50 22, 36 40, 36 48 C 36 55.7, 42.3 62, 50 62 C 57.7 62, 64 55.7, 64 48 C 64 40, 50 22, 50 22 Z" 
            fill="url(#goldGradient)" 
            opacity="0.95"
          />
          
          {/* Light highlight inside the drop */}
          <path 
            d="M46 38 C 44 42, 42 46, 42 48" 
            stroke="#ffffff" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
          />

          <defs>
            <linearGradient id="goldGradient" x1="50" y1="22" x2="50" y2="62" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f3e7c4" />
              <stop offset="50%" stopColor="#c8922a" />
              <stop offset="100%" stopColor="#8a5f13" />
            </linearGradient>
          </defs>
        </svg>
      );
    }

    return (
      <img 
        src="https://raw.githubusercontent.com/ayoubarrich1990-lab/africapoolspa/d683d75a7d91c261251be9e6ca617675b430e519/logo%20blanc%20africa%20pool%40300x.png"
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
      </div>
    );
  }

  // Default: Horizontal Logo (Perfect for navbars)
  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`} id="logo-branding-horizontal">
      <Symbol />
      <div className="flex flex-col font-sans">
        <span className="text-[10px] text-gold tracking-[0.28em] font-black uppercase leading-none font-mono">
          AFRICA POOL &amp; SPA
        </span>
        <div className={`font-serif ${primaryColor} font-black text-xl lg:text-2xl leading-tight flex items-center gap-1.5 pt-0.5`}>
          <span className="tracking-tight">EXPO</span> 
          <span className="text-gold font-sans font-black">2026</span>
        </div>
        <span className={`text-[8px] ${subtitleColor} uppercase tracking-widest leading-none pt-0.5`}>
          OFEC Casablanca, Maroc
        </span>
      </div>
    </div>
  );
};

export default Logo;
