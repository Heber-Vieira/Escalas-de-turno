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
    return <div className="p-8 text-white">Carregando usuários...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-6 font-inter">
      <div className="flex justify-between items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Gerenciamento de Acessos</h2>
          <p className="text-gray-400 text-sm font-medium mt-1">
            Controle quem tem acesso ao sistema Escala Fácil
          </p>
        </div>
        <button
            onClick={() => setShowAddModal(true)}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
        >
            <UserPlus size={16} />
            Novo Usuário
        </button>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">E-mail do Usuário</th>
                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Função</th>
                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <User size={16} className="text-gray-400" />
                      </div>
                      <span className="text-sm font-bold text-white">{user.email}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                        onClick={() => handleToggleRole(user)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${
                        user.role === 'admin' 
                            ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' 
                            : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                        }`}
                    >
                        {user.role === 'admin' ? <ShieldCheck size={12} /> : <User size={12} />}
                        {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      user.is_approved 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {user.is_approved ? 'Liberado' : 'Bloqueado'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${
                        user.is_approved
                            ? 'bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-gray-400 border border-white/10'
                            : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {user.is_approved ? 'Bloquear Acesso' : 'Liberar Acesso'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-[#0a0a0f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative"
            >
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Cadastrar Novo Usuário</h3>
                    <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white transition-colors">
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
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="email"
                                required
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="email@exemplo.com"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white text-sm outline-none focus:border-pink-500 transition-colors"
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Senha</label>
                        <div className="relative">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white text-sm outline-none focus:border-pink-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={addingUser}
                            className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-colors"
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
