import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Save,
  Calendar as CalendarIcon, 
  Clock,
  CheckCircle,
  ArrowLeft,
  List
} from 'lucide-react';
import { CyberFrame, CutCornerButton } from '../components/CyberUI';

const ShiftPage = ({
    viewState,
    setViewState,
    shiftMonth,
    setShiftMonth,
    shiftData,
    setShiftData,
    selectedShiftDate,
    setSelectedShiftDate,
    attendanceHistory = []
}) => {
  
  const [tempData, setTempData] = useState(null);
  const [isCorrectionMode, setIsCorrectionMode] = useState(false);
  const [localHistory, setLocalHistory] = useState(attendanceHistory);
  const [confirmDisplayMode, setConfirmDisplayMode] = useState('calendar');

  const year = shiftMonth.getFullYear();
  const month = shiftMonth.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();

  // スクロールバー非表示用の共通スタイル
  const noScrollStyle = {
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    WebkitOverflowScrolling: 'touch'
  };

  const calculateTotalHours = (start, end) => {
    if (!start || !end) return "0:00";
    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    let diffMinutes = (eH * 60 + eM) - (sH * 60 + sM) - 60; 
    if (diffMinutes < 0) diffMinutes = 0;
    const h = Math.floor(diffMinutes / 60);
    const m = diffMinutes % 60;
    return `${h}:${String(m).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (attendanceHistory.length === 0) {
      const mockData = [];
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
    } else {
      setLocalHistory(attendanceHistory);
    }
  }, [shiftMonth, year, month, attendanceHistory]);

  const now = new Date();
  const targetPeriodStart = "01";
  const targetPeriodEnd = "15";
  const targetMonth = month;
  
  const deadlineDate = new Date();
  deadlineDate.setDate(now.getDate() + 3);
  const deadlineStr = `${String(deadlineDate.getMonth() + 1).padStart(2, '0')}/${String(deadlineDate.getDate()).padStart(2, '0')}`;

  const formatDate = (y, m, d) => 
    `${y}.${String(m).padStart(2, '0')}.${String(d).padStart(2, '0')}`;

  const handleMonthChange = (delta) => {
    setShiftMonth(new Date(year, shiftMonth.getMonth() + delta, 1));
    setSelectedShiftDate(null);
    setIsCorrectionMode(false);
  };

  const handleDateClick = (day) => {
    const dateStr = formatDate(year, month, day);
    if (shiftData[dateStr]) {
      setTempData({ ...shiftData[dateStr] });
    } else {
      setTempData({
        date: dateStr,
        type: 'none',
        startTime: '09:00',
        endTime: '18:00',
        memo: '',
        status: 'draft'
      });
    }
    setSelectedShiftDate(dateStr);
  };

  const handleSaveTemp = () => {
    if (selectedShiftDate && tempData) {
      setShiftData(prev => ({ ...prev, [selectedShiftDate]: tempData }));
      setSelectedShiftDate(null);
    }
  };

  const handleFinalSubmit = () => {
    const updatedData = { ...shiftData };
    Object.keys(updatedData).forEach(key => {
      if (updatedData[key].type !== 'none') {
        updatedData[key].status = 'pending';
      }
    });
    setShiftData(updatedData);
    alert('シフト希望を申請しました！');
    setViewState('confirm');
  };

  const handleSubmitCorrection = () => {
    if (selectedShiftDate) {
      setLocalHistory(prev => prev.map(log => 
        log.date === selectedShiftDate 
          ? { ...log, correctionStatus: 'pending' } 
          : log
      ));
      alert('修正申請を送信しました');
      setIsCorrectionMode(false);
    }
  };

  const getCalendarMark = (type) => {
      switch (type) {
        case 'desired': return '●';
        case 'any': return '⚪︎';
        case 'negotiable': return '△';
        default: return null;
      }
  };

  const getStatusLabel = (type) => {
    switch (type) {
      case 'desired': return '希望あり';
      case 'any': return 'どこでも';
      case 'negotiable': return '相談可';
      default: return 'なし';
    }
  };

  const selectedLog = selectedShiftDate 
    ? localHistory.find(log => log.date === selectedShiftDate) 
    : null;

  const isSelectedPending = selectedLog?.correctionStatus === 'pending';

  const WeekdayHeader = () => (
    <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[10px] font-bold uppercase tracking-widest">
      <div className="text-pink-600">日</div>
      <div className="text-white">月</div>
      <div className="text-white">火</div>
      <div className="text-white">水</div>
      <div className="text-white">木</div>
      <div className="text-white">金</div>
      <div className="text-cyan-600">土</div>
    </div>
  );

  // --- 1. メニュー画面 ---
  if (viewState === 'menu' || !viewState) {
    return (
      <div 
        className="flex-1 flex flex-col p-6 space-y-6 animate-in fade-in duration-500 overflow-y-auto no-scrollbar pb-32 relative z-10 text-left pt-2"
        style={noScrollStyle}
      >
        <div className="flex flex-col gap-1 mb-4 mt-2">
          <div className="text-[10px] text-cyan-50 font-bold tracking-[0.4em] font-orbitron uppercase">Operation_Select</div>
          <h2 className="text-3xl font-black font-orbitron text-white border-l-4 border-cyan-400 pl-3 uppercase">Shift_Hub</h2>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <CutCornerButton onClick={() => setViewState('request')} filled color="magenta" className="w-full py-8 flex flex-col items-center justify-center gap-2">
            <CalendarIcon className="w-6 h-6" />
            <div className="flex flex-col items-center justify-center">
              <span className="text-sm font-black text-center">新規作成 / シフト希望提出</span>
              <span className="text-[9px] font-orbitron opacity-70 tracking-widest uppercase mt-1 text-center">Submit_New_Request</span>
            </div>
          </CutCornerButton>
          <CutCornerButton onClick={() => setViewState('confirm')} filled color="cyan" className="w-full py-8 flex flex-col items-center justify-center gap-2">
            <CheckCircle className="w-6 h-6" />
            <div className="flex flex-col items-center justify-center">
              <span className="text-sm font-black text-center">シフト確認 / 承認待ち・確定済み</span>
              <span className="text-[9px] font-orbitron opacity-70 tracking-widest uppercase mt-1 text-center">Schedule_Review</span>
            </div>
          </CutCornerButton>
          <CutCornerButton onClick={() => { setViewState('correction'); setIsCorrectionMode(false); }} filled color="amber" className="w-full py-8 flex flex-col items-center justify-center gap-2">
            <Clock className="w-6 h-6" />
            <div className="flex flex-col items-center justify-center">
              <span className="text-sm font-black text-center">打刻修正 / 履歴確認</span>
              <span className="text-[9px] font-orbitron opacity-70 tracking-widest uppercase mt-1 text-center">Attendance_Correction</span>
            </div>
          </CutCornerButton>
        </div>
      </div>
    );
  }

  // --- 2. 修正申請フォーム画面 (更新FIX版) ---
  if (viewState === 'correction' && isCorrectionMode && selectedLog) {
    return (
      <div className="absolute inset-0 z-30 bg-[#050a14] text-white flex flex-col overflow-hidden animate-in slide-in-from-right-10 duration-300 text-left">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        
        {/* ヘッダーガード：高さを調整 */}
        <div className="h-6 w-full mt-4 z-20" />

        <div 
            className="flex-1 overflow-y-auto overscroll-contain p-6 space-y-6 pb-32 no-scrollbar relative z-10 text-left pt-2"
            style={noScrollStyle}
        >
          <div className="space-y-2">
            <label className="text-xs font-bold text-amber-500 tracking-widest pl-1 uppercase font-orbitron">対象日</label>
            <div className="w-full bg-zinc-900/50 border border-amber-700/50 p-4 rounded text-base font-orbitron tracking-wider text-amber-50">
              {selectedLog.date.replace(/\./g, '/')}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-amber-500 tracking-widest pl-1 uppercase font-orbitron">修正種別</label>
            <div className="relative">
              <select className="w-full bg-zinc-900 border border-amber-900/60 text-amber-50 p-4 rounded text-sm focus:border-amber-500 focus:outline-none appearance-none transition-all shadow-lg font-bold">
                <option>時刻修正</option>
                <option>追加</option>
                <option>削除</option>
              </select>
              <div className="absolute right-4 top-4 pointer-events-none text-amber-500 text-[10px]">▼</div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-amber-500 tracking-widest pl-1 uppercase font-orbitron">打刻種別</label>
            <div className="relative">
              <select className="w-full bg-zinc-900 border border-amber-900/60 text-amber-50 p-4 rounded text-sm focus:border-amber-500 focus:outline-none appearance-none transition-all shadow-lg font-bold">
                <option>出勤</option>
                <option>退勤</option>
                <option>休憩開始</option>
                <option>休憩終了</option>
              </select>
              <div className="absolute right-4 top-4 pointer-events-none text-amber-500 text-[10px]">▼</div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-amber-500 tracking-widest pl-1 uppercase font-orbitron">修正時刻</label>
            <input type="time" defaultValue={selectedLog.clockIn} className="w-full bg-zinc-900 border border-amber-900/60 p-4 rounded text-xl font-orbitron tracking-widest text-amber-50 focus:border-amber-500 focus:outline-none transition-all shadow-lg font-bold" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-amber-500 tracking-widest pl-1 uppercase font-orbitron">理由 (必須)</label>
            <textarea className="w-full bg-zinc-900 border border-amber-900/60 p-4 rounded text-sm text-amber-50 focus:border-amber-500 focus:outline-none h-32 resize-none transition-all shadow-lg" placeholder="修正理由を入力してください..." />
          </div>

          <div className="pt-8 flex flex-col gap-4">
            <CutCornerButton 
              onClick={handleSubmitCorrection} 
              filled 
              color="amber" 
              className="w-full py-5 font-black tracking-widest text-black text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)] uppercase font-orbitron flex justify-center"
            >
              申請内容を送信
            </CutCornerButton>
            
            <CutCornerButton 
              onClick={() => setIsCorrectionMode(false)} 
              filled 
              color="slate" 
              className="w-full py-4 font-black tracking-widest text-zinc-400 text-xs border-zinc-700 uppercase font-orbitron flex justify-center"
            >
              戻って修正する
            </CutCornerButton>
          </div>
        </div>
      </div>
    );
  }

  // --- 3. 打刻修正 / 履歴カレンダー ---
  if (viewState === 'correction') {
    return (
      <div className="h-full bg-[#050505] text-cyan-50 font-sans flex flex-col relative overflow-hidden text-left">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div 
            className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar relative z-10 pb-32 text-left pt-2"
            style={noScrollStyle}
        >
          <button onClick={() => setViewState('menu')} className="flex items-center gap-2 text-white text-xs font-bold mb-2 font-orbitron uppercase text-left hover:text-zinc-300"><ArrowLeft size={16} /> 戻る</button>
          <div className="flex items-center justify-between px-2 text-left">
            <button onClick={() => handleMonthChange(-1)} className="p-2 text-zinc-500 hover:text-white text-left"><ChevronLeft /></button>
            <h2 className="text-3xl font-black font-orbitron text-white transform -skew-x-6 text-left">{year}年{month}月</h2>
            <button onClick={() => handleMonthChange(1)} className="p-2 text-zinc-500 hover:text-white text-left"><ChevronRight /></button>
          </div>
          <CyberFrame title="ATTENDANCE_HISTORY" color="amber">
            <WeekdayHeader />
            <div className="grid grid-cols-7 gap-1 text-left">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="text-left" />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1; const dateStr = formatDate(year, month, day); const log = localHistory.find(l => l.date === dateStr);
                const isSelected = selectedShiftDate === dateStr; const isPending = log?.correctionStatus === 'pending';
                const dotColor = isPending ? 'bg-amber-500 shadow-[0_0_5px_#f59e0b]' : 'bg-cyan-400 shadow-[0_0_5px_#22d3ee]';
                return (
                  <button key={day} onClick={() => setSelectedShiftDate(dateStr)} className={`aspect-square relative flex flex-col items-center justify-center rounded-sm border transition-all ${isSelected ? 'border-amber-400 bg-amber-900/40 text-white shadow-[0_0_10px_#f59e0b66]' : 'border-zinc-800 bg-zinc-900/20 text-zinc-400'} text-left`}>
                    <span className="text-sm font-bold text-left">{day}</span>
                    {log && <div className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${dotColor}`} />}
                  </button>
                );
              })}
            </div>
          </CyberFrame>
          {selectedShiftDate && (
             <div className="animate-in slide-in-from-bottom-4 duration-300 text-left">
                <div className={`transition-all duration-300 ${isSelectedPending ? 'opacity-50 grayscale pointer-events-none' : ''} text-left`}>
                    <CyberFrame title="LOG_DETAIL" color="amber" className="!p-5 bg-zinc-900/60 text-left">
                        {selectedLog ? (
                            <div className="space-y-4 text-left">
                                <div className="flex justify-between items-center border-b border-zinc-800/60 pb-2 text-left"><span className="text-xs text-zinc-500 font-bold uppercase tracking-widest font-orbitron text-left">出勤</span><span className="text-xl font-black font-orbitron text-white tracking-widest text-left">{selectedLog.clockIn}</span></div>
                                <div className="flex justify-between items-center border-b border-zinc-800/60 pb-2 text-left"><span className="text-xs text-zinc-500 font-bold uppercase tracking-widest font-orbitron text-left">退勤</span><span className="text-xl font-black font-orbitron text-white tracking-widest text-left">{selectedLog.clockOut}</span></div>
                                <div className="flex justify-between items-center border-b border-zinc-800/60 pb-2 text-left"><span className="text-xs text-zinc-500 font-bold uppercase tracking-widest font-orbitron text-left">休憩</span><span className="text-xl font-black font-orbitron text-white tracking-widest text-left">12:00-13:00</span></div>
                                <div className="pt-2 flex justify-between items-center text-left"><span className="text-[10px] text-amber-500 font-bold font-orbitron uppercase text-left">合計時間</span><span className="text-xl font-black font-orbitron text-white tracking-widest text-left">{calculateTotalHours(selectedLog.clockIn, selectedLog.clockOut)}</span></div>
                            </div>
                        ) : <div className="py-4 text-center text-zinc-500 text-xs font-bold uppercase tracking-widest italic text-left">No Data</div>}
                    </CyberFrame>
                </div>
                {isSelectedPending ? <button disabled className="w-full mt-4 py-4 bg-zinc-800 text-zinc-500 font-bold tracking-widest text-sm cursor-not-allowed border border-zinc-700 font-orbitron uppercase text-center flex justify-center text-left">承認待ち</button> : <CutCornerButton onClick={() => setIsCorrectionMode(true)} filled color="amber" className="w-full mt-4 py-4 font-black tracking-widest text-sm shadow-lg text-black uppercase font-orbitron flex justify-center text-left">打刻修正申請を行う</CutCornerButton>}
             </div>
          )}
        </div>
      </div>
    );
  }

  // --- 4. 確定・申請中シフト確認 ビュー ---
  if (viewState === 'confirm') {
    const activeShifts = Object.entries(shiftData).filter(([_, data]) => data.type !== 'none');
    const selectedConfirmData = selectedShiftDate ? shiftData[selectedShiftDate] : null;

    return (
      <div className="h-full bg-[#050505] text-cyan-50 font-sans flex flex-col relative overflow-hidden text-left">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div 
            className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar relative z-10 pb-32 text-left pt-2"
            style={noScrollStyle}
        >
          <div className="flex justify-between items-center mb-2 text-left">
            <button onClick={() => setViewState('menu')} className="flex items-center gap-2 text-white text-xs font-bold font-orbitron uppercase text-left hover:text-zinc-300"><ArrowLeft size={16} /> 戻る</button>
            <div className="flex bg-zinc-900 p-1 rounded-sm border border-cyan-900/50 text-left"><button onClick={() => setConfirmDisplayMode('calendar')} className={`p-1.5 rounded-sm transition-all ${confirmDisplayMode === 'calendar' ? 'bg-cyan-500 text-black shadow-lg' : 'text-zinc-500'} text-left`}><CalendarIcon size={14} /></button><button onClick={() => setConfirmDisplayMode('list')} className={`p-1.5 rounded-sm transition-all ${confirmDisplayMode === 'list' ? 'bg-cyan-500 text-black shadow-lg' : 'text-zinc-500'} text-left`}><List size={14} /></button></div>
          </div>
          <div className="flex items-center justify-between px-2 text-left"><button onClick={() => handleMonthChange(-1)} className="p-2 text-zinc-500 hover:text-white text-left"><ChevronLeft /></button><h2 className="text-3xl font-black font-orbitron text-white transform -skew-x-6 text-left">{year}年{month}月</h2><button onClick={() => handleMonthChange(1)} className="p-2 text-zinc-500 hover:text-white text-left"><ChevronRight /></button></div>
          
          {confirmDisplayMode === 'calendar' ? (
            <>
              <CyberFrame title="SCHEDULE_VIEW" color="cyan" className="text-left">
                <WeekdayHeader />
                <div className="grid grid-cols-7 gap-1 text-left">
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="text-left" />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1; const dateStr = formatDate(year, month, day); const data = shiftData[dateStr];
                    const isSelected = selectedShiftDate === dateStr;
                    return (
                      <button key={day} onClick={() => setSelectedShiftDate(dateStr)} className={`aspect-square relative flex flex-col items-center justify-center rounded-sm border transition-all ${isSelected ? 'border-cyan-400 bg-cyan-900/20 shadow-[0_0_10px_#22d3ee66]' : 'border-zinc-800 bg-zinc-900/20 text-zinc-400'} text-left`}>
                        <span className="text-sm font-bold text-left">{day}</span>
                        {data && data.type !== 'none' && (<div className={`absolute top-1 right-1 text-[8px] leading-none ${data.status === 'pending' ? 'text-cyan-400' : 'text-pink-400'} text-left`}>{getCalendarMark(data.type)}</div>)}
                      </button>
                    );
                  })}
                </div>
              </CyberFrame>
              {selectedShiftDate && selectedConfirmData && selectedConfirmData.type !== 'none' && (
                <div className="animate-in slide-in-from-bottom-4 duration-300 text-left">
                  <CyberFrame title="SHIFT_DETAIL" color={selectedConfirmData.status === 'pending' ? 'cyan' : 'magenta'} className="!p-5 bg-zinc-900/60 text-left">
                    <div className="space-y-4 text-left">
                        <div className="flex justify-between items-center border-b border-zinc-800/60 pb-2 text-left"><span className="text-xs text-zinc-500 font-bold uppercase font-orbitron text-left">勤務時間</span><span className="text-xl font-black font-orbitron text-white tracking-widest text-left">{selectedConfirmData.startTime} - {selectedConfirmData.endTime}</span></div>
                        <div className="flex justify-between items-center border-b border-zinc-800/60 pb-2 text-left"><span className="text-xs text-zinc-500 font-bold uppercase font-orbitron text-left">休憩時間</span><span className="text-xl font-black font-orbitron text-white tracking-widest text-left">12:00 - 13:00</span></div>
                        <div className="pt-2 flex justify-between items-center text-left"><span className="text-[10px] text-zinc-500 font-bold font-orbitron uppercase text-left">合計時間</span><span className="text-xl font-black font-orbitron text-white tracking-widest text-left">{calculateTotalHours(selectedConfirmData.startTime, selectedConfirmData.endTime)}</span></div>
                        <div className="pt-1 flex justify-between items-center text-left"><span className="text-[10px] text-zinc-500 font-bold font-orbitron uppercase text-left">勤務形態</span><span className={`text-xs font-bold ${selectedConfirmData.status === 'pending' ? 'text-cyan-400' : 'text-pink-500'} text-left`}>{getStatusLabel(selectedConfirmData.type)}</span></div>
                    </div>
                  </CyberFrame>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3 text-left">
              {activeShifts.length > 0 ? activeShifts.sort((a, b) => a[0].localeCompare(b[0])).map(([date, data]) => (
                <div key={date} className={`bg-zinc-900/60 border-l-2 ${data.status === 'pending' ? 'border-cyan-400' : 'border-pink-500'} p-4 flex justify-between items-center rounded-r-sm backdrop-blur-sm text-left`}><div className="text-left"><div className="text-sm font-bold text-white mb-1 font-orbitron text-left">{date}</div><span className={`text-[9px] font-black px-1.5 py-0.5 border ${data.status === 'pending' ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20' : 'border-pink-500 text-pink-400 bg-pink-950/20'} uppercase font-orbitron text-left`}>{data.status === 'pending' ? '申請中' : '確定'}</span></div><div className="text-right"><div className="text-xl font-bold font-orbitron text-white tracking-tighter text-right">{data.startTime} - {data.endTime}</div></div></div>
              )) : <div className="text-center py-20 text-zinc-600 font-bold uppercase font-orbitron italic text-left">No entries found</div>}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- 5, 6 ビュー ---
  if (viewState === 'summary') {
    const activeShifts = Object.entries(shiftData).filter(([_, data]) => data.type !== 'none');
    return (
      <div className="h-full bg-[#050505] text-cyan-50 font-sans flex flex-col relative overflow-hidden text-left">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(236,72,153,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(236,72,153,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div 
            className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar relative z-10 pb-40 text-left pt-2"
            style={noScrollStyle}
        >
          <div className="flex flex-col gap-1 mb-4 text-left pt-2"><div className="text-[10px] text-pink-500 font-bold tracking-[0.4em] font-orbitron uppercase text-left">Final_Review</div><h2 className="text-3xl font-black font-orbitron text-white border-l-4 border-pink-500 pl-3 uppercase text-left">希望内容の確認</h2></div>
          <div className="space-y-3 text-left">
            {activeShifts.length > 0 ? activeShifts.sort((a, b) => a[0].localeCompare(b[0])).map(([date, data]) => (
                <div key={date} className={`bg-zinc-900/60 border-l-2 ${data.type === 'negotiable' ? 'border-cyan-400' : 'border-pink-500'} p-4 flex justify-between items-center rounded-r-sm backdrop-blur-sm text-left`}><div className="text-left"><div className="text-sm font-bold text-white mb-1 font-orbitron text-left">{date}</div><span className={`text-[10px] font-bold px-1.5 py-0.5 border ${data.type === 'desired' ? 'border-pink-500 text-pink-400' : data.type === 'any' ? 'border-zinc-500 text-zinc-400' : 'border-cyan-500 text-cyan-400'} text-left`}>{getStatusLabel(data.type)}</span></div><div className="text-right"><div className="text-xl font-bold font-orbitron text-white tracking-tighter text-right">{data.startTime} - {data.endTime}</div></div></div>
              )) : <div className="text-center py-20 text-zinc-600 font-bold uppercase font-orbitron text-left">No Entries</div>}
          </div>
          <div className="pt-10 flex flex-col gap-3 text-left"><CutCornerButton handleFinalSubmit={handleFinalSubmit} filled color="magenta" className="w-full py-5 font-black text-sm tracking-widest shadow-[0_0_20px_#ec4899] font-orbitron flex justify-center text-left">シフトを申請する</CutCornerButton><CutCornerButton onClick={() => setViewState('request')} filled color="slate" className="w-full py-5 font-black text-sm tracking-widest font-orbitron flex justify-center text-left">戻って修正する</CutCornerButton></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#050505] text-cyan-50 font-sans flex flex-col relative overflow-hidden text-left">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="p-4 pt-2 relative z-20 shrink-0 text-left">
        <button onClick={() => setViewState('menu')} className="flex items-center gap-2 text-white text-xs font-bold mb-3 font-orbitron uppercase text-left hover:text-zinc-300"><ArrowLeft size={16} /> 戻る</button>
        <div className="bg-magenta-950/20 border border-pink-500/20 px-4 py-3 rounded-sm backdrop-blur-sm flex justify-between items-center text-left">
          <div className="text-left">
            <div className="text-[10px] text-pink-400 tracking-wider font-bold mb-0.5 uppercase font-orbitron text-left">対象期間</div>
            <div className="text-sm font-bold text-white text-left">{targetMonth}/{targetPeriodStart} ~ {targetMonth}/{targetPeriodEnd} 分</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-zinc-500 tracking-widest block font-bold font-orbitron uppercase text-right">提出期限</span>
            <span className="text-xl font-black text-pink-500 drop-shadow-lg font-orbitron text-right">{deadlineStr}</span>
          </div>
        </div>
      </div>
      <div 
        className="flex-1 overflow-y-auto no-scrollbar overscroll-contain relative z-10 px-4 flex flex-col gap-4 pb-40 text-left pt-2"
        style={noScrollStyle}
      >
        <div className="flex items-center justify-between px-2 mt-0 shrink-0 text-left">
          <button onClick={() => handleMonthChange(-1)} className="p-2 text-zinc-500 hover:text-white transition-colors text-left"><ChevronLeft /></button>
          <h2 className="text-3xl font-black font-orbitron text-white transform -skew-x-6 text-left" style={{ textShadow: '0 0 10px rgba(236,72,153,0.3)' }}>{year}年{month}月</h2>
          <button onClick={() => handleMonthChange(1)} className="p-2 text-zinc-500 hover:text-white transition-colors text-left"><ChevronRight /></button>
        </div>
        <CyberFrame title="REQUEST_CALENDAR" color="magenta" className="shrink-0 font-orbitron text-left">
          <WeekdayHeader />
          <div className="grid grid-cols-7 gap-1 text-center text-left">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="text-left" />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1; const dateStr = formatDate(year, month, day); const data = shiftData[dateStr]; const isSelected = selectedShiftDate === dateStr; 
              return (
                <button key={day} onClick={() => handleDateClick(day)} className={`aspect-square relative flex flex-col items-center justify-center rounded-sm border transition-all duration-200 ${isSelected ? 'border-pink-400 bg-pink-900/40 text-white shadow-[0_0_10px_#ec489988] z-10' : 'border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800'} text-left`}>
                  <span className={`text-sm font-bold font-orbitron text-left`}>{day}</span>
                  {data && data.type !== 'none' && (<div className="absolute top-1 right-1 text-[8px] text-pink-400 leading-none font-sans font-black text-left">{getCalendarMark(data.type)}</div>)}
                </button>
              );
            })}
          </div>
          <div className="mt-4 grid grid-cols-4 text-[8px] font-bold text-zinc-500 uppercase tracking-tighter border-t border-zinc-800/50 pt-3 text-center text-left">
             <div className="flex items-center gap-1 justify-center text-left"><span className="text-pink-400 text-xs leading-none text-left">●</span> 希望あり</div>
             <div className="flex items-center gap-1 justify-center text-left"><span className="text-pink-400 text-xs leading-none text-left">⚪︎</span> どこでも</div>
             <div className="flex items-center gap-1 justify-center text-left"><span className="text-cyan-400 text-xs leading-none text-left">△</span> 相談可</div>
             <div className="flex items-center gap-1 justify-center text-left"><span className="text-zinc-600 text-xs leading-none text-left">×</span> 希望なし</div>
          </div>
        </CyberFrame>
        <div className="space-y-4 px-2 shrink-0 mt-2 text-left"><CutCornerButton onClick={() => alert('下書き保存しました')} filled color="slate" className="w-full py-4 font-black tracking-widest text-xs bg-slate-800 border-slate-700 shadow-lg flex items-center justify-center gap-2 font-orbitron text-center flex justify-center text-left"><Save className="w-4 h-4 text-left" /> 下書き保存</CutCornerButton><CutCornerButton onClick={() => setViewState('summary')} filled color="magenta" className="w-full py-5 font-black text-sm tracking-widest shadow-[0_0_20px_#ec4899] uppercase font-orbitron text-center flex justify-center text-left">内容を確認する</CutCornerButton></div>
      </div>
      {selectedShiftDate && tempData && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end text-left">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm text-left" onClick={() => setSelectedShiftDate(null)} />
          <div 
            className="relative bg-[#0a0a0a] border-t border-pink-500/50 p-6 rounded-t-xl pb-10 animate-in slide-in-from-bottom-10 duration-300 text-left overflow-y-auto no-scrollbar"
            style={noScrollStyle}
          >
            <div className="flex justify-between items-center mb-6 text-left"><h3 className="text-xl font-bold text-white flex items-center gap-2 font-orbitron text-left"><span className="font-orbitron text-left">{selectedShiftDate}</span> <span className="text-xs font-normal text-zinc-500 border border-zinc-700 px-2 py-0.5 rounded uppercase font-orbitron tracking-widest text-left">Entry</span></h3><button onClick={() => setSelectedShiftDate(null)} className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors text-left"><X size={20} /></button></div>
            <div className="mb-6 text-left">
              <p className="text-[10px] text-pink-500 font-bold tracking-widest mb-2 uppercase font-orbitron tracking-widest text-left">種別選択</p>
              <div className="grid grid-cols-4 gap-2 text-left">
                {statusData.map((status) => (
                  <button key={status.id} onClick={() => tempData && setTempData({ ...tempData, type: status.id })} className={`py-3 text-[10px] font-bold leading-tight border rounded-sm transition-colors ${tempData.type === status.id ? 'bg-pink-900/40 border-pink-400 text-pink-300 shadow-[0_0_10px_#ec489944]' : 'bg-zinc-900 border-zinc-800 text-zinc-500'} flex flex-col items-center justify-center text-center text-left`}>
                    {status.label.split('\n').map((l, i) => <div key={i}>{l}</div>)}
                  </button>
                ))}
              </div>
            </div>
            <div className={`mb-6 text-left ${tempData.type === 'none' ? 'opacity-30 pointer-events-none text-left' : ''}`}>
              <p className="text-[10px] text-pink-500 font-bold tracking-widest mb-2 uppercase font-orbitron tracking-widest text-left">時間範囲</p>
              <div className="flex items-center gap-3 text-left">
                <input type="time" value={tempData.startTime} onChange={(e) => tempData && setTempData({...tempData, startTime: e.target.value})} className="flex-1 bg-zinc-900 border border-zinc-700 text-white p-3 rounded text-center text-lg font-orbitron focus:border-pink-500 focus:outline-none text-left font-bold" />
                <span className="text-zinc-600 font-bold text-left">~</span>
                <input type="time" value={tempData.endTime} onChange={(e) => tempData && setTempData({...tempData, endTime: e.target.value})} className="flex-1 bg-zinc-900 border border-zinc-700 text-white p-3 rounded text-center text-lg font-orbitron focus:border-pink-500 focus:outline-none text-left font-bold" />
              </div>
            </div>
            <button onClick={handleSaveTemp} className="w-full py-4 bg-white text-black font-black tracking-widest hover:bg-zinc-200 rounded-sm clip-corner-br flex items-center justify-center gap-2 transition-colors uppercase font-orbitron text-center flex justify-center text-left">設定内容を保存</button>
          </div>
        </div>
      )}
      <style>{`
        .clip-corner-br { clip-path: polygon(0 0, 100% 0, 100% 70%, 95% 100%, 0 100%); } 
        .no-scrollbar::-webkit-scrollbar { display: none !important; } 
        .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>
    </div>
  );
};

const statusData = [
  { id: 'desired', label: '希望\nあり' },
  { id: 'any', label: 'どこ\nでも' },
  { id: 'negotiable', label: '相談\n可能' },
  { id: 'none', label: '希望\nなし' }
];

export default ShiftPage;