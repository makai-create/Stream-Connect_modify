import React, { useEffect, useState } from 'react';
import { X, Check, ChevronLeft, ScanLine } from 'lucide-react';
import { CutCornerButton } from './CyberUI';

export type PunchType = 'in' | 'out' | 'break_start' | 'break_end';

interface ScannerOverlayProps {
  type: PunchType;
  onClose: () => void;
  onSuccess: (type: PunchType) => void;
}

export const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ type, onClose, onSuccess }) => {
  const [scanState, setScanState] = useState<'scanning' | 'success'>('scanning');
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    if (scanState === 'success') {
      const now = new Date();
      setTimestamp(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    }
  }, [scanState]);

  const handleScanDetect = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setScanState('success');
  };

  const getConfig = () => {
    switch (type) {
      case 'in': return { title: 'Welcome! / ようこそ！', status: '出勤しました', color: 'text-cyan-400', borderColor: 'border-cyan-400', glowColor: 'shadow-[0_0_30px_rgba(34,211,238,0.6)]', btnClass: '!bg-cyan-500 text-black', btnBaseColor: 'cyan' as const };
      case 'out': return { title: 'Good Job! / お疲れ様でした', status: '退勤しました', color: 'text-blue-500', borderColor: 'border-blue-500', glowColor: 'shadow-[0_0_30px_rgba(59,130,246,0.6)]', btnClass: '!bg-blue-600 text-white', btnBaseColor: 'cyan' as const };
      case 'break_start': return { title: 'Enjoy your break! / 行ってらっしゃい！', status: '休憩入りしました', color: 'text-amber-500', borderColor: 'border-amber-500', glowColor: 'shadow-[0_0_30px_rgba(245,158,11,0.6)]', btnClass: '!bg-amber-500 text-black', btnBaseColor: 'amber' as const };
      case 'break_end': return { title: 'Welcome back! / お帰りなさい！', status: '休憩明けしました', color: 'text-amber-500', borderColor: 'border-amber-500', glowColor: 'shadow-[0_0_30px_rgba(245,158,11,0.6)]', btnClass: '!bg-amber-500 text-black', btnBaseColor: 'amber' as const };
      default: return { title: 'Confirmed', status: '完了しました', color: 'text-white', borderColor: 'border-white', glowColor: 'shadow-none', btnClass: '!bg-white text-black', btnBaseColor: 'slate' as const };
    }
  };

  const config = getConfig();

  // --- 1. スキャン中の画面 (背景歪み・拡大・ステータスバー干渉を排除) ---
  if (scanState === 'scanning') {
    return (
      <div 
        onClick={handleScanDetect}
        className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300 cursor-pointer overflow-hidden"
      >
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div 
            className="w-full h-full opacity-20"
            style={{
              backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(34,211,238,.3) 25%, rgba(34,211,238,.3) 26%, transparent 27%, transparent 74%, rgba(34,211,238,.3) 75%, rgba(34,211,238,.3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(34,211,238,.3) 25%, rgba(34,211,238,.3) 26%, transparent 27%, transparent 74%, rgba(34,211,238,.3) 75%, rgba(34,211,238,.3) 76%, transparent 77%, transparent)`,
              backgroundSize: '50px 50px',
              backgroundPosition: 'center'
            }} 
          />
        </div>

        <div className="relative z-10 w-full flex flex-col items-center justify-center pointer-events-none">
          <div className="relative w-60 h-60 mb-8 shrink-0">
             <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400" />
             <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400" />
             <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400" />
             <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400" />
             <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <div className="w-full h-[2px] bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-scan-move" />
             </div>
          </div>
          <div className="text-cyan-400 font-bold tracking-widest font-orbitron text-sm">READY TO SCAN</div>
        </div>

        <div className="absolute bottom-8 z-20 pointer-events-auto">
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="w-12 h-12 rounded-full border border-zinc-800 bg-black/80 flex items-center justify-center active:scale-90 transition-transform">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <style>{`
          @keyframes scan-move { 0% { transform: translateY(-110px); } 100% { transform: translateY(110px); } }
          .animate-scan-move { animation: scan-move 2.5s linear infinite; }
        `}</style>
      </div>
    );
  }

  // --- 2. スキャン完了画面 (背景ズレ解消版) ---
  return (
    <div className="absolute inset-0 z-[100] bg-[#050a14] text-white flex flex-col animate-in fade-in duration-300 overflow-hidden">
      <div className="h-14 flex items-center px-4 border-b border-zinc-800 bg-[#050a14]/95 shrink-0">
        <button onClick={() => onSuccess(type)} className="flex items-center gap-1 text-cyan-400 font-bold text-[10px] font-orbitron uppercase tracking-widest">
           <ChevronLeft className="w-3 h-3" /> Back
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 pb-12 overflow-y-auto no-scrollbar">
        <div className={`shrink-0 w-16 h-16 rounded-full border-2 ${config.borderColor} flex items-center justify-center mb-6 ${config.glowColor}`}>
           <Check className={`w-8 h-8 ${config.color}`} />
        </div>
        <h2 className="text-base font-bold text-white mb-6 text-center uppercase tracking-tight">{config.title}</h2>

        <div className="relative w-full max-w-[260px] bg-black/40 border border-zinc-800 p-6 rounded-sm shrink-0 backdrop-blur-md">
           <div className={`absolute -top-[1px] -left-[1px] w-3 h-3 border-t border-l ${config.borderColor}`} />
           <div className={`absolute -top-[1px] -right-[1px] w-3 h-3 border-t border-r ${config.borderColor}`} />
           <div className={`absolute -bottom-[1px] -left-[1px] w-3 h-3 border-b border-l ${config.borderColor}`} />
           <div className={`absolute -bottom-[1px] -right-[1px] w-3 h-3 border-b border-r ${config.borderColor}`} />
           <div className="absolute -top-2.5 left-4 bg-[#050a14] px-2 text-[7px] font-bold text-cyan-500 tracking-widest font-orbitron border border-zinc-800 uppercase">System_Auth</div>
           
           <div className="text-center mb-4">
             <div className="text-[7px] text-zinc-500 tracking-[0.3em] mb-1 font-orbitron uppercase">Receipt Confirmed</div>
             <div className="text-lg font-black text-white">{config.status}</div>
           </div>
           <div className="h-[1px] w-full bg-zinc-800/50 mb-3" />
           <div className="flex justify-between items-end">
             <div className="flex flex-col text-left">
               <span className="text-[7px] text-zinc-600 uppercase tracking-widest mb-1 font-orbitron">Node</span>
               <span className="text-[9px] font-bold text-slate-300">渋谷セクター01</span>
             </div>
             <div className="flex flex-col items-end">
               <span className="text-[7px] text-zinc-600 uppercase tracking-widest mb-1 font-orbitron">Timestamp</span>
               <span className="text-base font-black text-white font-orbitron">{timestamp}</span>
             </div>
           </div>
        </div>

        <div className="mt-8 w-full max-w-[260px] shrink-0">
          <CutCornerButton onClick={() => onSuccess(type)} filled color={config.btnBaseColor} className={`w-full py-4 font-black tracking-widest text-xs shadow-xl font-orbitron uppercase ${config.btnClass}`}>
            OK
          </CutCornerButton>
        </div>
      </div>
    </div>
  );
};