
import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Calendar, 
  Clock, 
  Wifi, 
  Settings as SettingsIcon, 
  ChevronLeft, 
  ChevronRight, 
  MapPin,
  ArrowLeft,
  Plus,
  Save,
  FileText,
  AlertTriangle,
  Send,
  User as UserIcon,
  CheckCircle2,
  Sparkles,
  Target,
  Cake,
  Briefcase as BriefcaseIcon,
  Bell,
  LogOut as LogOutIcon,
  Play,
  Coffee,
  Activity,
  Zap,
  Globe,
  HelpCircle,
  Timer,
  FileEdit,
  History as HistoryIcon,
  X,
  LayoutGrid,
  List,
  MessageSquare,
  ExternalLink,
  ShieldCheck,
  FileLock2
} from 'lucide-react';
import { Tab, User, AttendanceLog, ShiftViewState, ShiftDay } from './types';
import { CyberFrame, CutCornerButton } from './components/CyberUI';
import { ScannerOverlay, PunchType } from './components/ScannerOverlay';

// Extended Attendance Log to support Correction Status
interface AttendanceLogWithCorrection extends AttendanceLog {
  correctionStatus?: 'none' | 'pending' | 'approved';
  correctionData?: {
    type: string;
    punchType: string;
    time: string;
    reason: string;
  };
}

interface ExtendedShiftDayLocal extends ShiftDay {
  memo?: string;
  type: 'none' | 'desired' | 'any' | 'negotiable'; // ー, ●, ⚪︎, △
}

interface AppNotification {
  id: string;
  dateLabel: string; // "今日", "昨日", or "12月15日"
  title: string;
  description: string;
  time: string;
  isUnread: boolean;
  type: 'shift' | 'correction' | 'info';
}

const INITIAL_USER: User = {
  name: "山田 太郎",
  rank: "NOVICE",
  location: "UNKNOWN",
  role: "スタッフ",
  department: "開発部 第3セクション",
  base: "東京本社",
  joinDate: "2022.04.01",
  avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=200"
};

const AVATAR_OPTIONS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=200"
];

const ATTENDANCE_HISTORY: AttendanceLogWithCorrection[] = [
  { id: '1', date: '2024.12.17', clockIn: '09:02', clockOut: '18:05', location: '渋谷セクター01', status: 'normal', correctionStatus: 'none' },
  { id: '2', date: '2024.12.16', clockIn: '09:05', clockOut: '18:15', location: '新宿セクター02', status: 'late', correctionStatus: 'pending', correctionData: { type: '変更', punchType: '出勤', time: '09:00', reason: '交通機関の遅延（証明書有）' } },
  { id: '3', date: '2024.12.15', clockIn: '08:55', clockOut: '17:58', location: '渋谷セクター01', status: 'normal', correctionStatus: 'none' },
  { id: '4', date: '2024.12.24', clockIn: '08:50', clockOut: '18:30', location: '渋谷セクター01', status: 'normal', correctionStatus: 'none' },
  { id: '5', date: '2024.12.11', clockIn: '09:12', clockOut: '18:05', location: '代々木セクター03', status: 'late', correctionStatus: 'none' },
];

const NOTIFICATIONS_DATA: AppNotification[] = [
  {
    id: 'n1',
    dateLabel: '今日',
    title: 'シフトが確定しました',
    description: '12/16〜12/31のシフトが公開されました。',
    time: '10:30',
    isUnread: true,
    type: 'shift'
  },
  {
    id: 'n2',
    dateLabel: '昨日',
    title: '明日のシフト (リマインド)',
    description: '12/17 09:00〜 渋谷カフェ店 20:00',
    time: '20:00',
    isUnread: false,
    type: 'shift'
  },
  {
    id: 'n3',
    dateLabel: '12月15日',
    title: '打刻修正が承認されました',
    description: '12/15の出勤打刻',
    time: '15:30',
    isUnread: false,
    type: 'correction'
  }
];

const NOTIFICATIONS_COUNT = 1; // Unread count

