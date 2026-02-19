import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
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
import { COLORS } from '../constants';
import {
  hasConflict,
  toDateString,
} from '../services/calculations';
import { TourEntry, TourType } from '../types';

const TOUR_TYPES: { label: string; value: TourType; desc: string }[] = [
  { label: 'Yarım Gün', value: 'HALF', desc: '0.5 gün' },
  { label: 'Tam Gün', value: 'FULL', desc: '1 gün' },
  { label: 'Paket Tur', value: 'PACKAGE', desc: 'Çok günlü' },
];

function generateId(): string {
  return `tour-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function TourFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { state, addTour, updateTour } = useApp();

  const editingTour = id ? state.tours.find((t) => t.id === id) : undefined;
  const isEditing = !!editingTour;

  const today = toDateString(new Date());

  const [title, setTitle] = useState(editingTour?.title ?? '');
  const [type, setType] = useState<TourType>(editingTour?.type ?? 'FULL');
  const [startDate, setStartDate] = useState(editingTour?.startDate ?? today);
  const [endDate, setEndDate] = useState(editingTour?.endDate ?? today);
  const [agencyId, setAgencyId] = useState(editingTour?.agencyId ?? (state.agencies[0]?.id ?? ''));
  const [dailyRate, setDailyRate] = useState(
    editingTour ? String(editingTour.dailyRate) : String(state.settings.defaultDailyRate),
  );
  const [notes, setNotes] = useState(editingTour?.notes ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedAgency = useMemo(
    () => state.agencies.find((a) => a.id === agencyId),
    [state.agencies, agencyId],
  );

  // Auto-set endDate for non-package tours
  useEffect(() => {
    if (type !== 'PACKAGE') setEndDate(startDate);
  }, [type, startDate]);

  // Auto-set daily rate from agency
  useEffect(() => {
    if (!isEditing && selectedAgency) {
      setDailyRate(String(selectedAgency.defaultDailyRate));
    }
  }, [selectedAgency, isEditing]);

  const conflictWarning = useMemo(() => {
    if (!startDate || !endDate) return null;
    const conflict = hasConflict(startDate, endDate, state.tours, editingTour?.id);
    return conflict ? 'Bu tarihte başka bir tur var! Çakışma oluşabilir.' : null;
  }, [startDate, endDate, state.tours, editingTour?.id]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Tur adı zorunludur.';
    if (!agencyId) errs.agency = 'Ajans seçimi zorunludur.';
    if (!dailyRate || parseFloat(dailyRate) <= 0) errs.dailyRate = 'Geçerli bir yevmiye girin.';
    if (type === 'PACKAGE' && endDate < startDate) errs.endDate = 'Bitiş tarihi başlangıçtan önce olamaz.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const now = new Date().toISOString();
    const tour: TourEntry = {
      id: editingTour?.id ?? generateId(),
      title: title.trim(),
      type,
      startDate,
      endDate: type === 'PACKAGE' ? endDate : startDate,
      agencyId,
      dailyRate: parseFloat(dailyRate.replace(',', '.')) || 0,
      paymentStatus: editingTour?.paymentStatus ?? 'UNPAID',
      paidAmount: editingTour?.paidAmount ?? 0,
      paidDate: editingTour?.paidDate,
      tips: editingTour?.tips ?? [],
      commissions: editingTour?.commissions ?? [],
      notes: notes.trim(),
      createdAt: editingTour?.createdAt ?? now,
      updatedAt: now,
    };

    if (isEditing) {
      await updateTour(tour);
    } else {
      await addTour(tour);
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Modal Handle */}
      <View style={styles.handle} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Turu Düzenle' : 'Yeni Tur'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Tour Type */}
          <Text style={styles.fieldLabel}>Tur Türü</Text>
          <View style={styles.typeRow}>
            {TOUR_TYPES.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[styles.typeBtn, type === t.value && styles.typeBtnActive]}
                onPress={() => setType(t.value)}
              >
                <Text style={[styles.typeBtnLabel, type === t.value && styles.typeBtnLabelActive]}>
                  {t.label}
                </Text>
                <Text style={[styles.typeBtnDesc, type === t.value && styles.typeBtnDescActive]}>
                  {t.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Title */}
          <Input
            label="Tur Adı"
            placeholder="Örn: Efes Antik Kenti Turu"
            value={title}
            onChangeText={setTitle}
            error={errors.title}
            required
          />

          {/* Agency */}
          <Text style={styles.fieldLabel}>
            Ajans <Text style={styles.required}>*</Text>
          </Text>
          {errors.agency && <Text style={styles.errorText}>{errors.agency}</Text>}
          <View style={styles.agencyList}>
            {state.agencies.map((agency) => (
              <TouchableOpacity
                key={agency.id}
                style={[
                  styles.agencyBtn,
                  agencyId === agency.id && styles.agencyBtnActive,
                ]}
                onPress={() => setAgencyId(agency.id)}
              >
                <Text
                  style={[
                    styles.agencyLabel,
                    agencyId === agency.id && styles.agencyLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {agency.name}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.agencyAddBtn}
              onPress={() => router.push('/agency-form')}
            >
              <Ionicons name="add" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Daily Rate */}
          <Input
            label="Yevmiye (₺)"
            placeholder="0"
            value={dailyRate}
            onChangeText={setDailyRate}
            keyboardType="decimal-pad"
            error={errors.dailyRate}
            prefix={<Text style={{ color: COLORS.textMuted, fontSize: 16 }}>₺</Text>}
            required
          />

          {/* Start Date */}
          <Input
            label="Başlangıç Tarihi"
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-AA-GG"
            keyboardType="numeric"
            required
          />

          {/* End Date (package only) */}
          {type === 'PACKAGE' && (
            <Input
              label="Bitiş Tarihi"
              value={endDate}
              onChangeText={setEndDate}
              placeholder="YYYY-AA-GG"
              keyboardType="numeric"
              error={errors.endDate}
              required
            />
          )}

          {/* Conflict Warning */}
          {conflictWarning && (
            <View style={styles.warningBox}>
              <Ionicons name="warning-outline" size={16} color={COLORS.warning} />
              <Text style={styles.warningText}>{conflictWarning}</Text>
            </View>
          )}

          {/* Notes */}
          <Input
            label="Notlar (İsteğe Bağlı)"
            placeholder="Tur hakkında notlar..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={{ minHeight: 72, textAlignVertical: 'top' }}
          />

          {/* Save Button */}
          <Button
            label={isEditing ? 'Değişiklikleri Kaydet' : 'Turu Ekle'}
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
  content: { padding: 20 },

  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  required: { color: COLORS.danger },
  errorText: { fontSize: 12, color: COLORS.danger, marginBottom: 6 },

  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  typeBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  typeBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  typeBtnLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  typeBtnLabelActive: { color: COLORS.primaryDark },
  typeBtnDesc: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  typeBtnDescActive: { color: COLORS.primary },

  agencyList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  agencyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
    maxWidth: 140,
  },
  agencyBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  agencyLabel: { fontSize: 13, fontWeight: '500', color: COLORS.textMuted },
  agencyLabelActive: { color: COLORS.primaryDark },
  agencyAddBtn: {
    width: 38,
    height: 38,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },

  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningLight,
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginBottom: 16,
  },
  warningText: { fontSize: 13, color: COLORS.primaryDark, flex: 1 },
});
