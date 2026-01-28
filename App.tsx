import React, { useState, useEffect } from 'react';
import { 
  Home, Calendar, Wifi, Settings as SettingsIcon, Zap, 
  Bell
} from 'lucide-react';
import { Tab, User, AppNotification, ShiftViewState, ExtendedShiftDayLocal, AppState, AttendanceStatus, AttendanceLogWithCorrection } from './types';
import { PunchType } from './components/ScannerOverlay';

import LoginPage from './pages/LoginPage';
import SetupAvatarPage from './pages/SetupAvatarPage';
import SetupProfilePage from './pages/SetupProfilePage';
import HomePage from './pages/HomePage';
import ShiftPage from './pages/ShiftPage';
import SignalPage from './pages/SignalPage';
import SettingsPage from './pages/SettingsPage';

// --- 画像パスの設定 (publicフォルダ直下からの絶対パス) ---
const AVATAR_OPTIONS = [
  "/images/avatars/avatars_f_01.png",
  "/images/avatars/avatars_f_02.png"
];
const HOME_BG_IMAGE = "/images/backgrounds/home_bg01.jpg";

const INITIAL_USER: User = {
  name: "山田 太郎",
  rank: "NOVICE",
  location: "UNKNOWN",
  role: "スタッフ",
  department: "開発部 第3セクション",
  base: "東京本社",
  joinDate: "2022.04.01",
  avatar: AVATAR_OPTIONS[0]
};

const ATTENDANCE_HISTORY: AttendanceLogWithCorrection[] = [
  { id: '1', date: '2024.12.17', clockIn: '09:02', clockOut: '18:05', location: '渋谷セクター01', status: 'normal', correctionStatus: 'none' },
  { id: '2', date: '2024.12.16', clockIn: '09:05', clockOut: '18:15', location: '新宿セクター02', status: 'late', correctionStatus: 'pending' },
  { id: '3', date: '2024.12.15', clockIn: '08:55', clockOut: '17:58', location: '渋谷セクター01', status: 'normal', correctionStatus: 'none' },
];

