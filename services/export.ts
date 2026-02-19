import { Platform } from 'react-native';
import { Agency, Expense, TourEntry } from '../types';
import {
  formatDate,
  getTourBaseIncome,
  getTourCommissionsTotal,
  getTourTipsTotal,
  getTourTotalIncome,
} from './calculations';

// ─── CSV Helpers ──────────────────────────────────────────────────────────────

function escapeCSV(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function csvRow(...values: (string | number)[]): string {
  return values.map(escapeCSV).join(',');
}

// ─── Tours CSV ────────────────────────────────────────────────────────────────

export function buildToursCSV(tours: TourEntry[], agencies: Agency[]): string {
  const agencyMap = new Map(agencies.map((a) => [a.id, a.name]));

  const header = csvRow(
    'Tur Adı',
    'Tür',
    'Başlangıç',
    'Bitiş',
    'Ajans',
    'Günlük Ücret (₺)',
    'Gün Sayısı',
    'Yevmiye Toplamı (₺)',
    'Bahşiş (₺)',
    'Komisyon (₺)',
    'Toplam Gelir (₺)',
    'Ödeme Durumu',
    'Ödenen (₺)',
    'Notlar',
  );

  const tourTypeLabel = (type: string) => {
    if (type === 'HALF') return 'Yarım Gün';
    if (type === 'FULL') return 'Tam Gün';
    return 'Paket Tur';
  };

  const paymentLabel = (status: string) => {
    if (status === 'PAID') return 'Ödendi';
    if (status === 'PARTIAL') return 'Kısmi Ödendi';
    return 'Ödenmedi';
  };

  const rows = tours
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .map((t) => {
      const duration =
        t.type === 'HALF'
          ? 0.5
          : Math.max(
              1,
              Math.floor(
                (new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) /
                  86400000,
              ) + 1,
            );
      return csvRow(
        t.title,
        tourTypeLabel(t.type),
        formatDate(t.startDate),
        formatDate(t.endDate),
        agencyMap.get(t.agencyId) ?? 'Bilinmiyor',
        t.dailyRate,
        duration,
        getTourBaseIncome(t),
        getTourTipsTotal(t),
        getTourCommissionsTotal(t),
        getTourTotalIncome(t),
        paymentLabel(t.paymentStatus),
        t.paidAmount ?? 0,
        t.notes,
      );
    });

  return ['\uFEFF' + header, ...rows].join('\n');
}

// ─── Expenses CSV ─────────────────────────────────────────────────────────────

export function buildExpensesCSV(expenses: Expense[]): string {
  const header = csvRow('Başlık', 'Kategori', 'Tarih', 'Tutar (₺)', 'Tekrarlayan', 'Notlar');

  const rows = expenses
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) =>
      csvRow(
        e.title,
        e.category,
        formatDate(e.date),
        e.amount,
        e.isRecurring ? 'Evet' : 'Hayır',
        e.notes ?? '',
      ),
    );

  return ['\uFEFF' + header, ...rows].join('\n');
}

// ─── Platform-aware Share / Download ─────────────────────────────────────────

function downloadCSVWeb(content: string, filename: string): void {
  // Browser download via Blob API
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function shareCSVNative(content: string, filename: string): Promise<void> {
  // Dynamic import so web bundle doesn't try to resolve native modules
  const FileSystem = await import('expo-file-system');
  const Sharing = await import('expo-sharing');

  const path = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(path, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Bu cihazda paylaşma özelliği desteklenmiyor.');
  }

  await Sharing.shareAsync(path, {
    mimeType: 'text/csv',
    dialogTitle: 'Dışa Aktar',
  });
}

async function shareCSV(content: string, filename: string): Promise<void> {
  if (Platform.OS === 'web') {
    downloadCSVWeb(content, filename);
  } else {
    await shareCSVNative(content, filename);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function exportTours(
  tours: TourEntry[],
  agencies: Agency[],
): Promise<void> {
  const csv = buildToursCSV(tours, agencies);
  const date = new Date().toISOString().split('T')[0];
  await shareCSV(csv, `guidetrack-turlar-${date}.csv`);
}

export async function exportExpenses(expenses: Expense[]): Promise<void> {
  const csv = buildExpensesCSV(expenses);
  const date = new Date().toISOString().split('T')[0];
  await shareCSV(csv, `guidetrack-giderler-${date}.csv`);
}

export async function exportAll(
  tours: TourEntry[],
  expenses: Expense[],
  agencies: Agency[],
): Promise<void> {
  const tourCSV = buildToursCSV(tours, agencies);
  const expenseCSV = buildExpensesCSV(expenses);
  const combined = `TUR KAYITLARI\n${tourCSV}\n\nGİDER KAYITLARI\n${expenseCSV}`;
  const date = new Date().toISOString().split('T')[0];
  await shareCSV(combined, `guidetrack-tum-veriler-${date}.csv`);
}
