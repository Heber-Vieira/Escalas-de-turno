
import { ShiftType } from '../types';
import { startOfDay, parse, getDay, differenceInCalendarDays, isBefore, isValid } from 'date-fns';

export function isWorkDay(date: Date, config: { 
  shiftType: ShiftType, 
  startDate: string, 
  offDays: number[],
  rotatingWorkDays?: number,
  rotatingOffDays?: number
}): boolean {
  // Verificação de segurança para datas inválidas (ex: quando o usuário clica em "Limpar" no date picker)
  if (!isValid(date) || isNaN(date.getTime())) {
    return false;
  }

  const checkDate = startOfDay(date);
  // Normalizar a data de início para o horário local
  const start = startOfDay(parse(config.startDate, 'yyyy-MM-dd', new Date()));

  // REGRA CRÍTICA: Não há programação de escala antes da data de início oficial
  if (isBefore(checkDate, start)) {
    return false;
  }

  const dayOfWeek = getDay(checkDate); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

  switch (config.shiftType) {
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
      const work = config.rotatingWorkDays || 5;
      const off = config.rotatingOffDays || 1;
      const cycle = work + off;
      const diff = differenceInCalendarDays(checkDate, start);
      
      const posInCycle = ((diff % cycle) + cycle) % cycle;
      return posInCycle < work;
    }

    case ShiftType.FLEXIBLE:
      return !config.offDays.includes(dayOfWeek);

    default:
      return true;
  }
}
