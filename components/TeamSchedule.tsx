
import React, { useState, useMemo, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, getDay, parseISO, differenceInCalendarDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { UserConfig, Absence, WorkTurn, ThemeStyle } from '../types';
import { isWorkDay } from '../utils/shiftCalculator';
import { THEME_CONFIGS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, CloudSun, Moon, ChevronLeft, ChevronRight, Printer, X, Check, Settings2, Filter, CalendarDays, Clock, RotateCcw, ChevronDown, Umbrella, Zap, HelpCircle } from 'lucide-react';

interface TeamScheduleProps {
  activeConfig: UserConfig;
  allProfiles: UserConfig[];
  absences: Absence[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  onOpenHelp?: () => void;
}

interface PrintSettings {
  showRoles: boolean;
  showIcons: boolean;
  compactMode: boolean;
  blackAndWhite: boolean;
}

export const TeamSchedule: React.FC<TeamScheduleProps> = ({ 
  activeConfig, 
  allProfiles, 
  absences, 
  currentMonth,
  onMonthChange,
  onOpenHelp
}) => {
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isDaysMenuOpen, setIsDaysMenuOpen] = useState(false);
  const [printSettings, setPrintSettings] = useState<PrintSettings>({
    showRoles: true,
    showIcons: true,
    compactMode: false,
    blackAndWhite: false,
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const allDaysInMonth = useMemo(() => 
    eachDayOfInterval({ start: monthStart, end: monthEnd }), 
    [currentMonth]
  );

  const allRoles = useMemo(() => Array.from(new Set(allProfiles.map(p => p.role))).sort(), [allProfiles]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(allRoles);
  const [selectedTurns, setSelectedTurns] = useState<WorkTurn[]>(Object.values(WorkTurn));
  const [visibleDays, setVisibleDays] = useState<number[]>(allDaysInMonth.map(d => d.getDate()));

  useEffect(() => {
    setVisibleDays(allDaysInMonth.map(d => d.getDate()));
    setIsDaysMenuOpen(false);
  }, [allDaysInMonth]);

  const theme = THEME_CONFIGS[activeConfig.theme] || THEME_CONFIGS[ThemeStyle.MODERN];

  const toggleFilter = <T,>(list: T[], item: T, setter: (val: T[]) => void) => {
    setter(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  /**
   * Agrupamento Criativo de Férias: 
   * Transforma datas individuais em períodos legíveis para o resumo do topo.
   */
  const vacationPeriodsSummary = useMemo(() => {
    const list: { profile: UserConfig, periods: { start: string, end: string, count: number }[] }[] = [];

    allProfiles.forEach(profile => {
      const dates = [...(profile.vacationDates || [])].sort();
      if (dates.length === 0) return;

      const periods: { start: string, end: string, count: number }[] = [];
      let currentGroup: string[] = [dates[0]];

      for (let i = 1; i <= dates.length; i++) {
        const prev = parseISO(dates[i - 1]);
        const currStr = dates[i];
        const curr = currStr ? parseISO(currStr) : null;

        if (curr && differenceInCalendarDays(curr, prev) === 1) {
          currentGroup.push(currStr);
        } else {
          const startStr = currentGroup[0];
          const endStr = currentGroup[currentGroup.length - 1];
          const startD = parseISO(startStr);
          const endD = parseISO(endStr);

          // Verifica se o período tem intersecção com o mês visualizado
          const inMonth = (startD >= monthStart && startD <= monthEnd) || 
                          (endD >= monthStart && endD <= monthEnd) ||
                          (startD < monthStart && endD > monthEnd);

          if (inMonth) {
            periods.push({ start: startStr, end: endStr, count: currentGroup.length });
          }
          if (currStr) currentGroup = [currStr];
        }
      }

      if (periods.length > 0) {
        list.push({ profile, periods });
      }
    });

    return list;
  }, [allProfiles, currentMonth, monthStart, monthEnd]);

  const getWorkersByDayAndTurn = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    
    const workers = allProfiles.filter(p => 
      (isWorkDay(day, p) || (p.overtimeDates?.includes(dateStr))) && 
      !absences.some(a => a.date === dateStr && a.profileId === p.id) &&
      !(p.vacationDates?.includes(dateStr)) &&
      selectedRoles.includes(p.role) &&
      selectedTurns.includes(p.turn)
    );

    const onVacation = allProfiles.filter(p => 
      p.vacationDates?.includes(dateStr) &&
      selectedRoles.includes(p.role) &&
      selectedTurns.includes(p.turn)
    );

    return {
      [WorkTurn.MORNING]: workers.filter(w => w.turn === WorkTurn.MORNING),
      [WorkTurn.AFTERNOON]: workers.filter(w => w.turn === WorkTurn.AFTERNOON),
      [WorkTurn.NIGHT]: workers.filter(w => w.turn === WorkTurn.NIGHT),
      vacation: onVacation
    };
  };

  const getTurnStyles = (turn: WorkTurn | 'vacation' | 'overtime') => {
    switch (turn) {
      case WorkTurn.MORNING: return { icon: <Sun size={12} />, color: 'text-orange-500', bg: 'bg-orange-50' };
      case WorkTurn.AFTERNOON: return { icon: <CloudSun size={12} />, color: 'text-pink-500', bg: 'bg-pink-50' };
      case WorkTurn.NIGHT: return { icon: <Moon size={12} />, color: 'text-indigo-500', bg: 'bg-indigo-50' };
      case 'vacation': return { icon: <Umbrella size={12} />, color: 'text-sky-500', bg: 'bg-sky-50' };
      case 'overtime': return { icon: <Zap size={12} />, color: 'text-purple-500', bg: 'bg-purple-50' };
    }
  };

  const handleQuickDaySelect = (type: 'all' | 'weekdays' | 'weekends') => {
    if (type === 'all') setVisibleDays(allDaysInMonth.map(d => d.getDate()));
    else if (type === 'weekdays') setVisibleDays(allDaysInMonth.filter(d => getDay(d) !== 0 && getDay(d) !== 6).map(d => d.getDate()));
    else if (type === 'weekends') setVisibleDays(allDaysInMonth.filter(d => getDay(d) === 0 || getDay(d) === 6).map(d => d.getDate()));
  };

  const resetFilters = () => {
    setSelectedRoles(allRoles);
    setSelectedTurns(Object.values(WorkTurn));
    setVisibleDays(allDaysInMonth.map(d => d.getDate()));
  };

  const visibleDaysSummary = () => {
    if (visibleDays.length === allDaysInMonth.length) return "Todos os dias";
    if (visibleDays.length === 0) return "Nenhum dia selecionado";
    return `${visibleDays.length} dias selecionados`;
  };

  return (
    <div className="space-y-6 pb-28">
      <style>{`
        @media print {
          @page { size: A4; margin: 1cm; }
          nav, button, .no-print { display: none !important; }
          .day-container { break-inside: avoid; border-left: 1px solid #eee !important; margin-bottom: 10px !important; }
        }
      `}</style>

      <div className="flex justify-between items-center no-print px-1">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-gray-900">Equipe</h2>
          <p className="text-[10px] font-bold text-pink-500 uppercase tracking-[0.2em]">Escala Diária</p>
        </div>
        <div className="flex gap-2">
            {onOpenHelp && (
              <button onClick={onOpenHelp} className="p-2.5 bg-white text-pink-500 rounded-xl border border-gray-100 shadow-sm transition-all active:scale-90">
                  <HelpCircle size={18} />
              </button>
            )}
            <button onClick={resetFilters} className="p-2.5 bg-white text-gray-400 rounded-xl border border-gray-100 shadow-sm transition-all active:scale-90">
                <RotateCcw size={18} />
            </button>
            <button onClick={() => setIsPrintModalOpen(true)} className="p-2.5 bg-gray-900 text-white rounded-xl shadow-lg transition-all active:scale-90">
                <Printer size={18} />
            </button>
        </div>
      </div>

      <div className={`flex items-center justify-between p-3 shadow-sm no-print rounded-3xl ${theme.card}`}>
        <button onClick={() => { const d = new Date(currentMonth); d.setMonth(d.getMonth() - 1); onMonthChange(d); }} className="p-1 opacity-40 hover:opacity-100"><ChevronLeft size={18} /></button>
        <span className="font-black uppercase text-[10px] tracking-widest">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</span>
        <button onClick={() => { const d = new Date(currentMonth); d.setMonth(d.getMonth() + 1); onMonthChange(d); }} className="p-1 opacity-40 hover:opacity-100"><ChevronRight size={18} /></button>
      </div>

      {/* RESUMO DE FÉRIAS INTELIGENTE E CRIATIVO */}
      {vacationPeriodsSummary.length > 0 && (
        <div className="no-print space-y-3">
          <div className="flex items-center gap-2 px-2">
            <Umbrella size={16} className="text-sky-500" />
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resumo de Férias ({format(currentMonth, 'MMM', { locale: ptBR })})</h3>
          </div>
          <div className="flex flex-col gap-2">
            {vacationPeriodsSummary.map(({ profile, periods }) => (
              <div key={profile.id} className="bg-sky-50/50 border border-sky-100 rounded-3xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-sky-200">
                    {profile.name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-[12px] font-black text-sky-900 block">{profile.name.split(' ')[0]}</span>
                    <span className="text-[8px] font-bold text-sky-400 uppercase tracking-tighter">{profile.role}</span>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  {periods.map((p, i) => (
                    <div key={i} className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-sky-700">
                        {format(parseISO(p.start), 'dd/MM')} a {format(parseISO(p.end), 'dd/MM')}
                      </span>
                      <span className="text-[8px] bg-white px-2 py-0.5 rounded-full border border-sky-100 text-sky-400 font-bold uppercase tracking-tighter">
                        {p.count} Dias
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`space-y-4 no-print bg-white/95 backdrop-blur-md border border-pink-50 rounded-[32px] p-5 shadow-sm relative ${isDaysMenuOpen ? 'z-[90]' : 'z-20'}`}>
        <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">Cargos</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allRoles.map(role => (
                  <button
                    key={role}
                    onClick={() => toggleFilter(selectedRoles, role, setSelectedRoles)}
                    className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-wider transition-all border ${
                      selectedRoles.includes(role) ? 'bg-pink-500 border-pink-500 text-white' : 'bg-gray-50 border-gray-100 text-gray-400'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">Turnos</span>
              </div>
              <div className="flex gap-1.5">
                {Object.values(WorkTurn).map(turn => {
                  const style = getTurnStyles(turn);
                  const isActive = selectedTurns.includes(turn);
                  return (
                    <button
                      key={turn}
                      onClick={() => toggleFilter(selectedTurns, turn, setSelectedTurns)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all ${
                        isActive ? 'bg-white border-pink-500 text-gray-900 shadow-sm' : 'bg-gray-50 border-gray-100 text-gray-300'
                      }`}
                    >
                      <span className={isActive ? style.color : 'text-gray-300'}>{style.icon}</span>
                      <span className="text-[8px] font-black uppercase tracking-tighter">{turn}</span>
                    </button>
                  );
                })}
              </div>
            </div>
        </div>

        <div className="space-y-2 relative">
          <div className="flex items-center justify-between px-1">
            <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">Dias</span>
            <div className="flex gap-2">
                <button onClick={() => handleQuickDaySelect('all')} className="text-[8px] font-black text-pink-500 uppercase">Todos</button>
                <button onClick={() => handleQuickDaySelect('weekdays')} className="text-[8px] font-black text-pink-500 uppercase">Úteis</button>
            </div>
          </div>
          
          <button 
            onClick={() => setIsDaysMenuOpen(!isDaysMenuOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-left transition-all"
          >
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                {visibleDaysSummary()}
            </span>
            <ChevronDown size={14} className={`text-gray-300 transition-transform ${isDaysMenuOpen ? 'rotate-180 text-pink-500' : ''}`} />
          </button>

          <AnimatePresence>
            {isDaysMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                className="absolute top-full left-0 right-0 z-[100] mt-2 p-3 bg-white border border-pink-50 rounded-2xl shadow-xl grid grid-cols-7 gap-1"
              >
                {allDaysInMonth.map(day => {
                    const dateNum = day.getDate();
                    const isActive = visibleDays.includes(dateNum);
                    return (
                        <button
                            key={dateNum}
                            onClick={() => toggleFilter(visibleDays, dateNum, setVisibleDays)}
                            className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all border ${
                                isActive 
                                ? 'bg-pink-500 border-pink-500 text-white' 
                                : 'bg-gray-50 border-gray-50 text-gray-300'
                            }`}
                        >
                            <span className="text-[10px] font-black">{dateNum}</span>
                        </button>
                    );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="space-y-6 mt-4 relative z-0">
        {allDaysInMonth
          .filter(day => visibleDays.includes(day.getDate()))
          .map((day, idx) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const workersByTurn = getWorkersByDayAndTurn(day);
          const { morning, afternoon, night, vacation } = {
            morning: workersByTurn[WorkTurn.MORNING],
            afternoon: workersByTurn[WorkTurn.AFTERNOON],
            night: workersByTurn[WorkTurn.NIGHT],
            vacation: workersByTurn.vacation
          };
          
          const hasAnyone = morning.length > 0 || afternoon.length > 0 || night.length > 0;
          const isT = isToday(day);

          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.01 }}
              key={day.toISOString()} 
              className="relative pl-6 border-l border-pink-100 day-container"
            >
              <div className={`absolute -left-[4.5px] top-0 w-2 h-2 rounded-full border border-white shadow-sm no-print ${isT ? 'bg-pink-500 scale-150' : 'bg-pink-100'}`} />
              
              <div className="mb-2">
                <h3 className={`text-sm font-black flex items-center gap-2 ${isT ? 'text-pink-600' : 'text-gray-700'}`}>
                  {format(day, 'dd')} <span className="text-[10px] opacity-40 uppercase font-bold tracking-widest">{format(day, 'EEE', { locale: ptBR })}</span>
                  {isT && <span className="text-[8px] bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded-full uppercase ml-1">Hoje</span>}
                </h3>
              </div>

              {!hasAnyone && vacation.length === 0 ? (
                <div className="py-2 opacity-20 text-[8px] font-black uppercase tracking-widest">---</div>
              ) : (
                <div className="space-y-3">
                  {[WorkTurn.MORNING, WorkTurn.AFTERNOON, WorkTurn.NIGHT].map(turn => {
                    const workers = workersByTurn[turn as WorkTurn];
                    if (workers.length === 0) return null;
                    const style = getTurnStyles(turn as WorkTurn);

                    return (
                      <div key={turn} className="flex flex-wrap gap-1.5 items-center">
                        <div className={`flex items-center gap-1 min-w-[50px] ${style.color}`}>
                          {style.icon}
                          <span className="text-[7px] font-black uppercase tracking-tighter opacity-70">{turn.slice(0, 1)}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 flex-1">
                          {workers.map(w => {
                            const isExtra = w.overtimeDates?.includes(dateStr);
                            return (
                              <div key={w.id} className={`flex items-center gap-2 rounded-full bg-white border border-gray-100 shadow-sm px-2.5 py-1.5 ${w.id === activeConfig.id ? 'border-pink-200 ring-1 ring-pink-500/10' : ''} ${isExtra ? 'border-purple-200' : ''}`}>
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center font-black text-[7px] border no-print ${w.id === activeConfig.id ? (isExtra ? 'bg-purple-600 border-purple-400 text-white' : 'bg-pink-500 border-pink-400 text-white') : 'bg-gray-100 border-gray-200 text-gray-400'}`}>{w.name.charAt(0)}</div>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-bold text-gray-700 leading-none">{w.name.split(' ')[0]}</span>
                                    {isExtra && <Zap size={8} className="text-purple-500 fill-purple-500" />}
                                  </div>
                                  <span className="text-[7px] font-black text-pink-400 uppercase tracking-tighter mt-0.5">{w.role.slice(0, 12)}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {vacation.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 items-center pt-1 border-t border-sky-50 opacity-60">
                        <div className={`flex items-center gap-1 min-w-[50px] text-sky-400`}>
                          <Umbrella size={10} />
                          <span className="text-[6px] font-black uppercase tracking-tighter">FER</span>
                        </div>
                        <div className="flex flex-wrap gap-1 flex-1">
                          {vacation.map(w => (
                            <div key={w.id} className="px-2 py-0.5 rounded-full bg-sky-50/50 border border-sky-100 text-[8px] font-bold text-sky-400 uppercase">
                              {w.name.split(' ')[0]}
                            </div>
                          ))}
                        </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {isPrintModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/30 backdrop-blur-[2px]">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white w-full max-w-xs rounded-3xl shadow-2xl p-6">
              <h3 className="text-sm font-black uppercase mb-4 text-center">Configurar Impressão</h3>
              <div className="space-y-2 mb-6">
                {['showRoles', 'compactMode', 'blackAndWhite'].map(opt => (
                  <button key={opt} onClick={() => setPrintSettings(p => ({...p, [opt]: !p[opt as keyof PrintSettings]}))} className="w-full flex justify-between p-3 rounded-xl bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    {opt === 'showRoles' ? 'Exibir Cargos' : opt === 'compactMode' ? 'Modo Compacto' : 'Preto e Branco'}
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${printSettings[opt as keyof PrintSettings] ? 'bg-pink-500 border-pink-500 text-white' : 'bg-white border-gray-200'}`}>
                      {printSettings[opt as keyof PrintSettings] && <Check size={10} strokeWidth={4} />}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsPrintModalOpen(false)} className="flex-1 py-3 text-[9px] font-black text-gray-400 uppercase">Cancelar</button>
                <button onClick={() => { setIsPrintModalOpen(false); setTimeout(() => window.print(), 300); }} className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95">Imprimir</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
