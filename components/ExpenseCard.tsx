import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
  const icon = CATEGORY_ICONS[expense.category] ?? 'ellipsis-horizontal-circle-outline';

  const handleDelete = () => {
    Alert.alert(
      'Gideri Sil',
      `"${expense.title}" giderini silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: onDelete },
      ],
    );
  };

  return (
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

      {/* Actions */}
      <View style={styles.actions}>
        {onEdit && (
          <TouchableOpacity
            onPress={onEdit}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.actionBtn}
          >
            <Ionicons name="pencil-outline" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.actionBtn}
        >
          <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 8,
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
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionBtn: {
    padding: 4,
  },
});
