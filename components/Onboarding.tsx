
import React, { useState, useMemo } from 'react';
import { ShiftType, WorkTurn, UserConfig, ThemeStyle } from '../types';
import { THEME_CONFIGS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, User, Calendar, Clock, ShieldCheck, AlertCircle, Sun, CloudSun, Moon, Briefcase, Sparkles } from 'lucide-react';

interface OnboardingProps {
  onComplete: (config: UserConfig) => void;
  onCancel?: () => void;
  isAddingExtra?: boolean;
  existingRoles?: string[];
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onCancel, isAddingExtra, existingRoles = [] }) => {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<Partial<UserConfig>>({
    id: Math.random().toString(36).substring(2, 9),
    name: '',
    role: '',
    shiftType: ShiftType.FIVE_TWO,
    turn: WorkTurn.MORNING,
    startDate: new Date().toISOString().split('T')[0],
    offDays: [0],
    rotatingWorkDays: 5,
    rotatingOffDays: 1,
    state: 'SP',
    city: 'São Paulo',
    theme: ThemeStyle.MODERN
  });

  const next = () => setStep((s: number) => s + 1);
  const prev = () => setStep((s: number) => Math.max(1, s - 1));

  const toggleOffDay = (day: number) => {
    const current = config.offDays || [];
    if (current.includes(day)) {
      setConfig({ ...config, offDays: current.filter((d: number) => d !== day) });
    } else {
      setConfig({ ...config, offDays: [...current, day] });
    }
  };

  const steps = [
    {
      icon: <User className="w-8 h-8 text-emerald-500" />,
      title: "Identificação",
      content: (
        <div className="space-y-4 px-2">
          <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Como podemos te chamar?</p>
          <input
            autoFocus
            className="w-full p-3 sm:p-4 text-xl sm:text-2xl font-black border-b-4 border-emerald-500 outline-none bg-transparent text-center text-gray-900 placeholder:opacity-30"
            placeholder="Seu Nome"
            value={config.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, name: e.target.value })}
          />
        </div>
      )
    },
    {
      icon: <Briefcase className="w-8 h-8 text-purple-500" />,
      title: "Cargo / Função",
      content: (
        <div className="space-y-6 px-2">
          <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Qual sua função na equipe?</p>
          <input
            autoFocus
            className="w-full p-3 sm:p-4 text-xl sm:text-2xl font-black border-b-4 border-purple-500 outline-none bg-transparent text-center text-gray-900 placeholder:opacity-30"
            placeholder="Ex: Operador, Mecânico..."
            value={config.role}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, role: e.target.value })}
            list="roles-list-onboarding"
          />
          <datalist id="roles-list-onboarding">
            {existingRoles.map(role => (
              <option key={role} value={role} />
            ))}
          </datalist>

          <AnimatePresence>
            {existingRoles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2 justify-center">
                  <Sparkles size={12} className="text-purple-400" />
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sugestões Recentes</span>
                </div>
                <div className="flex flex-wrap justify-center gap-2 overflow-x-auto no-scrollbar pb-2">
                  {existingRoles.map((role) => (
                    <motion.button
                      key={role}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setConfig({ ...config, role })}
                      className={`px-4 py-2 rounded-full text-[10px] font-bold border transition-all whitespace-nowrap ${config.role === role
                        ? 'bg-purple-500 border-purple-600 text-white shadow-md'
                        : 'bg-purple-50 border-purple-100 text-purple-600 hover:bg-purple-100'
                        }`}
                    >
                      {role}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )
    },
    {
      icon: <Calendar className="w-8 h-8 text-blue-500" />,
      title: "Escala de Trabalho",
      content: (
        <div className="grid grid-cols-1 gap-2 max-h-[45vh] overflow-y-auto no-scrollbar pr-1 px-1">
          {Object.values(ShiftType).map(type => (
            <button
              key={type}
              onClick={() => setConfig({ ...config, shiftType: type })}
              className={`p-3 sm:p-4 rounded-2xl text-left border-2 transition-all ${config.shiftType === type ? 'border-blue-500 bg-blue-50 text-blue-700 ring-4 ring-blue-500/10' : 'border-gray-100 hover:border-blue-200 text-gray-700'}`}
            >
              <div className="flex justify-between items-center">
                <div className="font-black text-base sm:text-lg">{type}</div>
                {(type === ShiftType.FIVE_TWO || type === ShiftType.SIX_ONE) && <ShieldCheck size={14} className="text-emerald-500" />}
              </div>
              <div className="text-[10px] font-bold opacity-60 uppercase tracking-tighter mt-1">
                {type === ShiftType.FIVE_TWO && 'Segunda a Sexta fixa (Padrão CLT)'}
                {type === ShiftType.SIX_ONE && 'Segunda a Sábado fixa (Padrão CLT)'}
                {type === ShiftType.TWELVE_THIRTY_SIX && '12h trabalho / 36h descanso'}
                {type === ShiftType.ROTATING && 'Ciclos como 5x1, 4x2 (Revezamento)'}
                {type === ShiftType.FLEXIBLE && 'Você define suas folgas fixas'}
              </div>
            </button>
          ))}
        </div>
      )
    },
    {
      icon: <Clock className="w-8 h-8 text-orange-500" />,
      title: "Turno de Trabalho",
      content: (
        <div className="grid grid-cols-1 gap-3">
          {[
            { id: WorkTurn.MORNING, label: 'Manhã', icon: <Sun size={24} />, desc: 'Geralmente 06:00 às 14:00' },
            { id: WorkTurn.AFTERNOON, label: 'Tarde', icon: <CloudSun size={24} />, desc: 'Geralmente 14:00 às 22:00' },
            { id: WorkTurn.NIGHT, label: 'Noite', icon: <Moon size={24} />, desc: 'Geralmente 22:00 às 06:00' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setConfig({ ...config, turn: t.id as WorkTurn })}
              className={`p-3 sm:p-4 rounded-2xl flex items-center gap-3 sm:gap-4 border-2 transition-all ${config.turn === t.id ? 'border-orange-500 bg-orange-50 text-orange-700 ring-4 ring-orange-500/10' : 'border-gray-100 hover:border-orange-200 text-gray-700'}`}
            >
              <div className={config.turn === t.id ? 'text-orange-500' : 'text-gray-300'}>
                {React.cloneElement(t.icon as React.ReactElement, { size: 20 })}
              </div>
              <div className="text-left">
                <div className="font-black text-base sm:text-lg">{t.label}</div>
                <div className="text-[10px] font-bold opacity-60 uppercase">{t.desc}</div>
              </div>
            </button>
          ))}
        </div>
      )
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-indigo-500" />,
      title: "Ajustes Legais",
      content: (
        <div className="space-y-6">
          {config.shiftType === ShiftType.ROTATING ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-center">
                  <label className="text-[10px] font-black opacity-40 uppercase">Dias Trabalho</label>
                  <input type="number" className="w-full p-3 sm:p-4 rounded-2xl border-2 border-indigo-100 text-center font-black bg-white text-gray-900" value={config.rotatingWorkDays} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, rotatingWorkDays: Math.max(1, parseInt(e.target.value)) })} />
                </div>
                <div className="space-y-2 text-center">
                  <label className="text-[10px] font-black opacity-40 uppercase">Dias Folga</label>
                  <input type="number" className="w-full p-3 sm:p-4 rounded-2xl border-2 border-indigo-100 text-center font-black bg-white text-gray-900" value={config.rotatingOffDays} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, rotatingOffDays: Math.max(1, parseInt(e.target.value)) })} />
                </div>
              </div>
              {(config.rotatingWorkDays || 0) > 6 && (
                <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl text-red-600 border border-red-100">
                  <AlertCircle size={14} className="mt-1 flex-shrink-0" />
                  <p className="text-[9px] font-bold">Atenção: A lei brasileira exige folga após no máximo 6 dias de trabalho consecutivo.</p>
                </div>
              )}
            </div>
          ) : config.shiftType === ShiftType.FLEXIBLE ? (
            <div className="space-y-4">
              <p className="text-[10px] font-black opacity-40 uppercase text-center">Selecione seus dias de FOLGA fixa</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'].map((d, i) => (
                  <button
                    key={i}
                    onClick={() => toggleOffDay(i)}
                    className={`w-12 h-12 rounded-2xl font-black text-[10px] border-2 transition-all ${config.offDays?.includes(i) ? 'bg-red-500 border-red-600 text-white shadow-lg' : 'border-gray-100 text-gray-400'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 bg-emerald-50 rounded-3xl text-center space-y-2">
              <ShieldCheck className="mx-auto text-emerald-500" size={32} />
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Escala Padrão CLT</p>
              <p className="text-[10px] opacity-60">Sua jornada de trabalho está automaticamente configurada conforme a legislação vigente.</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black opacity-40 uppercase block text-center">Início do Ciclo Atual</label>
            <input
              type="date"
              className="w-full p-3 sm:p-4 rounded-2xl border-2 border-indigo-100 text-center font-bold bg-white text-gray-900 outline-none focus:border-indigo-500 transition-all [color-scheme:light]"
              style={{ colorScheme: 'light' }}
              value={config.startDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, startDate: e.target.value })}
            />
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[step - 1];

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="min-h-full flex flex-col items-center justify-center p-4 sm:p-8">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md space-y-6"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-4 sm:p-5 bg-gray-50 rounded-[24px] sm:rounded-[30px] shadow-inner text-gray-500">
                {currentStepData.icon}
              </div>
              <h1 className="text-[10px] sm:text-xs font-black tracking-[0.2em] sm:tracking-[0.3em] text-gray-400 uppercase">
                {currentStepData.title}
              </h1>
            </div>

            <div className="py-2">
              {currentStepData.content}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="p-4 sm:p-6 bg-white border-t border-gray-50 safe-area-bottom">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step > 1 ? (
              <button
                onClick={prev}
                className="p-2 text-gray-300 hover:text-gray-600 transition-colors"
                aria-label="Voltar"
              >
                <ArrowLeft size={22} />
              </button>
            ) : isAddingExtra && (
              <button
                onClick={onCancel}
                className="px-2 py-2 text-red-400 font-black uppercase text-[9px] tracking-widest"
              >
                Cancelar
              </button>
            )}
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all ${i < step ? 'w-4 sm:w-6 bg-pink-500' : 'w-1.5 bg-gray-100'}`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={() => step === steps.length ? onComplete(config as UserConfig) : next()}
            disabled={(step === 1 && !config.name) || (step === 2 && !config.role)}
            className="flex items-center gap-1.5 px-6 sm:px-8 py-3.5 bg-gray-900 text-white rounded-full font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl disabled:opacity-20 transition-all hover:scale-105 active:scale-95"
          >
            {step === steps.length ? 'Pronto' : 'Avançar'}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
