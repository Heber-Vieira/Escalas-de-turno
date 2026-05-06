import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy' | null;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen || !type) return null;

  const content = {
    terms: {
      icon: <FileText className="text-violet-500" size={28} />,
      title: 'Termos de Serviço',
      gradient: 'from-violet-500 to-fuchsia-600',
      sections: [
        {
          title: '1. Aceitação dos Termos',
          body: 'Ao acessar e utilizar o Escala Fácil, você concorda em cumprir e ficar vinculado a estes Termos de Serviço. Se você não concorda com qualquer parte destes termos, não deve utilizar nossos serviços.'
        },
        {
          title: '2. Uso do Sistema',
          body: 'O sistema é fornecido para o gerenciamento de escalas e equipes. Você é responsável por manter a confidencialidade de sua conta e senha, e por todas as atividades que ocorram sob sua conta.'
        },
        {
          title: '3. Níveis de Acesso e Responsabilidade',
          body: 'Administradores têm acesso a dados sensíveis da equipe e auditorias de sistema. É estritamente proibido o compartilhamento de credenciais de administrador ou o uso indevido de informações de terceiros.'
        },
        {
          title: '4. Disponibilidade do Serviço',
          body: 'Nós nos esforçamos para garantir 99.9% de uptime, mas o serviço é fornecido "como está". Não nos responsabilizamos por perdas de dados decorrentes de falhas de conexão ou uso indevido.'
        },
        {
          title: '5. Modificações',
          body: 'Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações significativas serão notificadas através do painel principal do sistema.'
        }
      ]
    },
    privacy: {
      icon: <ShieldCheck className="text-emerald-500" size={28} />,
      title: 'Política de Privacidade',
      gradient: 'from-emerald-500 to-teal-600',
      sections: [
        {
          title: '1. Coleta de Dados',
          body: 'Coletamos informações necessárias para o funcionamento da plataforma, incluindo nome, endereço de e-mail, foto de perfil, histórico de cargos e registros de turnos de trabalho.'
        },
        {
          title: '2. Uso das Informações',
          body: 'Seus dados são utilizados exclusivamente para o gerenciamento da sua escala, cálculo de conflitos pela nossa IA e auditoria de segurança interna. Não vendemos seus dados a terceiros.'
        },
        {
          title: '3. Inteligência Artificial e Gemini',
          body: 'Os dados de turnos e ausências podem ser processados anonimamente por motores de Inteligência Artificial (como o Google Gemini) com o único fim de prever conflitos e otimizar escalas. Nenhuma informação pessoal identificável é usada para treinar modelos públicos.'
        },
        {
          title: '4. Segurança e Armazenamento',
          body: 'Utilizamos criptografia de ponta a ponta e provedores de infraestrutura seguros para proteger suas informações contra acessos não autorizados.'
        },
        {
          title: '5. Seus Direitos',
          body: 'Você tem o direito de solicitar a exclusão total da sua conta e dados associados a qualquer momento, contatando um Administrador do seu ambiente de trabalho ou nosso suporte.'
        }
      ]
    }
  };

  const currentContent = content[type];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[#0a0a0f] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/5 backdrop-blur-md relative z-10">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${currentContent.gradient} rounded-2xl flex items-center justify-center shadow-lg bg-opacity-20 backdrop-blur-md border border-white/20 rotate-3`}>
                <div className="bg-white/90 w-10 h-10 rounded-xl flex items-center justify-center -rotate-3">
                  {currentContent.icon}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-wider">{currentContent.title}</h2>
                <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase mt-1">Atualizado em 06/05/2026</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-all active:scale-90"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 no-scrollbar relative">
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-gradient-to-b ${currentContent.gradient} opacity-[0.03] blur-[60px] pointer-events-none`} />
            
            <div className="space-y-6 relative z-10">
              {currentContent.sections.map((section, idx) => (
                <div key={idx} className="space-y-2 group">
                  <h3 className="text-sm font-black text-white flex items-center gap-2 group-hover:text-pink-400 transition-colors">
                    <CheckCircle2 size={14} className="text-gray-600 group-hover:text-pink-500 transition-colors" />
                    {section.title}
                  </h3>
                  <p className="text-[12px] leading-relaxed text-gray-400 pl-6 text-justify">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-5 bg-white/5 border border-white/10 rounded-3xl text-center space-y-2 relative z-10">
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Dúvidas Frequentes?</p>
               <p className="text-xs text-gray-400">Entre em contato com nossa equipe de suporte através de <span className="text-white font-medium cursor-pointer hover:underline">suporte@escalafacil.com.br</span></p>
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-6 bg-white/5 border-t border-white/5 shrink-0 flex justify-end backdrop-blur-md">
            <button
              onClick={onClose}
              className={`px-8 py-3 bg-gradient-to-r ${currentContent.gradient} text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all hover:opacity-90`}
            >
              Compreendi e Concordo
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
