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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { COLORS, PAYMENT_STATUS_LABELS, TOUR_TYPE_LABELS } from '../constants';
import {
  formatCurrency,
  formatDateRange,
  getTourBaseIncome,
  getTourCommissionsTotal,
  getTourDurationDays,
  getTourStatus,
  getTourTipsTotal,
  getTourTotalIncome,
} from '../services/calculations';
import { PaymentStatus } from '../types';

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'danger'> = {
  PAID: 'success',
  PARTIAL: 'warning',
  UNPAID: 'danger',
};

export default function TourDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, deleteTour, updatePaymentStatus } = useApp();

  const tour = state.tours.find((t) => t.id === id);
  const agency = tour ? state.agencies.find((a) => a.id === tour.agencyId) : undefined;
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  const status = tour ? getTourStatus(tour) : 'PAST';
  const totalIncome = tour ? getTourTotalIncome(tour) : 0;
  const baseIncome = tour ? getTourBaseIncome(tour) : 0;
  const tipsTotal = tour ? getTourTipsTotal(tour) : 0;
  const commissionsTotal = tour ? getTourCommissionsTotal(tour) : 0;
  const duration = tour ? getTourDurationDays(tour) : 0;

  const commissionByCategory = useMemo(() => {
    if (!tour) return [];
    const map = new Map<string, number>();
    tour.commissions.forEach((c) => {
      map.set(c.category, (map.get(c.category) ?? 0) + c.amount);
    });
    return Array.from(map.entries()).map(([cat, amt]) => ({ cat, amt }));
  }, [tour]);

  if (!tour) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.notFound}>
          <Text>Tur bulunamadı.</Text>
          <Button label="Geri Dön" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Turu Sil',
      `"${tour.title}" turunu silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await deleteTour(tour.id);
            router.back();
          },
        },
      ],
    );
  };

  const handlePaymentStatus = async (newStatus: PaymentStatus) => {
    const paidAmount =
      newStatus === 'PAID'
        ? baseIncome
        : newStatus === 'PARTIAL'
        ? baseIncome / 2
        : 0;
    await updatePaymentStatus(tour.id, newStatus, paidAmount);
    setShowPaymentOptions(false);
  };

  const statusColor = status === 'CURRENT' ? 'success' : status === 'UPCOMING' ? 'info' : 'neutral';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Tur Detayı
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push({ pathname: '/tour-form', params: { id: tour.id } })}
          >
            <Ionicons name="pencil-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Title Card */}
        <View style={styles.titleCard}>
          <View style={styles.titleRow}>
            <View style={styles.titleInfo}>
              <Text style={styles.tourTitle}>{tour.title}</Text>
              <Text style={styles.agencyName}>{agency?.name ?? 'Ajans Yok'}</Text>
            </View>
            <View style={styles.badges}>
              <Badge
                label={status === 'CURRENT' ? 'Aktif' : status === 'UPCOMING' ? 'Yaklaşan' : 'Geçmiş'}
                variant={statusColor}
              />
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.metaText}>
                {formatDateRange(tour.startDate, tour.endDate)}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.metaText}>
                {TOUR_TYPE_LABELS[tour.type]} ({duration} gün)
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Status */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ödeme Durumu</Text>
            <TouchableOpacity onPress={() => setShowPaymentOptions(!showPaymentOptions)}>
              <Text style={styles.changeBtn}>Değiştir</Text>
            </TouchableOpacity>
          </View>
          <Badge
            label={PAYMENT_STATUS_LABELS[tour.paymentStatus]}
            variant={STATUS_BADGE[tour.paymentStatus]}
          />
          {tour.paymentStatus === 'PARTIAL' && (
            <Text style={styles.paidAmountText}>
              Ödenen: {formatCurrency(tour.paidAmount)}
              {' / '}
              Kalan: {formatCurrency(baseIncome - tour.paidAmount)}
            </Text>
          )}

          {showPaymentOptions && (
            <View style={styles.paymentOptions}>
              {(['UNPAID', 'PARTIAL', 'PAID'] as PaymentStatus[]).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.paymentOption,
                    tour.paymentStatus === s && styles.paymentOptionActive,
                  ]}
                  onPress={() => handlePaymentStatus(s)}
                >
                  <Ionicons
                    name={s === 'PAID' ? 'checkmark-circle' : s === 'PARTIAL' ? 'time' : 'close-circle'}
                    size={18}
                    color={s === 'PAID' ? COLORS.success : s === 'PARTIAL' ? COLORS.warning : COLORS.danger}
                  />
                  <Text style={styles.paymentOptionText}>
                    {PAYMENT_STATUS_LABELS[s]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Income Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gelir Özeti</Text>

          <View style={styles.incomeRow}>
            <Text style={styles.incomeLabel}>
              Yevmiye ({tour.dailyRate > 0 ? `${formatCurrency(tour.dailyRate)} × ${duration} gün` : '-'})
            </Text>
            <Text style={styles.incomeValue}>{formatCurrency(baseIncome)}</Text>
          </View>

          {tipsTotal > 0 && (
            <View style={styles.incomeRow}>
              <Text style={styles.incomeLabel}>
                Bahşiş ({tour.tips.length} adet)
              </Text>
              <Text style={styles.incomeValue}>{formatCurrency(tipsTotal)}</Text>
            </View>
          )}

          {commissionsTotal > 0 && (
            <View>
              <View style={styles.incomeRow}>
                <Text style={styles.incomeLabel}>
                  Komisyon ({tour.commissions.length} adet)
                </Text>
                <Text style={styles.incomeValue}>{formatCurrency(commissionsTotal)}</Text>
              </View>
              {commissionByCategory.map(({ cat, amt }) => (
                <View key={cat} style={[styles.incomeRow, styles.incomeSubRow]}>
                  <Text style={styles.incomeSub}>• {cat}</Text>
                  <Text style={styles.incomeSub}>{formatCurrency(amt)}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={[styles.incomeRow, styles.incomeTotalRow]}>
            <Text style={styles.incomeTotalLabel}>Toplam Gelir</Text>
            <Text style={styles.incomeTotalValue}>{formatCurrency(totalIncome)}</Text>
          </View>
        </View>

        {/* Tour Tips */}
        {tour.tips.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bahşiş Detayı</Text>
            {tour.tips.map((tip, idx) => (
              <View key={tip.id} style={styles.incomeRow}>
                <Text style={styles.incomeLabel}>
                  {idx + 1}. Bahşiş{tip.note ? ` (${tip.note})` : ''}
                </Text>
                <Text style={styles.incomeValue}>{formatCurrency(tip.amount)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Notes */}
        {tour.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notlar</Text>
            <Text style={styles.notesText}>{tour.notes}</Text>
          </View>
        ) : null}

        {/* Add Extra Income */}
        <Button
          label="Bahşiş / Komisyon Ekle"
          variant="secondary"
          icon={<Ionicons name="add-circle-outline" size={18} color={COLORS.primaryDark} />}
          onPress={() =>
            router.push({ pathname: '/extra-income', params: { tourId: tour.id } })
          }
          fullWidth
          style={{ marginTop: 8 }}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: '#fff',
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: COLORS.text },
  headerActions: { flexDirection: 'row', gap: 4 },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 16, gap: 12 },

  titleCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  titleInfo: { flex: 1 },
  tourTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  agencyName: { fontSize: 14, color: COLORS.textMuted },
  badges: { gap: 6 },
  metaRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 13, color: COLORS.textMuted },

  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  changeBtn: { fontSize: 13, color: COLORS.primary, fontWeight: '500' },

  paymentOptions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  paymentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  paymentOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  paymentOptionText: { fontSize: 12, fontWeight: '600', color: COLORS.text },
  paidAmountText: { fontSize: 13, color: COLORS.textMuted, marginTop: 8 },

  incomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  incomeSubRow: { paddingLeft: 12 },
  incomeLabel: { fontSize: 14, color: COLORS.textMuted, flex: 1 },
  incomeValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  incomeSub: { fontSize: 12, color: COLORS.textLight },
  incomeTotalRow: {
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopColor: COLORS.border,
    marginTop: 4,
    paddingTop: 12,
  },
  incomeTotalLabel: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  incomeTotalValue: { fontSize: 18, fontWeight: '800', color: COLORS.primaryDark },

  notesText: { fontSize: 14, color: COLORS.textMuted, lineHeight: 20 },
});
