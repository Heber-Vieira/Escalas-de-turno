
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
        <nav className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] backdrop-blur-xl border border-white/20 px-6 py-4 flex justify-between items-center z-50 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] ${theme.bg.includes('white') ? 'bg-white/85' : 'bg-black/85'}`}>
            <button
                onClick={() => setView('calendar')}
                className={`flex flex-col items-center gap-1 transition-all ${getActiveTabColor(view === 'calendar')}`}
            >
                <Calendar size={22} />
                <span className="text-[9px] uppercase font-bold tracking-tighter">Minha Escala</span>
            </button>

            <button
                onClick={() => setView('team_schedule')}
                className={`flex flex-col items-center gap-1 transition-all ${getActiveTabColor(view === 'team_schedule')}`}
            >
                <ListTodo size={22} />
                <span className="text-[9px] uppercase font-bold tracking-tighter">Toda Equipe</span>
            </button>

            <button
                onClick={() => setView('history')}
                className={`flex flex-col items-center gap-1 transition-all ${getActiveTabColor(view === 'history')}`}
            >
                <History size={22} />
                <span className="text-[9px] uppercase font-bold tracking-tighter">Histórico</span>
            </button>

            <button
                onClick={() => setView('users')}
                className={`flex flex-col items-center gap-1 transition-all ${getActiveTabColor(view === 'users')}`}
            >
                <Users size={22} />
                <span className="text-[9px] uppercase font-bold tracking-tighter">Equipe</span>
            </button>
        </nav>
    );
};
