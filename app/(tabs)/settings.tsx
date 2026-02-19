import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { COLORS } from '../../constants';
import { exportAll } from '../../services/export';
import { clearAllData } from '../../services/storage';
import { formatCurrency } from '../../services/calculations';

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

function SettingRow({
  icon,
  iconColor = COLORS.primary,
  title,
  subtitle,
  onPress,
  rightElement,
  danger = false,
}: SettingRowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress && !rightElement}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.rowIcon, { backgroundColor: danger ? COLORS.dangerLight : COLORS.primaryLight }]}>
        <Ionicons name={icon} size={18} color={danger ? COLORS.danger : iconColor} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowTitle, danger && styles.rowTitleDanger]}>{title}</Text>
        {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement ?? (
        onPress && <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
      )}
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { state, updateSettings } = useApp();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!state.user?.isPremium) {
      Alert.alert(
        'Premium Özellik',
        'Veri dışa aktarma özelliği Premium üyelere özeldir.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Premium Al', onPress: () => {} },
        ],
      );
      return;
    }
    try {
      setExporting(true);
      await exportAll(state.tours, state.expenses, state.agencies);
    } catch (e: unknown) {
      Alert.alert('Hata', String(e));
    } finally {
      setExporting(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Tüm Verileri Sil',
      'Bu işlem geri alınamaz! Tüm tur, gider ve ajans verileriniz silinecek.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet, Sil',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Başarılı', 'Tüm veriler silindi. Uygulamayı yeniden başlatın.');
          },
        },
      ],
    );
  };

  const totalTours = state.tours.length;
  const totalExpenses = state.expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ayarlar</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color={COLORS.primaryDark} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {state.user?.name ?? 'Tur Rehberi'}
            </Text>
            <View style={styles.premiumBadge}>
              <Ionicons
                name={state.user?.isPremium ? 'star' : 'star-outline'}
                size={12}
                color={state.user?.isPremium ? '#fff' : COLORS.textMuted}
              />
              <Text style={[
                styles.premiumText,
                state.user?.isPremium && styles.premiumTextActive,
              ]}>
                {state.user?.isPremium ? 'Premium' : 'Ücretsiz Plan'}
              </Text>
            </View>
          </View>
          {!state.user?.isPremium && (
            <TouchableOpacity style={styles.upgradeBtn}>
              <Text style={styles.upgradeBtnText}>Yükselt</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalTours}</Text>
            <Text style={styles.statLabel}>Tur</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{state.agencies.length}</Text>
            <Text style={styles.statLabel}>Ajans</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatCurrency(totalExpenses)}</Text>
            <Text style={styles.statLabel}>Toplam Gider</Text>
          </View>
        </View>

        {/* Management */}
        <SectionHeader title="YÖNETİM" />
        <View style={styles.section}>
          <SettingRow
            icon="business-outline"
            title="Ajanslar"
            subtitle={`${state.agencies.length} ajans kayıtlı`}
            onPress={() => router.push('/agencies')}
          />
          <SettingRow
            icon="bar-chart-outline"
            title="Raporlar"
            subtitle="Aylık ve yıllık analiz"
            onPress={() => router.push('/reports')}
          />
        </View>

        {/* Data */}
        <SectionHeader title="VERİ" />
        <View style={styles.section}>
          <SettingRow
            icon="download-outline"
            title="Verileri Dışa Aktar"
            subtitle={exporting ? 'Hazırlanıyor...' : 'CSV formatında Excel\'e aktar'}
            onPress={handleExport}
            iconColor={COLORS.emerald}
          />
        </View>

        {/* App Settings */}
        <SectionHeader title="UYGULAMA" />
        <View style={styles.section}>
          <SettingRow
            icon="notifications-outline"
            title="Bildirimler"
            subtitle="Yaklaşan tur hatırlatmaları"
            rightElement={
              <Switch
                value={state.settings.notificationsEnabled}
                onValueChange={(v) => updateSettings({ notificationsEnabled: v })}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor="#fff"
              />
            }
          />
        </View>

        {/* Danger Zone */}
        <SectionHeader title="TEHLİKELİ BÖLGE" />
        <View style={styles.section}>
          <SettingRow
            icon="trash-outline"
            title="Tüm Verileri Sil"
            subtitle="Bu işlem geri alınamaz"
            onPress={handleClearData}
            danger
          />
        </View>

        {/* Version */}
        <Text style={styles.version}>GuideTrack v1.0.0</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  content: { paddingHorizontal: 16 },

  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  premiumText: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted },
  premiumTextActive: { color: '#fff' },
  upgradeBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  upgradeBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  statsRow: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  statValue: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  statLabel: { fontSize: 11, color: COLORS.textMuted },

  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
    marginLeft: 4,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '500', color: COLORS.text },
  rowTitleDanger: { color: COLORS.danger },
  rowSubtitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },

  version: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textLight,
    marginVertical: 8,
  },
});
