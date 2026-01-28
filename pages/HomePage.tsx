import React, { useState } from 'react';
import { MapPin, Briefcase as BriefcaseIcon } from 'lucide-react';
import { User, AttendanceStatus, ShiftViewState, AttendanceLogWithCorrection } from '../types';
import { CutCornerButton, CyberFrame } from '../components/CyberUI';
import { ScannerOverlay, PunchType } from '../components/ScannerOverlay';

interface HomePageProps {
  userData: User;
  attendanceStatus: AttendanceStatus;
  startScan: (type: PunchType) => void;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
  handleScanSuccess: (type: PunchType) => void;
  shiftViewState: ShiftViewState;
  setShiftViewState: (state: ShiftViewState) => void;
  attendanceHistory: AttendanceLogWithCorrection[];
  // App.tsx から渡される点火状態
  isIgnited: boolean;
  setIsIgnited: (ignited: boolean) => void;
}

const HomePage: React.FC<HomePageProps> = ({
  userData,
  attendanceStatus,
  startScan,
  isScanning,
  setIsScanning,
  handleScanSuccess,
  shiftViewState,
  setShiftViewState,
  attendanceHistory,
  isIgnited,
  setIsIgnited,
}) => {
  const [currentPunchType, setCurrentPunchType] = useState<PunchType>('in');

  const handleStartScan = (type: PunchType) => {
    setCurrentPunchType(type);
    startScan(type);
  };
  
  // --- 打刻履歴の詳細一覧 (history_list) ---
  if (shiftViewState === 'history_list') {
    return (
      <div className="h-full relative overflow-hidden flex flex-col w-full bg-[#050a14] z-[100]">
        <div className="absolute inset-0 bg-black/90 z-0" />
        <div className="shrink-0 pt-4 px-6 relative z-10 bg-gradient-to-b from-black/80 to-transparent text-left">
           <div className="flex items-center gap-2 text-cyan-400">
             <div className="h-[1px] w-8 bg-cyan-400" />
             <span className="text-xs font-black font-orbitron tracking-widest uppercase text-left">Weekly Log</span>
           </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-28 pt-4 no-scrollbar relative z-10 w-full text-left">
          <div className="space-y-3">
            {attendanceHistory.map((log) => (
              <CyberFrame key={log.id} title={log.date} color={log.status === 'normal' ? 'cyan' : 'amber'} className="shrink-0 !p-3 bg-[#050a14]/90 w-full text-left">
                <div className="flex justify-between items-center text-left">
                  <div className="flex flex-col text-left">
                      <div className="flex items-center gap-2 text-left">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span className="text-[10px] font-bold text-slate-200 text-left">{log.location}</span>
                      </div>
                      <div className="mt-1 flex gap-4 text-left">
                         <span className="text-lg font-orbitron font-black leading-tight text-white text-left">{log.clockIn} - {log.clockOut}</span>
                      </div>
                  </div>
                  <div className={`text-[9px] font-bold px-1.5 py-0.5 border ${log.status === 'normal' ? 'border-cyan-400 text-cyan-400' : 'border-amber-500 text-amber-500'} uppercase font-orbitron text-left`}>
                    {log.status}
                  </div>
                </div>
              </CyberFrame>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-4 pt-12 bg-gradient-to-t from-black via-black/95 to-transparent z-20">
          <CutCornerButton onClick={() => setShiftViewState('menu')} filled color="cyan" className="w-full py-4 font-black tracking-widest font-orbitron uppercase text-sm shadow-xl text-center">
            Return to Home / 戻る
          </CutCornerButton>
        </div>
      </div>
    );
  }

  const statusLabels = {
    none: { label: '未出勤', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/40' },
    working: { label: '勤務中', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/40' },
    break: { label: '休憩中', color: 'text-amber-400', bg: 'bg-emerald-500/10', border: 'border-amber-500/40' },
    finished: { label: '退勤済', color: 'text-slate-500', bg: 'bg-slate-900/40', border: 'border-slate-800' },
  };

  const currentStatus = statusLabels[attendanceStatus] || statusLabels.none;

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden relative">
      
      {/* --- 背景レイヤー --- */}
      <div className={`absolute inset-0 z-0 flex items-end justify-center pointer-events-none transition-opacity duration-300 ${isScanning ? 'opacity-0' : 'opacity-100'}`}>
        <div className="absolute inset-0 bg-[#050a14]">
             <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover opacity-40 mix-blend-overlay" alt="" />
             <div className="absolute inset-0 bg-gradient-to-t from-[#050a14] via-transparent to-[#050a14]/50" />
        </div>
        <img src={userData.avatar} alt="User Avatar" className="h-[90%] w-auto object-cover object-top opacity-80" />
      </div>

      {/* --- UIレイヤー --- */}
      <div className={`relative z-10 flex-1 flex flex-col justify-between pt-6 pb-4 px-6 transition-opacity duration-300 ${isScanning ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        
        {/* 上部エリア */}
        <div className="flex flex-col gap-4 mt-2">
           <CyberFrame title="TODAY'S_SHIFT" subTitle="本日の予定" color="magenta" className="shrink-0 !pb-0 backdrop-blur-md bg-[#050a14]/70 text-left">
              <div className="flex items-center justify-between pb-4 text-left">
                <div className="flex flex-col gap-1 text-left">
                  <div className="flex items-center gap-2 text-pink-500 text-left">
                    <BriefcaseIcon className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-mono uppercase tracking-widest font-bold text-left">Shift Assigned</span>
                  </div>
                  <div className="text-2xl font-black font-orbitron text-white italic tracking-tighter text-left">09:00 - 18:00</div>
                  <div className="flex items-center gap-2 mt-1 border-t border-pink-500/20 pt-1 w-full text-left">
                    <span className="text-[8px] bg-pink-500 text-slate-950 px-1.5 font-black uppercase font-orbitron text-left">Role</span>
                    <span className="text-xs font-bold text-slate-200 text-left">スタッフ</span>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end text-right">
                  <div className="text-[9px] text-slate-500 font-mono uppercase font-orbitron text-right">Node</div>
                  <div className="text-xs font-bold text-pink-500 flex items-center gap-1 text-right"><MapPin className="w-3 h-3" />{userData.location || "渋谷セクター01"}</div>
                </div>
              </div>
            </CyberFrame>

            {/* 点火時のみ表示されるステータスバッジ */}
            {isIgnited && (
              <div className="flex flex-col items-center gap-2 mb-2 animate-in zoom-in-95 duration-500 text-center">
                 <div className={`px-4 py-1.5 border ${currentStatus.border} ${currentStatus.bg} backdrop-blur-md rounded-full flex items-center gap-3 text-center`}>
                   <div className={`w-2 h-2 rounded-full ${currentStatus.color.replace('text', 'bg')} animate-pulse`} />
                   <span className={`text-xs font-black tracking-[0.2em] font-orbitron ${currentStatus.color} text-center`}>STATUS: {currentStatus.label}</span>
                 </div>
              </div>
            )}
        </div>

        {/* 下部エリア */}
        <div className="flex flex-col gap-3">
          
          {isIgnited ? (
            /* --- 点火（ナビボタン押下）後に解放される出退勤ボタン --- */
            <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-4 duration-700 ease-out text-center">
              {(attendanceStatus === 'none' || attendanceStatus === 'finished') && (
                <CutCornerButton 
                  onClick={() => handleStartScan('in')} 
                  filled color="cyan" 
                  className="w-full py-5 flex flex-col items-center !bg-emerald-500 text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.4)] text-center"
                >
                  <span className="text-[10px] opacity-70 tracking-[0.3em] font-mono leading-none mb-1 font-orbitron uppercase text-center">Refresh the World</span>
                  <span className="text-xl font-black tracking-widest font-orbitron uppercase text-center">出勤する</span>
                </CutCornerButton>
              )}

              {attendanceStatus === 'working' && (
                <div className="grid grid-cols-2 gap-3 text-center">
                  <CutCornerButton onClick={() => handleStartScan('out')} filled color="cyan" className="w-full py-5 flex flex-col items-center !bg-blue-600 text-white shadow-lg text-center">
                    <span className="text-[10px] opacity-70 tracking-[0.3em] font-mono mb-1 font-orbitron uppercase text-center">Log out</span>
                    <span className="text-sm font-bold uppercase text-center">退勤する</span>
                  </CutCornerButton>
                  <CutCornerButton onClick={() => handleStartScan('break_start')} filled color="cyan" className="w-full py-5 flex flex-col items-center !bg-blue-600/80 text-white shadow-lg text-center">
                    <span className="text-[10px] opacity-70 tracking-[0.3em] font-mono mb-1 font-orbitron uppercase text-center">Rest</span>
                    <span className="text-sm font-bold uppercase text-center">休憩する</span>
                  </CutCornerButton>
                </div>
              )}

              {attendanceStatus === 'break' && (
                <CutCornerButton onClick={() => handleStartScan('break_end')} filled color="amber" className="w-full py-5 flex flex-col items-center !bg-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.5)] text-center">
                  <span className="text-[10px] opacity-70 tracking-[0.3em] font-mono mb-1 font-orbitron uppercase text-center">Re-Engage</span>
                  <span className="text-lg font-black font-orbitron uppercase text-center">休憩終了する</span>
                </CutCornerButton>
              )}
            </div>
          ) : (
            /* --- 点火前：ナビゲーションへの誘導メッセージ --- */
            <div className="flex items-center justify-center py-6 opacity-40 text-center">
              <p className="text-[10px] text-cyan-400 font-orbitron tracking-[0.4em] uppercase animate-pulse text-center">
                System Offline: Ignite via Nav
              </p>
            </div>
          )}

          {/* 直近ログ：点火に関係なく常に表示 */}
          <CyberFrame title="ATTENDANCE_LOG" subTitle="直近の打刻" color="cyan" className="!p-3 backdrop-blur-md bg-[#050a14]/70 text-left">
            <div className="flex flex-col gap-1 text-left">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60 last:border-0 text-left">
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-mono text-slate-500 uppercase text-left">Dec 17</span>
                  <div className="flex items-center gap-1 text-left"><MapPin className="w-2.5 h-2.5 text-slate-500" /><span className="text-[10px] font-bold text-slate-200 text-left">渋谷セクター01</span></div>
                </div>
                <div className="flex gap-3 items-center text-right">
                  <div className="text-right">
                    <div className="text-[8px] text-cyan-400/60 font-mono uppercase font-orbitron text-right">In</div>
                    <div className="text-sm font-orbitron text-white text-right">09:02</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[8px] text-pink-400/60 font-mono uppercase font-orbitron text-right">Out</div>
                    <div className="text-sm font-orbitron text-white text-right">18:05</div>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={() => setShiftViewState('history_list')} className="text-center w-full text-[9px] text-cyan-400 mt-1 hover:text-white transition-all uppercase tracking-[0.2em] font-bold py-1 text-center">
              [ 履歴をすべて見る ]
            </button>
          </CyberFrame>
        </div>
      </div>

      {isScanning && (
        <div className="absolute inset-0 z-[100] bg-black overflow-hidden">
          <ScannerOverlay 
            type={currentPunchType}
            onClose={() => setIsScanning(false)} 
            onSuccess={() => handleScanSuccess(currentPunchType)}
          />
        </div>
      )}
    </div>
  );
};

export default HomePage;