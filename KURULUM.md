# GuideTrack - Kurulum Kılavuzu

## Gereksinimler

- Node.js 18+ (https://nodejs.org)
- npm veya yarn
- Expo Go uygulaması (test için, App Store / Google Play'den indir)

## 1. Kurulum

```bash
cd GuideTrack
npm install
```

## 2. Çalıştırma

```bash
npx expo start
```

Terminalde QR kodu görünecek. Telefonunuzda Expo Go'yu açıp QR kodu okutun.

## 3. Android/iOS Simülatör

```bash
# Android
npx expo start --android

# iOS (Mac gerektirir)
npx expo start --ios
```

## 4. App Store / Google Play için Build

### EAS (Expo Application Services) kurulumu:
```bash
npm install -g eas-cli
eas login
eas build:configure
```

### Android APK/AAB:
```bash
eas build --platform android
```

### iOS IPA:
```bash
eas build --platform ios
```

## Proje Yapısı

```
GuideTrack/
├── app/                  # Ekranlar (Expo Router)
│   ├── (tabs)/           # Alt tab ekranları
│   │   ├── index.tsx     # Bilanço/Dashboard
│   │   ├── tours.tsx     # Turlar
│   │   ├── calendar.tsx  # Takvim
│   │   ├── expenses.tsx  # Giderler
│   │   └── settings.tsx  # Ayarlar
│   ├── tour-form.tsx     # Tur ekle/düzenle
│   ├── expense-form.tsx  # Gider ekle/düzenle
│   ├── agency-form.tsx   # Ajans ekle/düzenle
│   ├── agencies.tsx      # Ajans listesi
│   ├── tour-detail.tsx   # Tur detayı
│   ├── extra-income.tsx  # Bahşiş/Komisyon ekle
│   └── reports.tsx       # Raporlar
├── components/           # Yeniden kullanılabilir bileşenler
├── context/              # Uygulama state yönetimi
├── services/             # Storage, hesaplama, export
├── types/                # TypeScript tipleri
└── constants/            # Renkler, sabit değerler
```

## Özellikler

- ✅ Tur yönetimi (yarım gün, tam gün, paket tur)
- ✅ Ajans yönetimi (CRUD)
- ✅ Gider takibi (tekrarlayan giderler dahil)
- ✅ Bahşiş ve komisyon ekleme
- ✅ Ödeme durumu takibi (Ödenmedi/Kısmi/Ödendi)
- ✅ Takvim görünümü
- ✅ Bilanço / Dashboard
- ✅ Aylık ve ajans bazlı raporlar
- ✅ CSV dışa aktarma (Premium)
- ✅ Çakışma tespiti
- ✅ Offline çalışma (tüm veri yerel)

## Icon / Splash Ekranı

`assets/` klasörüne şu dosyaları ekleyin:
- `icon.png` (1024x1024)
- `splash-icon.png` (1284x2778)
- `adaptive-icon.png` (1024x1024)
- `favicon.png` (196x196)

Ücretsiz icon oluşturmak için: https://expo.dev/tools/app-icon-generator
