import React from 'react';
import { MessageSquare } from 'lucide-react';
import { AppNotification } from '../types';

interface SignalPageProps {
  notifications: AppNotification[];
}

export const SignalPage: React.FC<SignalPageProps> = ({ notifications }) => {
  const groups = ['今日', '昨日', '12月15日'];

  return (
    <div className="h-full px-6 py-4 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500 overflow-y-auto no-scrollbar pt-2 font-orbitron">
      {groups.map(groupLabel => {
        const groupNotifications = notifications.filter(n => n.dateLabel === groupLabel);
        if (groupNotifications.length === 0) return null;

        return (
          <div key={groupLabel} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-cyan-400/30" />
              <span className="text-[10px] font-black text-cyan-400 tracking-widest uppercase italic bg-cyan-400/10 px-2 py-0.5 border border-cyan-400/20 font-orbitron">
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
                        <div className="absolute inset-0 bg-cyan-400 blur-sm rounded-full animate-pulse" />
                      )}
                      <div className={`w-2 h-2 rounded-full relative ${notification.isUnread ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-slate-700 opacity-40'}`} />
                    </div>
                    
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-[13px] font-black font-sans leading-tight ${notification.isUnread ? 'text-white' : 'text-slate-400'}`}>
                          {notification.title}
                        </span>
                        <span className={`text-[10px] font-orbitron font-bold whitespace-nowrap ml-2 ${notification.isUnread ? 'text-cyan-400' : 'text-slate-600'}`}>
                          {notification.time}
                        </span>
                      </div>
                      <p className={`text-[11px] font-medium leading-relaxed font-sans ${notification.isUnread ? 'text-slate-200' : 'text-slate-500'}`}>
                        {notification.description}
                      </p>
                    </div>
                    
                    <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-30 transition-opacity">
                       <MessageSquare className="w-4 h-4 text-cyan-400" />
                    </div>
                  </div>

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
        <span className="text-[8px] tracking-widest uppercase font-orbitron">EOF / End of Feed</span>
        <div className="inline-block h-[1px] w-12 bg-slate-700 align-middle ml-2" />
      </div>
    </div>
  );
};

export default SignalPage;