
import { ShiftType, ThemeStyle } from './types';

export const BRAZIL_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export const NATIONAL_HOLIDAYS = [
  { date: '2024-01-01', name: 'Confraternização Universal', type: 'Nacional' },
  { date: '2024-02-13', name: 'Carnaval', type: 'Nacional' },
  { date: '2024-03-29', name: 'Sexta-feira Santa', type: 'Nacional' },
  { date: '2024-04-21', name: 'Tiradentes', type: 'Nacional' },
  { date: '2024-05-01', name: 'Dia do Trabalho', type: 'Nacional' },
  { date: '2024-05-30', name: 'Corpus Christi', type: 'Nacional' },
  { date: '2024-09-07', name: 'Independência do Brasil', type: 'Nacional' },
  { date: '2024-10-12', name: 'Nossa Senhora Aparecida', type: 'Nacional' },
  { date: '2024-11-02', name: 'Finados', type: 'Nacional' },
  { date: '2024-11-15', name: 'Proclamação da República', type: 'Nacional' },
  { date: '2024-11-20', name: 'Dia da Consciência Negra', type: 'Nacional' },
  { date: '2024-12-25', name: 'Natal', type: 'Nacional' },
];

export const STATE_HOLIDAYS: Record<string, { date: string, name: string }[]> = {
  'SP': [{ date: '2024-07-09', name: 'Revolução Constitucionalista' }],
  'RJ': [{ date: '2024-01-20', name: 'São Sebastião' }, { date: '2024-04-23', name: 'São Jorge' }],
  'MG': [{ date: '2024-04-21', name: 'Inconfidência Mineira' }],
};

export interface ThemeConfig {
  bg: string;
  text: string;
  primary: string;
  button: string;
  card: string;
  font: string;
  workDay: string;
  offDay: string;
  selectedDay: string;
  icon: string;
}

export const THEME_CONFIGS: Record<ThemeStyle, ThemeConfig> = {
  [ThemeStyle.MODERN]: {
    bg: 'bg-white',
    text: 'text-gray-900',
    primary: 'text-emerald-600',
    button: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
    card: 'bg-white border border-gray-100 shadow-sm rounded-2xl',
    font: 'font-inter',
    workDay: 'bg-emerald-50 text-emerald-700',
    offDay: 'bg-orange-50 text-orange-700',
    selectedDay: 'bg-emerald-600 text-white',
    icon: '✨'
  },
  [ThemeStyle.DYNAMIC]: {
    bg: 'bg-gradient-to-br from-blue-50 to-emerald-50',
    text: 'text-gray-900',
    primary: 'text-blue-600',
    button: 'bg-gradient-to-r from-blue-600 to-emerald-500 shadow-lg text-white',
    card: 'bg-white/80 backdrop-blur-md border border-white/20 shadow-xl rounded-3xl',
    font: 'font-sans',
    workDay: 'bg-blue-100 text-blue-700',
    offDay: 'bg-amber-100 text-amber-700',
    selectedDay: 'bg-blue-600 text-white',
    icon: '🌈'
  },
  [ThemeStyle.CLASSIC]: {
    bg: 'bg-gray-100',
    text: 'text-indigo-950',
    primary: 'text-indigo-900',
    button: 'bg-indigo-900 hover:bg-indigo-800 text-white rounded-none',
    card: 'bg-gray-200 border-2 border-gray-300 shadow-none rounded-none',
    font: 'font-roboto',
    workDay: 'bg-indigo-50 text-indigo-900 border border-indigo-200',
    offDay: 'bg-gray-50 text-gray-500 border border-gray-200',
    selectedDay: 'bg-indigo-900 text-white',
    icon: '🏛️'
  },
  [ThemeStyle.CYBERPUNK]: {
    bg: 'bg-[#0a0a0f]',
    text: 'text-cyan-400',
    primary: 'text-pink-500',
    button: 'bg-pink-600 hover:bg-pink-500 text-white shadow-[0_0_15px_rgba(219,39,119,0.8)] uppercase tracking-widest',
    card: 'bg-gray-900/50 border border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)] rounded-lg',
    font: 'font-orbitron',
    workDay: 'bg-cyan-950 text-cyan-300 border border-cyan-500/30',
    offDay: 'bg-purple-950/30 text-purple-400 border border-purple-500/30',
    selectedDay: 'bg-pink-600 text-white shadow-[0_0_10px_#ff00ff]',
    icon: '💪'
  },
  [ThemeStyle.SYNTHWAVE]: {
    bg: 'bg-gradient-to-b from-[#2e1a47] to-[#1a0b2e]',
    text: 'text-[#ff71ce]',
    primary: 'text-[#01cdfe]',
    button: 'bg-[#ff71ce] hover:bg-[#ff94e0] text-[#1a0b2e] shadow-[0_0_20px_#ff71ce] font-exo font-extrabold italic uppercase',
    card: 'bg-[#24173d]/60 border border-[#05ffa1] shadow-[0_0_15px_rgba(5,255,161,0.2)] rounded-2xl backdrop-blur-sm',
    font: 'font-exo',
    workDay: 'bg-[#ff71ce]/20 text-[#ff71ce] border border-[#ff71ce]/40',
    offDay: 'bg-[#01cdfe]/20 text-[#01cdfe] border border-[#01cdfe]/40',
    selectedDay: 'bg-[#05ffa1] text-[#1a0b2e] shadow-[0_0_15px_#05ffa1]',
    icon: '🏙️'
  },
  [ThemeStyle.NEON]: {
    bg: 'bg-black',
    text: 'text-[#39ff14]',
    primary: 'text-[#fff01f]',
    button: 'bg-[#39ff14] hover:bg-[#32e012] text-black font-black uppercase tracking-tighter shadow-[0_0_30px_#39ff14]',
    card: 'bg-black border-2 border-[#39ff14] shadow-[0_0_10px_#39ff14] rounded-none',
    font: 'font-mono',
    workDay: 'bg-black text-[#39ff14] border border-[#39ff14]',
    offDay: 'bg-black text-[#fff01f] border border-[#fff01f]',
    selectedDay: 'bg-[#39ff14] text-black shadow-[0_0_20px_#39ff14]',
    icon: '🟢'
  }
};
