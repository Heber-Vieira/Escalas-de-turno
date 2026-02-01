
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, ArrowLeft, HelpCircle, Sparkles, Trash2, LogOut } from 'lucide-react';
import { format, parseISO, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HistoryViewProps {
    allEvents: any[];
    historyStats: { total: number; thisMonth: number };
    setView: (view: 'calendar' | 'team_schedule' | 'history' | 'users' | 'profile') => void;
    setIsHelpOpen: (isOpen: boolean) => void;
    handleRemoveEvent: (event: any) => void;
    onLogout: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
    allEvents,
    historyStats,
    setView,
    setIsHelpOpen,
    handleRemoveEvent,
    onLogout
}) => {
    return (
        <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('calendar')} className="p-2 hover:bg-black/5 rounded-full transition-colors active:scale-90">
                        <ArrowLeft size={24} className="text-gray-400" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-gray-900">Histórico</h2>
                        <p className="text-[10px] font-bold text-pink-500 uppercase tracking-widest leading-tight">Log de Registros</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={onLogout} className="p-2 bg-red-50 border border-red-100 rounded-full text-red-500 shadow-sm transition-all active:scale-90">
                        <LogOut size={20} />
                    </button>
                    <button onClick={() => setIsHelpOpen(true)} className="p-2 bg-white/50 border border-gray-100 rounded-full text-pink-500 shadow-sm transition-all active:scale-90">
                        <HelpCircle size={20} />
                    </button>
                    <div className="bg-gray-100/50 p-2 rounded-2xl">
                        <History className="text-pink-400" size={20} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-gray-100 p-4 rounded-[28px] shadow-sm">
                    <div className="text-2xl font-black text-gray-900 leading-none mb-1">{historyStats.thisMonth}</div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-pink-500/50">Neste Mês</div>
                </div>
                <div className="bg-gray-900 p-4 rounded-[28px] shadow-lg">
                    <div className="text-2xl font-black text-white leading-none mb-1">{historyStats.total}</div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-white/40">Total Geral</div>
                </div>
            </div>

            <div className="relative pt-2">
                {allEvents.length === 0 ? (
                    <div className="py-16 flex flex-col items-center text-center px-8">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Sparkles className="text-gray-200" size={32} />
                        </div>
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Tudo em dia!</h3>
                        <p className="text-[10px] text-gray-300 font-medium mt-2 leading-relaxed">Você não possui registros de ausência, férias ou extras.</p>
                    </div>
                ) : (
                    <div className="space-y-4 relative">
                        <div className="absolute left-6 top-0 bottom-0 w-px bg-pink-100 z-0" />
                        <AnimatePresence mode="popLayout">
                            {allEvents.map((event, idx) => (
                                <motion.div
                                    key={event.id}
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, x: 20 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="relative z-10 flex gap-4 items-start"
                                >
                                    <div className={`w-12 h-12 flex-shrink-0 rounded-2xl flex flex-col items-center justify-center shadow-sm border ${isSameMonth(parseISO(event.date), new Date()) ? `${event.color} border-white/20 text-white` : 'bg-white border-gray-100 text-gray-400'}`}>
                                        <span className="text-[14px] font-black leading-none">{format(parseISO(event.date), 'dd')}</span>
                                        <span className="text-[7px] font-black uppercase tracking-tighter opacity-70">{format(parseISO(event.date), 'MMM', { locale: ptBR })}</span>
                                    </div>
                                    <div className="flex-1 bg-white border border-gray-100 p-3.5 rounded-[24px] shadow-sm flex items-center justify-between group">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <span className={`text-[9px] font-black uppercase tracking-widest leading-none ${event.type === 'absence' ? 'text-pink-500' : event.type === 'vacation_period' ? 'text-sky-500' : 'text-purple-600'}`}>
                                                    {event.title}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-gray-800 text-[11px] truncate">
                                                {event.type === 'absence' ? event.title : format(parseISO(event.date), 'EEEE', { locale: ptBR })}
                                            </h4>
                                            <p className="text-[9px] text-gray-400 mt-0.5 line-clamp-1 italic">"{event.description}"</p>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveEvent(event)}
                                            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-200 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
