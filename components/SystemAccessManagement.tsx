import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldCheck, ShieldAlert, User, UserPlus, Mail, Key, Trash2, X, AlertTriangle, Eye, EyeOff, Users, Calendar, MapPin, Briefcase, Clock } from 'lucide-react';
import { SystemUser, UserConfig, ShiftType, WorkTurn, ThemeStyle } from '../types';
import { supabase } from '../services/supabase';
import { formatName } from '../utils/shiftCalculator';
import { format } from 'date-fns';

interface SystemAccessManagementProps {
  fetchAllSystemUsers: () => Promise<SystemUser[]>;
  updateSystemUserAccess: (userId: string, is_approved: boolean, role: 'admin' | 'user') => Promise<void>;
  deleteSystemUser: (userId: string) => Promise<void>;
  currentUserId?: string;
  updateSystemUserVisibility: (userId: string, visibility: 'all' | 'self' | 'created') => Promise<void>;
  updateSystemUserBlockedList: (userId: string, blockedUsers: string[]) => Promise<void>;
  addProfileForOtherUser: (targetUserId: string, config: UserConfig) => Promise<UserConfig | null>;
}

const SHIFT_LABELS: Record<ShiftType, string> = {
  [ShiftType.FIVE_TWO]: '5x2 – Seg a Sex',
  [ShiftType.SIX_ONE]: '6x1 – Seis dias/semana',
  [ShiftType.TWELVE_THIRTY_SIX]: '12x36 – Doze horas',
  [ShiftType.ROTATING]: 'Revezamento',
  [ShiftType.FLEXIBLE]: 'Flexível',
};

const TURN_LABELS: Record<WorkTurn, string> = {
  [WorkTurn.MORNING]: '☀️ Manhã',
  [WorkTurn.AFTERNOON]: '🌤 Tarde',
  [WorkTurn.NIGHT]: '🌙 Noite',
};

const inputClass = 'w-full bg-gray-50 border-2 border-gray-100 rounded-[18px] py-3 pl-11 pr-4 text-gray-800 text-sm outline-none focus:border-pink-400 focus:bg-white transition-all';
const selectClass = 'w-full bg-gray-50 border-2 border-gray-100 rounded-[18px] py-3 pl-11 pr-4 text-gray-800 text-sm outline-none focus:border-pink-400 focus:bg-white transition-all appearance-none';
const labelClass = 'text-[10px] font-black uppercase tracking-widest text-gray-500 ml-3 block mb-1';

