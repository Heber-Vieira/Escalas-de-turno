
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Layers, HelpCircle, Plus, Settings, Trash2 } from 'lucide-react';
import { UserConfig } from '../types';

interface UsersViewProps {
    profiles: UserConfig[];
    activeProfileId: string | null;
    setActiveProfileId: (id: string) => void;
    setView: (view: 'calendar' | 'team_schedule' | 'history' | 'users' | 'profile') => void;
    setIsBatchModalOpen: (isOpen: boolean) => void;
    setIsHelpOpen: (isOpen: boolean) => void;
    setShowOnboarding: (show: boolean) => void;
    removeProfile: (id: string) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
    profiles,
    activeProfileId,
    setActiveProfileId,
    setView,
    setIsBatchModalOpen,
    setIsHelpOpen,
    setShowOnboarding,
    removeProfile
}) => {
    return (
        <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 sm:gap-3">
                    <button onClick={() => setView('calendar')} className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors shrink-0"><ArrowLeft size={20} className="sm:size-24" /></button>
                    <h2 className="text-lg sm:text-2xl font-black text-gray-800 uppercase tracking-tight truncate">Equipe</h2>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <button onClick={() => setIsBatchModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-900 text-pink-500 rounded-full shadow-lg transition-all active:scale-95" title="Importação em Lote">
                        <Layers size={14} className="sm:size-18" />
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-white">Lote</span>
                    </button>
                    <button onClick={() => setIsHelpOpen(true)} className="p-2 sm:p-2.5 bg-white border border-gray-100 rounded-full text-pink-500 shadow-sm transition-all active:scale-95"><HelpCircle size={18} className="sm:size-20" /></button>
                </div>
            </div>

            <div className="space-y-2.5 sm:space-y-4">
                <div className="pb-0.5">
                    <button onClick={() => setShowOnboarding(true)} className="w-full flex items-center justify-center gap-3 p-4 sm:p-8 border-2 border-dashed border-pink-200 rounded-[24px] sm:rounded-[40px] text-pink-500 font-black text-[9px] sm:text-sm uppercase transition-all hover:bg-pink-50 active:scale-95">
                        <Plus size={16} className="sm:size-24" /> Novo Integrante
                    </button>
                </div>

                {profiles.map(p => (
                    <div key={p.id} className={`p-2 sm:p-4 flex items-center justify-between transition-all bg-white/85 border-2 rounded-[20px] sm:rounded-[40px] shadow-sm hover:shadow-md ${p.id === activeProfileId ? 'border-pink-300 ring-4 ring-pink-500/5' : 'border-pink-100/50'}`}>
                        <button className="flex-1 flex items-center gap-2 sm:gap-4 text-left min-w-0" onClick={() => { setActiveProfileId(p.id); setView('calendar'); }}>
                            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-pink-50 flex items-center justify-center font-bold text-pink-500 text-sm sm:text-xl border border-pink-200/30 uppercase shrink-0">
                                {p.name.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="font-black text-gray-800 text-sm sm:text-lg leading-tight uppercase truncate">{p.name}</div>
                                <span className="text-[7px] sm:text-[10px] text-pink-500 font-black uppercase tracking-wider truncate block opacity-70">{p.role}</span>
                            </div>
                        </button>
                        <div className="flex items-center gap-0">
                            <button onClick={() => { setActiveProfileId(p.id); setView('profile'); }} className="p-2 sm:p-3 text-gray-400 hover:text-pink-500 transition-colors">
                                <Settings size={16} sm:size={22} />
                            </button>
                            <button onClick={() => removeProfile(p.id)} className="p-2 sm:p-3 text-red-100 hover:text-red-500 transition-colors">
                                <Trash2 size={16} sm:size={22} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};
