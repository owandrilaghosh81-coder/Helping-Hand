import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', showTagline = false }) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-3 group select-none">
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 via-indigo-600 to-cyan-500 p-0.5 shadow-glow-brand transition-transform duration-300 group-hover:scale-105 ${iconSizes[size]}`}>
        <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center text-brand-400">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4/5 h-4/5 transform -rotate-6">
            <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
            <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6" />
            <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
            <path d="M18 8a2 2 0 0 1 2 2v4a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
          </svg>
        </div>
      </div>
      <div>
        <div className={`font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400 ${textSizes[size]}`}>
          HELPING HAND
        </div>
        {showTagline && (
          <div className="text-[11px] text-brand-400 font-medium tracking-wide">
            Turn coding errors into understandable solutions
          </div>
        )}
      </div>
    </div>
  );
};
