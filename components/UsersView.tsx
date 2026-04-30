
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Layers, HelpCircle, Plus, Settings, Trash2, LogOut, Search, X } from 'lucide-react';
import { UserConfig } from '../types';
import { formatName } from '../utils/shiftCalculator';

interface UsersViewProps {
    profiles: UserConfig[];
    activeProfileId: string | null;
    setActiveProfileId: (id: string) => void;
    setView: (view: 'calendar' | 'team_schedule' | 'history' | 'users' | 'profile') => void;
    setIsBatchModalOpen: (isOpen: boolean) => void;
    setIsHelpOpen: (isOpen: boolean) => void;
    setShowOnboarding: (show: boolean) => void;
    removeProfile: (id: string) => void;
    onLogout: () => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
    profiles,
    activeProfileId,
    setActiveProfileId,
    setView,
    setIsBatchModalOpen,
    setIsHelpOpen,
    setShowOnboarding,
    removeProfile,
    onLogout
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProfiles = profiles.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2 sm:space-y-3">

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden">
                    <button onClick={() => setView('calendar')} className="p-1.5 sm:p-2 bg-white shadow-sm border border-gray-100 rounded-full text-gray-500 transition-all active:scale-90 flex-shrink-0">
                        <ArrowLeft className="w-[14px] h-[14px] sm:w-[16px] sm:h-[16px]" />
                    </button>
                    <h2 className="text-sm sm:text-lg font-black text-gray-800 uppercase tracking-tight truncate">Equipe</h2>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <button onClick={() => setIsBatchModalOpen(true)} className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 bg-gray-900 text-pink-500 rounded-full shadow-lg transition-all active:scale-95" title="Importação em Lote">
                        <Layers className="w-[12px] h-[12px] sm:w-[14px] sm:h-[14px]" />
                        <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-white">Lote</span>
                    </button>
                </div>
            </div>

            <div className="relative group">
                <div className={`absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors ${searchQuery ? 'text-pink-500' : 'text-gray-400'}`}>
                    <Search size={14} />
                </div>
                <input
                    type="text"
                    placeholder="Buscar por nome ou função..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-pink-100 rounded-[20px] py-3 pl-11 pr-10 text-[11px] font-bold text-gray-800 placeholder:text-gray-300 outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-500/5 transition-all shadow-sm"
                />
                {searchQuery && (
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-4 flex items-center text-gray-300 hover:text-pink-500 transition-colors"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            <div className="space-y-1.5 sm:space-y-2">
                <div className="pb-0">
                    <button onClick={() => setShowOnboarding(true)} className="w-full flex items-center justify-center gap-2 p-2.5 sm:p-4 border-2 border-dashed border-pink-200 rounded-[12px] sm:rounded-[20px] text-pink-500 font-black text-[8px] sm:text-xs uppercase transition-all hover:bg-pink-50 active:scale-95">
                        <Plus className="w-[12px] h-[12px] sm:w-[16px] sm:h-[16px]" /> Novo Integrante
                    </button>
                </div>

                {filteredProfiles.length > 0 ? filteredProfiles.map(p => (
                    <div key={p.id} className={`p-1.5 sm:p-2.5 flex items-center justify-between transition-all bg-white/85 border rounded-[12px] sm:rounded-[20px] shadow-sm hover:shadow-md ${p.id === activeProfileId ? 'border-pink-300 ring-2 ring-pink-500/5' : 'border-pink-100/50'}`}>
                        <button className="flex-1 flex items-center gap-1.5 sm:gap-2.5 text-left min-w-0" onClick={() => { setActiveProfileId(p.id); setView('calendar'); }}>
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-pink-50 flex items-center justify-center font-bold text-pink-500 text-[10px] sm:text-sm border border-pink-200/30 uppercase shrink-0 overflow-hidden">
                                {p.avatarUrl ? (
                                    <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                    p.name.charAt(0)
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="font-bold text-gray-800 text-[11px] sm:text-sm leading-tight truncate">
                                    {formatName(p.name)}
                                </div>
                                <span className="text-[6px] sm:text-[8px] text-pink-500 font-bold tracking-wider truncate block opacity-70">
                                    {formatName(p.role)}
                                </span>
                            </div>
                        </button>
                        <div className="flex items-center gap-0">
                            <button onClick={() => { setActiveProfileId(p.id); setView('profile'); }} className="p-1 sm:p-1.5 text-gray-400 hover:text-pink-500 transition-colors">
                                <Settings className="w-[13px] h-[13px] sm:w-[16px] sm:h-[16px]" />
                            </button>
                            <button onClick={() => removeProfile(p.id)} className="p-1 sm:p-1.5 text-red-100 hover:text-red-500 transition-colors">
                                <Trash2 className="w-[13px] h-[13px] sm:w-[16px] sm:h-[16px]" />
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 opacity-30 grayscale">
                        <Search size={32} className="text-gray-400" />
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest">Nenhum integrante encontrado</p>
                            <p className="text-[8px] font-bold">Tente ajustar sua busca</p>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
