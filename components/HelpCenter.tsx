
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, HelpCircle, Calendar, Users, History, Settings,
  Zap, Umbrella, AlertCircle, ShieldCheck, Search,
  ChevronRight, Sparkles, BookOpen, Info, MessageCircle,
  Clock, Filter, Printer, Star, Send, Bot, Play, CheckCircle2,
  Trophy, Lightbulb, Rocket, Fingerprint, LifeBuoy, Siren, Flame, LayoutGrid,
  ThumbsUp, ThumbsDown
} from 'lucide-react';
import { formatName, normalizeString } from '../utils/shiftCalculator';

interface HelpTopic {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  content: React.ReactNode;
  category: 'onboarding' | 'features' | 'advanced' | 'ai';
  tags: string[];
}

export const HelpCenter: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'onboarding' | 'features' | 'ai'>('all');
  const [isTyping, setIsTyping] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  // Reset feedback when topic changes
  useEffect(() => {
    setFeedbackGiven(false);
  }, [selectedTopic]);

  // Simulated AI response logic
  useEffect(() => {
    if (searchTerm.length > 3) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 800);
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  const topics: HelpTopic[] = [
    {
      id: 'onboarding_start',
      icon: <Rocket className="text-pink-500" />,
      category: 'onboarding',
      title: 'Primeiros Passos',
      description: 'Aprenda a configurar sua primeira escala em 2 minutos.',
      tags: ['inicio', 'configuracao', 'perfil'],
      content: (
        <div className="space-y-6">
          <div className="relative p-6 bg-gradient-to-br from-pink-500 to-rose-600 rounded-[32px] text-white overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Rocket size={80} /></div>
            <h4 className="text-lg font-black mb-2">Guia de Início Rápido</h4>
            <p className="text-xs opacity-90 leading-relaxed">Bem-vindo ao futuro da gestão de escalas. Siga este fluxo para começar:</p>
          </div>
          
          <div className="space-y-4">
            {[
              { step: '01', title: 'Aba Time', desc: 'Adicione seus colegas clicando no botão central.' },
              { step: '02', title: 'Configure Regimes', desc: 'Defina se é 5x2, 12x36 ou Revezamento.' },
              { step: '03', title: 'Data de Início', desc: 'Crucial para escalas cíclicas. Define o dia zero.' }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-3xl items-start shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-xs font-black text-pink-500 shrink-0 border border-pink-50">
                  {item.step}
                </div>
                <div>
                  <h5 className="font-black text-gray-800 text-sm">{item.title}</h5>
                  <p className="text-[11px] text-gray-500 leading-tight">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'ai_assistant',
      icon: <Bot className="text-amber-500" />,
      category: 'ai',
      title: 'IA e Alertas Inteligentes',
      description: 'Como o Gemini prevê conflitos e otimiza sua jornada.',
      tags: ['ia', 'gemini', 'conflitos', 'avisos'],
      content: (
        <div className="space-y-5">
          <div className="p-5 bg-amber-50 border border-amber-100 rounded-[32px] space-y-3">
            <div className="flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase tracking-widest">
              <Sparkles size={14} />
              Motor de Previsão
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Nosso sistema utiliza o <strong>Google Gemini Pro</strong> para analisar padrões de escala. Se você marcar férias e não houver cobertura para sua função, um alerta pulsante aparecerá no Dashboard.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="p-4 bg-white border border-gray-100 rounded-[28px] flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500"><Siren size={20} /></div>
              <div>
                <h5 className="font-black text-xs text-gray-800">Alertas de Fadiga</h5>
                <p className="text-[10px] text-gray-400">Identifica quando alguém trabalha mais de 6 dias sem folga.</p>
              </div>
            </div>
            <div className="p-4 bg-white border border-gray-100 rounded-[28px] flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500"><Flame size={20} /></div>
              <div>
                <h5 className="font-black text-xs text-gray-800">Mensagens Motivacionais</h5>
                <p className="text-[10px] text-gray-400">Frases dinâmicas geradas por IA no topo da tela inicial.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'printing_mastery',
      icon: <Printer className="text-sky-500" />,
      category: 'features',
      title: 'Domínio de Impressão',
      description: 'Gere murais perfeitos em A4 com zoom e cores customizadas.',
      tags: ['impressao', 'pdf', 'mural', 'exportar'],
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 px-1">Configure o mural ideal para seu departamento:</p>
          <div className="bg-gray-50 rounded-[32px] p-6 border border-gray-100 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-sky-500" /><span className="text-[10px] font-bold">Zoom Inteligente</span></div>
              <p className="text-[9px] text-gray-400">Ajuste para caber em 1 ou 2 páginas A4 automaticamente.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[10px] font-bold">Modo Compacto</span></div>
              <p className="text-[9px] text-gray-400">Reduz o tamanho dos avatares para caber mais dias na tela.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-900" /><span className="text-[10px] font-bold">P&B Profissional</span></div>
              <p className="text-[9px] text-gray-400">Economize toner com o modo de alto contraste.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-pink-500" /><span className="text-[10px] font-bold">Privacidade</span></div>
              <p className="text-[9px] text-gray-400">Opção para ocultar os cargos e focar apenas nos nomes.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'advanced_history',
      icon: <History className="text-indigo-500" />,
      category: 'advanced',
      title: 'Ciclo de Vida e Carreira',
      description: 'Como gerenciar promoções e mudanças retroativas.',
      tags: ['historico', 'promocao', 'cargo', 'mudanca'],
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">O sistema é temporal. Se um funcionário foi promovido ontem, você pode registrar isso sem perder a escala passada:</p>
          <div className="flex items-start gap-4 p-5 bg-indigo-50 border border-indigo-100 rounded-3xl">
            <Lightbulb className="text-indigo-500 shrink-0 mt-1" />
            <div className="space-y-2">
              <h5 className="font-black text-indigo-900 text-xs">Ponto de Transição</h5>
              <p className="text-[10px] text-indigo-700 leading-relaxed">Ao adicionar uma mudança de cargo no histórico, o sistema recalcula a escala a partir daquela data exata, mantendo a integridade dos dias anteriores.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'profile_management',
      icon: <Fingerprint className="text-pink-500" />,
      category: 'features',
      title: 'Identidade e Perfil',
      description: 'Personalize seu avatar e gerencie suas informações pessoais.',
      tags: ['perfil', 'foto', 'avatar', 'nome'],
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Agora você pode dar um rosto à sua escala:</p>
          <div className="p-5 bg-pink-50 border border-pink-100 rounded-3xl space-y-3">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-full bg-pink-200 border-2 border-white shadow-sm flex items-center justify-center text-pink-600"><Users size={20} /></div>
              <p className="text-[10px] font-bold text-pink-700 uppercase tracking-widest leading-tight">Upload de Foto Disponível na Aba Perfil</p>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">Clique no círculo do seu avatar para subir uma imagem do seu dispositivo. As fotos aparecem no calendário geral para facilitar a identificação visual rápida da equipe.</p>
          </div>
        </div>
      )
    }
  ];

  const filteredTopics = topics.filter(t => {
    const normalizedSearch = normalizeString(searchTerm);
    const matchesSearch = normalizeString(t.title).includes(normalizedSearch) ||
      normalizeString(t.description).includes(normalizedSearch) ||
      t.tags.some(tag => normalizeString(tag).includes(normalizedSearch));
    
    const matchesTab = activeTab === 'all' || t.category === activeTab;
    
    return matchesSearch && matchesTab;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center px-0 sm:px-4 pb-0 sm:pb-8">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ y: "100%", opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "100%", opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-xl bg-white rounded-t-[48px] sm:rounded-[56px] shadow-[0_32px_128px_rgba(0,0,0,0.2)] flex flex-col max-h-[92vh] overflow-hidden border border-white/40"
          >
            {/* Header com Glassmorphism */}
            <div className="p-6 sm:p-8 border-b border-gray-50 flex items-center justify-between shrink-0 bg-white/50 backdrop-blur-md z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-[22px] flex items-center justify-center shadow-xl shadow-pink-200 rotate-3 transition-transform hover:rotate-0">
                  <LifeBuoy size={28} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 leading-tight">Escala Inteligente</h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Central de Experiência</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all active:scale-90"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar bg-gray-50/30">
              <AnimatePresence mode="wait">
                {!selectedTopic ? (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-6 sm:p-8 space-y-8"
                  >
                    {/* Hero Search Area */}
                    <div className="space-y-4">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-pink-500/5 blur-2xl group-focus-within:bg-pink-500/10 transition-colors" />
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-pink-500 transition-colors" size={20} />
                        <input
                          type="text"
                          placeholder="Como podemos ajudar você hoje?"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-16 pr-8 py-6 bg-white border border-gray-100 rounded-[32px] text-sm font-bold shadow-sm focus:border-pink-500 focus:ring-4 focus:ring-pink-500/5 outline-none transition-all placeholder:text-gray-300"
                        />
                        {isTyping && (
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-1">
                            <span className="w-1 h-1 bg-pink-300 rounded-full animate-bounce" />
                            <span className="w-1 h-1 bg-pink-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1 h-1 bg-pink-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                          </div>
                        )}
                      </div>

                      {/* Tabs de Categoria */}
                      <div className="flex gap-2 overflow-x-auto no-scrollbar px-1 py-1">
                        {[
                          { id: 'all', label: 'Tudo', icon: <LayoutGrid size={14} /> },
                          { id: 'onboarding', label: 'Início', icon: <Rocket size={14} /> },
                          { id: 'features', label: 'Recursos', icon: <Star size={14} /> },
                          { id: 'ai', label: 'Gemini AI', icon: <Bot size={14} /> }
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                              activeTab === tab.id 
                                ? 'bg-gray-900 border-gray-900 text-white shadow-lg' 
                                : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                            }`}
                          >
                            {tab.icon}
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Lista de Tópicos */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Principais Dúvidas</h3>
                        {searchTerm && <span className="text-[10px] font-bold text-pink-500">{filteredTopics.length} encontrados</span>}
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        {filteredTopics.map((topic) => (
                          <button
                            key={topic.id}
                            onClick={() => setSelectedTopic(topic)}
                            className="w-full p-5 bg-white border border-gray-50 rounded-[32px] flex items-center justify-between group hover:border-pink-100 hover:shadow-xl hover:shadow-gray-200/40 transition-all active:scale-[0.98] border-b-4 border-b-gray-100 hover:border-b-pink-100"
                          >
                            <div className="flex items-center gap-5">
                              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 group-hover:bg-pink-50">
                                {React.cloneElement(topic.icon as React.ReactElement<any>, { size: 24, className: 'transition-colors group-hover:text-pink-500' })}
                              </div>
                              <div className="text-left">
                                <h4 className="text-sm font-black text-gray-800 mb-0.5 group-hover:text-pink-600 transition-colors">{topic.title}</h4>
                                <p className="text-[10px] text-gray-400 font-medium leading-tight max-w-[200px] sm:max-w-xs">{topic.description}</p>
                              </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-pink-500 group-hover:text-white transition-all">
                              <ChevronRight size={16} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Access Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => alert('Download do Guia Técnico (PDF) iniciado.')} className="text-left p-6 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-[40px] text-white space-y-3 shadow-lg shadow-indigo-200 hover:scale-[1.02] transition-transform active:scale-95">
                        <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center"><BookOpen size={20} /></div>
                        <h4 className="text-xs font-black uppercase tracking-widest">Documentação</h4>
                        <p className="text-[10px] opacity-70">Guia técnico completo em PDF.</p>
                      </button>
                      <button onClick={() => window.open('mailto:suporte@escalafacil.com.br?subject=Dúvida no Sistema')} className="text-left p-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[40px] text-white space-y-3 shadow-lg shadow-emerald-200 hover:scale-[1.02] transition-transform active:scale-95">
                        <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center"><MessageCircle size={20} /></div>
                        <h4 className="text-xs font-black uppercase tracking-widest">Suporte</h4>
                        <p className="text-[10px] opacity-70">Fale com nossos especialistas.</p>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="detail"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="flex flex-col min-h-full"
                  >
                    <div className="p-6 sm:p-8 space-y-8">
                      <button
                        onClick={() => setSelectedTopic(null)}
                        className="flex items-center gap-2 text-pink-500 font-black text-[10px] uppercase tracking-widest px-2 group"
                      >
                        <div className="w-6 h-6 rounded-full bg-pink-50 flex items-center justify-center group-hover:bg-pink-500 group-hover:text-white transition-all">
                          <ChevronRight size={14} className="rotate-180" />
                        </div>
                        Voltar para lista
                      </button>

                      <div className="space-y-6">
                        <div className="flex items-center gap-5 px-2">
                          <div className="w-16 h-16 bg-white border border-gray-100 rounded-3xl flex items-center justify-center shadow-xl rotate-3 group-hover:rotate-0 transition-transform">
                            {React.cloneElement(selectedTopic.icon as React.ReactElement<any>, { size: 32 })}
                          </div>
                          <div>
                            <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.15em] mb-1.5 inline-block ${
                              selectedTopic.category === 'ai' ? 'bg-amber-100 text-amber-600' :
                              selectedTopic.category === 'onboarding' ? 'bg-pink-100 text-pink-600' :
                              'bg-indigo-100 text-indigo-600'
                            }`}>
                              {selectedTopic.category}
                            </span>
                            <h3 className="text-2xl font-black text-gray-900 leading-tight">{selectedTopic.title}</h3>
                          </div>
                        </div>

                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-white rounded-[44px] p-6 sm:p-8 border border-gray-100 shadow-sm shadow-gray-200/20"
                        >
                          {selectedTopic.content}
                        </motion.div>
                        
                        <div className="flex items-center justify-center gap-4 py-4 min-h-[72px]">
                          <AnimatePresence mode="wait">
                            {!feedbackGiven ? (
                              <motion.div key="ask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-4">
                                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Isso foi útil?</p>
                                <div className="flex gap-3">
                                  <button onClick={() => setFeedbackGiven(true)} className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center bg-white hover:bg-emerald-50 hover:text-emerald-500 hover:border-emerald-200 transition-all text-gray-400 active:scale-90 hover:shadow-lg hover:shadow-emerald-500/10"><ThumbsUp size={18} /></button>
                                  <button onClick={() => setFeedbackGiven(true)} className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center bg-white hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-all text-gray-400 active:scale-90 hover:shadow-lg hover:shadow-rose-500/10"><ThumbsDown size={18} /></button>
                                </div>
                              </motion.div>
                            ) : (
                              <motion.div key="thanks" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 text-emerald-500 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                                <CheckCircle2 size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Obrigado pelo feedback!</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                    
                    {/* Topic Footer */}
                    <div className="mt-auto p-8 bg-gray-900 rounded-t-[56px] text-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Bot className="text-pink-500" />
                          <h4 className="text-sm font-black tracking-wide">Dica da IA</h4>
                        </div>
                        <Sparkles size={18} className="text-amber-500" />
                      </div>
                      
                      <AnimatePresence mode="wait">
                        {!searchTerm.startsWith('related:') ? (
                          <motion.div
                            key="ai-tip"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            <p className="text-xs text-gray-400 leading-relaxed mb-6">
                              Você sabia que o sistema aprende com suas marcações? Quanto mais preciso for seu histórico de movimentações, melhor o Gemini prevê conflitos de equipe.
                            </p>
                            <button 
                              onClick={() => setSearchTerm('related:' + selectedTopic.category)}
                              className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                              Explorar Tópicos Relacionados
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="related-grid"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-4"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[8px] font-black text-pink-500 uppercase tracking-widest">Sugestões para você</span>
                              <button onClick={() => setSearchTerm('')} className="text-[8px] text-gray-500 hover:text-white uppercase font-bold">Voltar</button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {topics
                                .filter(t => t.category === selectedTopic.category && t.id !== selectedTopic.id)
                                .slice(0, 2)
                                .map(rel => (
                                  <button
                                    key={rel.id}
                                    onClick={() => { setSelectedTopic(rel); setSearchTerm(''); }}
                                    className="p-3 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-white/10 transition-colors group"
                                  >
                                    <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center mb-2 group-hover:bg-pink-500 transition-colors">
                                      {React.cloneElement(rel.icon as React.ReactElement<any>, { size: 12 })}
                                    </div>
                                    <h5 className="text-[9px] font-black truncate">{rel.title}</h5>
                                  </button>
                                ))}
                            </div>
                          </motion.div>
                        )
                        }
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
