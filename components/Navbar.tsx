
import React from 'react';
import { Calendar, History, Users, ListTodo } from 'lucide-react';
import { ThemeConfig } from '../constants';

interface NavbarProps {
    view: string;
    setView: (view: any) => void;
    theme: ThemeConfig;
}

export const Navbar: React.FC<NavbarProps> = ({ view, setView, theme }) => {
    const getActiveTabColor = (isActive: boolean) => {
        if (!isActive) return 'text-gray-400';
        return 'text-pink-600';
    };

    return (
        <nav className={`fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-[92%] max-w-[360px] backdrop-blur-xl border border-white/20 px-4 py-3 flex justify-around items-center z-50 rounded-[30px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] ${theme.bg.includes('white') ? 'bg-white/90' : 'bg-black/90'}`}>
            <button
                onClick={() => setView('calendar')}
                className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${getActiveTabColor(view === 'calendar')}`}
            >
                <Calendar size={19} />
                <span className="text-[8px] uppercase font-black tracking-widest">Escala</span>
            </button>

            <button
                onClick={() => setView('team_schedule')}
                className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${getActiveTabColor(view === 'team_schedule')}`}
            >
                <ListTodo size={19} />
                <span className="text-[8px] uppercase font-black tracking-widest">Geral</span>
            </button>

            <button
                onClick={() => setView('history')}
                className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${getActiveTabColor(view === 'history')}`}
            >
                <History size={19} />
                <span className="text-[8px] uppercase font-black tracking-widest">Logs</span>
            </button>

            <button
                onClick={() => setView('users')}
                className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${getActiveTabColor(view === 'users')}`}
            >
                <Users size={19} />
                <span className="text-[8px] uppercase font-black tracking-widest">Time</span>
            </button>
        </nav>
    );
};
