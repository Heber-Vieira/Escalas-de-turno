import { ShiftType, UserConfig, CareerChange, WorkTurn } from '../types';
import { startOfDay, parse, getDay, differenceInCalendarDays, isBefore, isValid, parseISO } from 'date-fns';

/**
 * Calculates the effective configuration for a user on a specific date,
 * taking into account their career history (promotions, shift changes, etc).
 */
export function getEffectiveConfig(date: Date, config: Partial<UserConfig>): {
  shiftType: ShiftType;
  startDate: string;
  offDays: number[];
  rotatingWorkDays?: number;
  rotatingOffDays?: number;
  role?: string;
  turn?: WorkTurn;
} {
  // Configuração base (inicial)
  let effective = {
    shiftType: config.shiftType || ShiftType.FIVE_TWO,
    startDate: config.startDate || '2024-01-01',
    offDays: config.offDays || [],
    rotatingWorkDays: config.rotatingWorkDays,
    rotatingOffDays: config.rotatingOffDays,
    role: config.role,
    turn: config.turn
  };

  if (!config.careerHistory || config.careerHistory.length === 0) {
    return effective;
  }

  // Ordenar histórico por data (antigo -> recente)
  const sortedHistory = [...config.careerHistory].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const targetDateStr = date.toISOString().split('T')[0];

  for (const change of sortedHistory) {
    if (change.date <= targetDateStr) {
      // Se houve mudança de escala, a data de início da contagem passa a ser a data da mudança
      // Isso é crucial para escalas rotativas (12x36, etc) sincronizarem corretamente
      const shiftChanged = (change.shiftType && change.shiftType !== effective.shiftType) ||
        (change.rotatingWorkDays && change.rotatingWorkDays !== effective.rotatingWorkDays) ||
        (change.rotatingOffDays && change.rotatingOffDays !== effective.rotatingOffDays);

      if (shiftChanged) {
        effective.startDate = change.date;
      }

      // Aplicar mudanças
      if (change.shiftType) effective.shiftType = change.shiftType;
      if (change.offDays) effective.offDays = change.offDays;
      if (change.rotatingWorkDays) effective.rotatingWorkDays = change.rotatingWorkDays;
      if (change.rotatingOffDays) effective.rotatingOffDays = change.rotatingOffDays;
      if (change.role) effective.role = change.role;
      if (change.turn) effective.turn = change.turn;
    }
  }

  return effective;
}

export function isWorkDay(date: Date, config: Partial<UserConfig>): boolean {
  // Verificação de segurança para datas inválidas
  if (!isValid(date) || isNaN(date.getTime())) {
    return false;
  }

  const checkDate = startOfDay(date);

  // Obter a configuração efetiva para esta data específica
  const effectiveConfig = getEffectiveConfig(checkDate, config);

  // Normalizar a data de início para o horário local
  const start = startOfDay(parse(effectiveConfig.startDate, 'yyyy-MM-dd', new Date()));

  // REGRA CRÍTICA: Não há programação de escala antes da data de início oficial (da configuração efetiva)
  // Se a data verificada for anterior ao início desta fase da carreira/regime, 
  // pode ser necessário verificar se existia um regime anterior.
  // Pela lógica do getEffectiveConfig, se a data for anterior a QUALQUER histórico, ele usa o base.
  // Se o base.startDate for depois da data, retorna false.
  if (isBefore(checkDate, start)) {
    return false;
  }

  const dayOfWeek = getDay(checkDate); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

  switch (effectiveConfig.shiftType) {
    case ShiftType.FIVE_TWO:
      // Segunda (1) a Sexta (5) fixa
      return dayOfWeek >= 1 && dayOfWeek <= 5;

    case ShiftType.SIX_ONE:
      // Segunda (1) a Sábado (6) fixa
      return dayOfWeek >= 1 && dayOfWeek <= 6;

    case ShiftType.TWELVE_THIRTY_SIX: {
      const diff = differenceInCalendarDays(checkDate, start);
      return diff % 2 === 0;
    }

    case ShiftType.ROTATING: {
      const work = effectiveConfig.rotatingWorkDays || 5;
      const off = effectiveConfig.rotatingOffDays || 1;
      const cycle = work + off;
      const diff = differenceInCalendarDays(checkDate, start);

      const posInCycle = ((diff % cycle) + cycle) % cycle;
      return posInCycle < work;
    }

    case ShiftType.FLEXIBLE:
      return !effectiveConfig.offDays.includes(dayOfWeek);

    default:
      return true;
  }
}
