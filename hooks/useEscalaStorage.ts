
import { useState, useEffect, useMemo } from 'react';
import { UserConfig, Absence, ThemeStyle } from '../types';
import { supabase } from '../services/supabase';

export const useEscalaStorage = (session: any) => {
    const [profiles, setProfiles] = useState<UserConfig[]>([]);
    const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [globalTheme, setGlobalTheme] = useState<ThemeStyle>(ThemeStyle.MODERN);
    const [loading, setLoading] = useState(true);
    const [lastUserId, setLastUserId] = useState<string | null>(null);

    // Derived state: if user ID changed, we are definitely loading
    if (session?.user?.id !== lastUserId) {
        setLastUserId(session?.user?.id || null);
        setLoading(!!session?.user?.id);
    }

    // Initial Load from Supabase
    useEffect(() => {
        if (!session?.user?.id) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const fetchData = async () => {
            try {
                // Fetch Settings (Theme)
                const { data: settings, error: sError } = await supabase
                    .from('user_settings')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .maybeSingle();

                if (sError) console.error('Error fetching settings:', sError);

                if (settings) {
                    setGlobalTheme(settings.theme as ThemeStyle);
                } else {
                    await supabase.from('user_settings').insert({
                        user_id: session.user.id,
                        theme: ThemeStyle.MODERN
                    });
                }

                // Fetch Profiles
                const { data: dbProfiles, error: pError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_id', session.user.id);

                if (pError) throw pError;

                const mappedProfiles: UserConfig[] = dbProfiles.map(p => ({
                    id: p.id,
                    name: p.name,
                    role: p.role,
                    shiftType: p.shift_type,
                    turn: p.turn,
                    startDate: p.start_date,
                    offDays: p.off_days || [],
                    vacationDates: p.vacation_dates || [],
                    overtimeDates: p.overtime_dates || [],
                    rotatingWorkDays: p.rotating_work_days,
                    rotatingOffDays: p.rotating_off_days,
                    state: p.state,
                    city: p.city,
                    theme: p.theme,
                    avatarUrl: p.avatar_url,
                    email: p.email,
                    phone: p.phone,
                    isActive: p.is_active,
                    notes: p.notes
                }));

                setProfiles(mappedProfiles);

                // Fetch Absences
                const { data: dbAbsences, error: aError } = await supabase
                    .from('absences')
                    .select('*')
                    .eq('user_id', session.user.id);

                if (aError) throw aError;

                const mappedAbsences: Absence[] = dbAbsences.map(a => ({
                    id: a.id,
                    profileId: a.profile_id,
                    date: a.date,
                    reason: a.reason,
                    description: a.description,
                    status: a.status
                }));

                setAbsences(mappedAbsences);

                // Set Active Profile
                if (settings?.last_active_profile_id && mappedProfiles.find(p => p.id === settings.last_active_profile_id)) {
                    setActiveProfileId(settings.last_active_profile_id);
                } else {
                    const savedActiveId = localStorage.getItem('escala_facil_active_id');
                    if (savedActiveId && mappedProfiles.find(p => p.id === savedActiveId)) {
                        setActiveProfileId(savedActiveId);
                    } else if (mappedProfiles.length > 0) {
                        setActiveProfileId(mappedProfiles[0].id);
                    }
                }
            } catch (err) {
                console.error('Erro ao carregar dados:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [session]);

    // Save active profile ID and Theme to Supabase
    const updateGlobalSettings = async (updates: { theme?: ThemeStyle, lastActiveProfileId?: string | null }) => {
        if (!session?.user?.id) return;

        const dbUpdates: any = { updated_at: new Date().toISOString() };
        if (updates.theme) dbUpdates.theme = updates.theme;
        if (updates.lastActiveProfileId !== undefined) dbUpdates.last_active_profile_id = updates.lastActiveProfileId;

        const { error } = await supabase
            .from('user_settings')
            .update(dbUpdates)
            .eq('user_id', session.user.id);

        if (error) console.error('Error updating settings:', error);
    };

    useEffect(() => {
        if (activeProfileId) {
            localStorage.setItem('escala_facil_active_id', activeProfileId);
            updateGlobalSettings({ lastActiveProfileId: activeProfileId });
        }
    }, [activeProfileId]);

    const activeProfile = useMemo(() =>
        profiles.find(p => p.id === activeProfileId) || null,
        [profiles, activeProfileId]
    );

    const updateTheme = async (theme: ThemeStyle) => {
        setGlobalTheme(theme);
        await updateGlobalSettings({ theme });
    };

    // Sync helpers
    const addProfile = async (newConfig: UserConfig) => {
        if (!session?.user?.id) return;

        const { id, ...data } = newConfig;
        const dbRow = {
            user_id: session.user.id,
            name: data.name,
            role: data.role,
            shift_type: data.shiftType,
            turn: data.turn,
            start_date: data.startDate,
            off_days: data.offDays,
            vacation_dates: data.vacationDates,
            overtime_dates: data.overtimeDates,
            rotating_work_days: data.rotatingWorkDays,
            rotating_off_days: data.rotatingOffDays,
            state: data.state,
            city: data.city,
            theme: data.theme,
            avatar_url: data.avatarUrl,
            email: data.email,
            phone: data.phone,
            is_active: data.isActive,
            notes: data.notes
        };

        const { data: inserted, error } = await supabase
            .from('profiles')
            .insert(dbRow)
            .select()
            .single();

        if (error) throw error;

        const mapped: UserConfig = {
            ...newConfig,
            id: inserted.id
        };

        setProfiles(prev => [...prev, mapped]);
        return mapped;
    };

    const updateProfile = async (config: UserConfig) => {
        if (!session?.user?.id) return;

        const { id, ...data } = config;
        const dbRow = {
            name: data.name,
            role: data.role,
            shift_type: data.shiftType,
            turn: data.turn,
            start_date: data.startDate,
            off_days: data.offDays,
            vacation_dates: data.vacationDates,
            overtime_dates: data.overtimeDates,
            rotating_work_days: data.rotatingWorkDays,
            rotating_off_days: data.rotatingOffDays,
            state: data.state,
            city: data.city,
            theme: data.theme,
            avatar_url: data.avatarUrl,
            email: data.email,
            phone: data.phone,
            is_active: data.isActive,
            notes: data.notes,
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('profiles')
            .update(dbRow)
            .eq('id', id)
            .eq('user_id', session.user.id);

        if (error) throw error;

        setProfiles(prev => prev.map(p => p.id === id ? config : p));
    };

    const deleteProfile = async (id: string) => {
        if (!session?.user?.id) return;

        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id)
            .eq('user_id', session.user.id);

        if (error) throw error;

        setProfiles(prev => prev.filter(p => p.id !== id));
        setAbsences(prev => prev.filter(a => a.profileId !== id));
    };

    const syncAbsence = async (abs: Absence) => {
        if (!session?.user?.id) return;

        const dbRow = {
            user_id: session.user.id,
            profile_id: abs.profileId,
            date: abs.date,
            reason: abs.reason,
            description: abs.description,
            status: abs.status
        };

        const { data: inserted, error } = await supabase
            .from('absences')
            .insert(dbRow)
            .select()
            .single();

        if (error) throw error;

        const mapped: Absence = {
            ...abs,
            id: inserted.id
        };

        setAbsences(prev => [...prev.filter(a => a.date !== abs.date || a.profileId !== abs.profileId), mapped]);
        return mapped;
    };

    const deleteAbsence = async (id: string) => {
        if (!session?.user?.id) return;

        const { error } = await supabase
            .from('absences')
            .delete()
            .eq('id', id)
            .eq('user_id', session.user.id);

        if (error) throw error;

        setAbsences(prev => prev.filter(a => a.id !== id));
    };

    return {
        profiles,
        activeProfileId,
        setActiveProfileId,
        absences,
        activeProfile,
        globalTheme,
        updateTheme,
        loading,
        addProfile,
        updateProfile,
        deleteProfile,
        syncAbsence,
        deleteAbsence
    };
};
