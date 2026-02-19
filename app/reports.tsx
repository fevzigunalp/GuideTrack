import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { COLORS, TR_MONTHS } from '../constants';
import {
  buildAgencyReports,
  buildMonthlyReports,
  formatCurrency,
} from '../services/calculations';
import { exportAll } from '../services/export';

type ReportTab = 'monthly' | 'agency';

function ProgressBar({ value, max, color = COLORS.primary }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <View style={barStyles.track}>
      <View style={[barStyles.fill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

const barStyles = StyleSheet.create({
  track: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
});

export default function ReportsScreen() {
  const router = useRouter();
  const { state } = useApp();
  const [tab, setTab] = useState<ReportTab>('monthly');
  const [exporting, setExporting] = useState(false);

  const isPremium = state.user?.isPremium ?? false;

  const monthlyReports = useMemo(
    () => buildMonthlyReports(state.tours, state.expenses, 12),
    [state.tours, state.expenses],
  );

  const agencyReports = useMemo(
    () =>
      buildAgencyReports(
        state.tours,
        state.agencies.map((a) => ({ id: a.id, name: a.name })),
      ).filter((r) => r.tourCount > 0)
        .sort((a, b) => b.totalIncome - a.totalIncome),
    [state.tours, state.agencies],
  );

  const maxMonthlyIncome = Math.max(...monthlyReports.map((r) => r.totalIncome), 1);
  const maxAgencyIncome = Math.max(...agencyReports.map((r) => r.totalIncome), 1);

  const handleExport = async () => {
    if (!isPremium) {
      Alert.alert(
        'Premium Özellik',
        'Dışa aktarma özelliği Premium üyelere özeldir.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Premium Al', onPress: () => {} },
        ],
      );
      return;
    }
    try {
      setExporting(true);
      await exportAll(state.tours, state.expenses, state.agencies);
    } catch (e) {
      Alert.alert('Hata', String(e));
    } finally {
      setExporting(false);
    }
  };

  const totalYearIncome = monthlyReports.reduce((s, r) => s + r.totalIncome, 0);
  const totalYearExpense = monthlyReports.reduce((s, r) => s + r.totalExpenses, 0);
  const totalYearProfit = totalYearIncome - totalYearExpense;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Raporlar</Text>
        <TouchableOpacity
          style={[styles.exportBtn, exporting && { opacity: 0.5 }]}
          onPress={handleExport}
          disabled={exporting}
        >
          <Ionicons name="download-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Year Summary */}
      <View style={styles.yearSummary}>
        <View style={styles.yearStat}>
          <Text style={styles.yearStatValue}>{formatCurrency(totalYearIncome)}</Text>
          <Text style={styles.yearStatLabel}>Toplam Gelir</Text>
        </View>
        <View style={styles.yearDivider} />
        <View style={styles.yearStat}>
          <Text style={[styles.yearStatValue, { color: COLORS.danger }]}>
            {formatCurrency(totalYearExpense)}
          </Text>
          <Text style={styles.yearStatLabel}>Toplam Gider</Text>
        </View>
        <View style={styles.yearDivider} />
        <View style={styles.yearStat}>
          <Text
            style={[
              styles.yearStatValue,
              { color: totalYearProfit >= 0 ? COLORS.success : COLORS.danger },
            ]}
          >
            {formatCurrency(totalYearProfit)}
          </Text>
          <Text style={styles.yearStatLabel}>Net Kazanç</Text>
        </View>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'monthly' && styles.tabBtnActive]}
          onPress={() => setTab('monthly')}
        >
          <Text style={[styles.tabLabel, tab === 'monthly' && styles.tabLabelActive]}>
            Aylık
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'agency' && styles.tabBtnActive]}
          onPress={() => setTab('agency')}
        >
          <Text style={[styles.tabLabel, tab === 'agency' && styles.tabLabelActive]}>
            Ajans Bazlı
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {tab === 'monthly' ? (
          // Monthly Report
          monthlyReports.map((report) => {
            const profit = report.totalIncome - report.totalExpenses;
            return (
              <View key={`${report.year}-${report.month}`} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <View>
                    <Text style={styles.reportMonth}>
                      {TR_MONTHS[report.month - 1]} {report.year}
                    </Text>
                    <Text style={styles.reportTours}>{report.tourCount} tur</Text>
                  </View>
                  <Text
                    style={[
                      styles.reportProfit,
                      { color: profit >= 0 ? COLORS.success : COLORS.danger },
                    ]}
                  >
                    {profit >= 0 ? '+' : ''}
                    {formatCurrency(profit)}
                  </Text>
                </View>

                <View style={styles.reportBars}>
                  <View style={styles.barRow}>
                    <Text style={styles.barLabel}>Gelir</Text>
                    <ProgressBar value={report.totalIncome} max={maxMonthlyIncome} color={COLORS.success} />
                    <Text style={styles.barValue}>{formatCurrency(report.totalIncome)}</Text>
                  </View>
                  <View style={styles.barRow}>
                    <Text style={styles.barLabel}>Gider</Text>
                    <ProgressBar value={report.totalExpenses} max={maxMonthlyIncome} color={COLORS.danger} />
                    <Text style={styles.barValue}>{formatCurrency(report.totalExpenses)}</Text>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          // Agency Report
          agencyReports.length > 0 ? (
            agencyReports.map((report) => (
              <View key={report.agencyId} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <View>
                    <Text style={styles.reportMonth}>{report.agencyName}</Text>
                    <Text style={styles.reportTours}>{report.tourCount} tur</Text>
                  </View>
                  <Text style={styles.reportProfit}>{formatCurrency(report.totalIncome)}</Text>
                </View>

                <ProgressBar
                  value={report.totalIncome}
                  max={maxAgencyIncome}
                  color={COLORS.primary}
                />

                <View style={styles.agencyDetails}>
                  <View style={styles.agencyDetailItem}>
                    <Text style={styles.agencyDetailLabel}>Yevmiye</Text>
                    <Text style={styles.agencyDetailValue}>
                      {formatCurrency(report.totalDailyRates)}
                    </Text>
                  </View>
                  <View style={styles.agencyDetailItem}>
                    <Text style={styles.agencyDetailLabel}>Komisyon</Text>
                    <Text style={styles.agencyDetailValue}>
                      {formatCurrency(report.totalCommissions)}
                    </Text>
                  </View>
                  <View style={styles.agencyDetailItem}>
                    <Text style={styles.agencyDetailLabel}>Alacak</Text>
                    <Text style={[styles.agencyDetailValue, { color: COLORS.danger }]}>
                      {formatCurrency(report.unpaidAmount)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyReport}>
              <Ionicons name="business-outline" size={40} color={COLORS.textLight} />
              <Text style={styles.emptyText}>Ajans verisi bulunamadı.</Text>
            </View>
          )
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: COLORS.background,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontSize: 22, fontWeight: '700', color: COLORS.text },
  exportBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  yearSummary: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  yearStat: { flex: 1, alignItems: 'center' },
  yearDivider: { width: 1, backgroundColor: COLORS.border },
  yearStatValue: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  yearStatLabel: { fontSize: 11, color: COLORS.textMuted },

  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnActive: { backgroundColor: COLORS.primary },
  tabLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
  tabLabelActive: { color: '#fff' },

  content: { paddingHorizontal: 16, gap: 10 },

  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportMonth: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  reportTours: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  reportProfit: { fontSize: 16, fontWeight: '700', color: COLORS.success },

  reportBars: { gap: 8, marginTop: 4 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel: { fontSize: 12, color: COLORS.textMuted, width: 36 },
  barValue: { fontSize: 11, color: COLORS.textMuted, width: 70, textAlign: 'right' },

  agencyDetails: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  agencyDetailItem: { flex: 1, alignItems: 'center' },
  agencyDetailLabel: { fontSize: 11, color: COLORS.textMuted, marginBottom: 2 },
  agencyDetailValue: { fontSize: 13, fontWeight: '600', color: COLORS.text },

  emptyReport: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: { fontSize: 15, color: COLORS.textMuted },
});
