
export enum ShiftType {
  FIVE_TWO = '5x2',
  SIX_ONE = '6x1',
  TWELVE_THIRTY_SIX = '12x36',
  ROTATING = 'Revezamento',
  FLEXIBLE = 'Flexível'
}

export enum WorkTurn {
  MORNING = 'Manhã',
  AFTERNOON = 'Tarde',
  NIGHT = 'Noite'
}

export enum ThemeStyle {
  MODERN = 'Moderno Minimalista',
  DYNAMIC = 'Dinâmico Colorido',
  CLASSIC = 'Clássico Profissional',
  CYBERPUNK = 'Cyberpunk Futurista',
  SYNTHWAVE = 'Synthwave Retrô',
  NEON = 'Neon Web'
}

export interface UserConfig {
  id: string;
  name: string;
  role: string;
  shiftType: ShiftType;
  turn: WorkTurn;
  startDate: string;
  offDays: number[];
  vacationDates?: string[]; // Array de strings ISO (yyyy-MM-dd)
  overtimeDates?: string[]; // Array de strings ISO (yyyy-MM-dd)
  rotatingWorkDays?: number;
  rotatingOffDays?: number;
  state: string;
  city: string;
  theme: ThemeStyle;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
  notes?: string;
}

export interface Absence {
  id: string;
  profileId: string;
  date: string;
  reason: string;
  description: string;
  status: 'Pendente' | 'Aprovado' | 'Recusado';
}

export interface Holiday {
  id?: string;
  date: string;
  name: string;
  type: string;
  isGlobal?: boolean;
  icon?: string;
}

export interface AuditLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  tableName: string;
  recordId: string;
  oldData?: any;
  newData?: any;
  createdAt: string;
}
