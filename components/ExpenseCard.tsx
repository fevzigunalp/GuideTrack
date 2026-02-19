import React, { useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Expense } from '../types';
import { COLORS } from '../constants';
import { formatCurrency, formatDate } from '../services/calculations';

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Kira: 'home-outline',
  Bağkur: 'shield-checkmark-outline',
  Ulaşım: 'car-outline',
  Yemek: 'restaurant-outline',
  Fatura: 'receipt-outline',
  Telefon: 'phone-portrait-outline',
  Sağlık: 'medical-outline',
  Diğer: 'ellipsis-horizontal-circle-outline',
};

interface ExpenseCardProps {
  expense: Expense;
  onDelete: () => void;
  onEdit?: () => void;
}

export function ExpenseCard({ expense, onDelete, onEdit }: ExpenseCardProps) {
  const swipeableRef = useRef<Swipeable>(null);
  const icon = CATEGORY_ICONS[expense.category] ?? 'ellipsis-horizontal-circle-outline';

  const handleDelete = () => {
    swipeableRef.current?.close();
    onDelete();
  };

  const renderRightActions = () => (
    <TouchableOpacity style={styles.deleteAction} onPress={handleDelete} activeOpacity={0.8}>
      <Ionicons name="trash" size={20} color="#fff" />
      <Text style={styles.deleteText}>Sil</Text>
    </TouchableOpacity>
  );

  const renderLeftActions = onEdit
    ? () => (
        <TouchableOpacity
          style={styles.editAction}
          onPress={() => { swipeableRef.current?.close(); onEdit(); }}
          activeOpacity={0.8}
        >
          <Ionicons name="pencil" size={20} color="#fff" />
          <Text style={styles.editText}>Düzenle</Text>
        </TouchableOpacity>
      )
    : undefined;

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      overshootRight={false}
      overshootLeft={false}
      friction={2}
    >
      <View style={styles.card}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={20} color={COLORS.primaryDark} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.title} numberOfLines={1}>
              {expense.title}
            </Text>
            <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
          </View>
          <View style={styles.bottomRow}>
            <Text style={styles.category}>{expense.category}</Text>
            <View style={styles.rightInfo}>
              {expense.isRecurring && (
                <View style={styles.recurringBadge}>
                  <Ionicons name="refresh" size={10} color={COLORS.info} />
                  <Text style={styles.recurringText}>Tekrarlayan</Text>
                </View>
              )}
              <Text style={styles.date}>{formatDate(expense.date)}</Text>
            </View>
          </View>
        </View>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  deleteAction: {
    backgroundColor: COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 72,
    borderRadius: 14,
    marginBottom: 0,
    gap: 4,
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  editAction: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    width: 72,
    borderRadius: 14,
    gap: 4,
  },
  editText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.danger,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  category: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  rightInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recurringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.infoLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  recurringText: {
    fontSize: 10,
    color: COLORS.info,
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    color: COLORS.textLight,
  },
});
