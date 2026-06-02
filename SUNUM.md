# FlyTicket — Hoca Sunum Rehberi
**CENG-3502 Dynamic Web Programming — Final Project**

---

## SİSTEM BAŞLATMA (Her sunumdan önce)

### 1. MongoDB servisini kontrol et
```powershell
Get-Service MongoDB
# Status: Running olmalı
```
Durmuşsa:
```powershell
Start-Service MongoDB
```

### 2. Backend — Terminal 1
```powershell
cd C:\Users\baris\Desktop\FlyTicket\backend
npm run dev
```
✅ Beklenen:
```
MongoDB connected
FlyTicket API listening on :5000
```

### 3. Frontend — Terminal 2
```powershell
cd C:\Users\baris\Desktop\FlyTicket\frontend
npx live-server --port=3000
```
✅ Tarayıcı açılır: **http://localhost:3000**

> **Önemli:** `127.0.0.1:3000` değil, `localhost:3000` kullan!

---

## GİRİŞ BİLGİLERİ

| Hesap | Bilgi |
|-------|-------|
| **Admin** | `http://localhost:3000/admin-login.html` → `admin` / `Admin123!` |
| **User** | `http://localhost:3000/login.html` → `ahmet@test.com` / `test123` |
| **Test kart** | `4111 1111 1111 1111` · Exp `12/29` · CVV `123` |

---

## DEMO SENARYOSU

### BÖLÜM 1 — Ana Sayfa & Uçuş Arama
**URL:** `http://localhost:3000`

> *"81 Türkiye şehri One Way / Round Trip seçeneği ve yolcu sayısı ile aranabilir."*

- Sayfa açılışında 30 uçuş listelenir (3 günlük)
- **One Way / Round Trip** toggle → Round Trip seçince Return Date görünür
- **Passengers** dropdown: 1–4 kişi
- **Sort bar:** ⏰ Time · ₺↑ · ₺↓ butonları
- Aynı şehir seçilince inline hata (Origin must differ)
- İstanbul → Ankara ara → 1 sonuç · **₺850**

---

