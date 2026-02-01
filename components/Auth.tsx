
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, Mail, Lock, Sparkles, ArrowRight, Github, Chrome, AlertCircle } from 'lucide-react';

interface AuthProps {
    onAuthSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert('Verifique seu e-mail para confirmar o cadastro!');
            }
            onAuthSuccess();
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro na autenticação');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden font-inter">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[40px] p-8 shadow-2xl relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-500/20">
                        <Sparkles className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2 uppercase">Escala Fácil</h1>
                    <p className="text-gray-400 text-sm font-medium tracking-wide">
                        {isLogin ? 'Bem-vindo de volta à sua equipe' : 'Comece a gerenciar suas escalas agora'}
                    </p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-2xl mb-8">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Entrar
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Cadastrar
                    </button>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold"
                            >
                                <AlertCircle size={18} />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">E-mail</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-pink-500 transition-all outline-none font-bold text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-pink-500 transition-all outline-none font-bold text-sm"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-pink-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:active:scale-100"
                    >
                        {loading ? 'Processando...' : (
                            <>
                                {isLogin ? 'Entrar Agora' : 'Criar Minha Conta'}
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-px bg-white/10 flex-1" />
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Ou continue com</span>
                        <div className="h-px bg-white/10 flex-1" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 py-3 rounded-2xl hover:bg-white/10 transition-colors">
                            <Github size={20} className="text-white" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider">GitHub</span>
                        </button>
                        <button className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 py-3 rounded-2xl hover:bg-white/10 transition-colors">
                            <Chrome size={20} className="text-white" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider">Google</span>
                        </button>
                    </div>
                </div>

                <p className="mt-8 text-center text-[10px] font-medium text-gray-600 uppercase tracking-widest leading-loose">
                    Ao continuar, você concorda com nossos <br />
                    <span className="text-gray-400 cursor-pointer hover:text-pink-500 transition-colors">Termos de Serviço</span> e <span className="text-gray-400 cursor-pointer hover:text-pink-500 transition-colors">Privacidade</span>
                </p>
            </motion.div>
        </div>
    );
};
