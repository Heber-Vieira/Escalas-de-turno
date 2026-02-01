
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Layers, HelpCircle, Plus, Settings, Trash2 } from 'lucide-react';
import { UserConfig } from '../types';

interface UsersViewProps {
    profiles: UserConfig[];
    activeProfileId: string | null;
    setActiveProfileId: (id: string) => void;
    setView: (view: any) => void;
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
        <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('calendar')} className="p-2 hover:bg-black/5 rounded-full transition-colors"><ArrowLeft size={24} /></button>
                    <h2 className="text-2xl font-bold">Equipe Registrada</h2>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsBatchModalOpen(true)} className="p-2.5 bg-gray-900 text-pink-500 rounded-full shadow-lg transition-all active:scale-90" title="Importação em Lote"><Layers size={22} /></button>
                    <button onClick={() => setIsHelpOpen(true)} className="p-2.5 bg-white border border-gray-100 rounded-full text-pink-500 shadow-sm transition-all active:scale-90"><HelpCircle size={22} /></button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="pb-2">
                    <button onClick={() => setShowOnboarding(true)} className="w-full flex items-center justify-center gap-3 p-8 border-2 border-dashed border-pink-200 rounded-[40px] text-pink-500 font-black text-sm uppercase transition-all hover:bg-pink-50 active:scale-95">
                        <Plus size={24} /> Adicionar Integrante Manual
                    </button>
                </div>

                {profiles.map(p => (
                    <div key={p.id} className={`p-4 flex items-center justify-between transition-all bg-white/85 border-2 rounded-[40px] shadow-sm hover:shadow-md ${p.id === activeProfileId ? 'border-pink-300 ring-4 ring-pink-500/5' : 'border-pink-100/50'}`}>
                        <button className="flex-1 flex items-center gap-4 text-left" onClick={() => { setActiveProfileId(p.id); setView('calendar'); }}>
                            <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center font-bold text-pink-500 text-xl border border-pink-200/30 uppercase">
                                {p.name.charAt(0)}
                            </div>
                            <div>
                                <div className="font-black text-gray-800 text-lg leading-tight uppercase">{p.name}</div>
                                <span className="text-[10px] text-pink-500 font-black uppercase tracking-wider">{p.role}</span>
                            </div>
                        </button>
                        <div className="flex items-center gap-2">
                            <button onClick={() => { setActiveProfileId(p.id); setView('profile'); }} className="p-3 text-gray-400 hover:text-pink-500 transition-colors">
                                <Settings size={22} />
                            </button>
                            <button onClick={() => removeProfile(p.id)} className="p-3 text-red-100 hover:text-red-500 transition-colors">
                                <Trash2 size={22} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};
