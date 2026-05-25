import React, { useState } from 'react';
import logoUrl from '../assets/logo.svg';

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
  const [imageError, setImageError] = useState(false);

  // High-Quality Self-Contained Vector Symbol (Abstract Africa shape & water waves for brand identity)
  const DefaultSymbol = () => {
    return (
      <svg 
        viewBox="0 0 100 100" 
        className="h-12 w-12 flex-shrink-0 text-gold" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background elegant gold outer ring with subtle gradient */}
        <circle 
          cx="50" 
          cy="50" 
          r="45" 
          stroke="url(#logoGoldGrad)" 
          strokeWidth="2" 
          fill={light ? "rgba(255, 255, 255, 0.03)" : "rgba(10, 31, 68, 0.02)"} 
        />
        <circle 
          cx="50" 
          cy="50" 
          r="41" 
          stroke={light ? "rgba(255, 255, 255, 0.15)" : "rgba(10, 31, 68, 0.08)"} 
          strokeWidth="1" 
          strokeDasharray="3 2" 
        />
        
        {/* Abstract Golden African Continent Silhouette with high premium details */}
        <path 
          d="M50 20 C54 20, 58 21, 62 24 C65 27, 68 31, 68 35 C68 38, 66 40, 65 42 C64 43, 65 45, 66 47 C67 50, 65 54, 63 57 C59 63, 56 69, 53 75 C51 78, 49 81, 47 81 C45 81, 44 78, 44 75 C44 72, 42 69, 40 66 C38 62, 34 60, 31 57 C28 54, 26 51, 26 46 C26 42, 28 37, 32 33 C35 30, 41 27, 45 25 Z" 
          fill="url(#logoGoldGrad)" 
          opacity="0.95"
        />

        {/* Dynamic Glowing cyan/teal water ripples for Pool/spa element */}
        <path 
          d="M24 45 C34 37, 44 53, 54 45 C64 37, 74 53, 84 45" 
          stroke="#00E5FF" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          opacity="0.85" 
        />
        {/* Main Golden Ripple curve */}
        <path 
          d="M19 54 C30 46, 41 62, 52 54 C63 46, 74 62, 85 54" 
          stroke="url(#logoGoldGrad)" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        {/* Soft bottom water ripple (light white/dark navy depending on context) */}
        <path 
          d="M27 63 C35 57, 43 69, 51 63 C59 57, 67 69, 75 63" 
          stroke={light ? "#ffffff" : "#0d1e3d"} 
          strokeWidth="1.8" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          opacity="0.95"
        />

        {/* Floating droplets of relaxation / spa wellness */}
        <circle cx="50" cy="30" r="3" fill="#ffffff" opacity="0.9" />
        <circle cx="57" cy="26" r="1.8" fill="#00E5FF" opacity="0.8" />
        <circle cx="43" cy="27" r="1.2" fill="url(#logoGoldGrad)" opacity="0.85" />

        <defs>
          <linearGradient id="logoGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f7e1a3" />
            <stop offset="55%" stopColor="#c8922a" />
            <stop offset="100%" stopColor="#8d5f12" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  const LogoImage = () => {
    if (imageError) {
      return <DefaultSymbol />;
    }

    return (
      <img
        src={logoUrl}
        alt="Africa Pool &amp; Spa Expo"
        className="h-12 w-auto object-contain max-w-[280px]"
        referrerPolicy="no-referrer"
        onError={() => setImageError(true)}
      />
    );
  };

  // With text elements removed, all variants show the clean logo graphic image directly
  if (variant === 'symbol') {
    return <LogoImage />;
  }

  return (
    <div className={`flex items-center select-none ${className}`} id="logo-branding-horizontal">
      <LogoImage />
    </div>
  );
};

export default Logo;
