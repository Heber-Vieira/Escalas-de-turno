
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths, isSameDay, isWithinInterval, parseISO, getDay, addDays, differenceInDays, startOfDay, parse, isBefore, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { UserConfig, Holiday, Absence, ThemeStyle, ShiftType, WorkTurn } from '../types';
import { isWorkDay } from '../utils/shiftCalculator';
import { NATIONAL_HOLIDAYS, STATE_HOLIDAYS, THEME_CONFIGS } from '../constants';
import { ChevronLeft, ChevronRight, Palette, Settings, Eye, EyeOff, ShieldCheck, Clock, Umbrella, Calendar as CalendarIcon, ArrowRight, X, Zap, AlertCircle, Info, CheckCircle2, AlertTriangle, Users2, Briefcase, FileWarning, Sun, Moon, CloudSun, Sparkles, LayoutGrid, Check, Users, Undo2, Ban, HelpCircle, Flame, Siren, Footprints, Coffee, RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSmartAlert } from '../services/geminiService';

interface DashboardProps {
  config: UserConfig;
  allProfiles: UserConfig[];
  absences: Absence[];
  onAddAbsence: (absence: Partial<Absence>) => void;
  onRemoveAbsence: (id: string) => void;
  onUpdateConfig: (config: UserConfig) => void;
  onUpdateTheme: (theme: ThemeStyle) => void;
  globalTheme: ThemeStyle;
  openSettings: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  config,
  allProfiles,
  absences,
  onAddAbsence,
  onRemoveAbsence,
  onUpdateConfig,
  onUpdateTheme,
  globalTheme,
  openSettings
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [smartAlert, setSmartAlert] = useState<string | null>(null);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [isTeamView, setIsTeamView] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isStreakInfoOpen, setIsStreakInfoOpen] = useState(false);
  const [showCLTViolationAlert, setShowCLTViolationAlert] = useState(false);
  const [lastAlertedStreak, setLastAlertedStreak] = useState(0);

  const vacationStartRef = useRef<HTMLInputElement>(null);

  const [isVacationModalOpen, setIsVacationModalOpen] = useState(false);
  const [vacationStart, setVacationStart] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedDuration, setSelectedDuration] = useState<number>(10);

  const theme = (THEME_CONFIGS as Record<ThemeStyle, any>)[globalTheme] || THEME_CONFIGS[ThemeStyle.MODERN];
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfMonth = getDay(monthStart);
  const spacers = Array.from({ length: firstDayOfMonth });

  const getHolidayForDate = (date: Date): Holiday | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const national = NATIONAL_HOLIDAYS.find(h => h.date === dateStr);
    if (national) return national as Holiday;
    const stateHols = STATE_HOLIDAYS[config.state] || [];
    const state = stateHols.find(h => h.date === dateStr);
    if (state) return { ...state, type: 'Estadual' } as Holiday;
    return undefined;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchAlert = async () => {
        setIsAlertVisible(false);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const workTomorrow = isWorkDay(tomorrow, config) || isDayOvertime(tomorrow);
        const holidayTomorrow = !!getHolidayForDate(tomorrow);

        const msg = await getSmartAlert(config.name, config.shiftType, workTomorrow, holidayTomorrow);
        setSmartAlert(msg);
        setIsAlertVisible(true);
      };
      fetchAlert();
    }, 500);

    return () => clearTimeout(timer);
  }, [config.id, config.shiftType, config.startDate, config.name, config.state, config.overtimeDates]);

  const isDayAbsence = (date: Date, profileId: string = config.id) => {
    const profile = allProfiles.find((p: UserConfig) => p.id === profileId) || config;
    const start = startOfDay(parse(profile.startDate, 'yyyy-MM-dd', new Date()));
    if (isBefore(startOfDay(date), start)) return false;

    const dateStr = format(date, 'yyyy-MM-dd');
    return absences.some((a: Absence) => a.date === dateStr && a.profileId === profileId);
  };

  const isDayVacation = (date: Date, userConfig: UserConfig = config) => {
    const start = startOfDay(parse(userConfig.startDate, 'yyyy-MM-dd', new Date()));
    if (isBefore(startOfDay(date), start)) return false;

    const dateStr = format(date, 'yyyy-MM-dd');
    return userConfig.vacationDates?.includes(dateStr) || false;
  };

  const isDayOvertime = (date: Date, userConfig: UserConfig = config) => {
    const start = startOfDay(parse(userConfig.startDate, 'yyyy-MM-dd', new Date()));
    if (isBefore(startOfDay(date), start)) return false;

    const dateStr = format(date, 'yyyy-MM-dd');
    return userConfig.overtimeDates?.includes(dateStr) || false;
  };

  const getWhoWorksOn = (date: Date) => {
    return allProfiles.filter((p: UserConfig) => (isWorkDay(date, p) || isDayOvertime(date, p)) && !isDayAbsence(date, p.id) && !isDayVacation(date, p));
  };

  const teamStats = useMemo(() => {
    const working = getWhoWorksOn(selectedDate);

    const byTurn: Record<WorkTurn, { active: number, total: number }> = {
      [WorkTurn.MORNING]: { active: 0, total: 0 },
      [WorkTurn.AFTERNOON]: { active: 0, total: 0 },
      [WorkTurn.NIGHT]: { active: 0, total: 0 }
    };

    const byRole: Record<string, { active: number, total: number, workers: UserConfig[] }> = {};

    allProfiles.forEach((p: UserConfig) => {
      byTurn[p.turn].total++;
      if (!byRole[p.role]) byRole[p.role] = { active: 0, total: 0, workers: [] };
      byRole[p.role].total++;

      const isActive = working.find((w: UserConfig) => w.id === p.id);
      if (isActive) {
        byTurn[p.turn].active++;
        byRole[p.role].active++;
        byRole[p.role].workers.push(isActive);
      }
    });

    const totalActive = working.length;
    const totalTeam = allProfiles.length;
    const globalPercent = totalTeam > 0 ? Math.round((totalActive / totalTeam) * 100) : 0;

    return { byTurn, byRole, globalPercent, totalActive, totalTeam };
  }, [selectedDate, allProfiles, absences]);

  const toggleVacation = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const currentVacations = config.vacationDates || [];

    if (!currentVacations.includes(dateStr)) return;

    let periodToRemove = [dateStr];
    let next = addDays(date, 1);
    while (currentVacations.includes(format(next, 'yyyy-MM-dd'))) {
      periodToRemove.push(format(next, 'yyyy-MM-dd'));
      next = addDays(next, 1);
    }
    let prev = addDays(date, -1);
    while (currentVacations.includes(format(prev, 'yyyy-MM-dd'))) {
      periodToRemove.push(format(prev, 'yyyy-MM-dd'));
      prev = addDays(prev, -1);
    }

    const newVacations = currentVacations.filter((d: string) => !periodToRemove.includes(d));
    const newOvertime = (config.overtimeDates || []).filter((d: string) => !periodToRemove.includes(d));
    onUpdateConfig({ ...config, vacationDates: newVacations, overtimeDates: newOvertime });
  };

  const toggleOvertime = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const currentOvertime = config.overtimeDates || [];
    let newOvertime;
    if (currentOvertime.includes(dateStr)) {
      newOvertime = currentOvertime.filter((d: string) => d !== dateStr);
    } else {
      newOvertime = [...currentOvertime, dateStr];
    }
    onUpdateConfig({ ...config, overtimeDates: newOvertime });
  };

  const isVacationStartValid = () => {
    if (!vacationStart) return false;
    const startDate = parseISO(vacationStart);
    if (!isValid(startDate)) return false;
    return isWorkDay(startDate, config);
  };

  const getVacationEndDate = () => {
    if (!vacationStart) return new Date();
    const start = parseISO(vacationStart);
    if (!isValid(start)) return new Date();
    return addDays(start, selectedDuration - 1);
  };

  const vacationOverlap = useMemo(() => {
    if (!vacationStart) return false;
    try {
      const start = parseISO(vacationStart);
      if (!isValid(start)) return false;
      const end = addDays(start, selectedDuration - 1);
      const interval = eachDayOfInterval({ start, end });
      const currentVacations = config.vacationDates || [];
      return interval.some((d: Date) => currentVacations.includes(format(d, 'yyyy-MM-dd')));
    } catch { return false; }
  }, [vacationStart, selectedDuration, config.vacationDates]);

  const absenceOverlap = useMemo(() => {
    if (!vacationStart) return false;
    try {
      const start = parseISO(vacationStart);
      if (!isValid(start)) return false;
      const end = addDays(start, selectedDuration - 1);
      const interval = eachDayOfInterval({ start, end });
      const profileAbsences = absences.filter((a: Absence) => a.profileId === config.id).map((a: Absence) => a.date);
      return interval.some((d: Date) => profileAbsences.includes(format(d, 'yyyy-MM-dd')));
    } catch { return false; }
  }, [vacationStart, selectedDuration, absences, config.id]);

  const teamVacationConflict = useMemo(() => {
    if (!vacationStart || !isVacationModalOpen) return null;
    try {
      const start = parseISO(vacationStart);
      if (!isValid(start)) return null;
      const end = getVacationEndDate();
      const interval = eachDayOfInterval({ start, end });
      const intervalStr = interval.map(d => format(d, 'yyyy-MM-dd'));

      const peers = allProfiles.filter((p: UserConfig) => p.id !== config.id && p.role === config.role);

      const conflicts: { profile: UserConfig, dates: string[] }[] = [];

      peers.forEach((peer: UserConfig) => {
        const peerVacations = peer.vacationDates || [];
        const commonDates = intervalStr.filter(d => peerVacations.includes(d));
        if (commonDates.length > 0) {
          conflicts.push({ profile: peer, dates: commonDates });
        }
      });

      return conflicts.length > 0 ? conflicts : null;
    } catch { return null; }
  }, [vacationStart, selectedDuration, allProfiles, config.id, config.role, isVacationModalOpen]);

  // Função central para determinar se o salvamento está bloqueado por conflito pessoal
  const hasPersonalConflict = useMemo(() => {
    return vacationOverlap || absenceOverlap || !isVacationStartValid();
  }, [vacationOverlap, absenceOverlap, vacationStart]);

  const handleConfirmVacationPeriod = () => {
    if (!vacationStart || hasPersonalConflict) return;
    const start = parseISO(vacationStart);
    if (!isValid(start)) return;

    const end = getVacationEndDate();
    const interval = eachDayOfInterval({ start, end });
    const newDateStrings = interval.map(d => format(d, 'yyyy-MM-dd'));

    // Mesclagem simples sem remover registros antigos (exceto se o usuário for desabilitar essa trava no futuro)
    const currentVacations = config.vacationDates || [];
    const mergedVacations = Array.from(new Set([...currentVacations, ...newDateStrings]));

    onUpdateConfig({
      ...config,
      vacationDates: mergedVacations
    });

    setIsVacationModalOpen(false);
  };

  const openVacationModal = () => {
    let suggestStart = selectedDate;
    if (!isWorkDay(suggestStart, config)) {
      for (let i = 1; i <= 7; i++) {
        const next = addDays(selectedDate, i);
        if (isWorkDay(next, config)) {
          suggestStart = next;
          break;
        }
      }
    }
    setVacationStart(format(suggestStart, 'yyyy-MM-dd'));
    setSelectedDuration(10);
    setIsVacationModalOpen(true);
  };

  const getAbsenceForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return absences.find((a: Absence) => a.date === dateStr && a.profileId === config.id);
  };

  const workDaysInMonth = days.filter(d => isWorkDay(d, config) || isDayOvertime(d)).length;
  const monthAbsencesCount = absences.filter((a: Absence) => {
    const d = parseISO(a.date);
    return a.profileId === config.id && isWithinInterval(d, { start: monthStart, end: monthEnd });
  }).length;
  const presenceRate = workDaysInMonth > 0 ? Math.round(((workDaysInMonth - monthAbsencesCount) / workDaysInMonth) * 100) : 100;

  const streakData = useMemo(() => {
    let streak = 0;
    let streakDates: string[] = [];
    let checkDate = startOfDay(selectedDate);
    const profileStart = startOfDay(parse(config.startDate, 'yyyy-MM-dd', new Date()));

    if (isBefore(checkDate, profileStart)) return { count: 0, dates: [] };

    while (true) {
      const isWork = isWorkDay(checkDate, config) || isDayOvertime(checkDate, config);
      const hasAbsence = isDayAbsence(checkDate);
      const hasVacation = isDayVacation(checkDate, config);

      if (isWork && !hasAbsence && !hasVacation) {
        streak++;
        streakDates.push(format(checkDate, 'dd/MM'));
      } else {
        break;
      }

      checkDate = addDays(checkDate, -1);
      if (isBefore(checkDate, profileStart) || streak >= 365) break;
    }
    return { count: streak, dates: streakDates.reverse() };
  }, [selectedDate, config, absences]);

  const currentStreak = streakData.count;

  useEffect(() => {
    if (currentStreak > 6 && currentStreak !== lastAlertedStreak) {
      setShowCLTViolationAlert(true);
      setLastAlertedStreak(currentStreak);
    }
  }, [currentStreak, lastAlertedStreak]);

  const getStreakMessage = (count: number) => {
    if (count === 0) return "Momento de pausa! O motor está desligado para recarregar as baterias.";
    if (count === 1) return "Ignição! O primeiro passo de uma nova sequência acaba de ser dado.";
    if (count === 2) return "Ritmo em formação! As engrenagens estão começando a sincronizar.";
    if (count === 3) return "Fluxo constante! Você já superou a barreira da inércia inicial.";
    if (count === 4) return "Zona de foco! Seu cérebro já está operando no modo automático de produtividade.";
    if (count === 5) return "Reta final de ciclo! O horizonte do descanso começa a brilhar ao longe.";
    if (count === 6) return "Pico de eficiência! Você atingiu o limite saudável da jornada convencional.";
    return "Máquina de produtividade! Cuidado com o superaquecimento; a lei exige sua manutenção (DSR).";
  };

  const handleThemeChange = (styleName: ThemeStyle) => {
    onUpdateTheme(styleName);
    setIsThemeMenuOpen(false);
  };

  const getTurnIcon = (turn: WorkTurn) => {
    switch (turn) {
      case WorkTurn.MORNING: return <Sun size={8} className="text-orange-400" />;
      case WorkTurn.AFTERNOON: return <CloudSun size={8} className="text-pink-400" />;
      case WorkTurn.NIGHT: return <Moon size={8} className="text-indigo-400" />;
    }
  };

  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const triggerPicker = (ref: React.RefObject<HTMLInputElement | null>) => {
    if (ref.current) {
      if ('showPicker' in HTMLInputElement.prototype) {
        try { (ref.current as any).showPicker(); } catch (e: any) { ref.current.focus(); }
      } else { ref.current.focus(); }
    }
  };

  const isSavingBlocked = !vacationStart || !isValid(parseISO(vacationStart)) || hasPersonalConflict;

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <button onClick={openSettings} className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-full bg-pink-500 text-white flex items-center justify-center font-black text-sm border-2 border-pink-100 shadow-sm transition-transform active:scale-95">
              {config.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-800 leading-tight">{config.name.split(' ')[0]}</h2>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-black uppercase text-pink-500 leading-tight tracking-widest">{config.shiftType}</span>
                <span className="w-1 h-1 rounded-full bg-gray-200" />
                <span className="text-[8px] font-black uppercase text-gray-400 leading-tight tracking-widest">{config.turn}</span>
              </div>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className={`p-2 rounded-full border transition-all ${isThemeMenuOpen ? 'bg-pink-500 border-pink-400 text-white shadow-md' : 'bg-white border-gray-100 text-gray-400'}`}
            >
              <Palette size={18} />
            </button>
            <button onClick={() => setIsTeamView(!isTeamView)} className={`p-2 rounded-full border transition-all ${isTeamView ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-white border-gray-100 text-gray-400'}`}>
              {isTeamView ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <button onClick={openSettings} className="p-2 bg-white border border-gray-100 rounded-full shadow-sm active:scale-90 transition-transform"><Settings className="text-pink-500 w-4.5 h-4.5" /></button>
          </div>
        </div>

        <AnimatePresence>
          {isThemeMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-[60] bg-white border border-pink-100 p-2.5 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex gap-2.5 overflow-x-auto no-scrollbar w-max max-w-[calc(100vw-32px)]"
            >
              {(Object.entries(THEME_CONFIGS) as [ThemeStyle, any][]).map(([styleName, styleConfig]) => (
                <button
                  key={styleName}
                  onClick={() => handleThemeChange(styleName)}
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all border-2 ${globalTheme === styleName ? 'border-pink-500 bg-pink-50 scale-110' : 'border-gray-50 bg-gray-50/50 grayscale hover:grayscale-0'}`}
                  title={styleName}
                >
                  {styleConfig.icon}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {isAlertVisible && smartAlert && (
          <motion.div
            key={smartAlert}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl border-l-4 border-pink-500 bg-white shadow-sm flex items-center gap-2 sm:gap-3`}
          >
            <div className="bg-pink-50 p-1.5 sm:p-2 rounded-xl text-pink-500">
              <Clock size={14} className="sm:size-16" />
            </div>
            <p className="text-[10px] sm:text-[11px] font-bold text-gray-700 leading-tight flex-1">{smartAlert}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`p-3.5 sm:p-5 shadow-sm rounded-[32px] sm:rounded-[40px] ${theme.card}`}>
        <div className="flex items-center justify-between mb-5 px-1">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 text-gray-400"><ChevronLeft size={18} /></button>
          <span className="font-black text-[10px] uppercase tracking-[0.2em]">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 text-gray-400"><ChevronRight size={18} /></button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {weekDays.map((d, i) => (
            <div key={i} className="text-center text-[9px] font-black text-gray-300 uppercase tracking-tighter py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-6">
          {spacers.map((_, i) => (
            <div key={`spacer-${i}`} className="aspect-square" />
          ))}
          {days.map(day => {
            const isWork = isWorkDay(day, config);
            const isSel = isSameDay(day, selectedDate);
            const isT = isToday(day);
            const absence = isDayAbsence(day);
            const vacation = isDayVacation(day);
            const overtime = isDayOvertime(day);

            const profileStart = startOfDay(parse(config.startDate, 'yyyy-MM-dd', new Date()));
            const isBeforeStart = isBefore(startOfDay(day), profileStart);

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`aspect-square flex items-center justify-center rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] transition-all relative 
                  ${isSel ? 'bg-pink-500 text-white font-black scale-110 shadow-lg z-10' :
                    vacation ? 'bg-sky-500 text-white shadow-sm' :
                      overtime ? 'bg-purple-600 text-white shadow-md' :
                        isBeforeStart ? 'bg-transparent text-gray-300' :
                          isWork ? theme.workDay : theme.offDay} 
                  ${absence ? '!bg-red-50 !text-red-400 border border-red-100' : ''} 
                  ${isT && !isSel ? 'ring-2 ring-pink-300' : ''}`}
              >
                {day.getDate()}
                {overtime && !isSel && <div className="absolute top-1 right-1 w-1 sm:w-1.5 h-1 sm:h-1.5 bg-purple-200 rounded-full" />}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 border-t border-gray-50 pt-5 px-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <span className="text-[7px] font-black uppercase tracking-widest text-gray-400">Trabalho</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-orange-300"></div>
            <span className="text-[7px] font-black uppercase tracking-widest text-gray-400">Folga</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-sky-500"></div>
            <span className="text-[7px] font-black uppercase tracking-widest text-gray-400">Férias</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-purple-600"></div>
            <span className="text-[7px] font-black uppercase tracking-widest text-gray-400">Extra</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-400"></div>
            <span className="text-[7px] font-black uppercase tracking-widest text-gray-400">Ausência</span>
          </div>
        </div>
      </div>

      <motion.div layout className={`p-4 rounded-[28px] shadow-sm border-t-2 ${isTeamView ? 'border-indigo-500 bg-indigo-50/20' : 'border-pink-500 bg-white'}`}>
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-0.5">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</h3>
            {isTeamView && (
              <div className="flex items-center gap-3">
                {(Object.entries(teamStats.byTurn) as [WorkTurn, { active: number; total: number }][]).map(([turn, stats]) => {
                  const percent = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;
                  const icon = turn === WorkTurn.MORNING ? <Sun size={10} /> : turn === WorkTurn.AFTERNOON ? <CloudSun size={10} /> : <Moon size={10} />;
                  return (
                    <div key={turn} className="flex items-center gap-1">
                      <span className="text-indigo-300">{icon}</span>
                      <span className={`text-[9px] font-black ${percent === 100 ? 'text-emerald-500' : percent > 0 ? 'text-indigo-600' : 'text-gray-300'}`}>{percent}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {isTeamView && (
            <div className="bg-indigo-600 text-white px-2.5 py-1 rounded-xl flex items-center gap-2 shadow-md">
              <span className="text-[12px] font-black leading-none">{teamStats.globalPercent}%</span>
              <div className="w-[1px] h-3 bg-white/20" />
              <span className="text-[7px] font-black uppercase tracking-widest opacity-70">ATIVO</span>
            </div>
          )}
        </div>

        {isTeamView ? (
          <div className="space-y-4">
            <div className="space-y-5">
              {(Object.entries(teamStats.byRole) as [string, { active: number; total: number; workers: UserConfig[] }][]).map(([role, stats]) => {
                if (stats.workers.length === 0) return null;
                const percent = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;

                return (
                  <div key={role} className="space-y-2">
                    <div className="flex items-center justify-between px-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">{role}</span>
                        <span className="text-[7px] font-bold text-indigo-200">({stats.active}/{stats.total})</span>
                      </div>
                      <span className={`text-[8px] font-black ${percent === 100 ? 'text-emerald-500' : 'text-indigo-400'}`}>{percent}%</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {stats.workers.map(p => {
                        const isExtra = p.overtimeDates?.includes(format(selectedDate, 'yyyy-MM-dd'));
                        return (
                          <motion.div
                            key={p.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-white border shadow-xs transition-all ${p.id === config.id ? 'border-indigo-400 ring-2 ring-indigo-500/5' : 'border-indigo-50/50'}`}
                          >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[8px] shrink-0 ${p.id === config.id ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-400'}`}>
                              {p.name.charAt(0)}
                            </div>
                            <span className="text-[9px] font-bold text-gray-700 truncate max-w-[60px]">{p.name.split(' ')[0]}</span>
                            <div className="flex items-center gap-0.5 ml-0.5">
                              {getTurnIcon(p.turn)}
                              {isExtra && <Zap size={7} className="text-purple-500 fill-purple-500" />}
                            </div>
                            {p.id === config.id && <div className="w-1 h-1 rounded-full bg-indigo-500 ml-0.5" />}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {teamStats.totalActive === 0 && (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-2 opacity-20 grayscale">
                  <Users2 size={24} className="text-gray-400" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Nenhum Ativo</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              {getAbsenceForDate(selectedDate) ? (
                <button onClick={() => onRemoveAbsence(getAbsenceForDate(selectedDate)!.id)} className="flex-1 py-3.5 bg-red-50 text-red-500 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-red-100 active:scale-95 transition-all">Remover Ausência</button>
              ) : (
                <>
                  {(isWorkDay(selectedDate, config) || isDayOvertime(selectedDate)) && !isDayVacation(selectedDate) && (
                    <button onClick={() => onAddAbsence({ date: format(selectedDate, 'yyyy-MM-dd') })} className="flex-1 py-3.5 bg-gray-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all">Lançar Ausência</button>
                  )}
                  <button
                    onClick={() => isDayVacation(selectedDate) ? toggleVacation(selectedDate) : openVacationModal()}
                    className={`flex-1 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 ${isDayVacation(selectedDate) ? 'bg-sky-50 text-sky-600 border border-sky-100' : 'bg-sky-500 text-white shadow-md'}`}
                  >
                    <Umbrella size={14} />
                    {isDayVacation(selectedDate) ? 'Remover Férias' : 'Planejar Férias'}
                  </button>
                </>
              )}
            </div>

            {!isWorkDay(selectedDate, config) && !isDayVacation(selectedDate) && !getAbsenceForDate(selectedDate) && (
              <button
                onClick={() => toggleOvertime(selectedDate)}
                className={`w-full py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 ${isDayOvertime(selectedDate) ? 'bg-purple-50 text-purple-600 border border-purple-200' : 'bg-purple-600 text-white shadow-lg'}`}
              >
                <Zap size={14} />
                {isDayOvertime(selectedDate) ? 'Remover Hora Extra' : 'Lançar Hora Extra'}
              </button>
            )}
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setIsStreakInfoOpen(true)}
          className={`p-5 rounded-[32px] text-center relative overflow-hidden transition-all active:scale-95 group shadow-sm border ${currentStreak > 6 ? 'bg-amber-100 border-amber-300' : 'bg-emerald-600 border-emerald-500 text-white'}`}
        >
          {currentStreak > 6 && (
            <div className="absolute top-2 right-2 text-amber-600 animate-pulse">
              <AlertTriangle size={14} />
            </div>
          )}
          <div className={`text-xl font-black mb-0.5 ${currentStreak > 6 ? 'text-amber-800' : ''}`}>{currentStreak}</div>
          <div className={`text-[7px] font-black uppercase tracking-widest flex items-center justify-center gap-1 ${currentStreak > 6 ? 'text-amber-600' : 'text-white/80'}`}>
            Dias Seguidos <Info size={10} className="group-hover:scale-125 transition-transform" />
          </div>
        </button>
        <div className="p-5 rounded-[32px] text-center bg-white border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <div className="text-xl font-black mb-0.5 text-gray-900">{presenceRate}%</div>
          <div className="text-[7px] font-black uppercase tracking-widest opacity-40">Presença Mês</div>
        </div>
      </div>

      <AnimatePresence>
        {showCLTViolationAlert && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              className="bg-white w-full max-w-sm rounded-[32px] sm:rounded-[44px] shadow-[0_40px_100px_rgba(0,0,0,0.3)] p-6 sm:p-10 relative flex flex-col max-h-[90vh] border border-red-100"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
              <div className="absolute top-0 right-0 p-4">
                <div className="bg-red-50 p-2 rounded-full text-red-500">
                  <Siren size={20} className="animate-bounce" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-8 no-scrollbar">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-24 h-24 bg-red-100 rounded-[32px] flex items-center justify-center text-red-600 shadow-inner relative">
                    <Footprints size={48} />
                    <div className="absolute -bottom-2 -right-2 bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center border-4 border-white font-black text-xs">
                      {currentStreak}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-gray-900 leading-tight">Limite Excedido!</h2>
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Alerta de Conformidade Legal</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-5 bg-gray-50 rounded-[28px] border border-gray-100">
                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                      Detectamos que você atingiu <strong>{currentStreak} dias consecutivos</strong> de trabalho efetivo.
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-start gap-3">
                      <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-gray-500 leading-tight font-bold italic uppercase">
                        "É obrigatória a concessão de um descanso semanal de 24 horas consecutivas." (Art. 67 CLT)
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => setShowCLTViolationAlert(false)}
                      className="w-full py-4.5 bg-gray-900 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Coffee size={16} />
                      Entendido, preciso de pausa
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isStreakInfoOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[32px] sm:rounded-[40px] shadow-2xl p-6 sm:p-8 relative flex flex-col max-h-[90vh]"
            >
              <button
                onClick={() => setIsStreakInfoOpen(false)}
                className="absolute top-6 right-6 p-2 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-full transition-all"
              >
                <X size={20} />
              </button>

              <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-6 no-scrollbar">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-3xl shadow-lg ${currentStreak > 6 ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
                    {currentStreak > 6 ? <AlertTriangle size={28} /> : <Flame size={28} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">Dias Seguidos</h3>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Análise de Jornada CLT</p>
                  </div>
                </div>

                <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
                  <div className="p-4 bg-gray-50 rounded-3xl border border-gray-100 italic text-[11px] text-gray-700 leading-tight">
                    "{getStreakMessage(currentStreak)}"
                  </div>

                  {currentStreak > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sua Sequência Atual:</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {streakData.dates.map((d: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-[9px] font-black text-gray-800">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={`p-4 rounded-2xl border-l-4 ${currentStreak > 6 ? 'bg-amber-50 border-amber-400 text-amber-800' : 'bg-blue-50 border-blue-400 text-blue-800'}`}>
                    <h4 className="font-black text-[10px] uppercase mb-1">Regra de Ouro da CLT</h4>
                    <p className="text-[11px]">De acordo com o <strong>Art. 67</strong>, você tem direito a um <strong>Descanso Semanal Remunerado (DSR)</strong> de 24 horas consecutivas após, no máximo, 6 dias de trabalho.</p>
                  </div>

                  {currentStreak > 6 && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-3xl flex items-start gap-3 text-red-600">
                      <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-black uppercase mb-1">Atenção!</p>
                        <p className="text-[11px] leading-tight font-medium">Você atingiu {currentStreak} dias sem descanso. Isso excede o limite legal e exige o pagamento da folga em <strong>dobro</strong>.</p>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setIsStreakInfoOpen(false)}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-xl"
                >
                  Entendi a Regra
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isVacationModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-end justify-center px-4 pb-8 sm:items-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsVacationModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: 100, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white rounded-[40px] shadow-2xl p-6 overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-sky-100 text-sky-600 rounded-2xl">
                    <Umbrella size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 leading-tight">Planejar Férias</h3>
                    <p className="text-[9px] font-bold text-sky-500 uppercase tracking-widest">Defina o período de gozo</p>
                  </div>
                </div>
                <button onClick={() => setIsVacationModalOpen(false)} className="p-2 text-gray-300 hover:text-gray-900 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Data de Início</label>
                  <div className="relative group" onClick={() => triggerPicker(vacationStartRef)}>
                    <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400 pointer-events-none" size={16} />
                    <input
                      ref={vacationStartRef}
                      type="date"
                      value={vacationStart}
                      onChange={(e) => setVacationStart(e.target.value)}
                      className={`w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-2xl text-xs font-bold text-gray-800 outline-none transition-all cursor-pointer ${!isVacationStartValid() ? 'border-red-400 bg-red-50 text-red-900' : 'border-gray-100 focus:border-sky-500'}`}
                    />
                  </div>
                </div>

                {!isVacationStartValid() && vacationStart && isValid(parseISO(vacationStart)) && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2 p-3 bg-red-100/50 rounded-2xl text-red-600 border border-red-200">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <p className="text-[9px] font-bold leading-tight uppercase">O período de férias não pode iniciar em um dia de folga.</p>
                  </motion.div>
                )}

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Duração do Período</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[10, 15, 20, 30].map((d) => (
                      <button
                        key={d}
                        onClick={() => setSelectedDuration(d)}
                        className={`py-3 rounded-2xl font-black text-xs transition-all flex flex-col items-center justify-center gap-1 border-2 ${selectedDuration === d ? 'bg-sky-500 border-sky-600 text-white shadow-lg scale-105' : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-sky-200'}`}
                      >
                        <span className="leading-none">{d}</span>
                        <span className="text-[7px] uppercase tracking-tighter opacity-70">Dias</span>
                      </button>
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {vacationOverlap && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="p-4 bg-red-50 rounded-[28px] border-2 border-red-200 flex items-center gap-4 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 opacity-10 -mr-4 -mt-4"><AlertTriangle size={80} className="text-red-500" /></div>
                      <div className="w-10 h-10 rounded-2xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-200"><AlertTriangle size={20} /></div>
                      <div className="flex-1">
                        <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest">Férias Existentes</h4>
                        <p className="text-[9px] font-bold text-red-400 leading-tight">Já existem férias agendadas neste intervalo.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {absenceOverlap && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="p-4 bg-orange-50 rounded-[28px] border-2 border-orange-200 flex items-center gap-4 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 opacity-10 -mr-4 -mt-4"><FileWarning size={80} className="text-orange-500" /></div>
                      <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-200"><FileWarning size={20} /></div>
                      <div className="flex-1">
                        <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Conflito de Ausência</h4>
                        <p className="text-[9px] font-bold text-orange-400 leading-tight">Existe uma ausência (falta/folga) agendada neste período.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {teamVacationConflict && !hasPersonalConflict && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{
                        opacity: [1, 0.4, 1],
                        scale: 1,
                        y: 0
                      }}
                      transition={{
                        opacity: { repeat: Infinity, duration: 1, ease: "easeInOut" },
                        scale: { duration: 0.4 },
                        y: { duration: 0.4 }
                      }}
                      className="p-4 bg-amber-50 rounded-[28px] border-2 border-amber-200 flex items-start gap-4 relative overflow-hidden"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-200 mt-1">
                        <Users size={20} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div>
                          <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Aviso de Equipe</h4>
                          <p className="text-[9px] font-bold text-amber-500 leading-tight">
                            {teamVacationConflict.length === 1
                              ? `${teamVacationConflict[0].profile.name.split(' ')[0]} já tem férias neste período.`
                              : `${teamVacationConflict.length} colegas do cargo "${config.role}" estarão de férias.`}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className={`p-5 rounded-[32px] border transition-all relative overflow-hidden ${hasPersonalConflict ? 'bg-red-50 border-red-100' : 'bg-sky-50 border-sky-100/50'}`}>
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className={`text-[8px] font-black uppercase tracking-widest block ${hasPersonalConflict ? 'text-red-400' : 'text-sky-400'}`}>Previsão de Retorno</span>
                      <span className={`text-sm font-black ${hasPersonalConflict ? 'text-red-700' : 'text-sky-700'}`}>
                        {vacationStart && isValid(parseISO(vacationStart))
                          ? format(addDays(getVacationEndDate(), 1), "dd 'de' MMMM", { locale: ptBR })
                          : '---'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-[8px] font-black uppercase tracking-widest block ${hasPersonalConflict ? 'text-red-400' : 'text-sky-400'}`}>Total</span>
                      <span className={`text-lg font-black ${hasPersonalConflict ? 'text-red-700' : 'text-sky-700'}`}>{selectedDuration} dias</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleConfirmVacationPeriod}
                  disabled={isSavingBlocked}
                  className={`w-full py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 group ${isSavingBlocked
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    : teamVacationConflict
                      ? 'bg-amber-500 text-white shadow-amber-200'
                      : 'bg-gray-900 text-white'
                    }`}
                >
                  {isSavingBlocked ? (
                    <>
                      <X size={16} />
                      Datas Indisponíveis
                    </>
                  ) : teamVacationConflict ? (
                    <>
                      <AlertTriangle size={16} />
                      Confirmar mesmo assim
                    </>
                  ) : (
                    <>
                      <Umbrella size={16} className="group-active:rotate-12 transition-transform" />
                      Confirmar Férias
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
