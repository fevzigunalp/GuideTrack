import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { COLORS, DEFAULT_COMMISSION_CATEGORIES } from '../constants';
import { Commission, Tip } from '../types';

function generateId(): string {
  return `income-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type IncomeType = 'TIP' | 'COMMISSION';

export default function ExtraIncomeScreen() {
  const router = useRouter();
  const { tourId } = useLocalSearchParams<{ tourId: string }>();
  const { state, addTip, addCommission } = useApp();

  const tour = state.tours.find((t) => t.id === tourId);

  const [incomeType, setIncomeType] = useState<IncomeType>('TIP');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [commissionCategory, setCommissionCategory] = useState<string>(
    DEFAULT_COMMISSION_CATEGORIES[0],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!amount || parseFloat(amount.replace(',', '.')) <= 0)
      errs.amount = 'Geçerli bir tutar girin.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !tourId) return;

    const parsedAmount = parseFloat(amount.replace(',', '.'));

    if (incomeType === 'TIP') {
      const tip: Tip = {
        id: generateId(),
        amount: parsedAmount,
        note: note.trim() || undefined,
      };
      await addTip(tourId, tip);
    } else {
      const commission: Commission = {
        id: generateId(),
        category: commissionCategory,
        amount: parsedAmount,
      };
      await addCommission(tourId, commission);
    }

    router.back();
  };

  if (!tour) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.notFound}>
          <Text>Tur bulunamadı.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.handle} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ekstra Gelir Ekle</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tour Info */}
      <View style={styles.tourInfo}>
        <Ionicons name="map-outline" size={16} color={COLORS.primaryDark} />
        <Text style={styles.tourName} numberOfLines={1}>
          {tour.title}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Income Type */}
          <Text style={styles.fieldLabel}>Gelir Türü</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                incomeType === 'TIP' && styles.typeBtnActive,
              ]}
              onPress={() => setIncomeType('TIP')}
            >
              <Ionicons
                name="gift-outline"
                size={20}
                color={incomeType === 'TIP' ? COLORS.primaryDark : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.typeBtnLabel,
                  incomeType === 'TIP' && styles.typeBtnLabelActive,
                ]}
              >
                Bahşiş
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                incomeType === 'COMMISSION' && styles.typeBtnActive,
              ]}
              onPress={() => setIncomeType('COMMISSION')}
            >
              <Ionicons
                name="storefront-outline"
                size={20}
                color={incomeType === 'COMMISSION' ? COLORS.primaryDark : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.typeBtnLabel,
                  incomeType === 'COMMISSION' && styles.typeBtnLabelActive,
                ]}
              >
                Komisyon
              </Text>
            </TouchableOpacity>
          </View>

          {/* Commission Category */}
          {incomeType === 'COMMISSION' && (
            <>
              <Text style={styles.fieldLabel}>Kategori</Text>
              <View style={styles.categoryGrid}>
                {DEFAULT_COMMISSION_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryBtn,
                      commissionCategory === cat && styles.categoryBtnActive,
                    ]}
                    onPress={() => setCommissionCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryLabel,
                        commissionCategory === cat && styles.categoryLabelActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Amount */}
          <Input
            label="Tutar (₺)"
            placeholder="0"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            error={errors.amount}
            prefix={<Text style={{ color: COLORS.textMuted, fontSize: 16 }}>₺</Text>}
            required
          />

          {/* Note (tips only) */}
          {incomeType === 'TIP' && (
            <Input
              label="Not (İsteğe Bağlı)"
              placeholder="Örn: Amerikalı grup"
              value={note}
              onChangeText={setNote}
            />
          )}

          <Button
            label={incomeType === 'TIP' ? 'Bahşiş Ekle' : 'Komisyon Ekle'}
            onPress={handleSave}
            fullWidth
            size="lg"
            style={{ marginTop: 8 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: COLORS.background,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  tourInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tourName: { fontSize: 14, fontWeight: '600', color: COLORS.primaryDark, flex: 1 },
  content: { padding: 20 },
  fieldLabel: { fontSize: 14, fontWeight: '500', color: COLORS.text, marginBottom: 8 },

  typeRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#fff',
  },
  typeBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  typeBtnLabel: { fontSize: 15, fontWeight: '600', color: COLORS.textMuted },
  typeBtnLabelActive: { color: COLORS.primaryDark },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  categoryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
  },
  categoryBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  categoryLabel: { fontSize: 13, fontWeight: '500', color: COLORS.textMuted },
  categoryLabelActive: { color: COLORS.primaryDark },
});
