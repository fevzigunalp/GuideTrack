import React, { useMemo, useState } from 'react';
import {
  FlatList,
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
import { EmptyState } from '../../components/EmptyState';
import { COLORS } from '../../constants';
import { getTourStatus } from '../../services/calculations';
import { TourStatus } from '../../types';

type FilterOption = 'ALL' | TourStatus;

const FILTERS: { label: string; value: FilterOption }[] = [
  { label: 'Tümü', value: 'ALL' },
  { label: 'Aktif', value: 'CURRENT' },
  { label: 'Yaklaşan', value: 'UPCOMING' },
  { label: 'Geçmiş', value: 'PAST' },
];

export default function ToursScreen() {
  const router = useRouter();
  const { state } = useApp();
  const [filter, setFilter] = useState<FilterOption>('ALL');

  const agencyMap = useMemo(
    () => new Map(state.agencies.map((a) => [a.id, a])),
    [state.agencies],
  );

  const filteredTours = useMemo(() => {
    const sorted = [...state.tours].sort((a, b) =>
      b.startDate.localeCompare(a.startDate),
    );
    if (filter === 'ALL') return sorted;
    return sorted.filter((t) => getTourStatus(t) === filter);
  }, [state.tours, filter]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Turlar</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/tour-form')}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const count =
            f.value === 'ALL'
              ? state.tours.length
              : state.tours.filter((t) => getTourStatus(t) === f.value).length;
          return (
            <TouchableOpacity
              key={f.value}
              style={[
                styles.filterBtn,
                filter === f.value && styles.filterBtnActive,
              ]}
              onPress={() => setFilter(f.value)}
            >
              <Text
                style={[
                  styles.filterLabel,
                  filter === f.value && styles.filterLabelActive,
                ]}
              >
                {f.label}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.filterCount,
                    filter === f.value && styles.filterCountActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterCountText,
                      filter === f.value && styles.filterCountTextActive,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filteredTours}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TourCard
            tour={item}
            agency={agencyMap.get(item.agencyId)}
            onPress={() =>
              router.push({ pathname: '/tour-detail', params: { id: item.id } })
            }
            onAddIncome={() =>
              router.push({ pathname: '/extra-income', params: { tourId: item.id } })
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="map-outline"
            title="Henüz tur yok"
            description={
              filter === 'ALL'
                ? 'İlk turunuzu eklemek için + butonuna tıklayın.'
                : `Bu filtrede tur bulunmuyor.`
            }
            actionLabel={filter === 'ALL' ? 'Tur Ekle' : undefined}
            onAction={
              filter === 'ALL' ? () => router.push('/tour-form') : undefined
            }
          />
        }
      />
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 5,
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterLabel: { fontSize: 13, fontWeight: '500', color: COLORS.textMuted },
  filterLabelActive: { color: '#fff' },
  filterCount: {
    backgroundColor: COLORS.border,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterCountActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  filterCountText: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted },
  filterCountTextActive: { color: '#fff' },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
});
