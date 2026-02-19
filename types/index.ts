// ─── Tour Types ───────────────────────────────────────────────────────────────

export type TourType = 'HALF' | 'FULL' | 'PACKAGE';
export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';
export type TourStatus = 'UPCOMING' | 'CURRENT' | 'PAST';

export interface Commission {
  id: string;
  category: string;
  amount: number;
}

export interface Tip {
  id: string;
  amount: number;
  note?: string;
}

export interface TourEntry {
  id: string;
  title: string;
  type: TourType;
  startDate: string; // ISO date string YYYY-MM-DD
  endDate: string;   // ISO date string YYYY-MM-DD
  agencyId: string;
  dailyRate: number;
  paymentStatus: PaymentStatus;
  paidAmount: number;
  paidDate?: string;
  tips: Tip[];
  commissions: Commission[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Agency ───────────────────────────────────────────────────────────────────

export interface Agency {
  id: string;
  name: string;
  defaultDailyRate: number;
  contactPerson?: string;
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: string;
}

// ─── Expense ──────────────────────────────────────────────────────────────────

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string; // ISO date string YYYY-MM-DD
  isRecurring: boolean;
  recurrenceMonths?: number;
  notes?: string;
  createdAt: string;
}

// ─── User & Settings ──────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  isPremium: boolean;
  premiumExpiresAt?: string;
  createdAt: string;
}

export interface AppSettings {
  defaultDailyRate: number;
  notificationsEnabled: boolean;
  firstDayOfWeek: 0 | 1; // 0=Sunday, 1=Monday
}

// ─── Financial ────────────────────────────────────────────────────────────────

export interface FinancialSummary {
  totalIncome: number;
  totalDailyRates: number;
  totalTips: number;
  totalCommissions: number;
  totalExpenses: number;
  netProfit: number;
  netMargin: number;
  unpaidAmount: number;
  paidAmount: number;
}

export interface MonthlyReport {
  month: number; // 1-12
  year: number;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  tourCount: number;
}

export interface AgencyReport {
  agencyId: string;
  agencyName: string;
  tourCount: number;
  totalDailyRates: number;
  totalCommissions: number;
  totalTips: number;
  totalIncome: number;
  unpaidAmount: number;
}

// ─── App State ────────────────────────────────────────────────────────────────

export interface AppState {
  tours: TourEntry[];
  expenses: Expense[];
  agencies: Agency[];
  user: UserProfile | null;
  settings: AppSettings;
  expenseCategories: string[];
  isLoading: boolean;
}

// ─── Category Constants ───────────────────────────────────────────────────────

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Kira',
  'Bağkur',
  'Ulaşım',
  'Yemek',
  'Fatura',
  'Telefon',
  'Sağlık',
  'Diğer',
] as const;

export const DEFAULT_COMMISSION_CATEGORIES = [
  'Halı',
  'Taş',
  'Seramik',
  'At Turu',
  'ATV Turu',
  'Yemek',
  'Balon',
  'Deri',
  'Kuru Yemiş',
  'Diğer',
] as const;

export type ExpenseCategory = typeof DEFAULT_EXPENSE_CATEGORIES[number];
export type CommissionCategory = typeof DEFAULT_COMMISSION_CATEGORIES[number];
