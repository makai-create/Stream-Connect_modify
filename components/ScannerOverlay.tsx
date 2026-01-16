
import React, { useEffect, useState } from 'react';
import { 
  Check, 
  X, 
  Coffee, 
  UserCheck, 
  LogOut, 
  Clock, 
  ArrowLeft, 
  Navigation, 
  Camera
} from 'lucide-react';
import { CyberFrame } from './CyberUI';

export type PunchType = 'in' | 'out' | 'break_start' | 'break_end';

interface ScannerOverlayProps {
  type: PunchType;
  onClose: () => void;
  onSuccess: () => void;
}

type ScanStep = 'scanning' | 'gps_check' | 'success' | 'error';

export const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ type, onClose, onSuccess }) => {
  const [step, setStep] = useState<ScanStep>('scanning');
  const [scanPos, setScanPos] = useState(0);

  useEffect(() => {
    if (step === 'scanning') {
      const interval = setInterval(() => {
        setScanPos((prev) => (prev >= 100 ? 0 : prev + 2));
      }, 30);
      
      const timer = setTimeout(() => {
        setStep('gps_check');
      }, 2500);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }

    if (step === 'gps_check') {
      const timer = setTimeout(() => {
        setStep('success');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const getPunchMeta = () => {
    switch (type) {
      case 'in':
        return {
          title: "Welcome! / ようこそ！",
          msg: "出勤しました",
          buttonLabel: "リフレッシュザ・ワールド！",
          color: 'cyan' as const
        };
      case 'out':
        return {
          title: "Good Job! / お疲れ様でした！",
          msg: "退勤しました",
          buttonLabel: "ログアウト",
          color: 'cyan' as const
        };
      case 'break_start':
        return {
          title: "Enjoy your break！ / 行ってらっしゃい！",
          msg: "休憩入りしました",
          buttonLabel: "レスト",
          color: 'amber' as const
        };
      case 'break_end':
        return {
          title: "Welcome back! / お帰りなさい！",
          msg: "休憩明けしました",
          buttonLabel: "Break is over",
          color: 'amber' as const
        };
    }
  };

  const meta = getPunchMeta();

  return (
    <div className="fixed inset-0 z-[100] bg-[#050a14] flex flex-col animate-in fade-in duration-300">
      {/* HUD Header */}
      <div className="h-12 border-b border-cyan-400/20 flex items-center px-6 bg-slate-900/60 backdrop-blur-md">
        <button onClick={onClose} className="flex items-center gap-2 text-cyan-400 group">
          <ArrowLeft className="w-5 h-5 group-active:-translate-x-1 transition-transform" />
          <span className="text-sm font-black font-orbitron tracking-widest italic uppercase">IGNITION 打刻</span>
        </button>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-8">
        {step === 'scanning' && (
          <>
            <div className="absolute top-12 text-center">
               <h2 className="text-xl font-black font-orbitron text-cyan-400 tracking-widest uppercase mb-1 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                 QRコードをスキャン
               </h2>
               <div className="w-12 h-[2px] bg-cyan-400 mx-auto" />
            </div>

            <div className="relative w-full aspect-square max-w-[320px] bg-slate-900/40 border border-cyan-500/20 rounded-2xl overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center opacity-50">
                <Camera className="w-16 h-16 text-slate-700 animate-pulse" />
              </div>
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-cyan-400" />
                <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-cyan-400" />
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-cyan-400" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-cyan-400" />
                <div 
                  className="absolute left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_15px_#22d3ee] z-20"
                  style={{ top: `${scanPos}%` }}
                />
              </div>
            </div>

            <div className="absolute bottom-24 text-center px-8">
               <p className="text-xs font-bold text-slate-400 tracking-tight leading-relaxed">
                 店舗のQRコードを枠内に合わせてください
               </p>
            </div>
          </>
        )}

        {step === 'gps_check' && (
          <div className="flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
             <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-cyan-400/30 rounded-full animate-ping" />
                <Navigation className="w-16 h-16 text-cyan-400 animate-pulse" />
             </div>
             <div className="text-center">
                <h3 className="text-2xl font-black font-orbitron text-white mb-2 italic uppercase">Validating GPS</h3>
                <p className="text-xs font-mono text-cyan-400 tracking-[0.2em] uppercase">Confirming Sector Coordinates...</p>
             </div>
          </div>
        )}

        {step === 'success' && (
          <div className="w-full max-w-sm flex flex-col items-center animate-in zoom-in-90 fade-in duration-500">
             <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 border-2 shadow-[0_0_30px_currentColor] transition-all duration-700 ${meta.color === 'cyan' ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10' : 'border-amber-500 text-amber-500 bg-amber-500/10'}`}>
                <Check className="w-14 h-14" />
             </div>
             
             <h2 className="text-2xl font-black text-center text-white mb-6 tracking-tight leading-snug">
               {meta.title}
             </h2>

             <CyberFrame color={meta.color} className="w-full !p-6 flex flex-col items-center gap-4">
                <div className="text-center">
                  <div className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.3em] mb-1">Receipt Confirmed</div>
                  <div className="text-lg font-black text-white">{meta.msg}</div>
                </div>

                <div className="grid grid-cols-2 gap-8 w-full border-t border-slate-800 pt-4 mt-2">
                  <div className="text-left">
                    <span className="text-[9px] text-slate-500 font-mono uppercase block mb-1">Node</span>
                    <span className="text-sm font-bold text-slate-200">渋谷セクター01</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-500 font-mono uppercase block mb-1">Timestamp</span>
                    <span className="text-sm font-orbitron font-black text-white">{new Date().toLocaleTimeString('ja-JP', {hour:'2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
             </CyberFrame>

             <button 
                onClick={onSuccess}
                className={`mt-12 w-16 h-16 rounded-full flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.6)] hover:scale-110 active:scale-95 transition-all group ${meta.color === 'cyan' ? 'bg-cyan-400' : 'bg-amber-500'}`}
             >
                <Check className="w-8 h-8 group-active:scale-90 transition-transform" />
             </button>
          </div>
        )}

        {step === 'error' && (
          <div className="w-full max-w-sm flex flex-col items-center animate-in shake duration-500">
             <div className="w-24 h-24 rounded-full border-2 border-pink-500 text-pink-500 bg-pink-500/10 flex items-center justify-center mb-6 shadow-[0_0_30px_#ec4899]">
                <X className="w-14 h-14" />
             </div>
             <h2 className="text-3xl font-black font-orbitron text-pink-500 mb-2 italic uppercase">Access Denied</h2>
             <p className="text-slate-300 font-bold mb-8">スキャンに失敗しました</p>
             <button 
                onClick={() => setStep('scanning')}
                className="w-full py-5 bg-pink-500 text-slate-950 font-black font-orbitron tracking-widest uppercase rounded-sm"
             >
                RE-INITIALIZE
             </button>
          </div>
        )}
      </div>

      {/* Footer Info HUD */}
      <div className="h-16 border-t border-cyan-400/20 bg-slate-900/60 backdrop-blur-md px-8 flex items-center justify-center">
         <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${step === 'gps_check' ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'} shadow-[0_0_5px_currentColor]`} />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
               <Navigation className="w-3 h-3" />
               位置情報: {step === 'gps_check' ? '確認中...' : step === 'success' ? '確認済' : '待機中'}
            </span>
         </div>
      </div>
    </div>
  );
};
