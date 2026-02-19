import { Agency, AppSettings } from '../types';

// ─── Colors ───────────────────────────────────────────────────────────────────

export const COLORS = {
  primary: '#f59e0b',
  primaryDark: '#b45309',
  primaryLight: '#fef3c7',
  background: '#fafaf9',
  card: '#ffffff',
  text: '#1c1917',
  textMuted: '#78716c',
  textLight: '#a8a29e',
  border: '#e7e5e4',
  success: '#22c55e',
  successLight: '#dcfce7',
  danger: '#ef4444',
  dangerLight: '#fee2e2',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  info: '#3b82f6',
  infoLight: '#dbeafe',
  rose: '#f43f5e',
  roseLight: '#ffe4e6',
  emerald: '#10b981',
  emeraldLight: '#d1fae5',
  violet: '#8b5cf6',
  violetLight: '#ede9fe',
};

// ─── Default Agencies ─────────────────────────────────────────────────────────

export const DEFAULT_AGENCIES: Agency[] = [
  {
    id: 'agency-1',
    name: 'Özel Tur',
    defaultDailyRate: 1500,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'agency-2',
    name: 'TUI',
    defaultDailyRate: 2000,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'agency-3',
    name: 'Neckermann',
    defaultDailyRate: 1800,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'agency-4',
    name: 'Thomas Cook',
    defaultDailyRate: 1800,
    createdAt: new Date().toISOString(),
  },
];

// ─── Default Settings ─────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: AppSettings = {
  defaultDailyRate: 1500,
  notificationsEnabled: true,
  firstDayOfWeek: 1, // Monday
};

// ─── Premium Limits ───────────────────────────────────────────────────────────

export const FREE_TIER = {
  maxAgencies: 5,
  maxToursPerMonth: 999, // unlimited for basic
  canExport: false,
  canViewAdvancedReports: false,
  canCloudSync: false,
};

export const PREMIUM_TIER = {
  maxAgencies: 999,
  maxToursPerMonth: 999,
  canExport: true,
  canViewAdvancedReports: true,
  canCloudSync: true,
};

// ─── Tour Type Labels ─────────────────────────────────────────────────────────

export const TOUR_TYPE_LABELS = {
  HALF: 'Yarım Gün',
  FULL: 'Tam Gün',
  PACKAGE: 'Paket Tur',
};

export const PAYMENT_STATUS_LABELS = {
  UNPAID: 'Ödenmedi',
  PARTIAL: 'Kısmi Ödendi',
  PAID: 'Ödendi',
};

export const TOUR_STATUS_LABELS = {
  UPCOMING: 'Yaklaşan',
  CURRENT: 'Aktif',
  PAST: 'Geçmiş',
};

// ─── Turkish Calendar ─────────────────────────────────────────────────────────

export const TR_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

export const TR_DAYS_SHORT = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
export const TR_DAYS_LONG = [
  'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar',
];
