import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: 'map' as const,
    iconBg: '#fef3c7',
    iconColor: COLORS.primaryDark,
    title: 'Turlarınızı Takip Edin',
    description:
      'Yarım gün, tam gün ve paket turlarınızı kolayca kaydedin. Ajans bilgisi, yevmiye ve tarih çakışmalarını otomatik kontrol edin.',
  },
  {
    id: '2',
    icon: 'cash' as const,
    iconBg: '#d1fae5',
    iconColor: COLORS.success,
    title: 'Gelirlerinizi Yönetin',
    description:
      'Yevmiye, bahşiş ve komisyon gelirlerinizi ayrı ayrı takip edin. Ödeme durumunu (Ödendi / Kısmi / Bekliyor) anlık güncelleyin.',
  },
  {
    id: '3',
    icon: 'wallet' as const,
    iconBg: '#fee2e2',
    iconColor: COLORS.danger,
    title: 'Giderlerinizi Kontrol Edin',
    description:
      'Kira, Bağkur, ulaşım ve diğer giderlerinizi kategorilere göre kaydedin. Tekrarlayan giderleri tek seferde ekleyin.',
  },
  {
    id: '4',
    icon: 'bar-chart' as const,
    iconBg: '#ede9fe',
    iconColor: '#7c3aed',
    title: 'Raporları İnceleyin',
    description:
      'Aylık ve ajans bazlı gelir/gider raporlarını görüntüleyin. Tüm verilerinizi CSV formatında Excel\'e aktarın.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const finish = async () => {
    await AsyncStorage.setItem('gt_onboarding_done', '1');
    router.replace('/(tabs)');
  };

  const next = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      finish();
    }
  };

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Skip */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={finish} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.skipText}>Geç</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(s) => s.id}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(idx);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
              <Ionicons name={item.icon} size={56} color={item.iconColor} />
            </View>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideDesc}>{item.description}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentIndex && styles.dotActive]}
          />
        ))}
      </View>

      {/* CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.btn, isLast && styles.btnPrimary]}
          onPress={next}
          activeOpacity={0.85}
        >
          <Text style={[styles.btnText, isLast && styles.btnTextPrimary]}>
            {isLast ? 'Başlayalım' : 'Devam'}
          </Text>
          <Ionicons
            name={isLast ? 'checkmark' : 'arrow-forward'}
            size={18}
            color={isLast ? '#fff' : COLORS.primary}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  topBar: {
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingBottom: 24,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  slideDesc: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  btnTextPrimary: {
    color: '#fff',
  },
});
