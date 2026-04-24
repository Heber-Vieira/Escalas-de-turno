import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, LogOut } from 'lucide-react';

interface AccessDeniedProps {
  onLogout: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ onLogout }) => {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden font-inter">
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-500/10 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[40px] p-10 shadow-2xl relative z-10 text-center"
      >
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/10">
          <ShieldAlert className="text-red-500" size={40} />
        </div>
        
        <h1 className="text-2xl font-black text-white tracking-tight mb-4 uppercase">Acesso Restrito</h1>
        
        <p className="text-gray-400 text-sm font-medium leading-relaxed mb-10">
          Sua conta está aguardando aprovação do administrador para acessar o sistema. Por favor, aguarde a liberação.
        </p>

        <button
          onClick={onLogout}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group"
        >
          <LogOut size={16} />
          Sair da Conta
        </button>
      </motion.div>
    </div>
  );
};
