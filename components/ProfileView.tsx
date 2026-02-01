
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle, Briefcase, Calendar, Clock, AlertCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import { UserConfig, ShiftType, WorkTurn } from '../types';
import { ThemeConfig } from '../constants';

interface ProfileViewProps {
    activeProfile: UserConfig;
    theme: ThemeConfig;
    setView: (view: any) => void;
    setIsHelpOpen: (isOpen: boolean) => void;
    handleUpdateActiveProfile: (newConfig: UserConfig) => void;
    toggleOffDay: (day: number) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
    activeProfile,
    theme,
    setView,
    setIsHelpOpen,
    handleUpdateActiveProfile,
    toggleOffDay
}) => {
    return (
        <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 sm:space-y-6 pb-32">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                    <button onClick={() => setView('users')} className="p-2 hover:bg-black/5 rounded-full transition-colors"><ArrowLeft size={22} className="sm:size-24" /></button>
                    <h2 className="text-xl sm:text-2xl font-bold">Perfil</h2>
                </div>
                <button onClick={() => setIsHelpOpen(true)} className="p-2 bg-white/50 border border-gray-100 rounded-full text-pink-500 shadow-sm transition-all active:scale-90"><HelpCircle size={18} className="sm:size-20" /></button>
            </div>

            <div className={`p-4 sm:p-6 space-y-4 sm:space-y-6 ${theme.card}`}>
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1"><UserCircle size={12} className="opacity-40" /><label className="text-[9px] sm:text-[10px] font-bold opacity-40 uppercase tracking-widest">Nome</label></div>
                    <input className={`w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 ${theme.bg.includes('white') ? 'bg-gray-50/85' : 'bg-gray-800/85'} ${theme.text} font-bold text-sm sm:text-base`} value={activeProfile.name} onChange={e => handleUpdateActiveProfile({ ...activeProfile, name: e.target.value })} />
                </div>

                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1"><Briefcase size={12} className="opacity-40" /><label className="text-[9px] sm:text-[10px] font-bold opacity-40 uppercase tracking-widest">Função</label></div>
                    <input className={`w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 ${theme.bg.includes('white') ? 'bg-gray-50/85' : 'bg-gray-800/85'} ${theme.text} font-bold text-sm sm:text-base`} value={activeProfile.role} onChange={e => handleUpdateActiveProfile({ ...activeProfile, role: e.target.value })} />
                </div>

                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1"><Calendar size={12} className="opacity-40" /><label className="text-[9px] sm:text-[10px] font-bold opacity-40 uppercase tracking-widest">Início da Escala</label></div>
                    <input type="date" className={`w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 ${theme.bg.includes('white') ? 'bg-gray-50/85' : 'bg-gray-800/85'} ${theme.text} font-bold text-sm sm:text-base outline-none focus:border-pink-500 transition-all [color-scheme:light]`} style={{ colorScheme: 'light' }} value={activeProfile.startDate} onChange={e => handleUpdateActiveProfile({ ...activeProfile, startDate: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1"><Calendar size={12} className="opacity-40" /><label className="text-[9px] sm:text-[10px] font-bold opacity-40 uppercase tracking-widest">Escala</label></div>
                        <select className={`w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 ${theme.bg.includes('white') ? 'bg-gray-50/85' : 'bg-gray-800/85'} ${theme.text} font-bold text-sm sm:text-base appearance-none`} value={activeProfile.shiftType} onChange={e => handleUpdateActiveProfile({ ...activeProfile, shiftType: e.target.value as ShiftType })}>
                            {Object.values(ShiftType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1"><Clock size={12} className="opacity-40" /><label className="text-[9px] sm:text-[10px] font-bold opacity-40 uppercase tracking-widest">Turno</label></div>
                        <select className={`w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 ${theme.bg.includes('white') ? 'bg-gray-50/85' : 'bg-gray-800/85'} ${theme.text} font-bold text-sm sm:text-base appearance-none`} value={activeProfile.turn} onChange={e => handleUpdateActiveProfile({ ...activeProfile, turn: e.target.value as WorkTurn })}>
                            {Object.values(WorkTurn).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>

                <AnimatePresence>
                    {activeProfile.shiftType === ShiftType.ROTATING && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 pt-2 border-t border-gray-100 overflow-hidden">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] sm:text-[10px] font-bold opacity-40 uppercase tracking-widest">Dias Trab.</label>
                                    <input type="number" className={`w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 ${theme.bg.includes('white') ? 'bg-gray-50/85' : 'bg-gray-800/85'} ${theme.text} font-bold text-sm sm:text-base`} value={activeProfile.rotatingWorkDays || 5} onChange={e => handleUpdateActiveProfile({ ...activeProfile, rotatingWorkDays: Math.max(1, parseInt(e.target.value)) })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] sm:text-[10px] font-bold opacity-40 uppercase tracking-widest">Dias Folga</label>
                                    <input type="number" className={`w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 ${theme.bg.includes('white') ? 'bg-gray-50/85' : 'bg-gray-800/85'} ${theme.text} font-bold text-sm sm:text-base`} value={activeProfile.rotatingOffDays || 1} onChange={e => handleUpdateActiveProfile({ ...activeProfile, rotatingOffDays: Math.max(1, parseInt(e.target.value)) })} />
                                </div>
                            </div>
                            {(activeProfile.rotatingWorkDays || 0) > 6 && (
                                <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl text-red-600 border border-red-100">
                                    <AlertCircle size={14} className="mt-1 flex-shrink-0" />
                                    <p className="text-[9px] font-bold leading-tight">Atenção: A lei exige folga após no máximo 6 dias seguidos.</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeProfile.shiftType === ShiftType.FLEXIBLE && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 pt-2 border-t border-gray-100 overflow-hidden text-center">
                            <label className="text-[9px] sm:text-[10px] font-bold opacity-40 uppercase tracking-widest block mb-2">Selecione suas folgas fixas</label>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                                {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'].map((d, i) => (
                                    <button
                                        key={i}
                                        onClick={() => toggleOffDay(i)}
                                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl font-black text-[8px] sm:text-[9px] border-2 transition-all ${activeProfile.offDays?.includes(i) ? 'bg-red-500 border-red-600 text-white shadow-lg' : 'border-gray-100 text-gray-400'}`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button onClick={() => setView('users')} className="w-full py-3.5 sm:py-4 mt-2 sm:mt-4 bg-gray-900 text-white rounded-full font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-transform">Salvar Alterações</button>
            </div>
        </motion.div>
    );
};
