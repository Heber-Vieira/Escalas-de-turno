
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Key, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UserConfig } from '../types';
import { formatName } from '../utils/shiftCalculator';

interface InviteMemberModalProps {
  profile: UserConfig;
  isOpen: boolean;
  onClose: () => void;
  onInvite: (profileId: string, email: string, password: string, memberName: string) => Promise<{ success: boolean; error?: string }>;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  profile,
  isOpen,
  onClose,
  onInvite,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setLoading(false);
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await onInvite(profile.id, email, password, profile.name);

    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } else {
      setError(result.error || 'Erro ao convidar integrante.');
    }
  };

  const firstLetter = profile.name.charAt(0).toUpperCase();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-sm bg-white rounded-[28px] overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-pink-50 via-white to-purple-50 p-5 border-b border-pink-100/50">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-pink-100 border-2 border-pink-200/50 flex items-center justify-center text-pink-600 font-black text-lg overflow-hidden shrink-0">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                  ) : firstLetter}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-black text-pink-400 uppercase tracking-widest mb-0.5">Convidar para o Sistema</p>
                  <h3 className="text-sm font-black text-gray-900 truncate">{formatName(profile.name)}</h3>
                  <p className="text-[9px] text-gray-400 font-medium truncate">{formatName(profile.role)}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center gap-3 py-6 text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center">
                    <CheckCircle2 size={28} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-800 uppercase tracking-tight">Convite Enviado!</p>
                    <p className="text-[10px] text-gray-400 font-medium mt-1">
                      {formatName(profile.name.split(' ')[0])} já pode fazer login e ver a equipe.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                    Defina o <strong>e-mail</strong> e <strong>senha</strong> que{' '}
                    <span className="text-gray-700 font-bold">{formatName(profile.name.split(' ')[0])}</span>{' '}
                    usará para acessar o sistema. Ele verá as escalas da equipe.
                  </p>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-2xl"
                    >
                      <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                      <p className="text-[10px] font-bold text-red-500 leading-relaxed">{error}</p>
                    </motion.div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5 ml-1">
                      E-mail de Acesso
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@empresa.com"
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3 pl-10 pr-4 text-sm text-gray-800 outline-none focus:border-pink-300 focus:bg-white transition-all placeholder:text-gray-300"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5 ml-1">
                      Senha de Acesso
                    </label>
                    <div className="relative">
                      <Key size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3 pl-10 pr-11 text-sm text-gray-800 outline-none focus:border-pink-300 focus:bg-white transition-all placeholder:text-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-pink-400 transition-colors"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Info banner */}
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-2xl">
                    <span className="text-amber-400 text-xs mt-0.5">ℹ️</span>
                    <p className="text-[9px] font-medium text-amber-700 leading-relaxed">
                      O acesso será liberado automaticamente com visibilidade para toda a equipe criada por você.
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 py-3 border-2 border-gray-100 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md shadow-pink-500/20"
                    >
                      {loading ? (
                        <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Convidando...</>
                      ) : (
                        <><UserPlus size={13} /> Convidar</>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