export const SystemAccessManagement: React.FC<SystemAccessManagementProps> = ({
    fetchAllSystemUsers,
    updateSystemUserAccess,
    deleteSystemUser,
    currentUserId,
    updateSystemUserVisibility,
    updateSystemUserBlockedList,
    addProfileForOtherUser,
}) => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [addError, setAddError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<SystemUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  // Blocking state
  const [managingBlocksFor, setManagingBlocksFor] = useState<SystemUser | null>(null);
  const [blockedSelection, setBlockedSelection] = useState<string[]>([]);
  const [savingBlocks, setSavingBlocks] = useState(false);

  // Form fields
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newJobRole, setNewJobRole] = useState('');
  const [newShiftType, setNewShiftType] = useState<ShiftType>(ShiftType.FIVE_TWO);
  const [newTurn, setNewTurn] = useState<WorkTurn>(WorkTurn.MORNING);
  const [newStartDate, setNewStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newState, setNewState] = useState('');
  const [newCity, setNewCity] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    const data = await fetchAllSystemUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const resetForm = () => {
    setNewName(''); setNewEmail(''); setNewPassword(''); setNewJobRole('');
    setNewShiftType(ShiftType.FIVE_TWO); setNewTurn(WorkTurn.MORNING);
    setNewStartDate(format(new Date(), 'yyyy-MM-dd'));
    setNewState(''); setNewCity(''); setAddError(''); setShowPassword(false);
  };

  const handleToggleStatus = async (user: SystemUser) => {
    try {
      await updateSystemUserAccess(user.id, !user.is_approved, user.role);
      setUsers(users.map(u => u.id === user.id ? { ...u, is_approved: !u.is_approved } : u));
    } catch { alert('Erro ao atualizar status do usuário.'); }
  };

  const handleToggleRole = async (user: SystemUser) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await updateSystemUserAccess(user.id, user.is_approved, newRole, user.name);
      setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
    } catch { alert('Erro ao atualizar função do usuário.'); }
  };

  const handleUpdateName = async (user: SystemUser) => {
    if (!tempName.trim()) return setEditingNameId(null);
    try {
      await updateSystemUserAccess(user.id, user.is_approved, user.role, tempName.trim());
      setUsers(users.map(u => u.id === user.id ? { ...u, name: tempName.trim() } : u));
      setEditingNameId(null);
    } catch { alert('Erro ao atualizar nome.'); }
  };

  const handleDeleteUser = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteSystemUser(confirmDelete.id);
      setUsers(prev => prev.filter(u => u.id !== confirmDelete.id));
      setConfirmDelete(null);
    } catch (err: any) {
      alert('Erro ao excluir usuário: ' + (err.message || 'Tente novamente.'));
    } finally { setDeleting(false); }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingUser(true);
    setAddError('');

    const profileConfig: UserConfig = {
      id: '',
      name: newName,
      role: newJobRole,
      shiftType: newShiftType,
      turn: newTurn,
      startDate: newStartDate,
      offDays: [],
      state: newState,
      city: newCity,
      theme: ThemeStyle.MODERN,
      email: newEmail.trim().toLowerCase(),
      isActive: true,
      careerHistory: [],
    };

    try {
      // 1. Tenta criar normalmente via signUp
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newEmail.trim(),
        password: newPassword,
        options: { data: { full_name: newName } }
      });

      // 2. Detecta o erro de email já registrado no Auth
      if (authError) {
        const msg = authError.message?.toLowerCase() || '';
        const isAlreadyRegistered =
          msg.includes('already registered') ||
          msg.includes('already been registered') ||
          msg.includes('user already exists') ||
          authError.code === 'user_already_exists';

        if (isAlreadyRegistered) {
          // Verifica se ainda existe na system_users (usuário ativo, não foi realmente deletado)
          const { data: existingSys } = await supabase
            .from('system_users')
            .select('id, email')
            .ilike('email', newEmail.trim())
            .maybeSingle();

          if (existingSys) {
            // Usuário ainda está na tabela — não pode recadastrar
            setAddError('Este e-mail já possui acesso ativo no sistema. Se deseja reconfigurá-lo, edite o usuário existente na lista.');
            return;
          }

          // Usuário foi deletado da system_users mas conta de Auth persiste.
          // Estratégia: fazer signIn para obter o ID e recriar o registro.
          // Salvar sessão atual do admin para restaurar depois
          const { data: { session: adminSession } } = await supabase.auth.getSession();

          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: newEmail.trim(),
            password: newPassword,
          });

          if (signInError || !signInData.user) {
            // Restaurar sessão do admin em caso de falha
            if (adminSession) await supabase.auth.setSession({
              access_token: adminSession.access_token,
              refresh_token: adminSession.refresh_token,
            });
            setAddError(
              'Este e-mail já existe na autenticação mas com senha diferente. ' +
              'Para recadastrar, informe a senha original deste usuário, ou contate o suporte para remoção completa.'
            );
            return;
          }

          const existingUserId = signInData.user.id;

          // Recriar registro na system_users com o ID existente
          await supabase.from('system_users').upsert({
            id: existingUserId,
            email: newEmail.trim().toLowerCase(),
            name: newName,
            role: 'user',
            is_approved: true,
            visibility: 'self',
          }, { onConflict: 'id' });

          // Criar perfil de escala para o usuário
          await addProfileForOtherUser(existingUserId, { ...profileConfig, email: newEmail.trim().toLowerCase() });

          // Restaurar sessão do admin
          if (adminSession) {
            await supabase.auth.setSession({
              access_token: adminSession.access_token,
              refresh_token: adminSession.refresh_token,
            });
          }
          alert(`Usuário ${newName} recadastrado com sucesso! A escala está configurada.`);
          setShowAddModal(false);
          resetForm();
          loadUsers();
          return;
        }

        throw authError;
      }

      // 3. Criação normal bem-sucedida
      const newUserId = authData.user?.id;
      if (!newUserId) throw new Error('ID do usuário não retornado pelo Supabase.');

      await addProfileForOtherUser(newUserId, profileConfig);

      alert(`Usuário ${newName} cadastrado com sucesso! A escala já está configurada.`);
      setShowAddModal(false);
      resetForm();
      loadUsers();
    } catch (err: any) {
      setAddError(err.message || 'Erro ao criar usuário');
    } finally {
      setAddingUser(false);
    }
  };

  const handleToggleIndividualVisibility = async (user: SystemUser) => {
    const current = user.visibility || 'self';
    let next: 'all' | 'self' | 'created';
    if (current === 'all') next = 'self';
    else if (current === 'self') next = 'created';
    else next = 'all';
    try {
      await updateSystemUserVisibility(user.id, next);
      setUsers(users.map(u => u.id === user.id ? { ...u, visibility: next } : u));
    } catch { alert('Erro ao atualizar visibilidade.'); }
  };

  const handleSaveBlocks = async () => {
    if (!managingBlocksFor) return;
    setSavingBlocks(true);
    try {
      await updateSystemUserBlockedList(managingBlocksFor.id, blockedSelection);
      setUsers(users.map(u => u.id === managingBlocksFor.id ? { ...u, blocked_users: blockedSelection } : u));
      setManagingBlocksFor(null);
    } catch (err) {
      alert('Erro ao salvar configurações de bloqueio.');
    } finally {
      setSavingBlocks(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-500 font-bold uppercase tracking-widest text-center text-xs">Carregando usuários...</div>;

  return (
    <div className="w-full space-y-4 sm:space-y-6 font-inter pb-8">
      <div className="flex flex-col items-center gap-4 bg-white/85 backdrop-blur-xl border-2 border-pink-100/50 rounded-[30px] p-5 sm:p-6 shadow-sm text-center">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-gray-800 tracking-tight uppercase">Acessos</h2>
          <p className="text-gray-500 text-[10px] sm:text-xs font-bold mt-1 uppercase tracking-wider">Controle quem acessa o sistema</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="w-full bg-pink-500 hover:bg-pink-600 text-white px-6 py-3.5 rounded-[20px] text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md">
          <UserPlus size={16} /> Novo Usuário
        </button>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="bg-white/85 backdrop-blur-xl border-2 border-pink-100/50 rounded-[30px] p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-3 border-b-2 border-gray-50 pb-3">
              <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center shrink-0 border border-pink-100">
                <User size={18} className="text-pink-500" />
              </div>
              <div className="min-w-0 flex-1">
                {editingNameId === user.id ? (
                  <input autoFocus type="text" value={tempName} onChange={(e) => setTempName(e.target.value)}
                    onBlur={() => handleUpdateName(user)} onKeyDown={(e) => e.key === 'Enter' && handleUpdateName(user)}
                    className="flex-1 bg-gray-50 border-2 border-pink-100 rounded-lg px-2 py-1 text-sm font-black text-gray-800 outline-none w-full mb-1" />
                ) : (
                  <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { setEditingNameId(user.id); setTempName(user.name || ''); }}>
                    <span className="text-sm font-black text-gray-800 truncate block group-hover:text-pink-500 transition-colors">
                      {formatName((user.name || user.email.split('@')[0]).split(' ')[0])}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity"><Shield size={10} className="text-pink-300" /></div>
                  </div>
                )}
                <span className="text-[9px] font-bold text-gray-400 truncate block lowercase opacity-60">{user.email}</span>
                <span className={`text-[9px] font-black uppercase tracking-widest mt-1 block ${user.is_approved ? 'text-emerald-500' : 'text-red-500'}`}>
                  {user.is_approved ? 'Acesso Liberado' : 'Acesso Bloqueado'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={() => handleToggleRole(user)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[15px] text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${user.role === 'admin' ? 'bg-purple-50 text-purple-600 border-2 border-purple-100 hover:bg-purple-100' : 'bg-gray-50 text-gray-500 border-2 border-gray-100 hover:bg-gray-100'}`}>
                {user.role === 'admin' ? <ShieldCheck size={14} /> : <User size={14} />}
                {user.role === 'admin' ? 'Administrador' : 'Usuário Comum'}
              </button>

              <button onClick={() => handleToggleIndividualVisibility(user)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[15px] text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${user.visibility === 'all' ? 'bg-blue-50 text-blue-600 border-2 border-blue-100 hover:bg-blue-100' : user.visibility === 'created' ? 'bg-amber-50 text-amber-600 border-2 border-amber-100 hover:bg-amber-100' : 'bg-gray-50 text-gray-500 border-2 border-gray-100 hover:bg-gray-100'}`}>
                {user.visibility === 'all' ? <Eye size={14} /> : user.visibility === 'created' ? <Users size={14} /> : <EyeOff size={14} />}
                {user.visibility === 'all' ? 'Visão: Toda Equipe' : user.visibility === 'created' ? 'Visão: Si Mesmo e Criados' : 'Visão: Apenas Si Mesmo'}
              </button>

              {user.visibility === 'all' && (
                <button onClick={() => { setManagingBlocksFor(user); setBlockedSelection(user.blocked_users || []); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-[15px] text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 bg-white text-gray-400 border-2 border-gray-100 hover:bg-gray-50 hover:text-gray-600">
                  <ShieldAlert size={12} /> Ocultar Usuários
                  {user.blocked_users && user.blocked_users.length > 0 && (
                    <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md text-[8px]">{user.blocked_users.length}</span>
                  )}
                </button>
              )}

              <div className="flex gap-2">
                <button onClick={() => handleToggleStatus(user)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-[15px] text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${user.is_approved ? 'bg-white text-gray-500 border-2 border-gray-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200' : 'bg-emerald-50 text-emerald-600 border-2 border-emerald-200 hover:bg-emerald-100'}`}>
                  {user.is_approved ? 'Bloquear Acesso' : 'Liberar Acesso'}
                </button>
                {user.id !== currentUserId && (
                  <button onClick={() => setConfirmDelete(user)} title="Excluir usuário"
                    className="flex items-center justify-center w-12 h-12 rounded-[15px] border-2 border-red-100 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:scale-95">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Confirmação Exclusão */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-white border-2 border-red-100 rounded-[30px] p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center justify-center"><AlertTriangle size={20} className="text-red-500" /></div>
                <button onClick={() => setConfirmDelete(null)} className="p-2 rounded-xl text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-all"><X size={18} /></button>
              </div>
              <h3 className="text-base font-black text-gray-900 uppercase tracking-tight mb-1">Excluir Usuário</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed mb-1">Tem certeza que deseja excluir este usuário do sistema?</p>
              <div className="my-4 p-3 bg-gray-50 border border-gray-100 rounded-2xl">
                <p className="text-[11px] font-black text-gray-700 truncate">{confirmDelete.email}</p>
                <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${confirmDelete.is_approved ? 'text-emerald-500' : 'text-red-400'}`}>
                  {confirmDelete.role === 'admin' ? 'Administrador' : 'Usuário Comum'} • {confirmDelete.is_approved ? 'Acesso Liberado' : 'Bloqueado'}
                </p>
              </div>
              <p className="text-[10px] text-red-400 font-bold mb-5 leading-tight">⚠ Esta ação remove o acesso permanentemente.</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3.5 border-2 border-gray-100 text-gray-500 rounded-[15px] text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95">Cancelar</button>
                <button onClick={handleDeleteUser} disabled={deleting}
                  className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white rounded-[15px] text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md">
                  <Trash2 size={13} />{deleting ? 'Excluindo...' : 'Confirmar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Cadastro Novo Usuário */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 pb-28 px-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white border-2 border-pink-100 rounded-[30px] overflow-hidden shadow-2xl">
            
            <div className="p-6 border-b-2 border-pink-50 flex justify-between items-center bg-gradient-to-r from-pink-50 to-white">
              <div>
                <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Cadastrar Novo Usuário</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Acesso + Escala de trabalho</p>
              </div>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="text-gray-400 hover:text-pink-500 transition-colors p-1">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-5">
              {addError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs font-bold">
                  <ShieldAlert size={14} />{addError}
                </div>
              )}

              {/* Seção: Dados de Acesso */}
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-pink-400 mb-3 flex items-center gap-2">
                  <span className="w-4 h-4 bg-pink-100 rounded-full flex items-center justify-center text-[8px]">1</span>
                  Dados de Acesso
                </p>
                <div className="space-y-3">
                  <div>
                    <label className={labelClass}>Nome Completo</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome do colaborador" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@empresa.com" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Senha de Acesso</label>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input type={showPassword ? 'text' : 'password'} required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className={inputClass + ' pr-12'} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500 transition-colors">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-100 pt-4 space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-3 flex items-center gap-2">
                  <span className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center text-[8px]">2</span>
                  Escala de Trabalho
                </p>
                <div className="space-y-3">
                  <div>
                    <label className={labelClass}>Cargo / Função</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input type="text" required value={newJobRole} onChange={(e) => setNewJobRole(e.target.value)} placeholder="Ex: Operador, Supervisor..." className={inputClass} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Tipo de Escala</label>
                      <div className="relative">
                        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        <select value={newShiftType} onChange={(e) => setNewShiftType(e.target.value as ShiftType)} className={selectClass} required>
                          {Object.entries(SHIFT_LABELS).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Turno</label>
                      <div className="relative">
                        <Sun className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        <select value={newTurn} onChange={(e) => setNewTurn(e.target.value as WorkTurn)} className={selectClass} required>
                          {Object.entries(TURN_LABELS).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Data de Início</label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input type="date" required value={newStartDate} onChange={(e) => setNewStartDate(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Estado (UF)</label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="text" maxLength={2} value={newState} onChange={(e) => setNewState(e.target.value.toUpperCase())} placeholder="SP" className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Cidade</label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="text" value={newCity} onChange={(e) => setNewCity(e.target.value)} placeholder="São Paulo" className={inputClass} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={addingUser}
                  className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white py-4 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-md flex items-center justify-center gap-2">
                  {addingUser ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Cadastrando...</>
                  ) : (
                    <><UserPlus size={16} />Criar Usuário + Configurar Escala</>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal Gerenciamento de Bloqueios */}
      {managingBlocksFor && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white border-2 border-blue-100 rounded-[30px] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-5 border-b-2 border-blue-50 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white shrink-0">
              <div>
                <h3 className="text-base font-black text-gray-800 uppercase tracking-tight">Ocultar Usuários</h3>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Para: {managingBlocksFor.name || managingBlocksFor.email}</p>
              </div>
              <button onClick={() => setManagingBlocksFor(null)} className="text-gray-400 hover:text-blue-500 transition-colors p-1">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 space-y-2">
              <p className="text-[10px] font-bold text-gray-500 leading-relaxed mb-4">
                Selecione os administradores ou usuários cujos integrantes <strong className="text-gray-800">não devem aparecer</strong> para este usuário, mesmo ele tendo "Visão: Toda Equipe".
              </p>
              
              {users.filter(u => u.id !== managingBlocksFor.id).map(u => (
                <label key={u.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${blockedSelection.includes(u.id) ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                  <input type="checkbox" className="hidden" checked={blockedSelection.includes(u.id)}
                    onChange={(e) => {
                      if (e.target.checked) setBlockedSelection(prev => [...prev, u.id]);
                      else setBlockedSelection(prev => prev.filter(id => id !== u.id));
                    }} />
                  <div className={`w-5 h-5 rounded flex items-center justify-center border-2 ${blockedSelection.includes(u.id) ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-gray-200'}`}>
                    {blockedSelection.includes(u.id) && <X size={14} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-gray-800">{u.name || u.email.split('@')[0]}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">{u.role === 'admin' ? 'Admin' : 'Usuário'}</p>
                  </div>
                </label>
              ))}
              {users.filter(u => u.id !== managingBlocksFor.id).length === 0 && (
                <p className="text-xs text-gray-400 font-bold text-center py-4">Nenhum outro usuário no sistema.</p>
              )}
            </div>
            
            <div className="p-5 border-t-2 border-gray-50 shrink-0">
              <button onClick={handleSaveBlocks} disabled={savingBlocks}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-3.5 rounded-[15px] font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-md">
                {savingBlocks ? 'Salvando...' : 'Salvar Restrições'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Needed for the select icon
const Sun: React.FC<{ className?: string; size: number }> = ({ className, size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
  </svg>
);
