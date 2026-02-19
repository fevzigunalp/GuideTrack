# GuideTrack – Tur Rehberi Finans Uygulaması

Tur rehberleri için gelir, gider ve tur takip uygulaması. React Native (Expo) ile geliştirilmiştir.

## Canlı Önizleme

Uygulamayı tarayıcıda doğrudan açmak için:

**[web-preview.html](./web-preview.html)** dosyasını indirip çift tıklayın — kurulum gerekmez.

Cloudflare Pages üzerinden yayınlamak için aşağıdaki adımları izleyin.

---

## Özellikler

- **Tur Yönetimi** — Yarım gün, tam gün, paket tur kaydı; tarih çakışma uyarısı
- **Gelir Takibi** — Yevmiye, bahşiş, komisyon ayrı ayrı kaydedilir
- **Ödeme Durumu** — Ödenmedi / Kısmi / Ödendi takibi
- **Gider Yönetimi** — Kategorili gider kaydı; tekrarlayan gider desteği
- **Ajans Yönetimi** — Birden fazla ajans; varsayılan yevmiye tanımlama
- **Takvim** — Aylık görünüm; tur günleri işaretlenir
- **Raporlar** — 12 aylık gelir/gider grafiği; ajans bazlı analiz
- **CSV Dışa Aktarma** — Tüm verileri Excel'e aktarma
- **Arama** — Tur ve giderlerde anlık arama/filtreleme
- **Offline-first** — Tüm veriler cihazda (AsyncStorage / LocalStorage)

---

## Cloudflare Pages Kurulumu

### Seçenek 1 — web-preview.html (Hızlı, Önerilen)

1. [Cloudflare Pages](https://pages.cloudflare.com) → **Create a project** → **Connect to Git**
2. `fevzigunalp/GuideTrack` reposunu seçin
3. Build ayarları:
   | Alan | Değer |
   |------|-------|
   | Framework preset | `None` |
   | Build command | `mkdir -p dist && cp web-preview.html dist/index.html` |
   | Build output directory | `dist` |
4. **Save and Deploy** — birkaç saniye içinde canlıya alır.

### Seçenek 2 — Expo Web Build (Tam React Native)

1. Build ayarları:
   | Alan | Değer |
   |------|-------|
   | Framework preset | `None` |
   | Build command | `npx expo export --platform web` |
   | Build output directory | `dist` |
   | NODE_VERSION (env var) | `18` |
2. `public/_redirects` dosyası zaten eklenmiştir (SPA fallback).

---

## Yerel Geliştirme

### Gereksinimler

- Node.js 18+
- npm veya yarn

### Kurulum

```bash
cd GuideTrack
npm install
npm start        # Expo Dev Server
npm run web      # Tarayıcıda aç
```

### Mobil Cihazda Test

```bash
npm start
# QR kodu Expo Go uygulamasıyla okutun (iOS / Android)
```

### Uygulama Mağazası Build

```bash
npm install -g eas-cli
eas login
eas build --platform ios      # App Store
eas build --platform android  # Google Play
```

---

## Proje Yapısı

```
GuideTrack/
├── app/
│   ├── _layout.tsx          # Root layout (Stack + modal)
│   ├── (tabs)/
│   │   ├── index.tsx        # Bilanço (Dashboard)
│   │   ├── tours.tsx        # Turlar
│   │   ├── calendar.tsx     # Takvim
│   │   ├── expenses.tsx     # Giderler
│   │   └── settings.tsx     # Ayarlar
│   ├── tour-form.tsx        # Tur ekle/düzenle
│   ├── tour-detail.tsx      # Tur detayı & ödeme
│   ├── expense-form.tsx     # Gider ekle
│   ├── extra-income.tsx     # Bahşiş/komisyon ekle
│   ├── agencies.tsx         # Ajans listesi
│   ├── agency-form.tsx      # Ajans ekle/düzenle
│   └── reports.tsx          # Raporlar
├── components/              # UI bileşenleri
├── context/AppContext.tsx   # Global state
├── services/                # Storage, hesaplama, export
├── types/index.ts           # TypeScript tipleri
├── constants/index.ts       # Sabitler, varsayılanlar
├── web-preview.html         # Tek dosya tarayıcı önizleme
└── public/_redirects        # Cloudflare SPA fallback
```

---

## Teknoloji

| Katman | Teknoloji |
|--------|-----------|
| Framework | React Native + Expo SDK 52 |
| Routing | Expo Router v4 |
| Stil | NativeWind v4 (Tailwind CSS) |
| State | Context API + useReducer |
| Depolama | AsyncStorage (mobil) / LocalStorage (web) |
| Export | expo-file-system + expo-sharing / Blob API |

---

## Lisans

MIT © 2025 GuideTrack
