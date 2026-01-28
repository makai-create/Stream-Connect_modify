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

// --- 初期ユーザー設定 ---
const INITIAL_USER: User = {
  name: "山田 太郎",
  rank: "NOVICE",
  location: "UNKNOWN",
  role: "スタッフ",
  department: "開発部 第3セクション",
  base: "東京本社",
  joinDate: "2022.04.01",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
};

const AVATAR_OPTIONS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=150&q=80"
];

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
  
  // システム点火フラグ（これがtrueになると緑の出勤ボタンが現れる）
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
    setUserData(prev => ({ 
      ...prev, 
      nickname: setupNickname || prev.name, 
      goal: setupGoal 
    }));
    setAppState('main');
  };

  const startScan = (type: PunchType) => {
    setPunchType(type);
    setIsScanning(true);
  };

  const handleScanSuccess = (type: PunchType) => {
    setIsScanning(false);
    
    // スキャン成功時のステータス更新
    switch (type) {
      case 'in': setAttendanceStatus('working'); break;
      case 'out': setAttendanceStatus('finished'); break;
      case 'break_start': setAttendanceStatus('break'); break;
      case 'break_end': setAttendanceStatus('working'); break;
      default: break;
    }
  };

  const getFullPageTitle = () => {
    if (activeTab === 'home') return 'HOME / ホーム';
    if (activeTab === 'shift') return 'SHIFT / シフト';
    if (activeTab === 'signal') return 'SIGNAL / 通知';
    if (activeTab === 'settings') return 'SYS / 設定';
    return 'SYSTEM';
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case 'home': return (
        <HomePage 
          userData={userData} 
          attendanceStatus={attendanceStatus} 
          startScan={startScan} 
          isScanning={isScanning} 
          setIsScanning={setIsScanning} 
          handleScanSuccess={handleScanSuccess} 
          shiftViewState={shiftViewState} 
          setShiftViewState={setShiftViewState} 
          attendanceHistory={ATTENDANCE_HISTORY}
          isIgnited={isIgnited}
          setIsIgnited={setIsIgnited}
        />
      );
      case 'shift': return (
        <ShiftPage 
          viewState={shiftViewState} 
          setViewState={setShiftViewState} 
          shiftMonth={shiftMonth} 
          setShiftMonth={setShiftMonth} 
          shiftData={shiftData} 
          setShiftData={setShiftData} 
          selectedShiftDate={selectedShiftDate} 
          setSelectedShiftDate={setSelectedShiftDate} 
          previewMode="monthly"
        />
      );
      case 'signal': return <SignalPage notifications={NOTIFICATIONS_DATA} />;
      case 'settings': return (
        <SettingsPage 
          userData={userData} 
          settingsView={settingsView} 
          setSettingsView={setSettingsView} 
          setAppState={setAppState} 
          settingsNotifyShift={settingsNotifyShift} 
          setSettingsNotifyShift={setSettingsNotifyShift} 
          settingsNotifyRemind={settingsNotifyRemind} 
          setSettingsNotifyRemind={setSettingsNotifyRemind} 
          settingsNotifyCorrection={settingsNotifyCorrection} 
          setSettingsNotifyCorrection={setSettingsNotifyCorrection} 
        />
      );
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex justify-center overflow-hidden">
      <div className="relative w-full h-full max-w-[430px] bg-[#050a14] text-white flex flex-col overflow-hidden shadow-2xl border-x border-slate-800">
        
        {/* ヘッダー */}
        {appState === 'main' && (
          <header className="flex-none z-[60] flex flex-col">
            <div className="h-10 w-full" />
            <div className="w-full h-12 bg-[#050a14]/90 backdrop-blur-md border-b border-cyan-400/20 px-6 flex items-center justify-between">
              <button 
                onClick={() => { setActiveTab('home'); setShiftViewState('menu'); }}
                className="text-left group transition-opacity hover:opacity-80"
              >
                <div className="text-[10px] font-orbitron font-black tracking-[0.1em] italic uppercase text-cyan-400">
                  {getFullPageTitle()}
                </div>
              </button>
              <button onClick={() => setActiveTab('signal')} className="relative p-2 rounded-full hover:bg-white/5 transition-colors">
                <Bell className={`w-5 h-5 ${activeTab === 'signal' ? 'text-cyan-400' : 'text-slate-500'}`} />
                {hasUnread && <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-pink-500 rounded-full border border-[#050a14]" />}
              </button>
            </div>
          </header>
        )}

        {/* メインコンテンツ */}
        <main className="flex-1 relative overflow-hidden flex flex-col z-10">
          {appState === 'login' && <LoginPage onLogin={handleLogin} />}
          {appState === 'setup_avatar' && (
            <SetupAvatarPage avatarOptions={AVATAR_OPTIONS} selectedAvatarIdx={selectedAvatarIdx} setSelectedAvatarIdx={setSelectedAvatarIdx} onConfirm={handleAvatarSelect} />
          )}
          {appState === 'setup_profile' && (
            <SetupProfilePage nickname={setupNickname} setNickname={setSetupNickname} goal={setupGoal} setGoal={setSetupGoal} onComplete={handleProfileComplete} />
          )}
          {appState === 'main' && renderMainContent()}
        </main>

        {/* ナビゲーション（IGNITIONロジック修正済み） */}
        {appState === 'main' && (
          <nav className="flex-none h-24 bg-[#050a14]/95 backdrop-blur-2xl border-t border-cyan-400/30 z-50 flex items-center justify-around px-2">
            <NavButton active={activeTab === 'home'} onClick={() => { setActiveTab('home'); setShiftViewState('menu'); }} icon={<Home className="w-6 h-6" />} label="HOME" subLabel="ホーム" />
            <NavButton active={activeTab === 'shift'} onClick={() => setActiveTab('shift')} icon={<Calendar className="w-6 h-6" />} label="SHIFT" subLabel="シフト" />
            
            {/* IGNITIONボタン: 押すとHomePageに「緑の出勤ボタン」をアンロックして出現させる */}
            <NavButton 
              active={!isIgnited} 
              onClick={() => {
                setActiveTab('home');
                setShiftViewState('menu');
                if (!isIgnited) {
                  setIsIgnited(true); // スキャナーを介さず、まずボタンを解放する
                }
              }} 
              icon={<Zap className={`w-6 h-6 ${!isIgnited ? 'animate-pulse text-amber-400' : 'text-cyan-400'}`} />} 
              label="IGNITION" 
              subLabel={isIgnited ? "点火済み" : "点火起動"} 
            />
            
            <NavButton active={activeTab === 'signal'} onClick={() => setActiveTab('signal')} icon={<Wifi className="w-6 h-6" />} label="SIGNAL" subLabel="通知" />
            <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon className="w-6 h-6" />} label="SYS" subLabel="設定" />
          </nav>
        )}
      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label, subLabel }: any) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center justify-center gap-1 w-16 h-16 transition-all ${active ? 'text-slate-950 bg-cyan-400 shadow-[0_0_15px_#22d3ee88]' : 'text-slate-500 hover:text-slate-400'}`}
  >
    <div className={active ? 'scale-110' : ''}>{icon}</div>
    <div className="flex flex-col items-center leading-none">
      <span className="text-[8px] font-black tracking-widest font-orbitron">{label}</span>
      <span className="text-[6px] font-bold uppercase opacity-80 font-orbitron">{subLabel}</span>
    </div>
  </button>
);

export default App;