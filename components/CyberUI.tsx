import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// スタイル結合用ヘルパー
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- CyberFrame Component ---
interface CyberFrameProps {
  title?: string;
  subTitle?: string;
  children: React.ReactNode;
  className?: string;
  color?: 'cyan' | 'magenta' | 'amber' | 'slate' | 'pink';
}

export const CyberFrame: React.FC<CyberFrameProps> = ({ 
  title = "SYSTEM", 
  subTitle,
  children, 
  className,
  color = 'cyan' 
}) => {
  const colorMap = {
    cyan: 'border-cyan-500/30 text-cyan-400',
    magenta: 'border-pink-500/30 text-pink-400',
    amber: 'border-amber-500/30 text-amber-400',
    slate: 'border-slate-500/30 text-slate-400',
    pink: 'border-pink-500/30 text-pink-400',
  };

  const borderColor = colorMap[color] || colorMap.cyan;

  return (
    <div className={cn("relative border bg-[#050a14]/80 backdrop-blur-md p-4 rounded-sm", borderColor, className)}>
      {/* コーナー装飾 */}
      <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t-2 border-l-2 border-current opacity-70" />
      <div className="absolute -top-[1px] -right-[1px] w-2 h-2 border-t-2 border-r-2 border-current opacity-70" />
      <div className="absolute -bottom-[1px] -left-[1px] w-2 h-2 border-b-2 border-l-2 border-current opacity-70" />
      <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b-2 border-r-2 border-current opacity-70" />

      {/* タイトルバー */}
      {(title || subTitle) && (
        <div className="absolute -top-3 left-4 flex items-center gap-2 px-2 bg-[#050a14] border border-current border-opacity-30">
          <span className="text-[10px] font-black tracking-widest font-orbitron uppercase">{title}</span>
          {subTitle && <span className="text-[8px] text-slate-400 font-bold">{subTitle}</span>}
        </div>
      )}
      
      {children}
    </div>
  );
};

// --- CutCornerButton Component --
interface CutCornerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  filled?: boolean;
  color?: 'cyan' | 'magenta' | 'amber' | 'slate' | 'pink';
  variant?: 'primary' | 'accent' | 'secondary';
}

export const CutCornerButton: React.FC<CutCornerButtonProps> = ({ 
  children, 
  className, 
  filled = false, 
  color = 'cyan',
  variant,
  ...props 
}) => {

const variantMap = {
  primary: 'pink',
  accent: 'cyan',
  secondary: 'slate',
} as const;

const resolvedColor =
  variant && variantMap[variant]
    ? variantMap[variant]
    : color;

  const styles = {
    cyan: filled ? 'bg-cyan-500 text-black hover:bg-cyan-400' : 'border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10',
    magenta: filled ? 'bg-pink-500 text-white hover:bg-pink-400' : 'border border-pink-500 text-pink-400 hover:bg-pink-500/10',
    amber: filled ? 'bg-amber-500 text-black hover:bg-amber-400' : 'border border-amber-500 text-amber-400 hover:bg-amber-500/10',
    slate: filled ? 'bg-slate-700 text-white hover:bg-slate-600' : 'border border-slate-600 text-slate-400 hover:bg-slate-700/20',
    pink: filled ? 'bg-pink-500 text-white hover:bg-pink-400' : 'border border-pink-500 text-pink-400 hover:bg-pink-500/10',
  };

  return (
    <button 
      className={cn(
        "relative transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
        styles[resolvedColor] || styles.cyan,
        className
      )}
      style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
      {...props}
    >
      {children}
    </button>
  );
};