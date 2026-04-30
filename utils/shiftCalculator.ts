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

  const ensureArray = (arr: any) => Array.isArray(arr) ? arr : [];
  
  if (!config.careerHistory || ensureArray(config.careerHistory).length === 0) {
    return effective;
  }

  // Ordenar histórico por data (antigo -> recente)
  const sortedHistory = [...ensureArray(config.careerHistory)].sort((a, b) =>
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
      if (change.role) effective.role = change.role.trim();
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

  // Normalizar a data de início para o horário local com fallback seguro
  let start: Date;
  try {
    const startDateStr = String(effectiveConfig.startDate || '2024-01-01');
    start = parseISO(startDateStr);
    if (!isValid(start)) {
      start = parse(startDateStr, 'yyyy-MM-dd', new Date());
    }
    if (!isValid(start)) {
      start = new Date(); // Fallback final
    }
  } catch {
    start = new Date();
  }
  start = startOfDay(start);

  // REGRA CRÍTICA: Não há programação de escala antes da data de início oficial (da configuração efetiva)
  // Se a data verificada for anterior ao início desta fase da carreira/regime, 
  // pode ser necessário verificar se existia um regime anterior.
  // Pela lógica do getEffectiveConfig, se a data for anterior a QUALQUER histórico, ele usa o base.
  // Se o base.startDate for depois da data, retorna false.
  if (isBefore(checkDate, start)) {
    return false;
  }

  const dayOfWeek = getDay(checkDate); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

  // Normalizar o tipo de escala para comparação robusta
  const shiftType = String(effectiveConfig.shiftType || '').trim();

  switch (shiftType) {
    case '5x2':
    case ShiftType.FIVE_TWO:
      // Segunda (1) a Sexta (5) fixa - Padrão CLT
      return dayOfWeek >= 1 && dayOfWeek <= 5;

    case '6x1':
    case ShiftType.SIX_ONE:
      // Segunda (1) a Sábado (6) fixa - Padrão CLT
      return dayOfWeek >= 1 && dayOfWeek <= 6;

    case '12x36':
    case '12x38': // Autocorreção para erro comum no banco de dados
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

    case ShiftType.FLEXIBLE: {
      const offDays = Array.isArray(effectiveConfig.offDays) ? effectiveConfig.offDays : [];
      return !offDays.includes(dayOfWeek);
    }

    default:
      return true;
  }
}

/**
 * Formata um nome/cargo para "Title Case", garantindo que:
 * 1. Partículas (de, da, do, etc) fiquem minúsculas.
 * 2. Algarismos romanos (I, II, III, etc) fiquem sempre maiúsculos.
 * 3. Números isolados de 1 a 10 sejam convertidos para algarismos romanos.
 */
export function formatName(name: string): string {
  if (!name) return '';
  
  const particles = ['de', 'da', 'do', 'dos', 'das', 'e'];
  const romanMap: Record<string, string> = {
    '1': 'I', '2': 'II', '3': 'III', '4': 'IV', '5': 'V',
    '6': 'VI', '7': 'VII', '8': 'VIII', '9': 'IX', '10': 'X',
    'i': 'I', 'ii': 'II', 'iii': 'III', 'iv': 'IV', 'v': 'V',
    'vi': 'VI', 'vii': 'VII', 'viii': 'VIII', 'ix': 'IX', 'x': 'X'
  };
  
  return name.trim().toLowerCase().split(/\s+/).map((word, index) => {
    // Mantém partículas em minúsculo (exceto se for a primeira palavra)
    if (particles.includes(word) && index > 0) return word;
    
    // Autocorreção para escalas com erro de digitação (ex: 12x38 -> 12x36)
    const shiftCorrections: Record<string, string> = {
      '12x38': '12x36',
      '12x37': '12x36'
    };
    if (shiftCorrections[word]) return shiftCorrections[word];
    
    // Converte para Romano se estiver no mapa (números ou romanos minúsculos)
    if (romanMap[word]) return romanMap[word];
    
    // Capitalização padrão: Primeira letra maiúscula
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

export function normalizeString(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
