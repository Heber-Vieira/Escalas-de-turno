
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
      title: 'Primeiros Passos e Login',
      description: 'Aprenda a configurar sua primeira escala, criar sua conta e acessar o sistema.',
      tags: ['inicio', 'configuracao', 'perfil', 'login', 'cadastro'],
      content: (
        <div className="space-y-6">
          <div className="relative p-6 bg-gradient-to-br from-pink-500 to-rose-600 rounded-[32px] text-white overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Rocket size={80} /></div>
            <h4 className="text-lg font-black mb-2">Guia de Início Rápido</h4>
            <p className="text-xs opacity-90 leading-relaxed">Bem-vindo ao futuro da gestão de escalas. Siga este fluxo para começar sua jornada no sistema.</p>
          </div>
          
          <div className="space-y-4">
            {[
              { step: '01', title: 'Criação de Conta e Termos', desc: 'Ao fazer o primeiro acesso, leia e concorde com nossos Termos de Serviço e Política de Privacidade para garantir sua segurança e compliance com a LGPD.' },
              { step: '02', title: 'Aba Time', desc: 'Adicione seus colegas clicando no botão central para iniciar a formação da sua equipe.' },
              { step: '03', title: 'Configure Regimes', desc: 'Defina se é 5x2, 12x36 ou Revezamento no perfil de cada funcionário.' },
              { step: '04', title: 'Data de Início', desc: 'Crucial para escalas cíclicas. Define o "dia zero" para as projeções futuras.' }
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
      id: 'access_control',
      icon: <ShieldCheck className="text-emerald-500" />,
      category: 'advanced',
      title: 'Gestão de Acessos e Visibilidade Granular',
      description: 'Aprove usuários, defina níveis de visibilidade e oculte perfis através da função de Bloqueio.',
      tags: ['admin', 'acesso', 'aprovacao', 'visibilidade', 'permissoes', 'bloqueio', 'ocultar'],
      content: (
        <div className="space-y-6">
          <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-3xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
              <ShieldCheck size={14} />
              Exclusivo para Administradores
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              O sistema opera com um modelo robusto de <strong>Aprovação Prévia</strong> e <strong>Controle Granular</strong>. Você define exatamente o que cada pessoa pode acessar.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-white border border-gray-100 rounded-[28px] shadow-sm">
              <h5 className="font-black text-xs text-gray-800 mb-2">1. Painel de Aprovação de Acesso</h5>
              <p className="text-[11px] text-gray-500 leading-relaxed mb-3">
                Na tela <strong>Gerenciar Acessos</strong>, novos usuários entram em estado pendente. Somente após a sua Aprovação eles poderão visualizar os dados.
              </p>
            </div>

            <div className="p-4 bg-white border border-gray-100 rounded-[28px] shadow-sm">
              <h5 className="font-black text-xs text-gray-800 mb-2">2. Níveis de Visibilidade</h5>
              <p className="text-[11px] text-gray-500 leading-relaxed mb-2">Configure o alcance de cada usuário:</p>
              <ul className="space-y-2">
                <li className="flex gap-2 items-center text-[10px] text-gray-600"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div><strong>Tudo:</strong> Acesso total a todos os registros.</li>
                <li className="flex gap-2 items-center text-[10px] text-gray-600"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div><strong>Criados:</strong> Enxerga apenas membros que ele mesmo criou/convidou.</li>
                <li className="flex gap-2 items-center text-[10px] text-gray-600"><div className="w-1.5 h-1.5 rounded-full bg-pink-500"></div><strong>Próprios:</strong> Vê estritamente a si próprio.</li>
              </ul>
            </div>

            <div className="p-4 bg-red-50 border border-red-100 rounded-[28px] shadow-sm">
              <h5 className="font-black text-xs text-red-900 mb-2">3. Novo: Bloqueio de Usuários (Invisibilidade)</h5>
              <p className="text-[11px] text-red-800 leading-relaxed">
                Exclusivo para Admins na área de Gerenciar Acessos. Ao bloquear um usuário, <strong>ele ficará invisível para a equipe</strong>. O sistema também aplicará ocultação "em cascata", escondendo automaticamente todos os membros que foram criados por este usuário bloqueado.
                <br/><br/>
                <em>Exemplo Prático: Um coordenador terceirizado é desligado. Ao bloqueá-lo, todos os funcionários da empresa dele também são ocultados do painel principal, limpando a visualização para os demais.</em>
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'bulk_actions',
      icon: <LayoutGrid className="text-blue-500" />,
      category: 'features',
      title: 'Ações em Lote: Importar e Excluir',
      description: 'Importe via Excel ou exclua vários usuários de uma vez (Delete All).',
      tags: ['excel', 'importar', 'excluir', 'lote', 'deletar', 'massa'],
      content: (
        <div className="space-y-6">
          <div className="relative p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[32px] text-white overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 p-4 opacity-10"><LayoutGrid size={80} /></div>
            <h4 className="text-lg font-black mb-2">Ferramentas de Massa</h4>
            <p className="text-xs opacity-90 leading-relaxed">Ganhe produtividade ao manipular múltiplos registros simultaneamente, tanto para criação quanto para limpeza da base.</p>
          </div>
          
          <div className="space-y-4">
            <div className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm">
              <h5 className="font-black text-sm text-blue-600 flex items-center gap-2 mb-2">
                <Printer size={16} /> Importação via Excel
              </h5>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Faça o download da planilha modelo no botão "Adicionar em Lote". Preencha com sua equipe e importe. O sistema faz a validação e corrige pequenos erros de texto automaticamente.
              </p>
            </div>

            <div className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm border-l-4 border-l-rose-500">
              <h5 className="font-black text-sm text-gray-800 flex items-center gap-2 mb-2">
                <X size={16} className="text-rose-500" /> Deleção em Lote (Excluir Selecionados)
              </h5>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Na listagem da equipe, selecione múltiplos membros pelas caixas de seleção. Um botão de "Excluir Selecionados" aparecerá.
                Por segurança, o sistema exigirá confirmação e não permitirá a exclusão do próprio usuário logado caso seja Admin.
                <br/><br/>
                <em>Exemplo: Fim de contrato com uma equipe temporária. Selecione todos e remova em 1 clique. A interface indicará o número exato de afetados e garantirá o recálculo do dashboard.</em>
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'guest_invites',
      icon: <Send className="text-purple-500" />,
      category: 'features',
      title: 'Convites por E-mail',
      description: 'Como integrar novos colegas enviando convites seguros.',
      tags: ['convite', 'equipe', 'email', 'membro', 'cadastro'],
      content: (
        <div className="space-y-5">
          <p className="text-sm text-gray-600 px-1">Membros convidados não precisam passar pela "aprovação" manual do Admin, garantindo agilidade no acesso.</p>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="p-4 bg-white border border-gray-100 rounded-[28px] flex flex-col sm:flex-row sm:items-center gap-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500" />
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500 shrink-0"><Send size={20} /></div>
              <div>
                <h5 className="font-black text-xs text-gray-800 mb-1">Como enviar o convite?</h5>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Na aba <strong>Time</strong>, use a opção <strong>Convidar Usuário</strong>. Insira Nome e E-mail. O link de primeiro acesso chega direto na caixa de entrada do colega.
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-white border border-gray-100 rounded-[28px] flex flex-col sm:flex-row sm:items-center gap-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shrink-0"><AlertCircle size={20} /></div>
              <div>
                <h5 className="font-black text-xs text-gray-800 mb-1">Validação de E-mail Único</h5>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  O sistema agora bloqueia convites para e-mails que já existem na base (seja em sua equipe ou na de outro gestor), emitindo um alerta claro para prevenir cadastros duplicados e perda de dados.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'task_evidence',
      icon: <CheckCircle2 className="text-orange-500" />,
      category: 'features',
      title: 'Tarefas, Evidências e Histórico',
      description: 'Conclua tarefas com comprovantes anexos ou reabra pendências.',
      tags: ['tarefa', 'evidencia', 'anexo', 'concluir', 'reabrir'],
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-5 bg-orange-50 border border-orange-100 rounded-3xl">
            <CheckCircle2 className="text-orange-500 shrink-0 mt-1" />
            <div className="space-y-2">
              <h5 className="font-black text-orange-900 text-xs">Conclusão com Evidência Obrigatória</h5>
              <p className="text-[10px] text-orange-700 leading-relaxed">
                Nas tarefas, é possível exigir o upload de uma foto ou PDF (ex: atestado, comprovante de turno) na hora de marcar como feita. A tarefa não é finalizada sem o arquivo anexado.
              </p>
            </div>
          </div>

          <div className="p-5 bg-white border border-gray-100 rounded-3xl space-y-3 shadow-sm">
            <h5 className="font-black text-xs text-gray-800 flex items-center gap-2"><History size={14} className="text-gray-400" /> Como Reabrir uma Tarefa?</h5>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Errou o status da tarefa? Encontre o botão <strong>Reabrir</strong> no histórico. O sistema apagará a evidência salva nos servidores (economizando espaço e garantindo segurança) e devolverá a tarefa para a lista de "A Fazer".
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'system_logs',
      icon: <Siren className="text-rose-500" />,
      category: 'advanced',
      title: 'Auditoria e Aba Logs',
      description: 'Rastreabilidade total das ações feitas no sistema.',
      tags: ['logs', 'auditoria', 'rastreamento', 'admin', 'historico'],
      content: (
        <div className="space-y-5">
          <div className="p-5 bg-rose-50 border border-rose-100 rounded-[32px] space-y-3">
            <div className="flex items-center gap-2 text-rose-600 font-black text-[10px] uppercase tracking-widest">
              <Siren size={14} />
              Segurança e Conformidade (Apenas Admins)
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              A aba <strong>Logs</strong> funciona como uma caixa-preta. Nela, toda ação destrutiva, criação ou edição sensível é registrada. Apenas Administradores podem acessar essa aba para fim de investigação, garantindo sigilo.
            </p>
          </div>
          
          <div className="bg-gray-900 text-white p-5 rounded-[28px] space-y-3 relative overflow-hidden shadow-xl shadow-gray-900/20">
            <div className="absolute top-0 right-0 p-4 opacity-5"><Zap size={100} /></div>
            <h5 className="text-xs font-black text-rose-400 tracking-wider uppercase mb-3">Registros Armazenados</h5>
            <ul className="space-y-3 relative z-10">
              <li className="flex gap-3 items-center text-[10px] text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Exclusões em Lote ou Unitárias
              </li>
              <li className="flex gap-3 items-center text-[10px] text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Bloqueios e Aceites de Novos Usuários
              </li>
              <li className="flex gap-3 items-center text-[10px] text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Alterações de Nível de Visibilidade
              </li>
            </ul>
            <p className="text-[9px] text-gray-500 mt-4 pt-3 border-t border-gray-800">
              A trilha de logs é imutável: nenhum usuário pode apagar seu próprio rastro do sistema.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'ui_filters_printing',
      icon: <Filter className="text-sky-500" />,
      category: 'features',
      title: 'Filtros Dinâmicos e Impressão',
      description: 'Como filtrar a escala e gerar murais em PDF adaptativos.',
      tags: ['filtro', 'busca', 'impressao', 'pdf', 'mural', 'exportar'],
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-sky-50 border border-sky-100 rounded-3xl mb-4">
            <h5 className="text-sm font-black text-sky-900 mb-2 flex items-center gap-2"><Filter size={16} /> Filtros Compactos no Calendário</h5>
            <p className="text-[11px] text-sky-800 leading-relaxed">
              O módulo principal de visualização da escala agora conta com um toolbar simplificado. Você pode pesquisar rapidamente pelo Nome ou pelo Cargo do funcionário. O sistema reage em tempo real encurtando a visualização.
            </p>
          </div>

          <p className="text-sm text-gray-600 px-1">Ao preparar a impressão, configure o mural ideal:</p>
          <div className="bg-gray-50 rounded-[32px] p-6 border border-gray-100 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-sky-500" /><span className="text-[10px] font-bold">Zoom Inteligente</span></div>
              <p className="text-[9px] text-gray-400">Ajuste para caber em 1 ou 2 páginas A4.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[10px] font-bold">Modo Compacto</span></div>
              <p className="text-[9px] text-gray-400">Reduz tamanhos para listas de equipes enormes.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-900" /><span className="text-[10px] font-bold">P&B Profissional</span></div>
              <p className="text-[9px] text-gray-400">Alto contraste para impressora econômica a laser.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-pink-500" /><span className="text-[10px] font-bold">Modo Privacidade</span></div>
              <p className="text-[9px] text-gray-400">Oculta foto e detalhe extra, mantendo foco no dia a dia.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ai_assistant',
      icon: <Bot className="text-amber-500" />,
      category: 'ai',
      title: 'IA e Alertas Inteligentes',
      description: 'Como o algoritmo prevê conflitos e otimiza sua jornada.',
      tags: ['ia', 'gemini', 'conflitos', 'avisos'],
      content: (
        <div className="space-y-5">
          <div className="p-5 bg-amber-50 border border-amber-100 rounded-[32px] space-y-3">
            <div className="flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase tracking-widest">
              <Sparkles size={14} />
              Motor Analítico
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              O sistema analisa padrões contínuos para exibir alertas. Se houver falha de cobertura num plantão, um alerta pulsante aparecerá no Dashboard.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="p-4 bg-white border border-gray-100 rounded-[28px] flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500"><Siren size={20} /></div>
              <div>
                <h5 className="font-black text-xs text-gray-800">Alertas de Fadiga</h5>
                <p className="text-[10px] text-gray-400">Avisa quando membros trabalham muitos dias sem folga compensatória.</p>
              </div>
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
      description: 'Como gerenciar promoções e mudanças retroativas de regime.',
      tags: ['historico', 'promocao', 'cargo', 'mudanca', 'retroativo'],
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Mude a escala do meio do caminho sem quebrar o passado:</p>
          <div className="flex items-start gap-4 p-5 bg-indigo-50 border border-indigo-100 rounded-3xl">
            <Lightbulb className="text-indigo-500 shrink-0 mt-1" />
            <div className="space-y-2">
              <h5 className="font-black text-indigo-900 text-xs">Adição no Histórico</h5>
              <p className="text-[10px] text-indigo-700 leading-relaxed">
                Quando um colaborador muda de um regime 5x2 para 12x36, vá no perfil dele e adicione um novo registro no Histórico. A partir da <strong>data selecionada</strong>, a projeção do calendário passa a ser 12x36, mas tudo para trás daquela data permanecerá gravado na regra antiga 5x2.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'profile_management',
      icon: <Fingerprint className="text-pink-500" />,
      category: 'features',
      title: 'Perfil e Componentes de Ajuda',
      description: 'Personalize seu avatar e utilize tooltips.',
      tags: ['perfil', 'foto', 'avatar', 'nome', 'dicas'],
      content: (
        <div className="space-y-4">
          <div className="p-5 bg-pink-50 border border-pink-100 rounded-3xl space-y-3">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-full bg-pink-200 border-2 border-white shadow-sm flex items-center justify-center text-pink-600"><Users size={20} /></div>
              <p className="text-[10px] font-bold text-pink-700 uppercase tracking-widest leading-tight">Identidade Visual</p>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">No seu perfil, envie sua foto (upload de avatar). Ela se propaga imediatamente pela escala de todos. Use o botão de Logout disponível para fechar sua sessão com segurança.</p>
          </div>
          
          <div className="p-4 border border-gray-100 rounded-2xl flex items-center gap-3 bg-white">
             <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><Info size={16} /></div>
             <p className="text-[10px] text-gray-500">Ao longo de toda a plataforma, passe o mouse (ou toque) em ícones como este para exibir caixas informativas explicativas criadas para seu apoio.</p>
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
