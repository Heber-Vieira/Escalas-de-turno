import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldCheck, ShieldAlert, User, UserPlus, Mail, Key } from 'lucide-react';
import { SystemUser } from '../types';
import { supabase } from '../services/supabase';

interface SystemAccessManagementProps {
  fetchAllSystemUsers: () => Promise<SystemUser[]>;
  updateSystemUserAccess: (userId: string, is_approved: boolean, role: 'admin' | 'user') => Promise<void>;
}

export const SystemAccessManagement: React.FC<SystemAccessManagementProps> = ({ 
    fetchAllSystemUsers, 
    updateSystemUserAccess 
}) => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [addingUser, setAddingUser] = useState(false);
  const [addError, setAddError] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    const data = await fetchAllSystemUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (user: SystemUser) => {
    try {
      await updateSystemUserAccess(user.id, !user.is_approved, user.role);
      setUsers(users.map(u => u.id === user.id ? { ...u, is_approved: !u.is_approved } : u));
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      alert('Erro ao atualizar status do usuário.');
    }
  };

  const handleToggleRole = async (user: SystemUser) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await updateSystemUserAccess(user.id, user.is_approved, newRole);
      setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error('Erro ao atualizar função:', err);
      alert('Erro ao atualizar função do usuário.');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingUser(true);
    setAddError('');

    try {
      // Usando signUp (Nota: em algumas configurações isso pode deslogar o admin se a confirmação de email estiver desativada,
      // mas é a forma padrão de criar usuário via client-side sem Service Role Key).
      const { data, error } = await supabase.auth.signUp({
        email: newEmail,
        password: newPassword,
      });

      if (error) throw error;
      
      alert('Usuário cadastrado com sucesso!');
      setShowAddModal(false);
      setNewEmail('');
      setNewPassword('');
      loadUsers(); // Recarrega a lista para mostrar o novo usuário se o trigger funcionou
    } catch (err: any) {
      setAddError(err.message || 'Erro ao criar usuário');
    } finally {
      setAddingUser(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500 font-bold uppercase tracking-widest text-center text-xs">Carregando usuários...</div>;
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6 font-inter pb-8">
      <div className="flex flex-col items-center gap-4 bg-white/85 backdrop-blur-xl border-2 border-pink-100/50 rounded-[30px] p-5 sm:p-6 shadow-sm text-center">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-gray-800 tracking-tight uppercase">Acessos</h2>
          <p className="text-gray-500 text-[10px] sm:text-xs font-bold mt-1 uppercase tracking-wider">
            Controle quem acessa o sistema
          </p>
        </div>
        <button
            onClick={() => setShowAddModal(true)}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white px-6 py-3.5 rounded-[20px] text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
        >
            <UserPlus size={16} />
            Novo Usuário
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
                <span className="text-sm font-black text-gray-800 truncate block">{user.email}</span>
                <span className={`text-[9px] font-black uppercase tracking-widest mt-0.5 block ${user.is_approved ? 'text-emerald-500' : 'text-red-500'}`}>
                  {user.is_approved ? 'Acesso Liberado' : 'Acesso Bloqueado'}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <button 
                  onClick={() => handleToggleRole(user)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[15px] text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                  user.role === 'admin' 
                      ? 'bg-purple-50 text-purple-600 border-2 border-purple-100 hover:bg-purple-100' 
                      : 'bg-gray-50 text-gray-500 border-2 border-gray-100 hover:bg-gray-100'
                  }`}
              >
                  {user.role === 'admin' ? <ShieldCheck size={14} /> : <User size={14} />}
                  {user.role === 'admin' ? 'Administrador' : 'Usuário Comum'}
              </button>
              
              <button
                onClick={() => handleToggleStatus(user)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[15px] text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                  user.is_approved
                      ? 'bg-white text-gray-500 border-2 border-gray-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                      : 'bg-emerald-50 text-emerald-600 border-2 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                {user.is_approved ? 'Bloquear Acesso' : 'Liberar Acesso'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white border-2 border-pink-100 rounded-[30px] overflow-hidden shadow-2xl relative"
            >
                <div className="p-6 border-b-2 border-pink-50 flex justify-between items-center">
                    <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Cadastrar Novo Usuário</h3>
                    <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-pink-500 transition-colors">
                        ✕
                    </button>
                </div>
                <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                    {addError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs font-bold">
                            <ShieldAlert size={14} />
                            {addError}
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">E-mail</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="email"
                                required
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="email@exemplo.com"
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-[20px] py-3 pl-12 pr-4 text-gray-800 text-sm outline-none focus:border-pink-500 focus:bg-white transition-all"
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Senha</label>
                        <div className="relative">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-[20px] py-3 pl-12 pr-4 text-gray-800 text-sm outline-none focus:border-pink-500 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={addingUser}
                            className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white py-3.5 rounded-[20px] font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all active:scale-95 shadow-md"
                        >
                            {addingUser ? 'Cadastrando...' : 'Criar Usuário'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
      )}
    </div>
  );
};
