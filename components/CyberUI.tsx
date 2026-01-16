
import React from 'react';

interface FrameProps {
  children: React.ReactNode;
  className?: string;
  color?: 'cyan' | 'magenta' | 'slate' | 'amber';
  title?: string;
  subTitle?: string;
}

export const CyberFrame: React.FC<FrameProps> = ({ children, className = '', color = 'cyan', title, subTitle }) => {
  const borderMap = {
    cyan: 'border-cyan-400/60',
    magenta: 'border-pink-500/60',
    slate: 'border-slate-700/60',
    amber: 'border-amber-500/60'
  };
  const textMap = {
    cyan: 'text-cyan-400',
    magenta: 'text-pink-400',
    slate: 'text-slate-400',
    amber: 'text-amber-500'
  };
  const bgMap = {
    cyan: 'bg-cyan-950/20',
    magenta: 'bg-pink-950/20',
    slate: 'bg-slate-900/40',
    amber: 'bg-amber-950/20'
  };
  const accentColor = color === 'cyan' ? 'bg-cyan-400' : color === 'magenta' ? 'bg-pink-500' : color === 'amber' ? 'bg-amber-500' : 'bg-slate-600';

  return (
    <div className={`relative p-5 border ${borderMap[color]} ${bgMap[color]} backdrop-blur-md rounded-sm ${className}`}>
      {/* HUD Accents */}
      <div className={`absolute top-0 left-0 w-6 h-[2px] ${accentColor}`} />
      <div className={`absolute top-0 left-0 w-[2px] h-6 ${accentColor}`} />
      
      <div className={`absolute top-0 right-0 w-6 h-[2px] ${accentColor}`} />
      <div className={`absolute top-0 right-0 w-[2px] h-6 ${accentColor}`} />
      
      {title && (
        <div className="absolute -top-[10px] left-4 flex items-center gap-2">
          <div className={`px-2 py-0.5 bg-slate-900 border border-current text-[9px] font-black tracking-widest ${textMap[color]} font-orbitron uppercase`}>
            {title}
          </div>
          {subTitle && (
            <div className="text-[8px] text-slate-500 font-mono tracking-tighter">
              // {subTitle}
            </div>
          )}
        </div>
      )}
      
      <div className="relative z-10 h-full">
        {children}
      </div>
      
      {/* Bottom info strip */}
      <div className="absolute -bottom-[6px] right-2 flex gap-1 opacity-40">
        <div className={`w-1 h-1 ${accentColor}`} />
        <div className={`w-4 h-1 ${accentColor}`} />
      </div>
    </div>
  );
};

export const HexagonButton: React.FC<{ active?: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => {
  return (
    <div className="flex flex-col items-center justify-center cursor-pointer group" onClick={onClick}>
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Outer Glow */}
        {active && (
          <div className="absolute inset-0 bg-pink-500/20 blur-xl animate-pulse rounded-full" />
        )}
        
        <svg viewBox="0 0 100 100" className={`absolute inset-0 w-full h-full transition-all duration-300 ${active ? 'fill-pink-600/30 stroke-pink-400 scale-110 drop-shadow-[0_0_10px_#ec4899]' : 'fill-slate-800/80 stroke-slate-500 group-hover:stroke-slate-300'} stroke-[3]`}>
          <path d="M50 5 L92 28 L92 72 L50 95 L8 72 L8 28 Z" />
        </svg>
        
        <div className={`relative z-10 transition-all duration-300 ${active ? 'text-white scale-110' : 'text-slate-400 group-hover:text-slate-200'}`}>
          {icon}
        </div>
      </div>
      <span className={`text-[11px] mt-1 font-black tracking-[0.2em] font-orbitron transition-colors ${active ? 'text-pink-400' : 'text-slate-500 uppercase'}`}>
        {label}
      </span>
    </div>
  );
};

export const CutCornerButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  color?: 'cyan' | 'pink' | 'amber' | 'slate', 
  filled?: boolean,
  cornerSize?: number
}> = ({ 
  children, 
  className = '', 
  color = 'cyan', 
  filled = false, 
  cornerSize = 10,
  style,
  ...props 
}) => {
  const colorMap = {
    cyan: 'bg-cyan-400',
    pink: 'bg-pink-500',
    amber: 'bg-amber-500',
    slate: 'bg-slate-500'
  };
  
  const borderColorMap = {
    cyan: 'bg-cyan-400',
    pink: 'bg-pink-500',
    amber: 'bg-amber-500',
    slate: 'bg-slate-500'
  };

  const clipStyle = {
    clipPath: `polygon(
      ${cornerSize}px 0, 
      100% 0, 
      100% calc(100% - ${cornerSize}px), 
      calc(100% - ${cornerSize}px) 100%, 
      0 100%, 
      0 ${cornerSize}px
    )`
  };

  if (filled) {
    return (
      <button 
        className={`relative ${colorMap[color]} text-slate-950 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        style={{ ...style, ...clipStyle }}
        {...props}
      >
        {children}
      </button>
    );
  }

  // Outlined version
  return (
    <button 
      className={`relative group bg-transparent transition-all active:scale-95 disabled:opacity-50 ${className}`}
      style={{ ...style }}
      {...props}
    >
      {/* Outer Border */}
      <div 
        className={`absolute inset-0 ${borderColorMap[color]} opacity-100`}
        style={clipStyle}
      />
      {/* Inner Mask */}
      <div 
         className="absolute inset-[1px] bg-[#050a14] transition-colors group-hover:bg-[#0a1525]"
         style={clipStyle}
      />
      {/* Content */}
      <div className={`relative z-10 h-full flex items-center justify-center`}>
        {children}
      </div>
    </button>
  );
};