const NOTIFICATIONS_DATA: AppNotification[] = [
  { id: 'n1', dateLabel: '今日', title: 'シフトが確定しました', description: '12/16〜12/31のシフトが公開されました。', time: '10:30', isUnread: true, type: 'shift' },
];

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('login');
  const [userData, setUserData] = useState<User>(INITIAL_USER);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isIgnited, setIsIgnited] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>('none');
  const [isScanning, setIsScanning] = useState(false);
  const [punchType, setPunchType] = useState<PunchType>('in');
  const [selectedAvatarIdx, setSelectedAvatarIdx] = useState<number | null>(null);
  const [setupNickname, setSetupNickname] = useState('');
  const [setupGoal, setSetupGoal] = useState('');
  const [shiftViewState, setShiftViewState] = useState<ShiftViewState>('menu');
  const [settingsView, setSettingsView] = useState<'main' | 'profile'>('main');
  const [settingsNotifyShift, setSettingsNotifyShift] = useState(true);
  const [settingsNotifyRemind, setSettingsNotifyRemind] = useState(true);
  const [settingsNotifyCorrection, setSettingsNotifyCorrection] = useState(false);
  const [shiftMonth, setShiftMonth] = useState(new Date());
  const [shiftData, setShiftData] = useState<Record<string, ExtendedShiftDayLocal>>({});
  const [selectedShiftDate, setSelectedShiftDate] = useState<string | null>(null);

  const hasUnread = NOTIFICATIONS_DATA.some(n => n.isUnread);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = () => setAppState('setup_avatar');
  const handleAvatarSelect = () => {
    if (selectedAvatarIdx !== null) {
      setUserData(prev => ({ ...prev, avatar: AVATAR_OPTIONS[selectedAvatarIdx] }));
      setAppState('setup_profile');
    }
  };
  const handleProfileComplete = () => {
    setUserData(prev => ({ ...prev, nickname: setupNickname || prev.name, goal: setupGoal }));
    setAppState('main');
  };
  const startScan = (type: PunchType) => { setPunchType(type); setIsScanning(true); };
  const handleScanSuccess = (type: PunchType) => {
    setIsScanning(false);
    if (!isIgnited) setIsIgnited(true);
    switch (type) {
      case 'in': setAttendanceStatus('working'); break;
      case 'out': setAttendanceStatus('finished'); break;
      case 'break_start': setAttendanceStatus('break'); break;
      case 'break_end': setAttendanceStatus('working'); break;
    }
  };

  const getFullPageTitle = () => {
    const titles: Record<Tab, string> = { home: 'HOME', shift: 'SHIFT', history: 'HISTORY', signal: 'SIGNAL', settings: 'SYS' };
    return `${titles[activeTab]} / ${activeTab.toUpperCase()}`;
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case 'home': return (
        <HomePage 
          userData={userData} attendanceStatus={attendanceStatus} 
          startScan={startScan} isScanning={isScanning} 
          setIsScanning={setIsScanning} handleScanSuccess={handleScanSuccess} 
          shiftViewState={shiftViewState} setShiftViewState={setShiftViewState} 
          attendanceHistory={ATTENDANCE_HISTORY} isIgnited={isIgnited} 
          setIsIgnited={setIsIgnited} 
          homeBg={HOME_BG_IMAGE}
        />
      );
      case 'shift': return <ShiftPage viewState={shiftViewState} setViewState={setShiftViewState} shiftMonth={shiftMonth} setShiftMonth={setShiftMonth} shiftData={shiftData} setShiftData={setShiftData} selectedShiftDate={selectedShiftDate} setSelectedShiftDate={setSelectedShiftDate} previewMode="monthly" />;
      case 'signal': return <SignalPage notifications={NOTIFICATIONS_DATA} />;
      case 'settings': return <SettingsPage userData={userData} settingsView={settingsView} setSettingsView={setSettingsView} setAppState={setAppState} settingsNotifyShift={settingsNotifyShift} setSettingsNotifyShift={setSettingsNotifyShift} settingsNotifyRemind={settingsNotifyRemind} setSettingsNotifyRemind={setSettingsNotifyRemind} settingsNotifyCorrection={settingsNotifyCorrection} setSettingsNotifyCorrection={setSettingsNotifyCorrection} />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex justify-center overflow-hidden">
      <div className="relative w-full h-full max-w-[430px] bg-[#050a14] text-white flex flex-col overflow-hidden shadow-2xl border-x border-slate-800">
        {appState === 'main' && (
          <header className="flex-none z-[60] flex flex-col pt-10">
            <div className="w-full h-12 bg-[#050a14]/90 backdrop-blur-md border-b border-cyan-400/20 px-6 flex items-center justify-between">
              <button onClick={() => { setActiveTab('home'); setShiftViewState('menu'); }} className="text-left font-orbitron font-black text-cyan-400 text-[10px]">{getFullPageTitle()}</button>
              <button onClick={() => setActiveTab('signal')} className="relative p-2"><Bell className={`w-5 h-5 ${activeTab === 'signal' ? 'text-cyan-400' : 'text-slate-500'}`} />{hasUnread && <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-pink-500 rounded-full border border-[#050a14]" />}</button>
            </div>
          </header>
        )}
        <main className="flex-1 relative overflow-hidden flex flex-col z-10">
          {appState === 'login' && <LoginPage onLogin={handleLogin} />}
          {appState === 'setup_avatar' && <SetupAvatarPage avatarOptions={AVATAR_OPTIONS} selectedAvatarIdx={selectedAvatarIdx} setSelectedAvatarIdx={setSelectedAvatarIdx} onConfirm={handleAvatarSelect} />}
          {appState === 'setup_profile' && <SetupProfilePage nickname={setupNickname} setNickname={setSetupNickname} goal={setupGoal} setGoal={setSetupGoal} onComplete={handleProfileComplete} />}
          {appState === 'main' && renderMainContent()}
        </main>
        {appState === 'main' && (
          <nav className="flex-none h-24 bg-[#050a14]/95 backdrop-blur-2xl border-t border-cyan-400/30 z-50 flex items-center justify-around px-2">
            <NavButton active={activeTab === 'home'} onClick={() => { setActiveTab('home'); setShiftViewState('menu'); }} icon={<Home className="w-6 h-6" />} label="HOME" />
            <NavButton active={activeTab === 'shift'} onClick={() => setActiveTab('shift')} icon={<Calendar className="w-6 h-6" />} label="SHIFT" />
            <NavButton active={!isIgnited} onClick={() => { setActiveTab('home'); if (!isIgnited) setIsIgnited(true); }} icon={<Zap className={`w-6 h-6 ${!isIgnited ? 'animate-pulse text-amber-400' : 'text-cyan-400'}`} />} label="IGNITION" />
            <NavButton active={activeTab === 'signal'} onClick={() => setActiveTab('signal')} icon={<Wifi className="w-6 h-6" />} label="SIGNAL" />
            <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon className="w-6 h-6" />} label="SYS" />
          </nav>
        )}
      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 w-16 h-16 transition-all ${active ? 'text-cyan-400' : 'text-slate-500'}`}>
    {icon}<span className="text-[8px] font-black tracking-widest font-orbitron uppercase">{label}</span>
  </button>
);

export default App;
