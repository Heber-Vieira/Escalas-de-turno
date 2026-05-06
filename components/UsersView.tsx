
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Layers, HelpCircle, Plus, Settings, Trash2, LogOut, Search, X, Sun, CloudSun, Moon, ChevronDown, Check, Briefcase, UserPlus, Key } from 'lucide-react';
import { UserConfig, WorkTurn, SystemUser } from '../types';
import { formatName, normalizeString } from '../utils/shiftCalculator';
import { InviteMemberModal } from './InviteMemberModal';

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
    systemUser?: SystemUser | null;
    onInviteMember?: (profileId: string, email: string, password: string, memberName: string) => Promise<{ success: boolean; error?: string }>;
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
    onLogout,
    systemUser,
    onInviteMember,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isRolesMenuOpen, setIsRolesMenuOpen] = useState(false);
    const rolesMenuRef = useRef<HTMLDivElement>(null);
    const [inviteTarget, setInviteTarget] = useState<UserConfig | null>(null);
    const [viewCredentialsTarget, setViewCredentialsTarget] = useState<UserConfig | null>(null);

    const allRoles = useMemo(() => {
        const roles = new Set<string>();
        profiles.forEach(p => {
            if (p.role) roles.add(p.role.trim());
            p.careerHistory?.forEach(h => {
                if (h.role) roles.add(h.role.trim());
            });
        });
        return Array.from(roles).sort();
    }, [profiles]);

    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [selectedTurns, setSelectedTurns] = useState<WorkTurn[]>(Object.values(WorkTurn));

    // Inicializar selectedRoles quando os perfis carregarem
    useEffect(() => {
        if (selectedRoles.length === 0 && allRoles.length > 0) {
            setSelectedRoles(allRoles);
        }
    }, [allRoles]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (rolesMenuRef.current && !rolesMenuRef.current.contains(event.target as Node)) {
                setIsRolesMenuOpen(false);
            }
        };
        if (isRolesMenuOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isRolesMenuOpen]);

    const toggleFilter = <T,>(list: T[], item: T, setter: (val: T[]) => void) => {
        setter(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
    };

    const getTurnStyles = (turn: WorkTurn) => {
        switch (turn) {
            case WorkTurn.MORNING: return { icon: <Sun size={12} />, color: 'text-orange-500', bg: 'bg-orange-50' };
            case WorkTurn.AFTERNOON: return { icon: <CloudSun size={12} />, color: 'text-pink-500', bg: 'bg-pink-50' };
            case WorkTurn.NIGHT: return { icon: <Moon size={12} />, color: 'text-indigo-500', bg: 'bg-indigo-50' };
        }
    };

    // Convidado: usuário com created_by preenchido (foi convidado por outro usuário, não pelo admin)
    // Convidados têm acesso somente visualização — não podem editar, deletar ou adicionar
    const isGuest = !!systemUser?.created_by && systemUser?.role !== 'admin';

    // Usuário com visibilidade 'created', não admin e NÃO convidado pode convidar membros
    const canInvite = !isGuest && systemUser?.visibility === 'created' && systemUser?.role !== 'admin' && !!onInviteMember;

    const filteredProfiles = profiles.filter(p => {
        const normalizedSearch = normalizeString(searchQuery);
        const matchesSearch = normalizeString(p.name).includes(normalizedSearch) || 
                             normalizeString(p.role).includes(normalizedSearch);
        const matchesRole = selectedRoles.includes(p.role);
        const matchesTurn = selectedTurns.includes(p.turn);
        return matchesSearch && matchesRole && matchesTurn;
    });

    return (
        <>
        <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2 sm:space-y-3">

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden">
                    <button onClick={() => setView('calendar')} className="p-1.5 sm:p-2 bg-white shadow-sm border border-gray-100 rounded-full text-gray-500 transition-all active:scale-90 flex-shrink-0">
                        <ArrowLeft className="w-[14px] h-[14px] sm:w-[16px] sm:h-[16px]" />
                    </button>
                    <h2 className="text-sm sm:text-lg font-black text-gray-800 uppercase tracking-tight truncate">Equipe</h2>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                    {!isGuest && (
                        <button onClick={() => setIsBatchModalOpen(true)} className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 bg-gray-900 text-pink-500 rounded-full shadow-lg transition-all active:scale-95" title="Importação em Lote">
                            <Layers className="w-[12px] h-[12px] sm:w-[14px] sm:h-[14px]" />
                            <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-white">Lote</span>
                        </button>
                    )}
                    {isGuest && (
                        <div className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 bg-blue-50 border border-blue-100 rounded-full" title="Acesso somente visualização">
                            <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-blue-400">Visualização</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md border border-pink-50 rounded-[24px] p-1 shadow-sm relative z-50">
                {/* Busca Integrada */}
                <div className="relative flex-1 group min-w-0">
                    <div className={`absolute inset-y-0 left-2.5 sm:left-3.5 flex items-center pointer-events-none transition-colors ${searchQuery ? 'text-pink-500' : 'text-gray-400'}`}>
                        <Search size={12} className="sm:w-[14px] sm:h-[14px]" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50/50 border border-transparent rounded-full py-1.5 sm:py-2 pl-8 sm:pl-10 pr-6 sm:pr-8 text-[9px] sm:text-[11px] font-bold text-gray-800 placeholder:text-gray-300 outline-none focus:bg-white focus:border-pink-200 transition-all"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-3 flex items-center text-gray-300 hover:text-pink-500 transition-colors"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>

                <div className="w-px h-4 bg-gray-100 shrink-0" />

                <div className="flex items-center gap-1.5 shrink-0">
                    {/* Filtro de Turnos */}
                    <div className="flex gap-0.5 shrink-0 bg-gray-50/50 p-0.5 rounded-full border border-gray-100">
                        {Object.values(WorkTurn).map(turn => {
                            const style = getTurnStyles(turn);
                            const isActive = selectedTurns.includes(turn);
                            return (
                                <button
                                    key={turn}
                                    onClick={() => toggleFilter(selectedTurns, turn, setSelectedTurns)}
                                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-white shadow-sm ring-1 ring-black/5' : 'opacity-40 hover:bg-gray-100'}`}
                                    title={formatName(turn)}
                                >
                                    <span className={isActive ? style.color : 'text-gray-400'}>
                                        {React.cloneElement(style.icon as React.ReactElement<any>, { size: 10 })}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="w-px h-5 bg-gray-100 shrink-0" />

                    {/* Filtro de Cargos Dropdown */}
                    <div ref={rolesMenuRef} className="relative flex-initial flex items-center bg-gray-50/50 rounded-full pr-1 border border-gray-100 min-w-[75px] sm:min-w-[130px]">
                        <div className="px-2 py-1.5 flex items-center gap-1 border-r border-gray-200">
                            <Briefcase size={10} className="text-pink-500" />
                        </div>
                        <button
                            onClick={() => setIsRolesMenuOpen(!isRolesMenuOpen)}
                            className="flex-1 flex items-center justify-between gap-1 pl-2 pr-2 py-1.5 text-[8px] sm:text-[9px] font-black text-gray-600 uppercase tracking-widest hover:text-pink-500 transition-colors truncate"
                        >
                            <span className="truncate">{selectedRoles.length === allRoles.length ? 'Cargos' : `${selectedRoles.length}C`}</span>
                            <ChevronDown size={8} className={`transition-transform flex-shrink-0 ${isRolesMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <AnimatePresence>
                            {isRolesMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                                    className="absolute top-full right-0 mt-2 p-3 w-[220px] sm:w-[240px] bg-white border border-gray-100 rounded-3xl shadow-2xl z-[100]"
                                >
                                    <div className="flex justify-between items-center mb-3 px-1 border-b border-gray-50 pb-2">
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Filtrar Cargos</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => setSelectedRoles(allRoles)} className="text-[8px] font-bold text-pink-500 hover:bg-pink-50 px-2 py-1 rounded-md transition-colors">Todos</button>
                                            <button onClick={() => setSelectedRoles([])} className="text-[8px] font-bold text-gray-400 hover:bg-gray-50 px-2 py-1 rounded-md transition-colors">Nenhum</button>
                                        </div>
                                    </div>
                                    <div className="max-h-[250px] overflow-y-auto no-scrollbar space-y-1 pr-1">
                                        {allRoles.map(role => {
                                            const isActive = selectedRoles.includes(role);
                                            return (
                                                <button
                                                    key={role}
                                                    onClick={() => toggleFilter(selectedRoles, role, setSelectedRoles)}
                                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all border ${isActive ? 'bg-pink-50 border-pink-100 text-pink-700' : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100'}`}
                                                >
                                                    <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${isActive ? 'bg-pink-500 border-pink-500 text-white' : 'bg-white border-gray-300'}`}>
                                                        {isActive && <Check size={10} strokeWidth={4} />}
                                                    </div>
                                                    <span className="text-[10px] font-bold tracking-wide text-left flex-1 truncate">{formatName(role)}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
                {!isGuest && (
                    <div className="pb-0">
                        <button onClick={() => setShowOnboarding(true)} className="w-full flex items-center justify-center gap-2 p-2.5 sm:p-4 border-2 border-dashed border-pink-200 rounded-[12px] sm:rounded-[20px] text-pink-500 font-black text-[8px] sm:text-xs uppercase transition-all hover:bg-pink-50 active:scale-95">
                            <Plus className="w-[12px] h-[12px] sm:w-[16px] sm:h-[16px]" /> Novo Integrante
                        </button>
                    </div>
                )}

                {filteredProfiles.length > 0 ? filteredProfiles.map(p => (
                    <div key={p.id} className={`p-1.5 sm:p-2.5 flex items-center justify-between transition-all bg-white/85 border rounded-[12px] sm:rounded-[20px] shadow-sm hover:shadow-md ${p.id === activeProfileId ? 'border-pink-300 ring-2 ring-pink-500/5' : 'border-pink-100/50'}`}>
                        <button className="flex-1 flex items-center gap-1.5 sm:gap-2.5 text-left min-w-0" onClick={() => { setActiveProfileId(p.id); setView('calendar'); }}>
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-pink-50 flex items-center justify-center font-bold text-pink-500 text-[10px] sm:text-sm border border-pink-200/30 shrink-0 overflow-hidden">
                                {p.avatarUrl ? (
                                    <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                    p.name.charAt(0)
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="font-bold text-gray-800 text-[11px] sm:text-sm leading-tight truncate">
                                    {formatName(p.name.split(' ')[0])}
                                </div>
                                <span className="text-[6px] sm:text-[8px] text-pink-500 font-bold tracking-wider truncate block opacity-70">
                                    {formatName(p.role)}
                                </span>
                            </div>
                        </button>
                        <div className="flex items-center gap-0">
                            {canInvite && !p.email && (
                                <button
                                    onClick={() => setInviteTarget(p)}
                                    title="Convidar para o sistema"
                                    className="p-1 sm:p-1.5 text-gray-300 hover:text-purple-500 transition-colors"
                                >
                                    <UserPlus className="w-[13px] h-[13px] sm:w-[15px] sm:h-[15px]" />
                                </button>
                            )}
                            {canInvite && p.email && (
                                <button
                                    onClick={() => setViewCredentialsTarget(p)}
                                    title="Ver dados de acesso"
                                    className="p-1 sm:p-1.5 text-emerald-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-full transition-colors flex items-center justify-center"
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest">✓</span>
                                </button>
                            )}
                            {!isGuest && (
                                <button onClick={() => { setActiveProfileId(p.id); setView('profile'); }} className="p-1 sm:p-1.5 text-gray-400 hover:text-pink-500 transition-colors">
                                    <Settings className="w-[13px] h-[13px] sm:w-[16px] sm:h-[16px]" />
                                </button>
                            )}
                            {!isGuest && (
                                <button onClick={() => removeProfile(p.id)} className="p-1 sm:p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                                    <Trash2 className="w-[13px] h-[13px] sm:w-[16px] sm:h-[16px]" />
                                </button>
                            )}
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

        {/* Modal de Convite */}
        {inviteTarget && onInviteMember && (
            <InviteMemberModal
                profile={inviteTarget}
                isOpen={!!inviteTarget}
                onClose={() => setInviteTarget(null)}
                onInvite={onInviteMember}
            />
        )}

        {/* Modal de Ver Credenciais */}
        <AnimatePresence>
            {viewCredentialsTarget && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="w-full max-w-sm bg-white rounded-[28px] overflow-hidden shadow-2xl"
                    >
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                    <Key size={16} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-gray-900">Dados de Acesso</h3>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                        {formatName(viewCredentialsTarget.name.split(' ')[0])}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setViewCredentialsTarget(null)} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">E-mail</label>
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-bold text-gray-800 break-all select-all">
                                    {viewCredentialsTarget.email}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Senha de Acesso</label>
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-bold text-gray-800 break-all select-all">
                                    {viewCredentialsTarget.initialPassword || <span className="text-gray-400 font-medium italic">Não registrada neste dispositivo</span>}
                                </div>
                            </div>
                            
                            <div className="pt-2">
                                <button
                                    onClick={() => setViewCredentialsTarget(null)}
                                    className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-md"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    </>);
};
