import React from 'react';
import { User, AppState } from '../types';
import { 
  LogOut, 
  ChevronRight, 
  Shield, 
  FileText, 
  ChevronLeft, 
  Edit2 
} from 'lucide-react';
import { CyberFrame, CutCornerButton } from '../components/CyberUI';

interface SettingsPageProps {
  userData: User;
  settingsView: 'main' | 'profile';
  setSettingsView: (view: 'main' | 'profile') => void;
  setAppState: (state: AppState) => void;
  settingsNotifyShift: boolean;
  setSettingsNotifyShift: (v: boolean) => void;
  settingsNotifyRemind: boolean;
  setSettingsNotifyRemind: (v: boolean) => void;
  settingsNotifyCorrection: boolean;
  setSettingsNotifyCorrection: (v: boolean) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  userData,
  settingsView,
  setSettingsView,
  setAppState,
  settingsNotifyShift,
  setSettingsNotifyShift,
  settingsNotifyRemind,
  setSettingsNotifyRemind,
  settingsNotifyCorrection,
  setSettingsNotifyCorrection,
}) => {

  const handleLogout = () => {
    setAppState('login');
  };

  // --- プロフィール詳細ビュー (VIEW_PROFILE) ---
  if (settingsView === 'profile') {
    return (
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[#050505] text-white">
        {/* 背景グリッド */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        
        <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar space-y-6 pt-8 relative z-10">
          {/* 戻るボタン */}
          <button 
            onClick={() => setSettingsView('main')}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-2 group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold tracking-widest font-orbitron uppercase tracking-[0.2em]">Back_to_Settings</span>
          </button>

          <CyberFrame title="USER_IDENTITY" color="cyan" className="!p-5 overflow-visible bg-[#050a14]/60">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-2 border-cyan-400 p-1 shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                  <img src={userData.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                </div>
                <div>
                  <div className="text-xl font-black font-orbitron italic text-white tracking-tighter">
                    {userData.nickname || userData.name}
                  </div>
                  <div className="text-[10px] text-cyan-500 font-bold tracking-[0.2em] font-orbitron uppercase">
                    {userData.rank} / {userData.location}
                  </div>
                </div>
              </div>
              {/* プロフィール再編アイコン（初回設定画面へ遷移） */}
              <button 
                onClick={() => setAppState('setup_profile')}
                className="p-2 bg-white/5 rounded border border-white/10 hover:bg-cyan-400 hover:text-slate-950 transition-all shadow-lg"
              >
                <Edit2 size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {[
                { label: 'ROLE', value: userData.role },
                { label: 'DEPT', value: userData.department },
                { label: 'BASE', value: userData.base },
                { label: 'JOIN', value: userData.joinDate },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-zinc-800/50 pb-2">
                  <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">{item.label}</span>
                  <span className="text-sm font-bold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </CyberFrame>

          <div className="space-y-3">
             <div className="text-[10px] text-cyan-500 font-bold tracking-[0.3em] font-orbitron pl-2 uppercase">MISSION_STATEMENT</div>
             <div className="bg-cyan-950/20 border border-cyan-900/40 p-4 rounded text-sm leading-relaxed text-zinc-300 italic">
                「{userData.goal || "未設定"}」
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- メイン設定ビュー (SETTINGS_MAIN) ---
  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-[#050505] text-white">
      
      {/* 背景グリッド */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar space-y-6 pt-8 relative z-10">

        {/* 1. アカウント情報 (ACCOUNT_INFO) */}
        <CyberFrame title="ACCOUNT_INFO" subTitle="アカウント情報" color="cyan" className="!p-0 overflow-visible bg-[#050a14]/60 relative">
          <button 
             onClick={() => setSettingsView('profile')}
             className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <img 
                src={userData.avatar} 
                alt="avatar" 
                className="w-14 h-14 object-cover border border-cyan-500/30"
              />
              <div className="text-left">
                <div className="text-lg font-bold text-white mb-1">{userData.nickname || userData.name}</div>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 border border-slate-700">{userData.role}</span>
                   <span className="text-[10px] text-zinc-500">{userData.department}</span>
                </div>
              </div>
            </div>
            {/* 詳細を見る矢印 */}
            <ChevronRight className="w-5 h-5 text-cyan-500 group-hover:translate-x-1 transition-transform mr-1" />
          </button>

          {/* ★追加: プロフィール編集ボタン (初回設定ページへ) */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setAppState('setup_profile');
            }}
            className="absolute bottom-2 right-12 p-2 bg-[#050a14]/80 border border-cyan-500/30 text-cyan-400 rounded hover:bg-cyan-400 hover:text-slate-950 transition-all z-20 shadow-lg"
            title="プロファイルを再編集"
          >
            <Edit2 size={14} />
          </button>
        </CyberFrame>

        {/* 2. 通知設定 (NOTIFICATION_CONFIG) */}
        <CyberFrame title="NOTIFICATION_CONFIG" subTitle="通知設定" color="cyan" className="!p-0 overflow-visible bg-[#050a14]/60">
           <div className="p-4 space-y-4">
             <ToggleItem 
               label="シフト通知" 
               subLabel="SHIFT PUBLISHED SIGNAL"
               checked={settingsNotifyShift} 
               onChange={setSettingsNotifyShift} 
             />
             <ToggleItem 
               label="打刻リマインド" 
               subLabel="PUNCH-IN BEACON REMINDER"
               checked={settingsNotifyRemind} 
               onChange={setSettingsNotifyRemind} 
             />
             <ToggleItem 
               label="修正申請通知" 
               subLabel="CORRECTION STATUS ALERT"
               checked={settingsNotifyCorrection} 
               onChange={setSettingsNotifyCorrection} 
             />
           </div>
        </CyberFrame>

        {/* 3. システム情報 (SYSTEM_ENTITY) */}
        <CyberFrame title="SYSTEM_ENTITY" subTitle="アプリ情報" color="cyan" className="!p-0 overflow-visible bg-[#050a14]/60">
           <div className="p-4 space-y-1">
             <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                <span className="text-sm font-bold text-zinc-300">バージョン</span>
                <span className="text-sm font-black font-orbitron text-white">1.0.0</span>
             </div>
             
             <button className="w-full py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left border-b border-slate-800/50">
                <Shield className="w-4 h-4 text-zinc-500" />
                <span className="text-sm font-bold text-zinc-300">利用規約</span>
                <ChevronRight className="w-4 h-4 text-zinc-600 ml-auto" />
             </button>

             <button className="w-full py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left">
                <FileText className="w-4 h-4 text-zinc-500" />
                <span className="text-sm font-bold text-zinc-300">プライバシーポリシー</span>
                <ChevronRight className="w-4 h-4 text-zinc-600 ml-auto" />
             </button>
           </div>
        </CyberFrame>

        {/* 4. ログアウトボタン */}
        <div className="pt-2">
          <CutCornerButton 
            onClick={handleLogout}
            filled 
            color="magenta" 
            className="w-full py-5 font-black tracking-widest text-sm shadow-[0_0_20px_rgba(236,72,153,0.3)] flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> ログアウト
          </CutCornerButton>
        </div>

      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

// トグルスイッチコンポーネント
const ToggleItem = ({ label, subLabel, checked, onChange }: { label: string, subLabel: string, checked: boolean, onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between">
    <div>
      <div className="text-sm font-bold text-white mb-0.5">{label}</div>
      <div className="text-[9px] font-orbitron text-zinc-500 tracking-wider uppercase">{subLabel}</div>
    </div>
    <button 
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 ${checked ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-800 border border-slate-700'}`}
    >
      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);

export default SettingsPage;