type AppState = 'login' | 'setup_avatar' | 'setup_profile' | 'main';
type AttendanceStatus = 'none' | 'working' | 'break' | 'finished';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('login');
  const [userData, setUserData] = useState<User>(INITIAL_USER);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>('none');
  const [isScanning, setIsScanning] = useState(false);
  const [punchType, setPunchType] = useState<PunchType>('in');

  const [selectedAvatarIdx, setSelectedAvatarIdx] = useState<number | null>(null);
  const [setupNickname, setSetupNickname] = useState('');
  const [setupBirthday, setSetupBirthday] = useState('');
  const [setupHobbies, setSetupHobbies] = useState('');
  const [setupGoal, setSetupGoal] = useState('');

  const [viewState, setViewState] = useState<ShiftViewState>('menu');
  const [settingsView, setSettingsView] = useState<'main' | 'profile'>('main');
  const [historyMonth, setHistoryMonth] = useState(new Date(2024, 11, 1)); // Dec 2024
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string | null>(null);

  // Settings Toggles State
  const [settingsNotifyShift, setSettingsNotifyShift] = useState(true);
  const [settingsNotifyRemind, setSettingsNotifyRemind] = useState(true);
  const [settingsNotifyCorrection, setSettingsNotifyCorrection] = useState(false);

  // Shift Request State
  const [shiftMonth, setShiftMonth] = useState(new Date(2024, 11, 1)); // Dec 2024
  const [shiftData, setShiftData] = useState<Record<string, ExtendedShiftDayLocal>>({
    '2024.12.05': { date: 5, status: 'requested', type: 'desired', startTime: '09:00', endTime: '18:00', memo: '通院のため早上がり希望' },
    '2024.12.10': { date: 10, status: 'requested', type: 'any', startTime: '09:00', endTime: '18:00' },
    '2024.12.15': { date: 15, status: 'requested', type: 'negotiable', startTime: '10:00', endTime: '15:00' },
    '2024.12.20': { date: 20, status: 'requested', type: 'none', startTime: '09:00', endTime: '18:00' },
  });
  const [selectedShiftDate, setSelectedShiftDate] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'weekly' | 'monthly'>('monthly');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getFullPageTitle = () => {
    if (activeTab === 'home') {
      if (viewState === 'history_list') return 'WEEKLY_LOG / 直近の打刻';
      return 'HOME / ホーム';
    }
    if (activeTab === 'shift') {
      if (viewState === 'edit') return 'SHIFT_EDIT / シフト希望編集';
      if (viewState === 'correction') return 'SHIFT_PREVIEW / 提出確認';
      return 'SHIFT / シフト希望提出';
    }
    if (activeTab === 'history') {
      if (viewState === 'correction') return 'CORRECT / 打刻修正申請';
      return 'HISTORY / 打刻履歴';
    }
    if (activeTab === 'signal') return 'SIGNAL / 通知';
    if (activeTab === 'settings') {
      if (settingsView === 'profile') return 'PROFILE / ユーザー詳細';
      return 'SYS / 設定';
    }
    return 'SYSTEM';
  };

  const startScan = (type: PunchType) => {
    setPunchType(type);
    setIsScanning(true);
  };

  const handleScanSuccess = (type: PunchType) => {
    setIsScanning(false);
    if (type === 'in') setAttendanceStatus('working');
    if (type === 'out') setAttendanceStatus('finished');
    if (type === 'break_start') setAttendanceStatus('break');
    if (type === 'break_end') setAttendanceStatus('working');
  };

  const handleLogin = () => {
    setAppState('setup_avatar');
  };

  const handleAvatarSelect = () => {
    if (selectedAvatarIdx !== null) {
      setUserData(prev => ({ ...prev, avatar: AVATAR_OPTIONS[selectedAvatarIdx] }));
      setAppState('setup_profile');
    }
  };

  const handleProfileComplete = () => {
    if (setupNickname && setupGoal) {
      setUserData(prev => ({
        ...prev,
        nickname: setupNickname,
        birthday: setupBirthday,
        hobbies: setupHobbies,
        goal: setupGoal,
        rank: 'ELITE-A', 
        location: '渋谷セクター01' 
      }));
      setAppState('main');
    } else {
        alert('必須項目（ニックネーム・目標）を入力してください');
    }
  };

  const renderLogin = () => {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="mb-12 relative">
          <div className="absolute inset-0 bg-cyan-400/20 blur-2xl animate-pulse rounded-full" />
          <Zap className="w-24 h-24 text-cyan-400 relative z-10 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
        </div>
        <h1 className="text-4xl font-black font-orbitron text-white italic tracking-tighter mb-2 text-center uppercase">
          <span className="text-white">Stream</span> <span className="text-cyan-400">Connect</span>
        </h1>
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] mb-12 font-orbitron">
          Personnel Management System
        </p>
        <CutCornerButton onClick={handleLogin} filled color="cyan" className="w-full py-5 font-black font-orbitron tracking-widest uppercase text-sm">
          Establish Connection
        </CutCornerButton>
        <button 
          onClick={() => window.open('https://example.com/support', '_blank')}
          className="mt-6 text-[10px] text-cyan-400/60 hover:text-cyan-400 underline underline-offset-4 font-bold flex items-center gap-1.5 transition-colors group"
        >
          <HelpCircle className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          ログインでお困りの方
        </button>
      </div>
    );
  };

  const goHome = () => {
    setActiveTab('home');
    setViewState('menu');
  };

  const renderStatusBar = () => {
    const isHomeMenu = activeTab === 'home' && viewState === 'menu';
    const titleText = getFullPageTitle();
    const [enPart, jpPart] = titleText.split(' / ');

    if (activeTab === 'shift' && viewState === 'correction') {
      return (
        <div className="absolute top-0 left-0 right-0 z-[60] flex flex-col pointer-events-none">
          <div className="h-10 w-full" />
          <div className="w-full h-12 bg-[#050a14]/90 backdrop-blur-md border-b border-cyan-400/20 px-6 flex items-center justify-between pointer-events-auto">
            <div className="text-[10px] font-orbitron font-black tracking-[0.1em] italic uppercase">
              <span className="text-cyan-400">SHIFT_PREVIEW</span> <span className="text-white">/ 提出確認</span>
            </div>
            <button onClick={() => setPreviewMode(prev => prev === 'monthly' ? 'weekly' : 'monthly')} className="text-cyan-400 p-1 border border-cyan-400/20 rounded-sm hover:bg-cyan-400/10 transition-all pointer-events-auto">
              {previewMode === 'monthly' ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="absolute top-0 left-0 right-0 z-[60] flex flex-col pointer-events-none">
        <div className="h-10 w-full" />
        <div className="w-full h-12 bg-[#050a14]/90 backdrop-blur-md border-b border-cyan-400/20 px-6 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center w-full">
            <button 
              onClick={settingsView === 'profile' ? () => setSettingsView('main') : goHome}
              className="flex flex-col items-start group"
            >
              <div className="text-[10px] font-orbitron font-black tracking-[0.1em] italic uppercase drop-shadow-[0_0_5px_rgba(34,211,238,0.5)] transition-colors">
                {!isHomeMenu && <span className="text-white mr-1 group-hover:text-cyan-400 transition-colors">←</span>}
                <span className="text-cyan-400 group-hover:text-white transition-colors font-orbitron">{enPart}</span>
                {jpPart && <span className="text-white ml-1">/ {jpPart}</span>}
              </div>
              <div className="w-full h-[1px] bg-gradient-to-r from-cyan-400/60 to-transparent mt-0.5" />
            </button>
          </div>
          <div className="flex items-center justify-end">
            {(activeTab === 'home' || activeTab === 'signal') && (
              <div className="relative group cursor-pointer" onClick={() => setActiveTab('signal')}>
                <Bell className={`w-5 h-5 transition-colors ${activeTab === 'signal' ? 'text-white' : 'text-cyan-400 group-hover:text-white'}`} />
                {NOTIFICATIONS_COUNT > 0 && (
                  <div className="absolute -top-1.5 -right-2.5 flex items-center gap-0.5">
                    <span className="text-[9px] font-mono font-bold text-pink-500 bg-pink-500/10 px-1 border border-pink-500/40 font-orbitron">
                      ({NOTIFICATIONS_COUNT})
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (activeTab === 'home') {
      if (viewState === 'history_list') {
        return (
          <div className="h-full px-6 py-4 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
            <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1 no-scrollbar pt-2">
              {ATTENDANCE_HISTORY.slice(0, 7).map((log) => (
                <CyberFrame key={log.id} title={log.date} color={log.status === 'normal' ? 'cyan' : 'amber'} className="shrink-0 !p-3">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span className="text-[10px] font-bold text-slate-200">{log.location}</span>
                        </div>
                        <div className="mt-1 flex gap-4">
                           <span className="text-lg font-orbitron font-black leading-tight">{log.clockIn} - {log.clockOut}</span>
                        </div>
                    </div>
                    <div className={`text-[9px] font-bold px-1.5 py-0.5 border ${log.status === 'normal' ? 'border-cyan-400 text-cyan-400' : 'border-amber-500 text-amber-500'} uppercase font-orbitron`}>
                      {log.status}
                    </div>
                  </div>
                </CyberFrame>
              ))}
            </div>
            <div className="mt-auto shrink-0 pb-2">
              <CutCornerButton onClick={goHome} filled color="cyan" className="w-full py-4 font-black tracking-widest font-orbitron uppercase text-sm">
                Return to Home
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

      return (
        <div className="h-full flex flex-col px-6 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden relative">
          <div className="flex-1 overflow-hidden flex flex-col">
            <CyberFrame title="TODAY'S_SHIFT" subTitle="本日の予定" color="magenta" className="shrink-0 mt-2 !pb-0 mb-4">
              <div className="flex items-center justify-between pb-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-pink-500">
                    <BriefcaseIcon className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-mono uppercase tracking-widest font-bold">Shift Assigned</span>
                  </div>
                  <div className="text-2xl font-black font-orbitron text-white italic tracking-tighter">09:00 - 18:00</div>
                  <div className="flex items-center gap-2 mt-1 border-t border-pink-500/20 pt-1 w-full">
                    <span className="text-[8px] bg-pink-500 text-slate-950 px-1.5 font-black uppercase font-orbitron">Role</span>
                    <span className="text-xs font-bold text-slate-200">スタッフ</span>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="text-[9px] text-slate-500 font-mono uppercase font-orbitron">Node</div>
                  <div className="text-xs font-bold text-pink-500">{userData.location || "渋谷セクター01"}</div>
                </div>
              </div>
            </CyberFrame>

            <div className="relative flex flex-col items-center mb-6">
               <div className="relative scale-90">
                 <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-cyan-400 pointer-events-none"></div>
                 <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-cyan-400 pointer-events-none"></div>
                 <div className="w-56 h-56 relative overflow-hidden border border-cyan-500/30 bg-slate-900">
                    <img src={userData.avatar} className="w-full h-full object-cover grayscale brightness-75" alt="User" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050a14] via-transparent to-transparent"></div>
                    <div className="scanline"></div>
                 </div>
               </div>
            </div>

            <div className="flex flex-col items-center gap-2 mb-4">
               <div className={`px-4 py-1.5 border ${statusLabels[attendanceStatus].border} ${statusLabels[attendanceStatus].bg} rounded-full flex items-center gap-3 transition-all duration-500`}>
                 <div className={`w-2 h-2 rounded-full ${statusLabels[attendanceStatus].color.replace('text', 'bg')} animate-pulse`} />
                 <span className={`text-xs font-black tracking-[0.2em] font-orbitron ${statusLabels[attendanceStatus].color}`}>
                   STATUS: {statusLabels[attendanceStatus].label}
                 </span>
               </div>
            </div>

            <div className="flex flex-col gap-3 mb-6">
              {(attendanceStatus === 'none' || attendanceStatus === 'finished') && (
                <CutCornerButton 
                  onClick={() => startScan('in')} 
                  filled 
                  color="cyan" 
                  className="w-full py-5 font-black tracking-widest font-orbitron uppercase flex flex-col items-center !bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                >
                  <span className="text-[10px] opacity-70 tracking-[0.3em] font-mono leading-none mb-1">Refresh the World</span>
                  <span className="text-lg">出勤する</span>
                </CutCornerButton>
              )}

              {attendanceStatus === 'working' && (
                <div className="grid grid-cols-2 gap-3">
                  <CutCornerButton 
                    onClick={() => startScan('out')} 
                    filled
                    color="cyan" 
                    className="w-full py-5 font-black tracking-widest font-orbitron uppercase flex flex-col items-center !bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                  >
                    <span className="text-[10px] opacity-70 tracking-[0.3em] font-mono leading-none mb-1">Log out</span>
                    <span className="text-sm">退勤する</span>
                  </CutCornerButton>
                  <CutCornerButton 
                    onClick={() => startScan('break_start')} 
                    filled
                    color="cyan" 
                    className="w-full py-5 font-black tracking-widest font-orbitron uppercase flex flex-col items-center !bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                  >
                    <span className="text-[10px] opacity-70 tracking-[0.3em] font-mono leading-none mb-1">Rest</span>
                    <span className="text-sm">休憩する</span>
                  </CutCornerButton>
                </div>
              )}

              {attendanceStatus === 'break' && (
                <CutCornerButton 
                  onClick={() => startScan('break_end')} 
                  filled 
                  color="amber" 
                  className="w-full py-5 font-black tracking-widest font-orbitron uppercase flex flex-col items-center !bg-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                >
                  <span className="text-[10px] opacity-70 tracking-[0.3em] font-mono leading-none mb-1">Break is over</span>
                  <span className="text-lg">休憩終了する</span>
                </CutCornerButton>
              )}
            </div>
          </div>

          <div className="shrink-0 mb-4 mt-auto">
            <CyberFrame title="ATTENDANCE_LOG" subTitle="直近の打刻" color="cyan" className="!p-4">
              <div className="flex flex-col gap-2">
                {ATTENDANCE_HISTORY.slice(0, 2).map((log) => (
                  <div key={log.id} className="flex justify-between items-center py-2 border-b border-slate-800/60 last:border-0 shrink-0">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-slate-500">{log.date}</span>
                      <span className="text-sm font-bold text-slate-200">{log.location}</span>
                    </div>
                    <div className="flex gap-4 items-center">
                      <div className="text-right">
                        <div className="text-[9px] text-cyan-400/60 font-mono uppercase font-orbitron">In</div>
                        <div className="text-base font-orbitron text-white leading-none">{log.clockIn}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] text-pink-400/60 font-mono uppercase font-orbitron">Out</div>
                        <div className="text-base font-orbitron text-white leading-none">{log.clockOut}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
               <button onClick={() => setViewState('history_list')} className="text-center w-full text-[10px] text-cyan-400 mt-2 hover:text-white transition-all uppercase tracking-[0.2em] font-bold py-1">
                  [ 詳細を見る ]
                </button>
            </CyberFrame>
          </div>
          
          {isScanning && (
            <ScannerOverlay 
              type={punchType} 
              onClose={() => setIsScanning(false)}
              onSuccess={() => handleScanSuccess(punchType)}
            />
          )}
        </div>
      );
    }

    if (activeTab === 'shift') {
      const year = shiftMonth.getFullYear();
      const month = shiftMonth.getMonth() + 1;
      const daysInMonth = new Date(year, month, 0).getDate();
      const firstDay = new Date(year, month - 1, 1).getDay();
      const today = new Date();

      const changeMonth = (delta: number) => {
        const d = new Date(shiftMonth);
        d.setMonth(d.getMonth() + delta);
        if (d >= new Date(today.getFullYear(), today.getMonth(), 1)) {
          setShiftMonth(d);
          setSelectedShiftDate(null);
        }
      };

      const selectedDayData = selectedShiftDate ? shiftData[selectedShiftDate] || { date: parseInt(selectedShiftDate.split('.')[2]), status: 'draft', type: 'none', startTime: '09:00', endTime: '18:00', memo: '' } : null;
      const selectedDayDateObj = selectedShiftDate ? new Date(selectedShiftDate.replace(/\./g, '/')) : null;
      const selectedDayOfWeekStr = selectedDayDateObj ? ['日', '月', '火', '水', '木', '金', '土'][selectedDayDateObj.getDay()] : '';

      return (
        <div className="h-full px-6 py-4 flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-500 overflow-y-auto no-scrollbar pt-2">
          {viewState === 'correction' ? (
             // Submission Confirmation View
             <>
               <div className="flex flex-col gap-4">
                  <div className="text-[10px] font-mono border-b border-cyan-400/20 pb-1 uppercase tracking-widest font-orbitron">
                    <span className="text-cyan-400">Submission Preview</span> <span className="text-white">/ 提出内容確認</span>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    {/* Fix: Explicitly cast Object.entries(shiftData) to ensure `data` is typed as ExtendedShiftDayLocal and avoid 'unknown' errors */}
                    {(Object.entries(shiftData) as [string, ExtendedShiftDayLocal][])
                      .filter(([_, data]) => data.type !== 'none')
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([date, data]) => {
                      const d = new Date(date.replace(/\./g, '/'));
                      return (
                        <div key={date} className="bg-slate-900/60 border-l-2 border-cyan-400 p-4 flex justify-between items-center group hover:bg-cyan-950/20 transition-all">
                           <div className="flex flex-col">
                              <div className="text-sm font-bold text-white font-sans">
                                {d.getMonth()+1}月{d.getDate()}日 ({['日','月','火','水','木','金','土'][d.getDay()]})
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-1 italic font-sans">
                                Type: {{desired:'希望あり', any:'どこでもOK', negotiable:'相談可能', none: 'ー'}[data.type]}
                              </div>
                           </div>
                           <div className="flex flex-col items-end">
                              <div className="text-lg font-orbitron font-black text-white">
                                {data.type !== 'none' ? `${data.startTime} - ${data.endTime}` : '-- : --'}
                              </div>
                              <div className="text-[9px] text-cyan-400 font-black tracking-widest uppercase font-orbitron">Operator</div>
                           </div>
                        </div>
                      );
                    })}
                  </div>
               </div>

               <div className="mt-auto flex flex-col gap-3 pb-4">
                 <CutCornerButton onClick={() => alert('シフト希望を提出しました')} filled color="cyan" className="w-full py-5 font-black font-orbitron tracking-widest text-sm shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                    シフト希望を提出
                 </CutCornerButton>
                 <CutCornerButton onClick={() => setViewState('menu')} color="slate" className="w-full py-4 font-black font-orbitron tracking-widest text-xs font-sans">
                    修正する
                 </CutCornerButton>
               </div>
             </>
          ) : (
            // Main Calendar View
            <>
              <div className="bg-cyan-950/30 border border-cyan-400/20 p-4 rounded-sm flex flex-col gap-1 shrink-0">
                 <div className="flex items-center justify-between font-black">
                   <span className="text-sm text-white italic font-sans">12/16 〜 12/31</span>
                   <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono uppercase tracking-tighter italic font-orbitron"><span className="text-cyan-400">提出期限:</span></span>
                      <span className="text-sm text-pink-500 font-sans">12/1</span>
                   </div>
                 </div>
              </div>

              <div className="flex items-center justify-between border-y border-cyan-400/20 py-2">
                 <button onClick={() => changeMonth(-1)} className="p-2 text-slate-400 hover:text-cyan-400 transition-colors"><ChevronLeft className="w-8 h-8 font-orbitron" /></button>
                 <div className="flex flex-col items-center">
                    <div className="text-2xl font-black font-orbitron text-white italic tracking-tighter">{year}年{String(month).padStart(2, '0')}月</div>
                 </div>
                 <button onClick={() => changeMonth(1)} className="p-2 text-slate-400 hover:text-cyan-400 transition-colors"><ChevronRight className="w-8 h-8 font-orbitron" /></button>
              </div>

              <CyberFrame title={`REQUEST_CALENDAR`} color="cyan" className="shrink-0 font-orbitron">
                 <div className="grid grid-cols-7 gap-1 mb-2 font-orbitron">
                   {['日', '月', '火', '水', '木', '金', '土'].map((d, i) => (
                     <div key={i} className={`text-center text-[10px] font-black font-sans ${i === 0 ? 'text-pink-500' : i === 6 ? 'text-cyan-400' : 'text-slate-500'}`}>{d}</div>
                   ))}
                 </div>
                 <div className="grid grid-cols-7 gap-1 font-orbitron">
                   {Array.from({length: firstDay}).map((_, i) => <div key={`empty-${i}`} />)}
                   {Array.from({length: daysInMonth}).map((_, i) => {
                     const day = i + 1;
                     const dateStr = `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`;
                     const data = shiftData[dateStr];
                     const dateObj = new Date(year, month - 1, day);
                     const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                     const isSelected = selectedShiftDate === dateStr;
                     
                     const marks = { desired: '●', any: '⚪︎', negotiable: '△', none: 'ー' };

                     return (
                       <button 
                        key={day} 
                        disabled={isPast}
                        onClick={() => setSelectedShiftDate(isSelected ? null : dateStr)}
                        className={`aspect-square border flex flex-col items-center justify-center relative text-[10px] font-bold transition-all font-orbitron ${isPast ? 'border-slate-800 text-slate-700 bg-slate-900/10' : isSelected ? 'border-cyan-400 bg-cyan-400/20 text-white shadow-[0_0_10px_rgba(34,211,238,0.4)]' : 'border-slate-800 hover:border-cyan-500/50 text-slate-300'}`}
                       >
                         {day}
                         {data && data.type !== 'none' && (
                           <div className="absolute top-1 right-1 text-[8px] text-cyan-400 leading-none font-sans">{marks[data.type]}</div>
                         )}
                       </button>
                     );
                   })}
                 </div>
              </CyberFrame>

              <div className="grid grid-cols-2 gap-x-6 gap-y-2 py-4 border-t border-slate-800">
                 {[
                   { m: '●', l: '希望あり' },
                   { m: '⚪︎', l: 'どこでもOK' },
                   { m: '△', l: '相談可能' },
                   { m: 'ー', l: '希望なし' }
                 ].map(item => (
                   <div key={item.l} className="flex items-center gap-3 text-[12px] text-slate-300 font-bold font-sans">
                     <span className="text-cyan-400 w-4 text-center font-sans">{item.m}</span>
                     <span>{item.l}</span>
                   </div>
                 ))}
              </div>

              {/* Edit Content matching wireframe, appearing below the calendar when a date is selected */}
              {selectedDayData && (
                <div className="animate-in slide-in-from-bottom-4 duration-300 py-4 flex flex-col gap-6 border-t border-slate-800 bg-slate-900/10 -mx-6 px-6">
                   {/* Header with selected date and close icon */}
                   <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="text-lg font-bold text-white font-sans">
                        {selectedDayDateObj?.getMonth()! + 1}月{selectedDayDateObj?.getDate()}日 ({selectedDayOfWeekStr})
                      </div>
                      <button onClick={() => setSelectedShiftDate(null)} className="text-slate-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                   </div>

                   {/* Status Selection (Wireframe style - horizontal boxes) */}
                   <div className="flex flex-col gap-3">
                      <div className="text-[12px] font-bold text-slate-200 font-sans">ステータス</div>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'desired', label: '希望\nあり' },
                          { id: 'any', label: 'どこ\nでも' },
                          { id: 'negotiable', label: '相談\n可能' },
                          { id: 'none', label: '希望\nなし' }
                        ].map(item => (
                          <button 
                            key={item.id}
                            onClick={() => setShiftData(prev => ({...prev, [selectedShiftDate!]: {...selectedDayData, type: item.id as any}}))}
                            className={`aspect-square border flex flex-col items-center justify-center transition-all rounded-sm ${selectedDayData.type === item.id ? 'bg-cyan-400/20 border-cyan-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                          >
                            <span className="text-[11px] leading-tight whitespace-pre-wrap text-center font-bold font-sans">{item.label}</span>
                          </button>
                        ))}
                      </div>
                   </div>

                   {/* Time Selection boxes */}
                   <div className="flex flex-col gap-3">
                      <div className="text-[12px] font-bold text-slate-200 font-sans">希望時間（希望ありの場合）</div>
                      <div className="flex items-center gap-3">
                         <div className="flex-1 bg-slate-950 border border-slate-800 p-3 flex items-center justify-center rounded-sm">
                            <input 
                              type="time" 
                              disabled={selectedDayData.type !== 'desired'}
                              value={selectedDayData.startTime}
                              onChange={e => setShiftData(prev => ({...prev, [selectedShiftDate!]: {...selectedDayData, startTime: e.target.value}}))}
                              className="bg-transparent text-white font-orbitron text-center outline-none cursor-pointer w-full disabled:opacity-20" 
                            />
                         </div>
                         <span className="text-slate-400 text-lg">〜</span>
                         <div className="flex-1 bg-slate-950 border border-slate-800 p-3 flex items-center justify-center rounded-sm">
                            <input 
                              type="time" 
                              disabled={selectedDayData.type !== 'desired'}
                              value={selectedDayData.endTime}
                              onChange={e => setShiftData(prev => ({...prev, [selectedShiftDate!]: {...selectedDayData, endTime: e.target.value}}))}
                              className="bg-transparent text-white font-orbitron text-center outline-none cursor-pointer w-full disabled:opacity-20" 
                            />
                         </div>
                      </div>
                   </div>

                   {/* Memo textarea */}
                   <div className="flex flex-col gap-3">
                      <div className="text-[12px] font-bold text-slate-200 font-sans">メモ</div>
                      <textarea 
                        value={selectedDayData.memo || ""}
                        onChange={e => setShiftData(prev => ({...prev, [selectedShiftDate!]: {...selectedDayData, memo: e.target.value}}))}
                        className="w-full bg-slate-950 border border-slate-800 p-3 text-sm text-slate-200 min-h-[100px] rounded-sm focus:border-cyan-400 outline-none resize-none font-sans"
                        placeholder="メモを入力..."
                      />
                   </div>

                   {/* Local Save button that hides the form */}
                   <button 
                     onClick={() => setSelectedShiftDate(null)}
                     className="w-full py-4 bg-white border border-slate-300 text-slate-950 font-black text-sm tracking-widest font-sans rounded-sm active:bg-slate-200 transition-colors"
                   >
                     保存
                   </button>
                </div>
              )}

              <div className="mt-auto flex flex-col gap-3 pb-4 pt-4 border-t border-slate-800/40">
                <CutCornerButton onClick={() => alert('下書き保存しました')} color="slate" className="w-full py-4 font-black tracking-widest text-xs font-sans">
                  <Save className="w-4 h-4 mr-2 font-orbitron" /> 下書き保存
                </CutCornerButton>
                <CutCornerButton onClick={() => setViewState('correction')} filled color="cyan" className="w-full py-5 font-black font-orbitron tracking-widest text-sm shadow-[0_0_20px_rgba(34,211,238,0.4)] uppercase font-orbitron">
                   シフト希望を確認
                </CutCornerButton>
              </div>
            </>
          )}
        </div>
      );
    }

    if (activeTab === 'history') {
      if (viewState === 'correction') {
        return (
          <div className="h-full px-6 py-4 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto pt-2">
            <CyberFrame title="REQUEST_CORRECTION" subTitle="打刻修正申請" color="amber" className="font-orbitron">
              <div className="flex flex-col gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest mb-1 block font-orbitron">
                      <span className="text-amber-500 font-orbitron">Target Date</span> <span className="text-slate-400 italic font-sans">/ 対象日</span>
                    </label>
                    <select className="w-full bg-slate-950 border border-slate-800 p-3 text-sm text-white focus:border-amber-500 outline-none font-sans">
                      <option>{selectedHistoryDate || "日付を選択"}</option>
                      {ATTENDANCE_HISTORY.map(log => <option key={log.id}>{log.date}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest mb-1 block font-orbitron">
                      <span className="text-amber-500 font-orbitron">Correction Type</span> <span className="text-slate-400 italic font-sans">/ 修正種別</span>
                    </label>
                    <select className="w-full bg-slate-950 border border-slate-800 p-3 text-sm text-white focus:border-amber-500 outline-none font-sans">
                      <option>追加 (Add)</option>
                      <option>変更 (Change)</option>
                      <option>削除 (Delete)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest mb-1 block font-orbitron">
                      <span className="text-amber-500 font-orbitron">Punch Type</span> <span className="text-slate-400 italic font-sans">/ 打刻種別</span>
                    </label>
                    <select className="w-full bg-slate-950 border border-slate-800 p-3 text-sm text-white focus:border-amber-500 outline-none font-sans">
                      <option>出勤 (Clock-in)</option>
                      <option>退勤 (Clock-out)</option>
                      <option>休憩開始 (Break Start)</option>
                      <option>休憩終了 (Break End)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest mb-1 block font-orbitron">
                      <span className="text-amber-500 font-orbitron">Time Selection</span> <span className="text-slate-400 italic font-sans">/ 時刻入力</span>
                    </label>
                    <input type="time" className="w-full bg-slate-950 border border-slate-800 p-3 text-sm text-white focus:border-amber-500 outline-none font-orbitron" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest mb-1 block font-orbitron">
                      <span className="text-amber-500 font-orbitron">Reason</span> <span className="text-slate-400 italic font-sans">/ 理由 *</span>
                    </label>
                    <textarea required className="w-full bg-slate-950 border border-slate-800 p-3 text-sm text-white focus:border-amber-500 outline-none min-h-[80px] resize-none font-sans" placeholder="修正理由を入力してください..." />
                  </div>
                </div>
                <CutCornerButton onClick={() => setViewState('menu')} filled color="amber" className="w-full py-4 font-black font-orbitron tracking-widest flex items-center justify-center gap-2 font-orbitron">
                  <Send className="w-4 h-4 font-orbitron" /> 申請する (APPLY)
                </CutCornerButton>
              </div>
            </CyberFrame>
          </div>
        );
      }

      const year = historyMonth.getFullYear();
      const month = historyMonth.getMonth() + 1;
      const daysInMonth = new Date(year, month, 0).getDate();
      const firstDay = new Date(year, month - 1, 1).getDay();
      const today = new Date();

      const changeMonth = (delta: number) => {
        const d = new Date(historyMonth);
        d.setMonth(d.getMonth() + delta);
        setHistoryMonth(d);
        setSelectedHistoryDate(null);
      };

      const selectedLog = ATTENDANCE_HISTORY.find(log => log.date === selectedHistoryDate);

      return (
        <div className="h-full px-6 py-4 flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-500 overflow-y-auto no-scrollbar pt-2">
          <div className="flex items-center justify-between border-y border-cyan-400/20 py-2 bg-cyan-950/10">
             <button onClick={() => changeMonth(-1)} className="p-2 text-slate-400 hover:text-cyan-400 transition-colors"><ChevronLeft className="w-8 h-8 font-orbitron" /></button>
             <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono tracking-[0.3em] uppercase">
                  <span className="text-cyan-400">Target Period</span>
                </span>
                <div className="text-3xl font-black font-orbitron text-white italic tracking-tighter font-orbitron">{year}年{String(month).padStart(2, '0')}月</div>
             </div>
             <button onClick={() => changeMonth(1)} className="p-2 text-slate-400 hover:text-cyan-400 transition-colors"><ChevronRight className="w-8 h-8 font-orbitron" /></button>
          </div>

          <CyberFrame title={`CALENDAR_${year}_${month}`} color="cyan" className="shrink-0 font-orbitron font-orbitron">
             <div className="grid grid-cols-7 gap-1 mb-2 font-orbitron">
               {['日', '月', '火', '水', '木', '金', '土'].map((d, i) => (
                 <div key={i} className={`text-center text-[10px] font-black font-sans ${i === 0 ? 'text-pink-500' : i === 6 ? 'text-cyan-400' : 'text-slate-500'}`}>{d}</div>
               ))}
             </div>
             <div className="grid grid-cols-7 gap-1 font-orbitron">
               {Array.from({length: firstDay}).map((_, i) => <div key={`empty-${i}`} />)}
               {Array.from({length: daysInMonth}).map((_, i) => {
                 const day = i + 1;
                 const dateStr = `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`;
                 const log = ATTENDANCE_HISTORY.find(l => l.date === dateStr);
                 const dateObj = new Date(year, month - 1, day);
                 const isFuture = dateObj > today;
                 const isSelected = selectedHistoryDate === dateStr;

                 return (
                   <button 
                    key={day} 
                    disabled={isFuture}
                    onClick={() => setSelectedHistoryDate(isSelected ? null : dateStr)}
                    className={`aspect-square border flex flex-col items-center justify-center relative text-[10px] font-bold transition-all font-orbitron ${isFuture ? 'border-slate-800 text-slate-700' : isSelected ? 'border-cyan-400 bg-cyan-400/20 text-white shadow-[0_0_10px_rgba(34,211,238,0.4)]' : 'border-slate-800 hover:border-cyan-500/50 text-slate-300'}`}
                   >
                     {day}
                     {log && (
                       <div className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor] ${log.correctionStatus === 'pending' ? 'bg-amber-500 text-amber-500 font-sans' : 'bg-cyan-400 text-cyan-400 font-sans'}`}></div>
                     )}
                   </button>
                 );
               })}
             </div>
          </CyberFrame>

          {selectedHistoryDate && (
            <div className="animate-in slide-in-from-bottom-4 duration-300 pb-10 flex flex-col gap-4">
               <div className="text-sm font-black font-orbitron text-white italic border-l-2 border-cyan-400 pl-2 font-orbitron font-orbitron">
                 {selectedHistoryDate.replace(/\./g, '/')} ({['日','月','火','水','木','金','土'][new Date(selectedHistoryDate.replace(/\./g, '/')).getDay()]})
               </div>
              {selectedLog ? (
                <>
                <CyberFrame title="LOG_DETAIL" color="cyan" className="flex flex-col gap-4 font-orbitron font-orbitron">
                  <div className="flex flex-col gap-4 py-2">
                     <div className="flex justify-between items-center text-sm font-bold border-b border-slate-800 pb-2">
                        <span className="text-slate-400 font-normal font-sans font-orbitron">出勤 (In)</span>
                        <span className="font-orbitron font-black text-lg text-white font-orbitron font-orbitron">{selectedLog.clockIn}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm font-bold border-b border-slate-800 pb-2">
                        <span className="text-slate-400 font-normal font-sans font-orbitron">休憩 (Break)</span>
                        <span className="font-orbitron font-black text-lg text-white font-orbitron font-orbitron">12:00 - 13:00</span>
                     </div>
                     <div className="flex justify-between items-center text-sm font-bold border-b border-slate-800 pb-2">
                        <span className="text-slate-400 font-normal font-sans font-orbitron">退勤 (Out)</span>
                        <span className="font-orbitron font-black text-lg text-white font-orbitron font-orbitron">{selectedLog.clockOut}</span>
                     </div>
                     <div className="flex flex-col gap-1 border-b border-slate-800 pb-2">
                        <span className="text-[9px] font-mono uppercase italic font-orbitron tracking-widest font-orbitron">
                          <span className="text-cyan-400/60 font-orbitron">Position & Node</span>
                        </span>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-white font-sans font-orbitron">スタッフ</span>
                          <span className="text-xs font-bold text-white font-sans font-orbitron">{selectedLog.location}</span>
                        </div>
                     </div>
                     <div className="flex justify-between items-center pt-2">
                        <span className="font-black tracking-widest text-xs uppercase italic font-orbitron font-orbitron">
                           <span className="text-cyan-400 font-orbitron">Total Work Time</span> <span className="text-white font-sans">/ 勤務時間</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-orbitron font-black text-white font-orbitron">8時間03分</span>
                        </div>
                     </div>
                  </div>
                </CyberFrame>

                {selectedLog.correctionStatus === 'pending' && selectedLog.correctionData && (
                  <CyberFrame title="PENDING_CORRECTION" subTitle="修正申請中" color="amber" className="animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <div className="flex flex-col gap-3 py-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-amber-500/60 font-mono uppercase italic font-orbitron tracking-widest font-orbitron">Status</span>
                        <span className="text-amber-400 font-bold uppercase italic tracking-tighter font-sans font-orbitron">Under Review / 承認待ち</span>
                      </div>
                      <div className="bg-amber-950/20 border border-amber-500/20 p-3 flex flex-col gap-2">
                        <div className="flex justify-between text-xs">
                           <span className="text-slate-400 italic font-sans font-orbitron">依頼内容: {selectedLog.correctionData.punchType}を{selectedLog.correctionData.type}</span>
                           <span className="font-orbitron font-black text-amber-400 font-orbitron">{selectedLog.correctionData.time}</span>
                        </div>
                        <div className="text-[10px] text-slate-300 italic border-t border-amber-500/10 pt-2 font-sans font-orbitron">
                          理由: {selectedLog.correctionData.reason}
                        </div>
                      </div>
                    </div>
                  </CyberFrame>
                )}

                <CutCornerButton 
                  onClick={() => setViewState('correction')} 
                  color="amber" 
                  filled
                  disabled={selectedLog.correctionStatus === 'pending'}
                  className={`w-full py-4 font-black font-orbitron tracking-[0.2em] uppercase text-sm shadow-[0_0_15px_rgba(245,158,11,0.3)] font-orbitron font-orbitron font-orbitron ${selectedLog.correctionStatus === 'pending' ? 'grayscale opacity-60' : ''}`}
                >
                  {selectedLog.correctionStatus === 'pending' ? '修正申請済み / APPLIED' : '修正申請する / CORRECT'}
                </CutCornerButton>
                </>
              ) : (
                <div className="p-10 border border-dashed border-slate-800 text-center opacity-40">
                  <span className="text-[10px] font-mono uppercase italic tracking-widest font-orbitron font-orbitron font-orbitron font-orbitron"><span className="text-cyan-400 font-orbitron font-orbitron font-orbitron">No Records Found</span> / 打刻データがありません</span>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'signal') {
      return (
        <div className="h-full px-6 py-4 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500 overflow-y-auto no-scrollbar pt-2">
          {['今日', '昨日', '12月15日'].map(groupLabel => {
            const groupNotifications = NOTIFICATIONS_DATA.filter(n => n.dateLabel === groupLabel);
            if (groupNotifications.length === 0) return null;

            return (
              <div key={groupLabel} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-cyan-400/30" />
                  <span className="text-[10px] font-black font-orbitron text-cyan-400 tracking-widest uppercase italic bg-cyan-400/10 px-2 py-0.5 border border-cyan-400/20 font-orbitron">
                    {groupLabel}
                  </span>
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-cyan-400/30" />
                </div>

                <div className="flex flex-col gap-2">
                  {groupNotifications.map(notification => (
                    <div 
                      key={notification.id}
                      className={`relative group bg-[#0a1525]/60 border-l-2 ${notification.isUnread ? 'border-cyan-400 bg-cyan-400/5 shadow-[inset_0_0_15px_rgba(34,211,238,0.05)]' : 'border-slate-800'} p-4 transition-all hover:bg-slate-900/40`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="relative mt-1">
                          {notification.isUnread && (
                            <div className="absolute inset-0 bg-cyan-400 blur-sm rounded-full animate-pulse font-orbitron" />
                          )}
                          <div className={`w-2 h-2 rounded-full relative ${notification.isUnread ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-slate-700 opacity-40'}`} />
                        </div>
                        
                        <div className="flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-[13px] font-black font-sans leading-tight ${notification.isUnread ? 'text-white' : 'text-slate-400'}`}>
                              {notification.title}
                            </span>
                            <span className={`text-[10px] font-orbitron font-bold whitespace-nowrap ml-2 font-orbitron ${notification.isUnread ? 'text-cyan-400' : 'text-slate-600'}`}>
                              {notification.time}
                            </span>
                          </div>
                          <p className={`text-[11px] font-medium leading-relaxed font-sans ${notification.isUnread ? 'text-slate-200' : 'text-slate-500'}`}>
                            {notification.description}
                          </p>
                        </div>
                        
                        <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-30 transition-opacity">
                           <MessageSquare className="w-4 h-4 text-cyan-400 font-orbitron" />
                        </div>
                      </div>

                      {/* Sci-fi HUD bottom edge accent */}
                      <div className="absolute bottom-0 right-0 w-4 h-4 opacity-10">
                        <div className={`absolute bottom-0 right-0 w-2 h-[1px] ${notification.isUnread ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                        <div className={`absolute bottom-0 right-0 w-[1px] h-2 ${notification.isUnread ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          
          <div className="mt-8 mb-4 text-center opacity-30">
            <div className="inline-block h-[1px] w-12 bg-slate-700 align-middle mr-2" />
            <span className="text-[8px] font-orbitron tracking-widest uppercase font-orbitron">EOF / End of Feed</span>
            <div className="inline-block h-[1px] w-12 bg-slate-700 align-middle ml-2" />
          </div>
        </div>
      );
    }

    if (activeTab === 'settings') {
      if (settingsView === 'profile') {
        return (
          <div className="h-full px-6 py-4 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500 overflow-y-auto no-scrollbar pt-2">
            <CyberFrame title="USER_PROFILE" subTitle="ユーザー詳細" color="cyan" className="flex flex-col gap-6">
                <div className="flex flex-col items-center gap-4 py-4">
                    <div className="w-32 h-32 border-2 border-cyan-400/30 rounded-full overflow-hidden shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                        <img src={userData.avatar} className="w-full h-full object-cover grayscale brightness-75" />
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-black text-white italic tracking-tighter uppercase font-orbitron font-orbitron">{userData.name}</div>
                        <div className="text-[10px] text-cyan-400 font-mono tracking-widest font-orbitron font-orbitron">Rank: {userData.rank}</div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-slate-800/60 pt-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-orbitron font-orbitron">Department / 部署</span>
                        <span className="text-sm font-bold text-slate-200">{userData.department}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-orbitron font-orbitron">Role / 役職</span>
                        <span className="text-sm font-bold text-slate-200">{userData.role}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-orbitron font-orbitron">Join Date / 入社日</span>
                        <span className="text-sm font-bold text-slate-200">{userData.joinDate}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-orbitron font-orbitron">Directives / 目標</span>
                        <span className="text-sm italic text-slate-300 leading-relaxed font-sans">"{userData.goal}"</span>
                    </div>
                </div>
            </CyberFrame>

            <CutCornerButton 
                onClick={() => setSettingsView('main')} 
                color="cyan" 
                className="w-full py-4 font-black font-orbitron tracking-widest flex items-center justify-center gap-2 font-orbitron font-orbitron font-orbitron font-orbitron"
            >
                Return to Settings
            </CutCornerButton>
          </div>
        );
      }

       return (
         <div className="h-full px-6 py-4 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500 overflow-y-auto no-scrollbar pt-2">
           <div 
             onClick={() => setSettingsView('profile')}
             className="cursor-pointer group active:scale-[0.98] transition-all"
           >
            <CyberFrame title="ACCOUNT_INFO" subTitle="アカウント情報" color="cyan" className="group-hover:border-cyan-400 transition-colors">
                <div className="flex items-center gap-5 py-2">
                    <div className="w-14 h-14 border-2 border-slate-700 group-hover:border-cyan-400/40 rounded-sm overflow-hidden transition-colors">
                        <img src={userData.avatar} className="w-full h-full object-cover grayscale brightness-75" />
                    </div>
                    <div className="flex-1 flex flex-col">
                        <div className="text-xl font-black text-white italic tracking-tighter uppercase font-orbitron group-hover:text-cyan-400 transition-colors font-orbitron">{userData.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800 px-1.5 py-0.5 rounded-sm font-orbitron">{userData.role}</span>
                            <span className="text-[10px] text-slate-400 font-sans font-medium">{userData.department}</span>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-cyan-400 transition-colors font-orbitron" />
                </div>
            </CyberFrame>
           </div>

           <div className="flex justify-center -mt-3">
                <button 
                  onClick={() => setAppState('setup_profile')}
                  className="bg-slate-900 border border-slate-800 p-2 rounded-full hover:border-cyan-400 hover:text-cyan-400 transition-all text-slate-500 shadow-xl"
                  title="Edit Profile"
                >
                    <FileEdit className="w-5 h-5 font-orbitron" />
                </button>
           </div>

           <CyberFrame title="NOTIFICATION_CONFIG" subTitle="通知設定" color="slate" className="font-orbitron font-orbitron font-orbitron">
                <div className="flex flex-col divide-y divide-slate-800/40">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-slate-200">シフト通知</span>
                            <span className="text-[9px] text-slate-500 font-mono uppercase italic tracking-tighter font-orbitron">Shift published signal</span>
                        </div>
                        <button 
                          onClick={() => setSettingsNotifyShift(!settingsNotifyShift)}
                          className={`w-10 h-5 rounded-full relative transition-colors ${settingsNotifyShift ? 'bg-cyan-500' : 'bg-slate-800'}`}
                        >
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${settingsNotifyShift ? 'left-5.5' : 'left-0.5'}`} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between py-4">
                        <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-slate-200">打刻リマインド</span>
                            <span className="text-[9px] text-slate-500 font-mono uppercase italic tracking-tighter font-orbitron">Punch-in beacon reminder</span>
                        </div>
                        <button 
                          onClick={() => setSettingsNotifyRemind(!settingsNotifyRemind)}
                          className={`w-10 h-5 rounded-full relative transition-colors ${settingsNotifyRemind ? 'bg-cyan-500' : 'bg-slate-800'}`}
                        >
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${settingsNotifyRemind ? 'left-5.5' : 'left-0.5'}`} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between py-4">
                        <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-slate-200">修正申請通知</span>
                            <span className="text-[9px] text-slate-500 font-mono uppercase italic tracking-tighter font-orbitron">Correction status alert</span>
                        </div>
                        <button 
                          onClick={() => setSettingsNotifyCorrection(!settingsNotifyCorrection)}
                          className={`w-10 h-5 rounded-full relative transition-colors ${settingsNotifyCorrection ? 'bg-cyan-500' : 'bg-slate-800'}`}
                        >
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${settingsNotifyCorrection ? 'left-5.5' : 'left-0.5'}`} />
                        </button>
                    </div>
                </div>
           </CyberFrame>

           <CyberFrame title="SYSTEM_ENTITY" subTitle="アプリ情報" color="slate" className="font-orbitron font-orbitron">
                <div className="flex flex-col divide-y divide-slate-800/40 font-orbitron font-orbitron">
                    <div className="flex items-center justify-between py-4 font-orbitron font-orbitron">
                        <span className="text-[13px] font-bold text-slate-400 font-sans">バージョン</span>
                        <span className="text-sm font-orbitron font-black text-white font-orbitron font-orbitron">1.0.0</span>
                    </div>
                    <button className="flex items-center justify-between py-4 group hover:bg-slate-800/20 transition-colors -mx-2 px-2">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors font-orbitron font-orbitron" />
                            <span className="text-[13px] font-bold text-slate-200 font-sans">利用規約</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-cyan-400 transition-colors font-orbitron font-orbitron" />
                    </button>
                    <button className="flex items-center justify-between py-4 group hover:bg-slate-800/20 transition-colors -mx-2 px-2">
                        <div className="flex items-center gap-3">
                            <FileLock2 className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors font-orbitron font-orbitron" />
                            <span className="text-[13px] font-bold text-slate-200 font-sans">プライバシーポリシー</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-cyan-400 transition-colors font-orbitron font-orbitron" />
                    </button>
                </div>
           </CyberFrame>

           <div className="mt-8 mb-4">
            <CutCornerButton 
                onClick={() => setAppState('login')} 
                color="pink" 
                className="w-full py-5 font-black font-orbitron tracking-widest flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(236,72,153,0.3)] font-orbitron font-orbitron font-orbitron"
            >
                <LogOutIcon className="w-5 h-5 font-orbitron font-orbitron" /> DISCONNECT / ログアウト
            </CutCornerButton>
           </div>
         </div>
       );
    }
    return null;
  };

  const renderSetup = () => {
    if (appState === 'setup_avatar') {
      return (
        <div className="flex-1 flex flex-col px-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-8 font-orbitron font-orbitron font-orbitron font-orbitron font-orbitron">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase font-orbitron font-orbitron font-orbitron">
              <span className="text-cyan-400 font-orbitron font-orbitron font-orbitron">SELECT_AVATAR</span> <span className="text-white">/ アバター選択</span>
            </h2>
            <div className="w-12 h-1 bg-cyan-400 mt-1" />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-12">
            {AVATAR_OPTIONS.map((url, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedAvatarIdx(idx)}
                className={`aspect-square border-2 transition-all cursor-pointer overflow-hidden ${selectedAvatarIdx === idx ? 'border-cyan-400 scale-105 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'border-slate-800 grayscale opacity-50'}`}
              >
                <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <CutCornerButton 
            onClick={handleAvatarSelect} 
            filled 
            color="cyan" 
            disabled={selectedAvatarIdx === null}
            className="w-full py-5 font-black font-orbitron tracking-widest uppercase text-sm font-orbitron font-orbitron font-orbitron"
          >
            Confirm Identity / 決定
          </CutCornerButton>
        </div>
      );
    }
    if (appState === 'setup_profile') {
      return (
        <div className="flex-1 flex flex-col px-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-y-auto">
          <div className="mb-8 font-orbitron font-orbitron font-orbitron font-orbitron font-orbitron font-orbitron">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase font-orbitron font-orbitron font-orbitron font-orbitron">
              <span className="text-cyan-400 font-orbitron font-orbitron font-orbitron font-orbitron">INIT_PROFILE</span> <span className="text-white font-sans font-orbitron font-orbitron font-orbitron font-orbitron">/ プロフィール設定</span>
            </h2>
            <div className="w-12 h-1 bg-cyan-400 mt-1" />
          </div>
          <div className="flex flex-col gap-6 mb-12">
            <div className="flex flex-col gap-2 font-orbitron font-orbitron">
              <label className="text-xs font-bold font-orbitron tracking-widest font-orbitron font-orbitron font-orbitron">
                <span className="text-cyan-400 uppercase font-orbitron font-orbitron font-orbitron">Nickname</span> <span className="text-slate-400 font-mono italic font-orbitron font-orbitron font-orbitron font-orbitron">(Required)</span> <span className="text-white font-sans font-orbitron font-orbitron font-orbitron">/ ニックネーム (必須)</span>
              </label>
              <input 
                value={setupNickname} 
                onChange={(e) => setSetupNickname(e.target.value)}
                className="bg-slate-900 border border-slate-700 p-3 text-white focus:border-cyan-400 outline-none font-sans rounded-sm" 
                placeholder="ニックネームを入力..."
              />
            </div>
            <div className="flex flex-col gap-2 font-orbitron font-orbitron">
              <label className="text-xs font-bold font-orbitron tracking-widest font-orbitron font-orbitron font-orbitron">
                <span className="text-cyan-400 uppercase font-orbitron font-orbitron font-orbitron">Birthday</span> <span className="text-white font-sans font-orbitron font-orbitron font-orbitron">/ 生年月日</span>
              </label>
              <input 
                type="date"
                value={setupBirthday} 
                onChange={(e) => setSetupBirthday(e.target.value)}
                className="bg-slate-900 border border-slate-700 p-3 text-white focus:border-cyan-400 outline-none font-mono rounded-sm font-orbitron font-orbitron" 
                placeholder="2000-01-01"
              />
            </div>
            <div className="flex flex-col gap-2 font-orbitron font-orbitron">
              <label className="text-xs font-bold font-orbitron tracking-widest font-orbitron font-orbitron font-orbitron">
                <span className="text-cyan-400 uppercase font-orbitron font-orbitron font-orbitron">Core Directive</span> <span className="text-slate-400 font-mono italic font-orbitron font-orbitron font-orbitron font-orbitron">(Required)</span> <span className="text-white font-sans font-orbitron font-orbitron font-orbitron">/ 今月の目標 (必須)</span>
              </label>
              <textarea 
                value={setupGoal} 
                onChange={(e) => setSetupGoal(e.target.value)}
                className="bg-slate-900 border border-slate-700 p-3 text-white focus:border-cyan-400 outline-none font-sans min-h-[120px] resize-none rounded-sm" 
                placeholder="今月の目標を入力..."
              />
            </div>
            <div className="flex flex-col gap-2 font-orbitron font-orbitron">
              <label className="text-xs font-bold font-orbitron tracking-widest font-orbitron font-orbitron font-orbitron">
                <span className="text-cyan-400 uppercase font-orbitron font-orbitron font-orbitron">Interests</span> <span className="text-white font-sans font-orbitron font-orbitron font-orbitron">/ 趣味・特技</span>
              </label>
              <input 
                value={setupHobbies} 
                onChange={(e) => setSetupHobbies(e.target.value)}
                className="bg-slate-900 border border-slate-700 p-3 text-white focus:border-cyan-400 outline-none font-sans rounded-sm" 
                placeholder="趣味や特技を入力..."
              />
            </div>
          </div>
          <CutCornerButton onClick={handleProfileComplete} filled color="cyan" className="w-full py-5 font-black tracking-widest font-orbitron uppercase text-sm mt-auto font-orbitron font-orbitron font-orbitron font-orbitron font-orbitron">
            Synchronize Data / データを同期
          </CutCornerButton>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-2">
      <div className="relative w-[390px] h-[844px] bg-[#050a14] text-white flex flex-col overflow-hidden shadow-2xl border border-slate-800 rounded-[40px]">
        <div className="absolute inset-0 pointer-events-none opacity-10"><svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#22d3ee" strokeWidth="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)" /></svg></div>
        {appState === 'main' && renderStatusBar()}
        <div className={`flex-1 overflow-hidden relative z-10 flex flex-col h-full`}>
          {appState === 'login' ? renderLogin() : appState === 'main' ? (<main className="flex-1 overflow-hidden pt-[104px] pb-24 flex flex-col">{renderContent()}</main>) : renderSetup()}
        </div>
        {appState === 'main' && (
          <nav className="absolute bottom-0 left-0 right-0 h-24 bg-[#050a14]/90 backdrop-blur-2xl border-t border-cyan-400/30 z-50 flex items-center justify-around px-2">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_-5px_20px_rgba(34,211,238,0.4)]" />
            <NavButton active={activeTab === 'home'} onClick={goHome} icon={<Home className="w-6 h-6" />} label="HOME" subLabel="ホーム" />
            <NavButton active={activeTab === 'shift'} onClick={() => { setActiveTab('shift'); setViewState('menu'); }} icon={<Calendar className="w-6 h-6" />} label="SHIFT" subLabel="シフト" />
            <NavButton active={activeTab === 'history'} onClick={() => { setActiveTab('history'); setViewState('menu'); }} icon={<HistoryIcon className="w-6 h-6" />} label="HISTORY" subLabel="打刻履歴" />
            <NavButton active={activeTab === 'signal'} onClick={() => setActiveTab('signal')} icon={<Wifi className="w-6 h-6" />} label="SIGNAL" subLabel="通知" />
            <NavButton active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setSettingsView('main'); }} icon={<SettingsIcon className="w-6 h-6" />} label="SYS" subLabel="設定" />
          </nav>
        )}
        
        {/* Version Information */}
        <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none opacity-20 z-[80]">
          <span className="text-[6px] font-mono tracking-[0.3em] text-slate-500 uppercase font-orbitron font-orbitron font-orbitron font-orbitron font-orbitron font-orbitron font-orbitron">Stream Connect Ver1.0.0</span>
        </div>
        
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-[70]" />
      </div>
    </div>
  );
};

const CUT_CORNER_SMALL_STYLE = { clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' };
const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; subLabel: string }> = ({ active, onClick, icon, label, subLabel }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 w-16 h-16 ${active ? 'text-slate-950 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)]' : 'text-slate-500 hover:text-cyan-400 hover:bg-slate-800/50'}`} style={CUT_CORNER_SMALL_STYLE}><div className="transition-all duration-300">{icon}</div><div className="flex flex-col items-center leading-none font-orbitron font-orbitron font-orbitron font-orbitron font-orbitron font-orbitron font-orbitron font-orbitron"><span className="text-[8px] font-black tracking-widest font-orbitron font-orbitron font-orbitron font-orbitron font-orbitron font-orbitron font-orbitron font-orbitron font-orbitron font-orbitron">{label}</span><span className="text-[6px] font-bold uppercase opacity-80 font-orbitron font-orbitron font-orbitron font-orbitron font-orbitron font-orbitron font-orbitron font-orbitron">{subLabel}</span></div></button>
);

export default App;
