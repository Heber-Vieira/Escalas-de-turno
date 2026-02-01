
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, HelpCircle, Calendar, Users, History, Settings,
  Zap, Umbrella, AlertCircle, ShieldCheck, Search,
  ChevronRight, Sparkles, BookOpen, Info, MessageCircle,
  Clock, Filter, Printer
} from 'lucide-react';

interface HelpTopic {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  content: React.ReactNode;
  category: 'basic' | 'advanced' | 'team' | 'ai';
}

export const HelpCenter: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);

  const topics: HelpTopic[] = [
    {
      id: 'scales',
      icon: <Calendar className="text-blue-500" />,
      category: 'basic',
      title: 'Entendendo as Escalas',
      description: 'Como funcionam os padrões 5x2, 6x1, 12x36 e outros.',
      content: (
        <div className="space-y-4 text-gray-600 text-sm">
          <p>O <strong>Escala Fácil</strong> suporta os principais modelos de jornada brasileiros:</p>
          <ul className="space-y-2">
            <li className="flex gap-2">
              <ShieldCheck size={14} className="text-emerald-500 shrink-0 mt-1" />
              <span><strong>5x2:</strong> Segunda a sexta, com sábados e domingos de folga.</span>
            </li>
            <li className="flex gap-2">
              <ShieldCheck size={14} className="text-emerald-500 shrink-0 mt-1" />
              <span><strong>6x1:</strong> Seis dias de trabalho por um de folga.</span>
            </li>
            <li className="flex gap-2">
              <ShieldCheck size={14} className="text-blue-500 shrink-0 mt-1" />
              <span><strong>12x36:</strong> Doze horas de trabalho seguidas por 36h de descanso.</span>
            </li>
            <li className="flex gap-2">
              <Zap size={14} className="text-purple-500 shrink-0 mt-1" />
              <span><strong>Revezamento:</strong> Ciclos customizados (ex: 5x1, 4x2).</span>
            </li>
          </ul>
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 flex gap-2">
            <Info size={16} className="text-amber-500 shrink-0" />
            <p className="text-[11px] font-bold text-amber-700 uppercase">DICA: A data de início do contrato define onde o ciclo começa.</p>
          </div>
        </div>
      )
    },
    {
      id: 'launches',
      icon: <Zap className="text-purple-500" />,
      category: 'basic',
      title: 'Lançamentos e Registros',
      description: 'Como adicionar faltas, horas extras e férias.',
      content: (
        <div className="space-y-4 text-gray-600 text-sm">
          <p>Para registrar um evento, primeiro toque no dia desejado no calendário principal:</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-gray-900 text-white rounded-2xl">
              <p className="font-black text-[10px] uppercase mb-1">Ausência</p>
              <p className="text-[9px] opacity-70">Usa para faltas ou folgas extras não programadas.</p>
            </div>
            <div className="p-3 bg-purple-600 text-white rounded-2xl">
              <p className="font-black text-[10px] uppercase mb-1">Extra</p>
              <p className="text-[9px] opacity-70">Trabalho em dia de folga. Ativa o alerta pulsante.</p>
            </div>
            <div className="p-3 bg-sky-500 text-white rounded-2xl col-span-2">
              <p className="font-black text-[10px] uppercase mb-1">Férias</p>
              <p className="text-[9px] opacity-70">Abre o planejador inteligente de períodos (10, 15, 20 ou 30 dias).</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'team_view',
      icon: <Users className="text-pink-500" />,
      category: 'team',
      title: 'Visão de Toda Equipe',
      description: 'Como gerenciar a escala coletiva e evitar conflitos.',
      content: (
        <div className="space-y-4 text-gray-600 text-sm">
          <p>A aba <strong>Equipe</strong> (ícone central) mostra quem está trabalhando em tempo real:</p>
          <ul className="space-y-3">
            <li className="flex gap-3 items-center">
              <div className="p-2 bg-pink-100 rounded-lg text-pink-500"><Filter size={14} /></div>
              <span><strong>Filtros:</strong> Filtre por Cargos ou Turnos para ver subgrupos específicos.</span>
            </li>
            <li className="flex gap-3 items-center">
              <div className="p-2 bg-sky-100 rounded-lg text-sky-500"><Umbrella size={14} /></div>
              <span><strong>Resumo de Férias:</strong> No topo, veja quem está de férias no mês atual de forma agrupada.</span>
            </li>
            <li className="flex gap-3 items-center">
              <div className="p-2 bg-gray-100 rounded-lg text-gray-500"><Printer size={14} /></div>
              <div className="flex flex-col">
                <span><strong>Impressão Avançada:</strong> Gere PDFs para murais.</span>
                <span className="text-[10px] opacity-70">Novas opções: Zoom (1 ou 2 páginas), Modo Compacto, P&B e Ocultar Cargos.</span>
              </div>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'ai_studio',
      icon: <Sparkles className="text-amber-500" />,
      category: 'ai',
      title: 'Inteligência Gemini',
      description: 'Como os alertas e a IA ajudam no seu dia a dia.',
      content: (
        <div className="space-y-4 text-gray-600 text-sm">
          <p>O app utiliza a IA do <strong>Google Gemini</strong> para:</p>
          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-br from-amber-50 to-pink-50 rounded-3xl border border-amber-100">
              <h4 className="font-black text-[10px] uppercase text-amber-600 mb-1">Alertas Motivacionais</h4>
              <p className="text-[11px] leading-relaxed italic text-gray-700">A IA analisa o clima, feriados e sua escala para criar mensagens personalizadas que aparecem no topo do seu Dashboard.</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-sky-50 to-blue-50 rounded-3xl border border-sky-100">
              <h4 className="font-black text-[10px] uppercase text-sky-600 mb-1">Prevenção de Conflitos</h4>
              <p className="text-[11px] leading-relaxed text-gray-700">Ao marcar férias, a IA verifica se outros colegas da mesma função estarão fora, emitindo um alerta visual pulsante.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'history',
      icon: <History className="text-gray-500" />,
      category: 'advanced',
      title: 'Movimentações e Carreira',
      description: 'Edite e gerencie seu histórico de mudanças.',
      content: (
        <div className="space-y-4 text-gray-600 text-sm">
          <p>O módulo de <strong>Movimentações</strong> permite rastrear sua evolução na empresa:</p>
          <ul className="space-y-2">
            <li>• <strong>Edição Compelta:</strong> Agora é possível editar registros passados clicando no ícone de lápis.</li>
            <li>• <strong>Sugestões Inteligentes:</strong> Ao digitar um cargo, o sistema sugere opções já existentes.</li>
            <li>• <strong>Exclusão Segura:</strong> A remoção de itens exige confirmação para evitar erros.</li>
            <li>• As alterações impactam automaticamente o cálculo da escala a partir da data definida.</li>
          </ul>
        </div>
      )
    }
  ];

  const filteredTopics = topics.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center px-4 pb-8">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-[40px] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-white/20"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-pink-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-pink-200">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900 leading-tight">Guia Escala Fácil</h2>
                  <p className="text-[10px] font-bold text-pink-500 uppercase tracking-widest">Centro de Suporte Inteligente</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6">
              <AnimatePresence mode="wait">
                {!selectedTopic ? (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      <input
                        type="text"
                        placeholder="Pesquisar ajuda..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold focus:border-pink-500 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Tópicos Recomendados</h3>
                      <div className="space-y-2">
                        {filteredTopics.map((topic) => (
                          <button
                            key={topic.id}
                            onClick={() => setSelectedTopic(topic)}
                            className="w-full p-4 bg-white border border-gray-100 rounded-3xl flex items-center justify-between group hover:border-pink-200 hover:shadow-lg hover:shadow-pink-500/5 transition-all active:scale-[0.98]"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-white transition-colors">
                                {topic.icon}
                              </div>
                              <div className="text-left">
                                <h4 className="text-xs font-black text-gray-800">{topic.title}</h4>
                                <p className="text-[9px] text-gray-400 font-medium">{topic.description}</p>
                              </div>
                            </div>
                            <ChevronRight size={16} className="text-gray-300 group-hover:text-pink-500 transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Footer Guide Section */}
                    <div className="p-5 bg-gradient-to-br from-gray-900 to-gray-800 rounded-[32px] text-white space-y-3">
                      <div className="flex items-center gap-2">
                        <MessageCircle size={18} className="text-pink-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Suporte Direto</span>
                      </div>
                      <p className="text-[11px] opacity-70 leading-relaxed">Não encontrou o que precisava? Nossa equipe está sempre pronta para ajudar a melhorar sua experiência.</p>
                      <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors">Falar com Desenvolvedores</button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="detail"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <button
                      onClick={() => setSelectedTopic(null)}
                      className="flex items-center gap-2 text-pink-500 font-black text-[10px] uppercase tracking-widest px-2"
                    >
                      <ChevronRight size={14} className="rotate-180" />
                      Voltar para lista
                    </button>

                    <div className="space-y-4">
                      <div className="flex items-center gap-4 px-2">
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center shadow-inner">
                          {React.cloneElement(selectedTopic.icon as React.ReactElement<any>, { size: 32 })}
                        </div>
                        <div>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${selectedTopic.category === 'ai' ? 'bg-amber-100 text-amber-600' :
                            selectedTopic.category === 'team' ? 'bg-pink-100 text-pink-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                            {selectedTopic.category}
                          </span>
                          <h3 className="text-xl font-black text-gray-900">{selectedTopic.title}</h3>
                        </div>
                      </div>

                      <div className="bg-gray-50/50 rounded-[32px] p-6 border border-gray-100">
                        {selectedTopic.content}
                      </div>
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
