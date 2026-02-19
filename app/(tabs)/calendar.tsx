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
import { useApp } from '../../context/AppContext';
import { TourCard } from '../../components/TourCard';
import { COLORS, TR_DAYS_SHORT, TR_MONTHS } from '../../constants';
import { formatCurrency, getTourTotalIncome } from '../../services/calculations';

export default function CalendarScreen() {
  const router = useRouter();
  const { state } = useApp();

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const agencyMap = useMemo(
    () => new Map(state.agencies.map((a) => [a.id, a])),
    [state.agencies],
  );

  // Build tour date map: date string -> tour ids
  const tourDays = useMemo(() => {
    const map = new Map<string, string[]>();
    state.tours.forEach((tour) => {
      const start = new Date(tour.startDate);
      const end = new Date(tour.endDate);
      const cur = new Date(start);
      while (cur <= end) {
        const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(tour.id);
        cur.setDate(cur.getDate() + 1);
      }
    });
    return map;
  }, [state.tours]);

  // Selected date tours
  const selectedTours = useMemo(() => {
    if (!selectedDate) return [];
    const tourIds = tourDays.get(selectedDate) ?? [];
    return state.tours.filter((t) => tourIds.includes(t.id));
  }, [selectedDate, tourDays, state.tours]);

  // Calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    // Make Monday = 0
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = Array(startDow).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewYear, viewMonth]);

  const navigate = (dir: -1 | 1) => {
    const d = new Date(viewYear, viewMonth + dir, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setSelectedDate(null);
  };

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const monthIncome = useMemo(() => {
    const monthTours = state.tours.filter((t) => {
      const [y, m] = t.startDate.split('-').map(Number);
      return y === viewYear && m === viewMonth + 1;
    });
    return monthTours.reduce((sum, t) => sum + getTourTotalIncome(t), 0);
  }, [state.tours, viewYear, viewMonth]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Takvim</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/tour-form')}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Month Navigator */}
        <View style={styles.monthNav}>
          <TouchableOpacity style={styles.navBtn} onPress={() => navigate(-1)}>
            <Ionicons name="chevron-back" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.monthInfo}>
            <Text style={styles.monthTitle}>
              {TR_MONTHS[viewMonth]} {viewYear}
            </Text>
            {monthIncome > 0 && (
              <Text style={styles.monthIncome}>{formatCurrency(monthIncome)}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.navBtn} onPress={() => navigate(1)}>
            <Ionicons name="chevron-forward" size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendar}>
          {/* Day Headers */}
          <View style={styles.dayHeaders}>
            {TR_DAYS_SHORT.map((d) => (
              <Text key={d} style={styles.dayHeader}>
                {d}
              </Text>
            ))}
          </View>

          {/* Days */}
          <View style={styles.daysGrid}>
            {calendarDays.map((day, idx) => {
              if (!day) return <View key={idx} style={styles.dayCell} />;

              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              const hasTours = tourDays.has(dateStr);

              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.dayCell,
                    isToday && styles.dayToday,
                    isSelected && styles.daySelected,
                  ]}
                  onPress={() =>
                    setSelectedDate(isSelected ? null : dateStr)
                  }
                >
                  <Text
                    style={[
                      styles.dayText,
                      isToday && styles.dayTodayText,
                      isSelected && styles.daySelectedText,
                    ]}
                  >
                    {day}
                  </Text>
                  {hasTours && (
                    <View
                      style={[
                        styles.tourDot,
                        isSelected && styles.tourDotSelected,
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected Date Tours */}
        {selectedDate && (
          <View style={styles.selectedSection}>
            <Text style={styles.selectedTitle}>
              {selectedDate.split('-').reverse().join('.')} —{' '}
              {selectedTours.length > 0
                ? `${selectedTours.length} Tur`
                : 'Tur Yok'}
            </Text>
            {selectedTours.map((tour) => (
              <TourCard
                key={tour.id}
                tour={tour}
                agency={agencyMap.get(tour.agencyId)}
                onPress={() =>
                  router.push({ pathname: '/tour-detail', params: { id: tour.id } })
                }
                onAddIncome={() =>
                  router.push({ pathname: '/extra-income', params: { tourId: tour.id } })
                }
              />
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
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
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthInfo: { alignItems: 'center' },
  monthTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  monthIncome: { fontSize: 13, color: COLORS.primary, fontWeight: '600', marginTop: 2 },

  calendar: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textLight,
    textTransform: 'uppercase',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  dayToday: {
    backgroundColor: COLORS.primaryLight,
  },
  daySelected: {
    backgroundColor: COLORS.primary,
  },
  dayText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  dayTodayText: { color: COLORS.primaryDark, fontWeight: '700' },
  daySelectedText: { color: '#fff', fontWeight: '700' },
  tourDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 2,
  },
  tourDotSelected: { backgroundColor: '#fff' },

  selectedSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  selectedTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
});
