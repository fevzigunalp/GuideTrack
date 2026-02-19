import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../../components/StatCard';
import { TourCard } from '../../components/TourCard';
import { COLORS, TR_MONTHS } from '../../constants';
import {
  calculateFinancialSummary,
  filterByMonth,
  formatCurrency,
  getTourStatus,
} from '../../services/calculations';

const PERIOD_OPTIONS = [
  { label: 'Bu Ay', value: 'month' },
  { label: 'Bu Yıl', value: 'year' },
  { label: 'Tümü', value: 'all' },
];

export default function DashboardScreen() {
  const router = useRouter();
  const { state } = useApp();
  const [period, setPeriod] = useState<'month' | 'year' | 'all'>('month');

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const filteredTours = useMemo(() => {
    if (period === 'all') return state.tours;
    if (period === 'year') {
      return state.tours.filter((t) => {
        const y = parseInt(t.startDate.split('-')[0]);
        return y === currentYear;
      });
    }
    return filterByMonth(state.tours, currentYear, currentMonth);
  }, [state.tours, period, currentMonth, currentYear]);

  const filteredExpenses = useMemo(() => {
    if (period === 'all') return state.expenses;
    if (period === 'year') {
      return state.expenses.filter((e) => {
        const y = parseInt(e.date.split('-')[0]);
        return y === currentYear;
      });
    }
    return filterByMonth(state.expenses, currentYear, currentMonth);
  }, [state.expenses, period, currentMonth, currentYear]);

  const summary = useMemo(
    () => calculateFinancialSummary(filteredTours, filteredExpenses),
    [filteredTours, filteredExpenses],
  );

  const upcomingTours = useMemo(
    () =>
      state.tours
        .filter((t) => getTourStatus(t) !== 'PAST')
        .sort((a, b) => a.startDate.localeCompare(b.startDate))
        .slice(0, 3),
    [state.tours],
  );

  const agencyMap = useMemo(
    () => new Map(state.agencies.map((a) => [a.id, a])),
    [state.agencies],
  );

  const periodLabel =
    period === 'month'
      ? `${TR_MONTHS[currentMonth - 1]} ${currentYear}`
      : period === 'year'
      ? `${currentYear} Yılı`
      : 'Tüm Zamanlar';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Merhaba 👋</Text>
          <Text style={styles.headerTitle}>Bilanço</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => router.push('/reports')}
          >
            <Ionicons name="bar-chart-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => router.push('/tour-form')}
          >
            <Ionicons name="add" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {PERIOD_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.periodBtn,
                period === opt.value && styles.periodBtnActive,
              ]}
              onPress={() => setPeriod(opt.value as 'month' | 'year' | 'all')}
            >
              <Text
                style={[
                  styles.periodLabel,
                  period === opt.value && styles.periodLabelActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Net Profit Card */}
        <LinearGradient
          colors={[COLORS.primaryDark, COLORS.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profitCard}
        >
          <View style={styles.profitHeader}>
            <Text style={styles.profitPeriod}>{periodLabel}</Text>
            <View style={styles.marginBadge}>
              <Text style={styles.marginText}>
                {summary.netMargin > 0 ? '+' : ''}
                {summary.netMargin}%
              </Text>
            </View>
          </View>
          <Text style={styles.profitLabel}>Net Kazanç</Text>
          <Text style={styles.profitValue}>{formatCurrency(summary.netProfit)}</Text>
          <View style={styles.profitRow}>
            <View>
              <Text style={styles.profitSubLabel}>Toplam Gelir</Text>
              <Text style={styles.profitSubValue}>
                {formatCurrency(summary.totalIncome)}
              </Text>
            </View>
            <View style={styles.profitDivider} />
            <View>
              <Text style={styles.profitSubLabel}>Toplam Gider</Text>
              <Text style={styles.profitSubValue}>
                {formatCurrency(summary.totalExpenses)}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Income Breakdown */}
        <Text style={styles.sectionTitle}>Gelir Detayı</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Yevmiyeler"
            value={formatCurrency(summary.totalDailyRates)}
            icon={<Ionicons name="briefcase-outline" size={18} color={COLORS.primaryDark} />}
            color={COLORS.primaryDark}
            bgColor={COLORS.primaryLight}
          />
          <StatCard
            title="Komisyonlar"
            value={formatCurrency(summary.totalCommissions)}
            icon={<Ionicons name="storefront-outline" size={18} color="#7c3aed" />}
            color="#7c3aed"
            bgColor={COLORS.violetLight}
          />
        </View>
        <View style={styles.statsGrid}>
          <StatCard
            title="Bahşişler"
            value={formatCurrency(summary.totalTips)}
            icon={<Ionicons name="gift-outline" size={18} color={COLORS.emerald} />}
            color={COLORS.emerald}
            bgColor={COLORS.emeraldLight}
          />
          <StatCard
            title="Alacaklar"
            value={formatCurrency(summary.unpaidAmount)}
            subtitle="Ödenmemiş"
            icon={<Ionicons name="time-outline" size={18} color={COLORS.rose} />}
            color={COLORS.rose}
            bgColor={COLORS.roseLight}
          />
        </View>

        {/* Expense Stats */}
        <Text style={styles.sectionTitle}>Gider Özeti</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Toplam Gider"
            value={formatCurrency(summary.totalExpenses)}
            icon={<Ionicons name="trending-down-outline" size={18} color={COLORS.danger} />}
            color={COLORS.danger}
            bgColor={COLORS.dangerLight}
          />
          <StatCard
            title="Tur Sayısı"
            value={`${filteredTours.length} Tur`}
            icon={<Ionicons name="map-outline" size={18} color={COLORS.info} />}
            color={COLORS.info}
            bgColor={COLORS.infoLight}
          />
        </View>

        {/* Upcoming Tours */}
        {upcomingTours.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Güncel & Yaklaşan Turlar</Text>
              <TouchableOpacity onPress={() => router.push('/tours')}>
                <Text style={styles.seeAll}>Tümünü gör</Text>
              </TouchableOpacity>
            </View>
            {upcomingTours.map((tour) => (
              <TourCard
                key={tour.id}
                tour={tour}
                agency={agencyMap.get(tour.agencyId)}
                onPress={() => router.push({ pathname: '/tour-detail', params: { id: tour.id } })}
                onAddIncome={() => router.push({ pathname: '/extra-income', params: { tourId: tour.id } })}
              />
            ))}
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  greeting: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerActions: { flexDirection: 'row', gap: 4 },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8 },

  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    gap: 2,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  periodBtnActive: { backgroundColor: COLORS.primary },
  periodLabel: { fontSize: 13, fontWeight: '500', color: COLORS.textMuted },
  periodLabelActive: { color: '#fff' },

  profitCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  profitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  profitPeriod: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  marginBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  marginText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  profitLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  profitValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginVertical: 4,
    letterSpacing: -1,
  },
  profitRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    gap: 24,
  },
  profitDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  profitSubLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 2 },
  profitSubValue: { fontSize: 16, fontWeight: '700', color: '#fff' },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 8,
  },
  seeAll: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
});
