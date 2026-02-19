import {
  AgencyReport,
  Expense,
  FinancialSummary,
  MonthlyReport,
  TourEntry,
  TourStatus,
} from '../types';

// ─── Tour Duration ────────────────────────────────────────────────────────────

export function getTourDurationDays(tour: TourEntry): number {
  if (tour.type === 'HALF') return 0.5;
  const start = new Date(tour.startDate);
  const end = new Date(tour.endDate);
  const diff = Math.floor(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  return Math.max(1, diff + 1);
}

// ─── Tour Income ──────────────────────────────────────────────────────────────

export function getTourBaseIncome(tour: TourEntry): number {
  return tour.dailyRate * getTourDurationDays(tour);
}

export function getTourTipsTotal(tour: TourEntry): number {
  return tour.tips.reduce((sum, tip) => sum + tip.amount, 0);
}

export function getTourCommissionsTotal(tour: TourEntry): number {
  return tour.commissions.reduce((sum, c) => sum + c.amount, 0);
}

export function getTourTotalIncome(tour: TourEntry): number {
  return (
    getTourBaseIncome(tour) +
    getTourTipsTotal(tour) +
    getTourCommissionsTotal(tour)
  );
}

// ─── Tour Status ──────────────────────────────────────────────────────────────

export function getTourStatus(tour: TourEntry): TourStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(tour.startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(tour.endDate);
  end.setHours(0, 0, 0, 0);

  if (today < start) return 'UPCOMING';
  if (today > end) return 'PAST';
  return 'CURRENT';
}

// ─── Date Helpers ─────────────────────────────────────────────────────────────

export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}.${m}.${y}`;
}

export function formatDateRange(start: string, end: string): string {
  if (start === end) return formatDate(start);
  return `${formatDate(start)} - ${formatDate(end)}`;
}

// ─── Currency Formatting ──────────────────────────────────────────────────────

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function parseTurkishNumber(value: string): number {
  return parseFloat(value.replace(',', '.')) || 0;
}

// ─── Period Filtering ─────────────────────────────────────────────────────────

export function filterByMonth<T extends { startDate?: string; date?: string }>(
  items: T[],
  year: number,
  month: number, // 1-12
): T[] {
  return items.filter((item) => {
    const dateStr = (item as { startDate?: string; date?: string }).startDate ?? item.date ?? '';
    const [y, m] = dateStr.split('-').map(Number);
    return y === year && m === month;
  });
}

// ─── Financial Summary ────────────────────────────────────────────────────────

export function calculateFinancialSummary(
  tours: TourEntry[],
  expenses: Expense[],
): FinancialSummary {
  const totalDailyRates = tours.reduce(
    (sum, t) => sum + getTourBaseIncome(t),
    0,
  );
  const totalTips = tours.reduce((sum, t) => sum + getTourTipsTotal(t), 0);
  const totalCommissions = tours.reduce(
    (sum, t) => sum + getTourCommissionsTotal(t),
    0,
  );
  const totalIncome = totalDailyRates + totalTips + totalCommissions;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const netMargin =
    totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

  const unpaidAmount = tours
    .filter((t) => t.paymentStatus !== 'PAID')
    .reduce((sum, t) => sum + getTourBaseIncome(t) - (t.paidAmount ?? 0), 0);

  const paidAmount = tours
    .filter((t) => t.paymentStatus === 'PAID')
    .reduce((sum, t) => sum + getTourBaseIncome(t), 0);

  return {
    totalIncome,
    totalDailyRates,
    totalTips,
    totalCommissions,
    totalExpenses,
    netProfit,
    netMargin,
    unpaidAmount,
    paidAmount,
  };
}

// ─── Monthly Reports ──────────────────────────────────────────────────────────

export function buildMonthlyReports(
  tours: TourEntry[],
  expenses: Expense[],
  monthCount = 12,
): MonthlyReport[] {
  const reports: MonthlyReport[] = [];
  const now = new Date();

  for (let i = monthCount - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const monthTours = tours.filter((t) => {
      const [y, m] = t.startDate.split('-').map(Number);
      return y === year && m === month;
    });

    const monthExpenses = expenses.filter((e) => {
      const [y, m] = e.date.split('-').map(Number);
      return y === year && m === month;
    });

    const totalIncome = monthTours.reduce(
      (sum, t) => sum + getTourTotalIncome(t),
      0,
    );
    const totalExpenses = monthExpenses.reduce(
      (sum, e) => sum + e.amount,
      0,
    );

    reports.push({
      month,
      year,
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      tourCount: monthTours.length,
    });
  }

  return reports;
}

// ─── Agency Reports ───────────────────────────────────────────────────────────

export function buildAgencyReports(
  tours: TourEntry[],
  agencies: { id: string; name: string }[],
): AgencyReport[] {
  return agencies.map((agency) => {
    const agencyTours = tours.filter((t) => t.agencyId === agency.id);
    const totalDailyRates = agencyTours.reduce(
      (sum, t) => sum + getTourBaseIncome(t),
      0,
    );
    const totalTips = agencyTours.reduce(
      (sum, t) => sum + getTourTipsTotal(t),
      0,
    );
    const totalCommissions = agencyTours.reduce(
      (sum, t) => sum + getTourCommissionsTotal(t),
      0,
    );
    const unpaidAmount = agencyTours
      .filter((t) => t.paymentStatus !== 'PAID')
      .reduce((sum, t) => sum + getTourBaseIncome(t) - (t.paidAmount ?? 0), 0);

    return {
      agencyId: agency.id,
      agencyName: agency.name,
      tourCount: agencyTours.length,
      totalDailyRates,
      totalCommissions,
      totalTips,
      totalIncome: totalDailyRates + totalTips + totalCommissions,
      unpaidAmount,
    };
  });
}

// ─── Conflict Detection ───────────────────────────────────────────────────────

export function hasConflict(
  newStart: string,
  newEnd: string,
  existingTours: TourEntry[],
  excludeId?: string,
): boolean {
  return existingTours.some((tour) => {
    if (tour.id === excludeId) return false;
    return newStart <= tour.endDate && newEnd >= tour.startDate;
  });
}