### BÖLÜM 2 — Dark Mode
- Navbar sağ üstteki **🌙** butonuna tıkla
- Tüm sayfa karardı, kartlar koyu renge döndü
- F5 sonrası ayar korunur *(localStorage'a kaydedilir)*
- ☀️ ile geri dön

---

### BÖLÜM 3 — Uçuş Detay & Koltuk Seçimi
**İstanbul→Ankara "Book" butonuna tıkla**

> *"Step indicator (adım çubuğu) hangi aşamada olduğunu gösterir."*

- Üstte: **Search → 💺 Select Seat → Payment → Confirm** adım çubuğu
- Koltuk haritası: A–F kolonları, boş / seçili / dolu renkleri
- Koltuk seçmeden Continue → uyarı
- **2B** seç → mavi renk → "Selected: 2B"
- Form doldur → **Continue to payment**

---

### BÖLÜM 4 — Ödeme Simülasyonu
> *"Luhn algoritması kart doğrulaması, 1.5s simüle gecikme, kayıtlı kart desteği."*

- **← Back to flight** geri butonu çalışır
- Order summary: uçuş, yolcu, koltuk, toplam
- Kötü kart: `1234 5678 9012 3456` → Invalid card number
- İyi kart: `4111 1111 1111 1111` · `12/29` · `123`
- **Pay** → Processing... (~1.5s) → Confirmation

---

### BÖLÜM 5 — Rezervasyon Onayı & E-Bilet
> *"Booking_ref ile round-trip dönüş bağlantısı ve kart kaydetme seçeneği."*

- ✅ **Booking confirmed!**
- E-bilet: Ticket ID, yolcu, koltuk, rota, saatler
- **Download / print** → print preview'da sadece e-bilet
- Eğer kayıtlı kullanıcıysa: "Save this card for future payments" seçeneği

---

### BÖLÜM 6 — Multi-Passenger Booking (Yolcu Sayısı)
Ana sayfaya dön:

> *"2 yolcu seç — sistem 2 koltuk seçimini zorunlu kılar, toplam tutar 2× gösterilir."*

1. Passengers: **2** seç
2. İstanbul → Ankara ara → Book
3. Koltuk haritasında **2 koltuk** seç (örn. 3A ve 3B)
4. Payment'da: "**2 × ₺850,00 = ₺1.700,00**"
5. Ödeme → Confirmation'da iki ayrı Ticket ID

---

### BÖLÜM 7 — Round-Trip Booking (Gidiş-Dönüş)
> *"Gidiş uçuşu rezerve edildikten sonra dönüş uçuşu için CTA gösterilir."*

1. **Round Trip** seç, Return Date gir (2 gün sonrası)
2. İstanbul → Ankara ara → Book → gidiş tamamla
3. Confirmation'da: **"↩️ Book your return flight"** kutusu
4. "Search return" butonuna tıkla → form otomatik dolu (Ankara → İstanbul)

---

### BÖLÜM 8 — Biletlerim & İptal Politikası
**URL:** `http://localhost:3000/my-tickets.html`

> *"İptal politikası: >48h tam iade, 24-48h %75, 12-24h %50, <12h iade yok."*

- Email ara: `ahmet@test.com` → biletler görünür
- **Active | Cancelled** tab sistemi
- Aktif bir bilette **"Cancel ticket"** butonu
- Modal açılır → iade tutarı ve yüzdesi gösterilir
- Onayla → bilet iptal, koltuk geri döner

---

### BÖLÜM 9 — Kullanıcı Profil Sayfası
`http://localhost:3000/login.html` → giriş → Navbar "👤 Ahmet" dropdown → **My Profile**

> *"4 sekme: profil bilgisi, şifre değiştirme, kayıtlı kartlar, istatistikler."*

1. **Profile** tab: isim değiştir → Kaydet → navbar güncellenir
2. **Security** tab: şifre değiştirme formu
3. **My Cards** tab: kayıtlı kartlar (varsa) + sil butonu
4. **Stats** tab: toplam trip, harcama, favori şehir

---

### BÖLÜM 10 — Admin Paneli

#### Dashboard `http://localhost:3000/admin-dashboard.html`
> *"Üst kısımda 4 metric kart: istatistikler canlı API'den çekiliyor."*

- **Flights 30** badge
- 4 stat kart: ✈️ Total Flights · 🎫 Bookings · 💰 Revenue · 📊 Avg Occupancy
- Tablo: Flight ID, rota, kalkış/varış, fiyat, koltuk

**Uçuş durumu değiştir:**
1. Herhangi bir uçuşta **Edit** → Status: **Delayed** → Save
2. Dashboard'a dön → uçuş kartında sarı ⏱ Delayed badge görünür

**Uçuş kuralı göster:**
- "+ Add new flight" → İstanbul 11:00 saatini dene → 409 Conflict hatası

#### Bookings `http://localhost:3000/admin-bookings.html`
> *"Canlı arama/filtreleme — veritabanına yeni istek gönderilmez."*

- **"All bookings N"** sayaç badge
- Email filtresi: `pdftest` yaz → anlık filtreleme
- Status filtresi: Cancelled → iptal edilenler

#### Admin Settings `http://localhost:3000/admin-settings.html`
- Admin şifre değiştirme formu

---

### BÖLÜM 11 — Güvenlik Kontrolü (Ekstra etkileyici)
Tarayıcı adres çubuğuna doğrudan yaz:

`http://localhost:3000/admin-dashboard.html` → Token yoksa **admin-login.html**'e yönlenir ✅

---

## PDF GEREKSİNİMLERİ UYUM TABLOSU

| # | Gereksinim | Durum |
|---|-----------|-------|
| 1 | 81 Türkiye şehri | ✅ |
| 2 | Uçuş listeleme | ✅ `GET /flights` |
| 3 | Origin/destination/tarih arama | ✅ |
| 4 | Bilet rezervasyonu | ✅ `POST /tickets` |
| 5 | Rezervasyon onayı | ✅ E-bilet + print |
| 6 | Admin login | ✅ JWT korumalı |
| 7 | Admin uçuş ekle | ✅ `POST /flights` |
| 8 | Admin uçuş düzenle | ✅ `PUT /flights/:id` |
| 9 | Admin uçuş sil | ✅ `DELETE /flights/:id` |
| 10 | Admin tüm rezervasyonlar | ✅ `GET /tickets` |
| 11 | from ≠ to kuralı | ✅ 400 hatası |
| 12 | arrival > departure | ✅ 400 hatası |
| 13 | Aynı saat aynı şehir kalkış | ✅ 409 hatası |
| 14 | Aynı saat aynı şehir iniş | ✅ 409 hatası |
| **B1** | Koltuk seçimi | ✅ + çoklu yolcu |
| **B2** | E-bilet email (SMTP) | ✅ Nodemailer |
| **B3** | Ödeme simülasyonu | ✅ Luhn + delay |
| **B4** | Kullanıcı auth | ✅ Register/Login |
| **B5** | Mobil responsive | ✅ Bootstrap 5 |

---

## HOCA SORARSA HAZIR CEVAPLAR

| Soru | Cevap |
|------|-------|
| "Neden framework yok?" | "Ders müfredatı Vanilla JS component mimarisini öğretmek için tasarlandı. `Component` base sınıfı ile setState/update döngüsü kurarak kendi mini-framework'ümüzü yazdık." |
| "Aynı koltuğu iki kişi alabilir mi?" | "Hayır. MongoDB'nin atomik `findOneAndUpdate` ile `booked_seats: { $ne: seat }` filtresi aynı anda iki rezervasyonu engeller." |
| "Şifreler nasıl saklanıyor?" | "bcryptjs ile 10-round salt + hash. DB'de düz metin yok." |
| "JWT nerede saklanıyor?" | "localStorage'da iki ayrı key: `flyticket_admin_token` ve `flyticket_user_token`. Admin ve kullanıcı token'ları bağımsız." |
| "İptal politikası nasıl çalışıyor?" | ">48h tam iade, 24-48h %75, 12-24h %50, <12h iade yok. `backend/utils/cancellationPolicy.js` ve `frontend/js/utils/cancellationPolicy.js` aynı mantık." |
| "Email gerçekten gidiyor mu?" | "`.env`'de SMTP bilgileri girilince Nodemailer ile gönderilir. SMTP boş ise sessizce skip eder, rezervasyon başarılı olmaya devam eder." |
| "Dark mode nasıl çalışıyor?" | "CSS custom properties `[data-theme='dark']` selector ile. Tercih localStorage'da saklanır, sayfa yüklenmeden önce `initTheme()` uygulanır (FOUC yok)." |

---

## DB EXPORT GÜNCELLEME

Sunum bitmeden çalıştır:
```powershell
cd C:\Users\baris\Desktop\FlyTicket\backend
npm run export
```

---

*CENG-3502 — FlyTicket Final Project — 2025*
