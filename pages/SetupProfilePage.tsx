import React from 'react';
import { CutCornerButton } from '../components/CyberUI';

interface SetupProfilePageProps {
  nickname: string;
  setNickname: (v: string) => void;
  birthday: string;
  setBirthday: (v: string) => void;
  goal: string;
  setGoal: (v: string) => void;
  hobbies: string;
  setHobbies: (v: string) => void;
  onComplete: () => void;
}

export const SetupProfilePage: React.FC<SetupProfilePageProps> = ({
  nickname,
  setNickname,
  birthday,
  setBirthday,
  goal,
  setGoal,
  hobbies,
  setHobbies,
  onComplete
}) => {
  return (
    <div className="flex-1 flex flex-col px-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-y-auto">
      <div className="mb-8 font-orbitron">
        <h2 className="text-2xl font-black italic tracking-tighter uppercase">
          <span className="text-cyan-400">INIT_PROFILE</span> <span className="text-white font-sans">/ プロフィール設定</span>
        </h2>
        <div className="w-12 h-1 bg-cyan-400 mt-1" />
      </div>
      <div className="flex flex-col gap-6 mb-12">
        <div className="flex flex-col gap-2 font-orbitron">
          <label className="text-xs font-bold tracking-widest">
            <span className="text-cyan-400 uppercase">Nickname</span> <span className="text-white font-sans">/ ニックネーム</span>
          </label>
          <input 
            value={nickname} 
            onChange={(e) => setNickname(e.target.value)}
            className="bg-slate-900 border border-slate-700 p-3 text-white focus:border-cyan-400 outline-none font-sans rounded-sm" 
            placeholder="ニックネームを入力..."
          />
        </div>
        <div className="flex flex-col gap-2 font-orbitron">
          <label className="text-xs font-bold tracking-widest">
            <span className="text-cyan-400 uppercase">Birthday</span> <span className="text-white font-sans">/ 生年月日</span>
          </label>
          <input 
            type="date"
            value={birthday} 
            onChange={(e) => setBirthday(e.target.value)}
            className="bg-slate-900 border border-slate-700 p-3 text-white focus:border-cyan-400 outline-none font-mono rounded-sm" 
          />
        </div>
        <div className="flex flex-col gap-2 font-orbitron">
          <label className="text-xs font-bold tracking-widest">
            <span className="text-cyan-400 uppercase">Core Directive</span> <span className="text-white font-sans">/ 今月の目標</span>
          </label>
          <textarea 
            value={goal} 
            onChange={(e) => setGoal(e.target.value)}
            className="bg-slate-900 border border-slate-700 p-3 text-white focus:border-cyan-400 outline-none font-sans min-h-[120px] resize-none rounded-sm" 
            placeholder="今月の目標を入力..."
          />
        </div>
        <div className="flex flex-col gap-2 font-orbitron">
          <label className="text-xs font-bold tracking-widest">
            <span className="text-cyan-400 uppercase">Interests</span> <span className="text-white font-sans">/ 趣味・特技</span>
          </label>
          <input 
            value={hobbies} 
            onChange={(e) => setHobbies(e.target.value)}
            className="bg-slate-900 border border-slate-700 p-3 text-white focus:border-cyan-400 outline-none font-sans rounded-sm" 
            placeholder="趣味や特技を入力..."
          />
        </div>
      </div>
      <CutCornerButton onClick={onComplete} filled color="cyan" className="w-full py-5 font-black tracking-widest font-orbitron uppercase text-sm mt-auto">
        OK
      </CutCornerButton>
    </div>
  );
};

export default SetupProfilePage;