import React, { useState } from 'react';
import { CutCornerButton } from '../components/CyberUI';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginClick = () => {
    setIsLoading(true);
    // 少しだけロード時間を演出してログイン
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 800);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#050a14]">
      
      {/* 背景：グリッド線 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
         <div className="absolute inset-0 bg-gradient-to-t from-[#050a14] via-transparent to-[#050a14]/50" />
      </div>

      <div className="w-full max-w-xs relative z-10 animate-in fade-in zoom-in duration-1000 flex flex-col items-center">
        <div className="mb-16 text-center w-full">
          {/* SYSTEM BOOT ラベルを削除 */}
          {/* ロゴ：StreamConnect */}
          <h1 className="text-4xl font-black italic text-white font-orbitron tracking-tighter transform -skew-x-6 leading-tight" style={{ textShadow: '0 0 30px rgba(6,182,212,0.6)' }}>
            Stream<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Connect</span>
          </h1>
          <div className="h-1 w-24 bg-cyan-500 mx-auto mt-6 shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
        </div>

        {/* ボタン：Refresh the World (文字のみに修正) */}
        <CutCornerButton 
          onClick={handleLoginClick}
          filled 
          color="cyan" 
          className="w-full py-4 font-black tracking-[0.2em] text-lg shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:shadow-[0_0_50px_rgba(34,211,238,0.6)] transition-all flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? 'CONNECTING...' : 'Refresh the World'}
        </CutCornerButton>
        
        {/* ログインでお困りの方のリンク */}
        <button className="mt-6 text-[10px] text-cyan-500/70 hover:text-cyan-400 transition-colors font-bold tracking-widest border-b border-cyan-500/20 pb-0.5">
          ログインでお困りの方はこちら
        </button>
        
        {/* Authorized Personnel Only のセクションを削除 */}
      </div>

      {/* バージョン表記：一番下に小さく配置 */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-10">
        <span className="text-[9px] text-slate-600 font-orbitron tracking-[0.3em] uppercase opacity-60">
          Stream Connect ver 1.0.0
        </span>
      </div>
    </div>
  );
};

export default LoginPage;