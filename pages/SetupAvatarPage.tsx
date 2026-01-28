
import React from 'react';
import { CutCornerButton } from '../components/CyberUI';

interface SetupAvatarPageProps {
  selectedAvatarIdx: number | null;
  setSelectedAvatarIdx: (idx: number) => void;
  onConfirm: () => void;
  avatarOptions: string[];
}

export const SetupAvatarPage: React.FC<SetupAvatarPageProps> = ({ 
  selectedAvatarIdx, 
  setSelectedAvatarIdx, 
  onConfirm,
  avatarOptions
}) => {
  return (
    <div className="flex-1 flex flex-col px-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700 font-orbitron">
      <div className="mb-8">
        <h2 className="text-2xl font-black italic tracking-tighter uppercase">
          <span className="text-cyan-400">SELECT_AVATAR</span> <span className="text-white">/ アバター選択</span>
        </h2>
        <div className="w-12 h-1 bg-cyan-400 mt-1" />
      </div>
      <div className="grid grid-cols-3 gap-4 mb-12">
        {avatarOptions.map((url, idx) => (
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
        onClick={onConfirm} 
        filled 
        color="cyan" 
        disabled={selectedAvatarIdx === null}
        className="w-full py-5 font-black tracking-widest uppercase text-sm"
      >
        Confirm Identity / 決定
      </CutCornerButton>
    </div>
  );
};

export default SetupAvatarPage;
