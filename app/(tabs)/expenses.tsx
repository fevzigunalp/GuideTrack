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
import { ExpenseCard } from '../../components/ExpenseCard';
import { EmptyState } from '../../components/EmptyState';
import { COLORS } from '../../constants';
import { formatCurrency } from '../../services/calculations';

export default function ExpensesScreen() {
  const router = useRouter();
  const { state, deleteExpense } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');

  const categories = useMemo(() => {
    const cats = new Set(state.expenses.map((e) => e.category));
    return ['Tümü', ...Array.from(cats)];
  }, [state.expenses]);

  const filtered = useMemo(() => {
    const sorted = [...state.expenses].sort((a, b) =>
      b.date.localeCompare(a.date),
    );
    if (selectedCategory === 'Tümü') return sorted;
    return sorted.filter((e) => e.category === selectedCategory);
  }, [state.expenses, selectedCategory]);

  const totalAmount = useMemo(
    () => filtered.reduce((sum, e) => sum + e.amount, 0),
    [filtered],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Giderler</Text>
          {filtered.length > 0 && (
            <Text style={styles.totalText}>
              Toplam: {formatCurrency(totalAmount)}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/expense-form')}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      {categories.length > 1 && (
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(c) => c}
          contentContainerStyle={styles.categoryList}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryBtn,
                selectedCategory === item && styles.categoryBtnActive,
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryLabel,
                  selectedCategory === item && styles.categoryLabelActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          style={styles.categoryScroll}
        />
      )}

      <FlatList
        data={filtered}
        keyExtractor={(e) => e.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ExpenseCard
            expense={item}
            onDelete={() => deleteExpense(item.id)}
            onEdit={() =>
              router.push({
                pathname: '/expense-form',
                params: { id: item.id },
              })
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="wallet-outline"
            title="Gider kaydı yok"
            description="Kira, Bağkur, ulaşım gibi giderlerinizi buraya ekleyin."
            actionLabel="Gider Ekle"
            onAction={() => router.push('/expense-form')}
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  totalText: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  categoryScroll: { maxHeight: 48, marginBottom: 4 },
  categoryList: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 12,
  },
  categoryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryLabel: { fontSize: 13, fontWeight: '500', color: COLORS.textMuted },
  categoryLabelActive: { color: '#fff' },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
});
