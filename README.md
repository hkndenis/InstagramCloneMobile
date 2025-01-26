# Instagram Clone Mobile App

## 📱 Proje Özeti
Instagram benzeri bir sosyal medya mobil uygulaması. Kullanıcılar fotoğraf paylaşabilir, diğer kullanıcıları takip edebilir ve gönderilerle etkileşime girebilir.

## 🎯 Hedef Kitle
- 13-45 yaş arası sosyal medya kullanıcıları
- Fotoğraf paylaşmayı seven kullanıcılar 
- Sosyal etkileşim arayan kullanıcılar

## 🛠️ Teknoloji Yığını

### Frontend
- React Native (Expo)
- TypeScript
- Redux Toolkit (State Management)
- React Navigation
- Axios
- Expo Image Picker
- Expo Secure Store

### Backend
- Python Flask
- PostgreSQL
- JWT Authentication
- CORS

## 📂 Klasör Yapısı
src/
├── app/
│ ├── (auth)/ # Kimlik doğrulama sayfaları
│ ├── (tabs)/ # Ana sekmeler
│ └── layout.tsx # Uygulama düzeni
├── components/ # UI bileşenleri
├── services/ # API servisleri
├── hooks/ # Özel hook'lar
├── store/ # Redux store
└── utils/ # Yardımcı fonksiyonlar

## ⭐ Temel Özellikler

### Kimlik Doğrulama
- Kayıt olma
- Giriş yapma
- Şifre sıfırlama
- Oturum yönetimi

### Profil Yönetimi
- Profil düzenleme
- Profil fotoğrafı yükleme
- Kullanıcı bilgilerini görüntüleme

### Gönderi İşlemleri
- Fotoğraf yükleme ve paylaşma
- Açıklama ekleme
- Gönderi silme
- Gönderi listeleme

### Sosyal Etkileşim
- Gönderi beğenme
- Yorum yapma
- Kullanıcıları takip etme
- Takipçi/takip edilen listeleme

### Keşfet
- Popüler gönderileri görüntüleme
- Kullanıcı arama
- Önerilen kullanıcılar

## 🔒 Güvenlik Önlemleri
- JWT token kullanımı
- Refresh token mekanizması
- Şifre hashleme
- HTTPS kullanımı
- Input validasyonu
- SQL injection koruması
- XSS koruması

## 🚀 Performans Optimizasyonları
- Görüntü önbelleğe alma
- Lazy loading
- Sonsuz scroll
- Database indexleme
- Query optimizasyonu
- Caching mekanizması

## 📱 Gelecek Özellikler
- [ ] Hikaye paylaşma
- [ ] Direct messaging
- [ ] Push notifications
- [ ] Video paylaşımı
- [ ] Konum etiketleme
- [ ] Offline kullanım desteği

## 📝 Lisans
Bu proje MIT lisansı altında lisanslanmıştır.
