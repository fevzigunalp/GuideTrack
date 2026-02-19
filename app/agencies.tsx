import React from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { EmptyState } from '../components/EmptyState';
import { COLORS } from '../constants';
import { formatCurrency } from '../services/calculations';

export default function AgenciesScreen() {
  const router = useRouter();
  const { state, deleteAgency } = useApp();

  const handleDelete = (id: string, name: string) => {
    const isUsed = state.tours.some((t) => t.agencyId === id);
    if (isUsed) {
      Alert.alert(
        'Silinemez',
        `"${name}" ajansı turlarda kullanılıyor. Önce ilgili turları düzenleyin.`,
      );
      return;
    }
    Alert.alert(
      'Ajansı Sil',
      `"${name}" ajansını silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => deleteAgency(id),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajanslar</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/agency-form')}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={state.agencies}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const tourCount = state.tours.filter((t) => t.agencyId === item.id).length;
          return (
            <View style={styles.card}>
              <View style={styles.cardIcon}>
                <Ionicons name="business" size={22} color={COLORS.primaryDark} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.agencyName}>{item.name}</Text>
                <Text style={styles.agencyMeta}>
                  {tourCount} tur • Yevmiye: {formatCurrency(item.defaultDailyRate)}
                </Text>
                {item.contactPerson && (
                  <Text style={styles.contact}>{item.contactPerson}</Text>
                )}
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  onPress={() =>
                    router.push({ pathname: '/agency-form', params: { id: item.id } })
                  }
                  style={styles.actionBtn}
                >
                  <Ionicons name="pencil-outline" size={18} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(item.id, item.name)}
                  style={styles.actionBtn}
                >
                  <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="business-outline"
            title="Ajans bulunamadı"
            description="Çalıştığınız ajansleri ekleyerek yevmiye bilgilerini otomatik doldurun."
            actionLabel="Ajans Ekle"
            onAction={() => router.push('/agency-form')}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontSize: 22, fontWeight: '700', color: COLORS.text },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { padding: 16, gap: 10, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: { flex: 1 },
  agencyName: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 3 },
  agencyMeta: { fontSize: 12, color: COLORS.textMuted },
  contact: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: 4 },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
