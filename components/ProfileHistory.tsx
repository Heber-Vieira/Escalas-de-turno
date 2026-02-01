import React, { useState } from 'react';
import { UserConfig, CareerChange, ShiftType, WorkTurn, ThemeStyle } from '../types';
import { Settings2, Plus, Trash2, Calendar, Briefcase, Clock, CalendarDays, History, Save, X, Pencil } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileHistoryProps {
    profile: UserConfig;
    onUpdate: (newConfig: UserConfig) => void;
    theme?: { bg: string, text: string, primary: string, secondary?: string, accent?: string };
    existingRoles?: string[];
    onRequestConfirmation: (title: string, message: string, onConfirm: () => void) => void;
}

export const ProfileHistory: React.FC<ProfileHistoryProps> = ({ profile, onUpdate, theme, existingRoles = [], onRequestConfirmation }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newChange, setNewChange] = useState<Partial<CareerChange>>({
        date: format(new Date(), 'yyyy-MM-dd'),
        role: profile.role,
        shiftType: profile.shiftType,
        turn: profile.turn,
        rotatingWorkDays: profile.rotatingWorkDays,
        rotatingOffDays: profile.rotatingOffDays,
        offDays: profile.offDays
    });

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onRequestConfirmation(
            "Remover Histórico",
            "Tem certeza que deseja remover este registro histórico?",
            () => {
                const updatedHistory = (profile.careerHistory || []).filter(h => h.id !== id);
                onUpdate({ ...profile, careerHistory: updatedHistory });
            }
        );
    };

    const handleEdit = (item: CareerChange) => {
        setNewChange({
            date: item.date,
            role: item.role,
            shiftType: item.shiftType,
            turn: item.turn,
            rotatingWorkDays: item.rotatingWorkDays,
            rotatingOffDays: item.rotatingOffDays,
            offDays: item.offDays
        });
        setEditingId(item.id);
        setIsModalOpen(true);
    };

    const handleOpenAdd = () => {
        setNewChange({
            date: format(new Date(), 'yyyy-MM-dd'),
            role: profile.role,
            shiftType: profile.shiftType,
            turn: profile.turn,
            rotatingWorkDays: profile.rotatingWorkDays,
            rotatingOffDays: profile.rotatingOffDays,
            offDays: profile.offDays
        });
        setEditingId(null);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!newChange.date) return alert('Selecione uma data');

        let updatedHistory;

        if (editingId) {
            updatedHistory = (profile.careerHistory || []).map(h =>
                h.id === editingId ? { ...h, ...newChange } as CareerChange : h
            ).sort((a, b) => b.date.localeCompare(a.date));
        } else {
            const change: CareerChange = {
                id: Math.random().toString(36).substr(2, 9),
                date: newChange.date!,
                role: newChange.role,
                shiftType: newChange.shiftType,
                turn: newChange.turn,
                rotatingWorkDays: newChange.rotatingWorkDays,
                rotatingOffDays: newChange.rotatingOffDays,
                offDays: newChange.offDays
            };
            updatedHistory = [...(profile.careerHistory || []), change].sort((a, b) => b.date.localeCompare(a.date));
        }

        onUpdate({ ...profile, careerHistory: updatedHistory });
        setIsModalOpen(false);
        setEditingId(null);
    };

    const sortedHistory = [...(profile.careerHistory || [])].sort((a, b) => b.date.localeCompare(a.date));

    return (
        <div className="mt-6 border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <History size={18} className="text-gray-400" />
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">MOVIMENTAÇÕES</h3>
                </div>
                <button
                    type="button"
                    onClick={handleOpenAdd}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wide hover:bg-indigo-100 transition-colors"
                >
                    <Plus size={14} />
                    Adicionar
                </button>
            </div>

            <div className="space-y-3 relative">
                {sortedHistory.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <History size={24} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-xs text-gray-400 font-medium">Nenhum registro histórico.</p>
                    </div>
                ) : (
                    <>
                        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-100" />
                        {sortedHistory.map((item) => (
                            <div key={item.id} className="relative pl-10 group">
                                <div className="absolute left-[15px] top-3 w-2.5 h-2.5 rounded-full bg-white border-2 border-indigo-400 z-10 group-hover:scale-110 transition-transform shadow-sm" />
                                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm group-hover:shadow-md transition-shadow relative overflow-hidden">
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                                            className="text-gray-300 hover:text-indigo-500 transition-colors bg-white/50 backdrop-blur-sm p-1 rounded-full"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(item.id, e)}
                                            className="text-gray-300 hover:text-red-500 transition-colors bg-white/50 backdrop-blur-sm p-1 rounded-full"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest border border-gray-200">
                                            {format(parseISO(item.date), 'dd/MM/yyyy')}
                                        </div>
                                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Início Vigência</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">Cargo</div>
                                            <div className="text-xs font-bold text-gray-800">{item.role || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">Regime</div>
                                            <div className="text-xs font-bold text-gray-800">{item.shiftType}</div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">Turno</div>
                                            <div className="text-xs font-bold text-gray-800">{item.turn}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[150] flex items-end justify-center px-4 pb-12 sm:items-center sm:pb-0">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="bg-white w-full max-w-md rounded-[32px] p-6 relative z-10 shadow-2xl max-h-[85vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-black text-gray-900">{editingId ? 'Editar Alteração' : 'Programar Alteração'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"><X size={20} /></button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Data de Início</label>
                                    <input
                                        type="date"
                                        value={newChange.date}
                                        onChange={e => setNewChange({ ...newChange, date: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Novo Cargo</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={newChange.role}
                                            onChange={e => {
                                                setNewChange({ ...newChange, role: e.target.value });
                                                setShowSuggestions(true);
                                            }}
                                            onFocus={() => setShowSuggestions(true)}
                                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                            className="w-full px-4 py-3 bg-gray-50 border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="Ex: Supervisor"
                                        />
                                        <AnimatePresence>
                                            {showSuggestions && existingRoles.filter(r => r.toLowerCase().includes((newChange.role || '').toLowerCase()) && r !== newChange.role).length > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 5 }}
                                                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-40 overflow-y-auto"
                                                >
                                                    {existingRoles.filter(r => r.toLowerCase().includes((newChange.role || '').toLowerCase()) && r !== newChange.role).map((role) => (
                                                        <button
                                                            key={role}
                                                            onMouseDown={() => {
                                                                setNewChange({ ...newChange, role });
                                                                setShowSuggestions(false);
                                                            }}
                                                            className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                                        >
                                                            {role}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Novo Turno</label>
                                        <select
                                            value={newChange.turn}
                                            onChange={e => setNewChange({ ...newChange, turn: e.target.value as WorkTurn })}
                                            className="w-full px-4 py-3 bg-gray-50 border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        >
                                            {Object.values(WorkTurn).map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Nova Escala</label>
                                        <select
                                            value={newChange.shiftType}
                                            onChange={e => setNewChange({ ...newChange, shiftType: e.target.value as ShiftType })}
                                            className="w-full px-4 py-3 bg-gray-50 border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                        >
                                            {Object.values(ShiftType).map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {newChange.shiftType === ShiftType.ROTATING && (
                                    <div className="grid grid-cols-2 gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                                        <div>
                                            <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Dias Trabalho</label>
                                            <input
                                                type="number"
                                                value={newChange.rotatingWorkDays || 1}
                                                onChange={e => setNewChange({ ...newChange, rotatingWorkDays: parseInt(e.target.value) })}
                                                className="w-full px-3 py-2 bg-white border-indigo-100 rounded-lg text-sm font-bold text-indigo-900 text-center"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Dias Folga</label>
                                            <input
                                                type="number"
                                                value={newChange.rotatingOffDays || 1}
                                                onChange={e => setNewChange({ ...newChange, rotatingOffDays: parseInt(e.target.value) })}
                                                className="w-full px-3 py-2 bg-white border-indigo-100 rounded-lg text-sm font-bold text-indigo-900 text-center"
                                            />
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleSave}
                                    className="w-full py-4 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    <Save size={18} />
                                    {editingId ? 'Salvar Edição' : 'Confirmar Alteração'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
