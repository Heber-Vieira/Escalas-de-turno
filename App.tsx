
import React, { useState, useEffect, useMemo } from 'react';
import { UserConfig, Absence, ThemeStyle, ShiftType, WorkTurn } from './types';
import { Onboarding } from './components/Onboarding';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TeamSchedule } from './components/TeamSchedule';
import { HelpCenter } from './components/HelpCenter';
import { BatchAddModal } from './components/BatchAddModal';
import { Navbar } from './components/Navbar';
import { HistoryView } from './components/HistoryView';
import { ProfileView } from './components/ProfileView';
import { UsersView } from './components/UsersView';
import { DuplicateAlert } from './components/DuplicateAlert';
import { Auth } from './components/Auth';
import { supabase } from './services/supabase';
import { useEscalaStorage } from './hooks/useEscalaStorage';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Zap, Umbrella, FileText, LogOut } from 'lucide-react';
import { THEME_CONFIGS } from './constants';
import { format, parseISO, isSameMonth, differenceInCalendarDays } from 'date-fns';


const App: React.FC = () => {
  const [session, setSession] = useState<any | null>(null);
  const {
    profiles,
    activeProfileId,
    setActiveProfileId,
    absences,
    activeProfile,
    globalTheme,
    updateTheme,
    loading: storageLoading,
    addProfile,
    updateProfile,
    deleteProfile,
    syncAbsence,
    deleteAbsence
  } = useEscalaStorage(session);

  const [view, setView] = useState<'calendar' | 'history' | 'profile' | 'users' | 'team_schedule'>('calendar');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [duplicateErrorName, setDuplicateErrorName] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (duplicateErrorName) {
      const timer = setTimeout(() => setDuplicateErrorName(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [duplicateErrorName]);

  const existingRoles = useMemo(() => {
    const roles = profiles.map((p: UserConfig) => p.role).filter((r: string) => r && r.trim() !== "");
    return Array.from(new Set(roles)).sort();
  }, [profiles]);

  const activeAbsences = useMemo(() =>
    absences.filter((a: Absence) => a.profileId === activeProfileId),
    [absences, activeProfileId]
  );

  const allEvents = useMemo(() => {
    if (!activeProfile) return [];
    const events: any[] = [];
    activeAbsences.forEach((a: Absence) => {
      events.push({
        id: a.id,
        date: a.date,
        title: a.reason,
        description: a.description,
        type: 'absence' as const,
        color: 'bg-pink-500',
        icon: <FileText size={18} />
      });
    });
    (activeProfile.overtimeDates || []).forEach((date: string) => {
      events.push({
        id: `ovt-${date}`,
        date: date,
        title: 'Hora Extra',
        description: 'Carga horária adicional registrada',
        type: 'overtime' as const,
        color: 'bg-purple-600',
        icon: <Zap size={18} />
      });
    });
    const vacationDates = [...(activeProfile.vacationDates || [])].sort();
    if (vacationDates.length > 0) {
      let currentPeriod: string[] = [vacationDates[0]];
      for (let i = 1; i <= vacationDates.length; i++) {
        const prevDate = parseISO(vacationDates[i - 1]);
        const currDateStr = vacationDates[i];
        const currDate = currDateStr ? parseISO(currDateStr) : null;
        if (currDate && differenceInCalendarDays(currDate, prevDate) === 1) {
          currentPeriod.push(currDateStr);
        } else {
          const start = currentPeriod[0];
          const end = currentPeriod[currentPeriod.length - 1];
          const totalDays = currentPeriod.length;
          events.push({
            id: `vac-period-${start}`,
            date: start,
            title: 'Período de Férias',
            description: totalDays === 1
              ? `Dia único de descanso`
              : `${format(parseISO(start), 'dd/MM')} a ${format(parseISO(end), 'dd/MM')} • ${totalDays} dias`,
            type: 'vacation_period' as const,
            dates: [...currentPeriod],
            color: 'bg-sky-500',
            icon: <Umbrella size={18} />
          });
          if (currDateStr) currentPeriod = [currDateStr];
        }
      }
    }
    return events.sort((a, b) => b.date.localeCompare(a.date));
  }, [activeAbsences, activeProfile]);

  const historyStats = useMemo(() => {
    const now = new Date();
    const thisMonthEvents = allEvents.filter((e: any) => {
      try { return isSameMonth(parseISO(e.date), now); } catch { return false; }
    }).length;
    return { total: allEvents.length, thisMonth: thisMonthEvents };
  }, [allEvents]);

  const handleAddProfile = async (newConfig: UserConfig) => {
    const nameExists = profiles.some((p: UserConfig) => p.name.trim().toLowerCase() === newConfig.name.trim().toLowerCase());
    if (nameExists) {
      setDuplicateErrorName(newConfig.name);
      return;
    }
    try {
      const saved = await addProfile(newConfig);
      if (saved) {
        setActiveProfileId(saved.id);
        setShowOnboarding(false);
        setView('calendar');
      }
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
      alert('Erro ao salvar perfil no banco de dados.');
    }
  };

  const handleBatchConfirm = async (newProfiles: UserConfig[]) => {
    const existingNames = new Set(profiles.map((p: UserConfig) => p.name.trim().toLowerCase()));
    const uniqueNewProfiles = newProfiles.filter((newP: UserConfig) => !existingNames.has(newP.name.trim().toLowerCase()));
    if (uniqueNewProfiles.length === 0 && newProfiles.length > 0) {
      setDuplicateErrorName("Múltiplos Integrantes");
      setIsBatchModalOpen(false);
      return;
    }

    try {
      for (const p of uniqueNewProfiles) {
        await addProfile(p);
      }
      setIsBatchModalOpen(false);
    } catch (err) {
      console.error('Erro ao importar equipe:', err);
      alert('Ocorreu um erro ao importar alguns integrantes.');
    }
  };

  const handleUpdateActiveProfile = async (newConfig: UserConfig) => {
    const nameExists = profiles.some((p: UserConfig) => p.id !== newConfig.id && p.name.trim().toLowerCase() === newConfig.name.trim().toLowerCase());
    if (nameExists) {
      setDuplicateErrorName(newConfig.name);
      return;
    }
    try {
      await updateProfile(newConfig);
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
    }
  };

  const removeProfile = async (id: string) => {
    if (profiles.length <= 1) {
      alert("O Escala Fácil precisa de pelo menos 1 perfil ativo.");
      return;
    }
    try {
      await deleteProfile(id);
      const remainingProfiles = profiles.filter((p: UserConfig) => p.id !== id);
      if (activeProfileId === id) {
        setActiveProfileId(remainingProfiles[0].id);
      }
      if (view === 'profile') setView('users');
    } catch (err) {
      console.error('Erro ao remover perfil:', err);
    }
  };

  const addAbsenceHandler = async (abs: Partial<Absence>) => {
    if (!abs.date || !activeProfileId) return;
    const dateStr = abs.date.includes('T') ? abs.date.split('T')[0] : abs.date;
    const newAbsence: Absence = {
      id: '', // Will be set by DB
      profileId: activeProfileId,
      date: dateStr,
      reason: abs.reason || 'Ausência Registrada',
      description: abs.description || '',
      status: 'Pendente'
    };
    try {
      await syncAbsence(newAbsence);
    } catch (err) {
      console.error('Erro ao salvar ausência:', err);
    }
  };

  const removeAbsenceHandler = async (id: string) => {
    try {
      await deleteAbsence(id);
    } catch (err) {
      console.error('Erro ao remover ausência:', err);
    }
  };

  const handleRemoveEvent = async (event: any) => {
    if (event.type === 'absence') {
      await removeAbsenceHandler(event.id);
    } else if (event.type === 'vacation_period') {
      const newVacations = (activeProfile?.vacationDates || []).filter((d: string) => !event.dates.includes(d));
      await handleUpdateActiveProfile({ ...activeProfile!, vacationDates: newVacations });
    } else if (event.type === 'overtime') {
      const newOvertime = (activeProfile?.overtimeDates || []).filter((d: string) => d !== event.date);
      await handleUpdateActiveProfile({ ...activeProfile!, overtimeDates: newOvertime });
    }
  };

  const toggleOffDay = (day: number) => {
    if (!activeProfile) return;
    const current = activeProfile.offDays || [];
    let newOffDays;
    if (current.includes(day)) {
      newOffDays = current.filter((d: number) => d !== day);
    } else {
      newOffDays = [...current, day];
    }
    handleUpdateActiveProfile({ ...activeProfile, offDays: newOffDays });
  };

  if (!session) {
    return <Auth onAuthSuccess={() => setView('calendar')} />;
  }

  if (storageLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-pink-500/20 border-t-pink-500 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.3)]"
        />
      </div>
    );
  }

  if (profiles.length === 0 || showOnboarding) {
    return (
      <>
        <DuplicateAlert duplicateErrorName={duplicateErrorName} setDuplicateErrorName={setDuplicateErrorName} />
        <Onboarding onComplete={handleAddProfile} onCancel={() => setShowOnboarding(false)} isAddingExtra={profiles.length > 0} existingRoles={existingRoles} />
      </>
    );
  }

  if (!activeProfile) return null;

  const theme = (THEME_CONFIGS as Record<ThemeStyle, any>)[globalTheme] || THEME_CONFIGS[ThemeStyle.MODERN];

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Layout themeStyle={globalTheme}>
      <DuplicateAlert duplicateErrorName={duplicateErrorName} setDuplicateErrorName={setDuplicateErrorName} />

      <div className="flex justify-between items-center mb-2 px-1">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-full text-[9px] font-black text-red-500 uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-90"
        >
          <LogOut size={14} /> Sair
        </button>
        <button
          onClick={() => setIsHelpOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/50 backdrop-blur-sm border border-gray-100 rounded-full text-[9px] font-black text-pink-500 uppercase tracking-widest hover:bg-white transition-all active:scale-90"
        >
          <HelpCircle size={14} /> Ajuda
        </button>
      </div>

      <AnimatePresence mode="wait">
        {view === 'calendar' && (
          <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Dashboard
              config={activeProfile}
              allProfiles={profiles}
              absences={absences}
              onAddAbsence={addAbsenceHandler}
              onRemoveAbsence={removeAbsenceHandler}
              onUpdateConfig={handleUpdateActiveProfile}
              onUpdateTheme={updateTheme}
              globalTheme={globalTheme}
              openSettings={() => setView('users')}
            />
          </motion.div>
        )}

        {view === 'team_schedule' && (
          <motion.div key="team_schedule" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TeamSchedule
              activeConfig={activeProfile}
              allProfiles={profiles}
              absences={absences}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              onOpenHelp={() => setIsHelpOpen(true)}
              onLogout={handleLogout}
            />
          </motion.div>
        )}

        {view === 'history' && (
          <HistoryView
            allEvents={allEvents}
            historyStats={historyStats}
            setView={setView}
            setIsHelpOpen={setIsHelpOpen}
            handleRemoveEvent={handleRemoveEvent}
            onLogout={handleLogout}
          />
        )}

        {view === 'profile' && (
          <ProfileView
            activeProfile={activeProfile}
            theme={theme}
            setView={setView}
            setIsHelpOpen={setIsHelpOpen}
            handleUpdateActiveProfile={handleUpdateActiveProfile}
            toggleOffDay={toggleOffDay}
          />
        )}

        {view === 'users' && (
          <UsersView
            profiles={profiles}
            activeProfileId={activeProfileId}
            setActiveProfileId={setActiveProfileId}
            setView={setView}
            setIsBatchModalOpen={setIsBatchModalOpen}
            setIsHelpOpen={setIsHelpOpen}
            setShowOnboarding={setShowOnboarding}
            removeProfile={removeProfile}
            onLogout={handleLogout}
          />
        )}
      </AnimatePresence>

      <Navbar view={view} setView={setView} theme={theme} />

      <HelpCenter isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <BatchAddModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onConfirm={handleBatchConfirm}
        existingRoles={existingRoles}
        existingProfiles={profiles}
      />
    </Layout>
  );
};

export default App;
