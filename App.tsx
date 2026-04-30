
import React, { useState, useEffect, useMemo } from 'react';
import { UserConfig, Absence, ThemeStyle, ShiftType, WorkTurn, CareerChange } from './types';
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
import { ConfirmModal } from './components/ConfirmModal';
import { AccessDenied } from './components/AccessDenied';
import { SystemAccessManagement } from './components/SystemAccessManagement';
import { ErrorBoundary } from './components/ErrorBoundary';
import { supabase } from './services/supabase';
import { useEscalaStorage } from './hooks/useEscalaStorage';
import { formatName } from './utils/shiftCalculator';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Zap, Umbrella, FileText, LogOut, Briefcase, ShieldCheck } from 'lucide-react';
import { THEME_CONFIGS } from './constants';
import { format, parseISO, isSameMonth, differenceInCalendarDays, isValid } from 'date-fns';

const ensureArray = (arr: any) => Array.isArray(arr) ? arr : [];

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
    deleteAbsence,
    systemUser,
    fetchAllSystemUsers,
    updateSystemUserAccess,
    deleteSystemUser,
    uploadAvatar,
    updateSystemUserVisibility
  } = useEscalaStorage(session);

  const [view, setView] = useState<'calendar' | 'history' | 'profile' | 'users' | 'team_schedule' | 'admin'>('calendar');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [duplicateErrorName, setDuplicateErrorName] = useState<string | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isAlert?: boolean;
    confirmText?: string;
  } | null>(null);

  const requestConfirmation = (title: string, message: string, onConfirm: () => void, isAlert = false, confirmText = 'Confirmar') => {
    setConfirmConfig({ isOpen: true, title, message, onConfirm, isAlert, confirmText });
  };

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
    const roles = new Set<string>();
    profiles.forEach((p: UserConfig) => {
      if (p.role && p.role.trim()) roles.add(p.role.trim());
      (p.careerHistory || []).forEach((h: CareerChange) => {
        if (h.role && h.role.trim()) roles.add(h.role.trim());
      });
    });
    return Array.from(roles).sort();
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
    ensureArray(activeProfile.overtimeDates).forEach((date: string) => {
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
    const vacationDates = [...ensureArray(activeProfile.vacationDates)].sort();
    if (vacationDates.length > 0) {
      let currentPeriod: string[] = [vacationDates[0]];
      for (let i = 1; i <= vacationDates.length; i++) {
        const prevDate = parseISO(vacationDates[i - 1]);
        const currDateStr = vacationDates[i];
        const currDate = currDateStr ? parseISO(currDateStr) : null;
        if (currDate && isValid(currDate) && isValid(prevDate) && differenceInCalendarDays(currDate, prevDate) === 1) {
          currentPeriod.push(currDateStr);
        } else {
          const start = currentPeriod[0];
          const end = currentPeriod[currentPeriod.length - 1];
          const totalDays = currentPeriod.length;
          
          if (isValid(parseISO(start)) && isValid(parseISO(end))) {
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
          }
          if (currDateStr) currentPeriod = [currDateStr];
        }
      }
    }

    (activeProfile.careerHistory || []).forEach((change: CareerChange) => {
      events.push({
        id: change.id,
        date: change.date,
        title: 'Mudança de Carreira',
        description: `${change.role || 'Cargo inalterado'} • ${change.shiftType || 'Escala inalterada'}`,
        type: 'career_change' as const,
        color: 'bg-emerald-500',
        icon: <Briefcase size={18} />
      });
    });

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
      requestConfirmation(
        "Ação Bloqueada",
        "O sistema precisa de pelo menos 1 perfil ativo para funcionar. Adicione outro integrante antes de remover este.",
        () => { },
        true,
        "Entendi"
      );
      return;
    }
    requestConfirmation(
      "Remover Integrante",
      `Tem certeza que deseja remover ${profiles.find(p => p.id === id)?.name}? Todos os registros vinculados serão perdidos.`,
      async () => {
        try {
          await deleteProfile(id);
          // O setProfiles dentro do useEscalaStorage já cuida da atualização do estado, 
          // mas vamos garantir a troca do perfil ativo se necessário antes do re-render
          if (activeProfileId === id) {
            const nextProfile = profiles.find(p => p.id !== id);
            if (nextProfile) {
              setActiveProfileId(nextProfile.id);
            }
          }
          if (view === 'profile') setView('users');
        } catch (err: any) {
          console.error('Erro ao remover perfil:', err);
          alert('Erro ao remover integrante: ' + (err.message || 'Verifique sua conexão.'));
        }
      }
    );
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
    requestConfirmation(
      "Remover Ausência",
      "Tem certeza que deseja remover este registro de ausência?",
      async () => {
        try {
          await deleteAbsence(id);
        } catch (err) {
          console.error('Erro ao remover ausência:', err);
        }
      }
    );
  };

  const handleRemoveEvent = async (event: any) => {
    const title = event.type === 'absence' ? "Remover Ausência" : event.type === 'vacation_period' ? "Remover Período" : event.type === 'career_change' ? "Remover Alteração" : "Remover Extra";
    const message = event.type === 'absence' ? "Deseja remover esta ausência?" : event.type === 'vacation_period' ? "Deseja remover todo este período de férias?" : event.type === 'career_change' ? "Deseja remover este registro histórico?" : "Deseja remover esta hora extra?";

    requestConfirmation(title, message, async () => {
      if (event.type === 'absence') {
        await removeAbsenceHandler(event.id);
      } else if (event.type === 'vacation_period') {
        const newVacations = (activeProfile?.vacationDates || []).filter((d: string) => !event.dates.includes(d));
        await handleUpdateActiveProfile({ ...activeProfile!, vacationDates: newVacations });
      } else if (event.type === 'overtime') {
        const newOvertime = (activeProfile?.overtimeDates || []).filter((d: string) => d !== event.date);
        await handleUpdateActiveProfile({ ...activeProfile!, overtimeDates: newOvertime });
      } else if (event.type === 'career_change') {
        const newHistory = (activeProfile?.careerHistory || []).filter(h => h.id !== event.id);
        await handleUpdateActiveProfile({ ...activeProfile!, careerHistory: newHistory });
      }
    });
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return <Auth onAuthSuccess={() => { }} />;
  }

  // Mostra loading enquanto os dados do banco estão sendo carregados
  if (storageLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-pink-500 animate-pulse" />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Carregando...</p>
      </div>
    );
  }

  // Só bloqueia se o systemUser EXISTE e explicitamente NÃO está aprovado
  // Se systemUser for null (não encontrado na tabela), deixa prosseguir
  if (systemUser !== null && !systemUser.is_approved) {
    return <AccessDenied onLogout={handleLogout} />;
  }

  // Se não há perfis OU o onboarding foi solicitado, mostra o onboarding
  if ((profiles.length === 0 || showOnboarding) && view !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        {systemUser?.role === 'admin' && (
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={() => {
                setShowOnboarding(false);
                setView('admin');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            >
              <ShieldCheck size={16} /> Painel Administrador
            </button>
          </div>
        )}
        <div className="absolute top-4 left-4 z-50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black text-red-400 uppercase tracking-widest hover:bg-red-500/20 transition-all"
          >
            <LogOut size={14} /> Sair
          </button>
        </div>
        <DuplicateAlert duplicateErrorName={duplicateErrorName} setDuplicateErrorName={setDuplicateErrorName} />
        <Onboarding onComplete={handleAddProfile} onCancel={() => setShowOnboarding(false)} isAddingExtra={profiles.length > 0} existingRoles={existingRoles} />
      </div>
    );
  }

  // Se após o carregamento não houver perfil ativo (não deveria acontecer, mas safety net)
  if (!activeProfile && view !== 'admin') {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center gap-4 p-8">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-lg font-black text-gray-800">Nenhum perfil encontrado</h2>
        <p className="text-sm text-gray-500 text-center">Não foi possível carregar seu perfil. Por favor, faça logout e entre novamente.</p>
        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-pink-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg"
        >
          Fazer Logout
        </button>
      </div>
    );
  }

  const theme = (THEME_CONFIGS as Record<ThemeStyle, any>)[globalTheme] || THEME_CONFIGS[ThemeStyle.MODERN];

  return (
    <Layout themeStyle={globalTheme}>
      <DuplicateAlert duplicateErrorName={duplicateErrorName} setDuplicateErrorName={setDuplicateErrorName} />

      <div className="flex justify-between items-center mb-6 px-2">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-90"
          >
            <LogOut size={14} /> Sair
          </button>
          
          <div className="flex flex-col pl-3 border-l border-gray-200">
            <span className="text-[10px] font-black text-gray-900 leading-none mb-1 truncate max-w-[80px] sm:max-w-[120px]">
              {formatName((systemUser?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuário').split(' ')[0])}
            </span>
            <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest leading-none">
              {systemUser?.role === 'admin' ? 'Admin' : 'Colab'}
            </span>
          </div>
        </div>

        <div className="flex gap-1.5 sm:gap-2">
          {systemUser?.role === 'admin' && view !== 'admin' && (
            <button
              onClick={() => setView('admin')}
              className="flex items-center gap-1.5 px-2.5 py-2 bg-purple-500/20 backdrop-blur-sm border border-purple-500/50 rounded-xl text-[9px] font-black text-purple-400 uppercase tracking-widest hover:bg-purple-50 hover:text-purple-600 transition-all active:scale-90 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
            >
              <ShieldCheck size={12} /> <span className="hidden sm:inline">Painel Admin</span><span className="sm:hidden">Admin</span>
            </button>
          )}

          <button
            onClick={() => setIsHelpOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-2 bg-white/50 backdrop-blur-sm border border-gray-100 rounded-xl text-[9px] font-black text-pink-500 uppercase tracking-widest hover:bg-white transition-all active:scale-90"
          >
            <HelpCircle size={12} /> <span className="hidden sm:inline">Ajuda</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'calendar' && (
          <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ErrorBoundary onLogout={handleLogout}>
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
                onConfirm={requestConfirmation}
              />
            </ErrorBoundary>
          </motion.div>
        )}

        {view === 'team_schedule' && (systemUser?.role === 'admin' || systemUser?.can_view_all) && (
          <motion.div key="team_schedule" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ErrorBoundary onLogout={handleLogout}>
              <TeamSchedule
                activeConfig={activeProfile}
                allProfiles={profiles}
                absences={absences}
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
                onOpenHelp={() => setIsHelpOpen(true)}
                onLogout={handleLogout}
              />
            </ErrorBoundary>
          </motion.div>
        )}

        {view === 'history' && systemUser?.role === 'admin' && (
          <HistoryView
            allEvents={allEvents}
            historyStats={historyStats}
            setView={setView}
            setIsHelpOpen={setIsHelpOpen}
            handleRemoveEvent={handleRemoveEvent}
            onLogout={handleLogout}
          />
        )}

        {view === 'profile' && activeProfile && (
          <ProfileView
            activeProfile={activeProfile}
            theme={theme}
            setView={setView}
            setIsHelpOpen={setIsHelpOpen}
            handleUpdateActiveProfile={handleUpdateActiveProfile}
            toggleOffDay={toggleOffDay}
            existingRoles={existingRoles}
            onRequestConfirmation={requestConfirmation}
            onUploadAvatar={uploadAvatar}
          />
        )}

        {view === 'users' && (systemUser?.role === 'admin' || systemUser?.can_view_all) && (
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
        {view === 'admin' && systemUser?.role === 'admin' && (
          <SystemAccessManagement 
            fetchAllSystemUsers={fetchAllSystemUsers} 
            updateSystemUserAccess={updateSystemUserAccess}
            deleteSystemUser={deleteSystemUser}
            currentUserId={session?.user?.id}
            updateSystemUserVisibility={updateSystemUserVisibility}
          />
        )}
      </AnimatePresence>

      <Navbar view={view} setView={setView} theme={theme} systemRole={systemUser?.role} allowUsersViewAll={systemUser?.can_view_all} />

      <HelpCenter isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <BatchAddModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onConfirm={handleBatchConfirm}
        existingRoles={existingRoles}
        existingProfiles={profiles}
      />

      <ConfirmModal
        isOpen={confirmConfig?.isOpen || false}
        onClose={() => setConfirmConfig(prev => prev ? { ...prev, isOpen: false } : null)}
        onConfirm={confirmConfig?.onConfirm || (() => { })}
        title={confirmConfig?.title || ""}
        message={confirmConfig?.message || ""}
        type={confirmConfig?.isAlert ? 'warning' : 'danger'}
        isAlert={confirmConfig?.isAlert}
        confirmText={confirmConfig?.confirmText}
      />
    </Layout>
  );
};

export default App;
