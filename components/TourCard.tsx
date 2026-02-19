import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Agency, TourEntry } from '../types';
import { Badge } from './ui/Badge';
import { COLORS, TOUR_TYPE_LABELS } from '../constants';
import {
  formatCurrency,
  formatDateRange,
  getTourStatus,
  getTourTotalIncome,
} from '../services/calculations';

interface TourCardProps {
  tour: TourEntry;
  agency?: Agency;
  onPress: () => void;
  onAddIncome?: () => void;
}

export function TourCard({ tour, agency, onPress, onAddIncome }: TourCardProps) {
  const status = getTourStatus(tour);
  const totalIncome = getTourTotalIncome(tour);

  const statusBadge = () => {
    if (status === 'CURRENT') return <Badge label="Aktif" variant="success" size="sm" />;
    if (status === 'UPCOMING') return <Badge label="Yaklaşan" variant="info" size="sm" />;
    return <Badge label="Geçmiş" variant="neutral" size="sm" />;
  };

  const paymentBadge = () => {
    if (tour.paymentStatus === 'PAID') return <Badge label="Ödendi" variant="success" size="sm" />;
    if (tour.paymentStatus === 'PARTIAL') return <Badge label="Kısmi" variant="warning" size="sm" />;
    return <Badge label="Bekliyor" variant="danger" size="sm" />;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      {/* Left accent bar */}
      <View
        style={[
          styles.accent,
          {
            backgroundColor:
              status === 'CURRENT'
                ? COLORS.success
                : status === 'UPCOMING'
                ? COLORS.info
                : COLORS.border,
          },
        ]}
      />
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title} numberOfLines={1}>
              {tour.title}
            </Text>
            <Text style={styles.agency} numberOfLines={1}>
              {agency?.name ?? 'Ajans Yok'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.income}>{formatCurrency(totalIncome)}</Text>
          </View>
        </View>

        {/* Info row */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={13} color={COLORS.textMuted} />
            <Text style={styles.infoText}>
              {formatDateRange(tour.startDate, tour.endDate)}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="briefcase-outline" size={13} color={COLORS.textMuted} />
            <Text style={styles.infoText}>{TOUR_TYPE_LABELS[tour.type]}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.badges}>
            {statusBadge()}
            {paymentBadge()}
          </View>
          {onAddIncome && (
            <TouchableOpacity
              style={styles.addIncomeBtn}
              onPress={onAddIncome}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="add-circle" size={22} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 10,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  accent: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 14,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  headerLeft: { flex: 1 },
  headerRight: { alignItems: 'flex-end' },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  agency: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  income: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  addIncomeBtn: {
    padding: 2,
  },
});
