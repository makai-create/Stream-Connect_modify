import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { CyberFrame, CutCornerButton } from '../components/CyberUI';
import { ShiftViewState, AttendanceLogWithCorrection } from '../types';

interface HistoryPageProps {
  viewState: ShiftViewState;
  setViewState: (state: ShiftViewState) => void;
  historyMonth: Date;
  setHistoryMonth: React.Dispatch<React.SetStateAction<Date>>;
  selectedHistoryDate: string | null;
  setSelectedHistoryDate: (date: string | null) => void;
  attendanceHistory: AttendanceLogWithCorrection[];
}

const HistoryPage: React.FC<HistoryPageProps> = ({
  viewState,
  setViewState,
  historyMonth,
  setHistoryMonth,
  selectedHistoryDate,
  setSelectedHistoryDate,
  attendanceHistory,
}) => {
  
  const [isCorrectionMode, setIsCorrectionMode] = useState(false);
  const [localHistory, setLocalHistory] = useState<AttendanceLogWithCorrection[]>([]);

  const year = historyMonth.getFullYear();
  const month = historyMonth.getMonth() + 1;

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();

  useEffect(() => {
    const mockData: AttendanceLogWithCorrection[] = [];
    for (let i = 0; i < 3; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        if (d.getFullYear() === year && (d.getMonth() + 1) === month) {
            const dStr = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
            mockData.push({
                id: `auto-${dStr}`,
                date: dStr,
                clockIn: "09:02",
                clockOut: "18:05",
                location: "渋谷セクター01",
                status: i === 1 ? "late" : "normal", 
                correctionStatus: "none"
            });
        }
    }
    setLocalHistory(mockData);
  }, [historyMonth, year, month]);

  const handleMonthChange = (delta: number) => {
    setHistoryMonth(new Date(year, historyMonth.getMonth() + delta, 1));
    setSelectedHistoryDate(null);
    setIsCorrectionMode(false);
  };

  const formatDate = (y: number, m: number, d: number) => 
    `${y}.${String(m).padStart(2, '0')}.${String(d).padStart(2, '0')}`;

  const handleDateClick = (dateStr: string) => {
    setSelectedHistoryDate(dateStr);
    setIsCorrectionMode(false);
  };

  const handleSubmitCorrection = () => {
    if (selectedHistoryDate) {
      setLocalHistory(prev => prev.map(log => 
        log.date === selectedHistoryDate 
          ? { ...log, correctionStatus: 'pending' } 
          : log
      ));
      alert('修正申請を送信しました');
      setIsCorrectionMode(false);
    }
  };

  const getLog = (day: number) => {
    const dateStr = formatDate(year, month, day);
    return localHistory.find(log => log.date === dateStr);
  };

  const selectedLog = selectedHistoryDate 
    ? localHistory.find(log => log.date === selectedHistoryDate) 
    : null;

  const isSelectedPending = selectedLog?.correctionStatus === 'pending';

  // --- 画面 A: 修正申請フォーム (ボタンをフロー内に移動) ---
  if (isCorrectionMode && selectedLog) {
    return (
      <div className="absolute inset-0 z-30 bg-[#050a14] text-white flex flex-col overflow-hidden animate-in slide-in-from-right-10 duration-300">
        
        <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        {/* ヘッダーは固定 */}
        <div className="flex items-center px-6 py-4 mt-12 bg-[#050a14]/95 backdrop-blur-md sticky top-0 z-20 border-b border-amber-900/30">
          <button onClick={() => setIsCorrectionMode(false)} className="mr-4 group p-1">
            <ArrowLeft className="w-5 h-5 text-amber-500 group-hover:text-amber-400 transition-colors" />
          </button>
          <span className="font-bold text-lg text-amber-50 tracking-wider font-orbitron uppercase italic">Correction_Request</span>
        </div>

        {/* コンテンツエリア：ボタンをこのリストの最後に入れます */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-6 space-y-6 pb-24 no-scrollbar relative z-10">
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-amber-500 tracking-widest pl-1 uppercase font-orbitron">Target Date</label>
            <div className="w-full bg-zinc-900/50 border border-amber-700/50 p-4 rounded text-base font-orbitron tracking-wider text-amber-50">
              {selectedLog.date.replace(/\./g, '/')}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-amber-500 tracking-widest pl-1 uppercase font-orbitron">Correction Type</label>
            <div className="relative">
              <select className="w-full bg-zinc-900 border border-amber-900/60 text-amber-50 p-4 rounded text-sm focus:border-amber-500 focus:outline-none appearance-none transition-all shadow-lg">
                <option>時刻修正</option>
                <option>追加</option>
                <option>削除</option>
              </select>
              <div className="absolute right-4 top-4 pointer-events-none text-amber-500 text-[10px]">▼</div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-amber-500 tracking-widest pl-1 uppercase font-orbitron">Punch Type</label>
            <div className="relative">
              <select className="w-full bg-zinc-900 border border-amber-900/60 text-amber-50 p-4 rounded text-sm focus:border-amber-500 focus:outline-none appearance-none transition-all shadow-lg">
                <option>出勤</option>
                <option>退勤</option>
                <option>休憩開始</option>
                <option>休憩終了</option>
              </select>
              <div className="absolute right-4 top-4 pointer-events-none text-amber-500 text-[10px]">▼</div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-amber-500 tracking-widest pl-1 uppercase font-orbitron">New Time Entry</label>
            <input 
              type="time" 
              defaultValue={selectedLog.clockIn} 
              className="w-full bg-zinc-900 border border-amber-900/60 p-4 rounded text-xl font-orbitron tracking-widest text-amber-50 focus:border-amber-500 focus:outline-none transition-all shadow-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-amber-500 tracking-widest pl-1 uppercase font-orbitron">Reason (Required)</label>
            <textarea 
              className="w-full bg-zinc-900 border border-amber-900/60 p-4 rounded text-sm text-amber-50 focus:border-amber-500 focus:outline-none h-32 resize-none transition-all shadow-lg"
              placeholder="修正理由を入力してください..."
            />
          </div>

          {/* ★修正箇所：ボタンを absolute 指定から外し、項目の最後に配置しました */}
          <div className="pt-8">
            <CutCornerButton 
              onClick={handleSubmitCorrection}
              filled 
              color="amber"
              className="w-full py-5 font-black tracking-widest text-black text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)] uppercase italic"
            >
              申請内容を送信
            </CutCornerButton>
          </div>

        </div>
      </div>
    );
  }

  // --- 画面 B: カレンダー & 詳細 (メイン画面) ---
  return (
    <div className="h-full bg-[#050505] text-white flex flex-col relative overflow-hidden">
      
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="flex-1 overflow-y-auto overscroll-contain no-scrollbar p-4 pt-2 pb-32">
        
        <div className="flex items-center justify-between px-2 mb-4">
          <button onClick={() => handleMonthChange(-1)} className="p-2 text-zinc-500 hover:text-white"><ChevronLeft /></button>
          <div className="text-center">
             <div className="text-[10px] text-cyan-500 font-bold tracking-[0.2em] mb-1 font-orbitron uppercase">TARGET_MONTH</div>
             <h2 className="text-3xl font-black font-orbitron italic tracking-tighter text-white transform -skew-x-6" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
               {year}年{month}月
             </h2>
          </div>
          <button onClick={() => handleMonthChange(1)} className="p-2 text-zinc-500 hover:text-white"><ChevronRight /></button>
        </div>

        <CyberFrame title={`CALENDAR_${year}_${month}`} color="cyan" className="shrink-0 mb-6 font-orbitron overflow-visible">
          <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-bold text-zinc-600">
             <div className="text-pink-600">日</div>
             <div>月</div>
             <div>火</div>
             <div>水</div>
             <div>木</div>
             <div>金</div>
             <div className="text-cyan-600">土</div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = formatDate(year, month, day);
              const log = getLog(day);
              const isSelected = selectedHistoryDate === dateStr;
              const isPending = log?.correctionStatus === 'pending';

              const dotColor = isPending 
                ? 'bg-amber-500 shadow-[0_0_5px_#f59e0b]' 
                : (log?.status === 'normal' ? 'bg-cyan-400 shadow-[0_0_5px_#22d3ee]' : 'bg-amber-500 shadow-[0_0_5px_#f59e0b]');

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(dateStr)}
                  className={`
                    aspect-square relative flex flex-col items-center justify-center rounded-sm transition-all duration-200
                    ${isSelected 
                      ? 'border border-cyan-400 bg-cyan-900/40 text-white shadow-[0_0_10px_rgba(34,211,238,0.4)] z-10' 
                      : 'border border-zinc-800/50 bg-zinc-900/20 text-zinc-400 hover:bg-zinc-800'}
                  `}
                >
                  <span className={`text-sm font-bold ${log ? 'text-white' : ''}`}>{day}</span>
                  
                  {log && (
                    <div className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${dotColor}`} />
                  )}
                </button>
              );
            })}
          </div>
        </CyberFrame>

        {selectedHistoryDate && (
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-300 relative">
                <div className="mb-2 ml-1 text-sm font-black italic font-orbitron tracking-wider text-white border-l-4 border-cyan-400 pl-2 uppercase font-orbitron tracking-widest">
                    {selectedHistoryDate}
                </div>
                
                <div className={`transition-all duration-300 ${isSelectedPending ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                    <CyberFrame title="LOG_DETAIL" color="cyan" className="!p-5 bg-[#050a14]/80 mb-6 border-t-0 font-sans overflow-visible">
                        {selectedLog ? (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-zinc-800/60 pb-2">
                                        <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest font-orbitron">Clock_In</span>
                                        <span className="text-xl font-black font-orbitron text-white tracking-widest">{selectedLog.clockIn}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-zinc-800/60 pb-2">
                                        <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest font-orbitron">Break_Record</span>
                                        <span className="text-xl font-black font-orbitron text-white tracking-widest">12:00 - 13:00</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-zinc-800/60 pb-2">
                                        <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest font-orbitron">Clock_Out</span>
                                        <span className="text-xl font-black font-orbitron text-white tracking-widest">{selectedLog.clockOut}</span>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <div className="text-[10px] text-cyan-500 font-bold mb-1 font-orbitron tracking-widest uppercase">Node_Identity</div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-white">スタッフ</span>
                                        <span className="text-xs font-bold text-white">{selectedLog.location}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-6 text-center text-xs text-zinc-500 font-bold uppercase tracking-widest font-orbitron">No_Log_Data</div>
                        )}
                    </CyberFrame>
                </div>

                {isSelectedPending ? (
                    <button disabled className="w-full py-4 bg-zinc-800 text-zinc-500 font-bold tracking-widest text-sm cursor-not-allowed border border-zinc-700 font-orbitron uppercase italic">修正申請中</button>
                ) : (
                    <CutCornerButton 
                        onClick={() => setIsCorrectionMode(true)}
                        filled
                        color="amber"
                        className="w-full py-4 font-black tracking-widest text-sm shadow-lg text-black uppercase font-orbitron italic"
                    >
                        打刻修正申請
                    </CutCornerButton>
                )}
            </div>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default HistoryPage;