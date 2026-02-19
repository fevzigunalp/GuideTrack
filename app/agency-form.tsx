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
import { COLORS } from '../constants';
import { Agency } from '../types';

function generateId(): string {
  return `agency-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function AgencyFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { state, addAgency, updateAgency } = useApp();

  const editingAgency = id ? state.agencies.find((a) => a.id === id) : undefined;
  const isEditing = !!editingAgency;

  const [name, setName] = useState(editingAgency?.name ?? '');
  const [defaultDailyRate, setDefaultDailyRate] = useState(
    editingAgency ? String(editingAgency.defaultDailyRate) : '1500',
  );
  const [contactPerson, setContactPerson] = useState(editingAgency?.contactPerson ?? '');
  const [phone, setPhone] = useState(editingAgency?.phone ?? '');
  const [email, setEmail] = useState(editingAgency?.email ?? '');
  const [notes, setNotes] = useState(editingAgency?.notes ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Ajans adı zorunludur.';
    if (!defaultDailyRate || parseFloat(defaultDailyRate) < 0)
      errs.rate = 'Geçerli bir yevmiye girin.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const agency: Agency = {
      id: editingAgency?.id ?? generateId(),
      name: name.trim(),
      defaultDailyRate: parseFloat(defaultDailyRate.replace(',', '.')) || 0,
      contactPerson: contactPerson.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: editingAgency?.createdAt ?? new Date().toISOString(),
    };

    if (isEditing) {
      await updateAgency(agency);
    } else {
      await addAgency(agency);
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.handle} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Ajansı Düzenle' : 'Yeni Ajans'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Input
            label="Ajans Adı"
            placeholder="Örn: TUI, Neckermann"
            value={name}
            onChangeText={setName}
            error={errors.name}
            required
          />

          <Input
            label="Varsayılan Yevmiye (₺)"
            placeholder="1500"
            value={defaultDailyRate}
            onChangeText={setDefaultDailyRate}
            keyboardType="decimal-pad"
            error={errors.rate}
            prefix={<Text style={{ color: COLORS.textMuted, fontSize: 16 }}>₺</Text>}
            hint="Tur eklerken otomatik doldurulur"
            required
          />

          <View style={styles.divider}>
            <Text style={styles.dividerText}>İletişim Bilgileri (İsteğe Bağlı)</Text>
          </View>

          <Input
            label="İletişim Kişisi"
            placeholder="Ad Soyad"
            value={contactPerson}
            onChangeText={setContactPerson}
          />

          <Input
            label="Telefon"
            placeholder="+90 555 000 00 00"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Input
            label="E-posta"
            placeholder="ajans@ornek.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Notlar"
            placeholder="Ajans hakkında notlar..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={{ minHeight: 72, textAlignVertical: 'top' }}
          />

          <Button
            label={isEditing ? 'Değişiklikleri Kaydet' : 'Ajansı Ekle'}
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
  divider: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
    marginBottom: 16,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
