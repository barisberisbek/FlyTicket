# FlyTicket — Hoca Sunum Rehberi
**CENG-3502 Dynamic Web Programming — Final Project**

---

## SUNUM ÖNCESİ HAZIRLIK (Her seferinde)

### 1. MongoDB servisini kontrol et
```powershell
Get-Service MongoDB
# Status: Running olmalı
```
Durmuşsa başlat:
```powershell
Start-Service MongoDB
```

### 2. Backend — Terminal 1
```powershell
cd C:\Users\baris\Desktop\FlyTicket\backend
npm run dev
```
✅ Beklenen çıktı:
```
MongoDB connected
FlyTicket API listening on :5000
```

### 3. Frontend — Terminal 2
```powershell
cd C:\Users\baris\Desktop\FlyTicket\frontend
npx live-server --port=3000
```
✅ Tarayıcı otomatik açılır: **http://localhost:3000**

> **Önemli:** `127.0.0.1:3000` değil, `localhost:3000` kullan!

---

## DEMO SENARYOSU (Hocaya gösterilecek sıra)

---

### BÖLÜM 1 — Ana Sayfa / Uçuş Arama
**URL:** `http://localhost:3000`

**Göster:**
- Sayfa açılışında 30 uçuş listeleniyor (3 günlük)
- From/To dropdown'larında **81 Türkiye şehri** mevcut
- Her uçuş kartında: rota, kalkış/varış saati, süre, koltuk durumu, fiyat

**Canlı test:**
1. From = **İstanbul**, To = **Ankara** → Search
   → 1 sonuç: 09.06, 11:00, ₺850
2. Aynı şehri seç (İstanbul → İstanbul) → Search
   → 🔴 Kırmızı inline hata: *"Origin and destination must differ"*
3. Sadece From = **Ankara** seç, To boş → Search
   → Ankara'dan kalkan tüm uçuşlar
4. Boş arama → Tüm 30 uçuş

---

### BÖLÜM 2 — Uçuş Detay & Koltuk Seçimi
**İstanbul→Ankara uçuşundan "Book" tıkla**

**Göster:**
- Uçuş özet kartı (tarih, saat, süre, fiyat)
- İnteraktif koltuk haritası (A–F kolonları, satır numaraları)
- Koltuk durumları: ⬜ Boş / 🟦 Seçili / 🟥 Dolu

**Canlı test:**
1. Koltuk seçmeden "Continue" → ⚠️ *"Please select a seat first"* uyarısı
2. **2B** koltuğuna tıkla → Mavi renk, *"Selected: 2B"*
3. Tekrar tıkla → Seçim kalkar (toggle)
4. Formu boş bırak → ✅ Bootstrap inline validasyon hataları
5. Yolcu bilgisi doldur: *Ali Yılmaz / ali@test.com*
6. "Continue to payment" → Payment sayfası

---

### BÖLÜM 3 — Ödeme Simülasyonu
**Göster:**
- **← Back to flight** geri butonu (uçuşa dönüş)
- Order summary: rota, yolcu adı, koltuk no, toplam tutar
- Ödeme formu

**Canlı test — önce hatalı:**
1. Kart: `1234 5678 9012 3456` → 🔴 *"Invalid card number"* (Luhn)
2. Expiry: `13/29` → 🔴 *"Use MM/YY format"* (geçersiz ay)

**Canlı test — geçerli:**
```
Kart: 4111 1111 1111 1111
Son kullanma: 12/29
CVV: 123
Kart üzerindeki ad: Ali Yilmaz
```
→ "Processing..." (~1.5 saniye)
→ Otomatik yönlendirme: **booking-confirmation.html**

---

### BÖLÜM 4 — Rezervasyon Onayı & E-Bilet
**Göster:**
- ✅ *"Booking confirmed!"* başarı mesajı
- E-bilet: Ticket ID, yolcu adı, koltuk, rota, kalkış/varış saatleri
- Sağ alt: Ticket ID (örn. `TKXXXXXXXX`)

**Canlı test:**
1. **"Download / print e-ticket"** → Browser print dialog açılır
2. Print preview'da → Sadece e-bilet, navbar/footer gizlenmiş
3. *"View my tickets"* → Biletlerim sayfasına geç

---

### BÖLÜM 5 — Biletlerim (My Tickets)
**URL:** `http://localhost:3000/my-tickets.html`

**Göster:**
- Email ile arama: `ali@test.com`
→ Az önce oluşturulan bilet görünür
- Tıklayınca e-bilet detayları expand olur

---

### BÖLÜM 6 — Kullanıcı Kaydı (Bonus)
**URL:** `http://localhost:3000/register.html`

**Canlı test:**
1. Form doldur: *Ayşe / Demir / ayse@demo.com / test123*
2. Kayıt ol → Ana sayfaya yönlenir
3. Navbar'da: **"Hi, Ayşe"** ✅
4. Bir uçuşa git → BookingForm adı/email **otomatik dolu**

---

### BÖLÜM 7 — Admin Paneli
**URL:** `http://localhost:3000/admin-login.html`

```
Kullanıcı adı: admin
Şifre: Admin123!
```

#### 7a. Dashboard
**URL:** `http://localhost:3000/admin-dashboard.html`

**Göster:**
- Başlık: **"Flights 30"** (badge sayaç)
- Tablo: Flight ID, rota, kalkış/varış, fiyat, koltuk durumu
- Her satırda [Edit] [Delete] butonları

**Canlı test — yeni uçuş ekle:**
1. **"+ Add new flight"** tıkla
2. From = To (Ankara/Ankara) → Save → 🔴 Inline hata
3. From = **Samsun**, To = **Antalya**
4. Kalkış: 3 gün sonra 10:00 / Varış: 11:30
5. Fiyat: 950 / Koltuk: 100
6. Save → Dashboard'a döner, yeni uçuş tabloda görünür

**Canlı test — düzenle:**
1. Yeni eklenen uçuşun [Edit] → Form dolu geliyor ✅
2. Fiyatı 950 → 875 yap → Save

**Canlı test — sil:**
1. [Delete] → "Delete this flight? This cannot be undone." dialog
2. Confirm → Tabloda kaybolur, sayaç 30'a döner

#### 7b. Uçuş Kuralları (PDF'in en önemli kısmı!)
Yeni uçuş eklerken, mevcut bir uçuşla aynı şehir + aynı saat:
- From = İstanbul, Kalkış = 09.06 11:00 (İstanbul zaten 11:00'de kalkıyor)
→ 🔴 `Conflict: a flight already departs from İstanbul at 11:00`

#### 7c. Tüm Rezervasyonlar
**URL:** `http://localhost:3000/admin-bookings.html`

**Göster:**
- Başlık: **"All bookings N"** (badge)
- Tablo: Ticket ID, yolcu, email, rota, koltuk, ödeme durumu, tarih

---

### BÖLÜM 8 — Güvenlik Kontrolü (Ekstra etkileyici)
Tarayıcı adres çubuğuna doğrudan yaz:

`http://localhost:3000/admin-dashboard.html`

→ Token yoksa otomatik **admin-login.html**'e yönlenir ✅

---

## TEST KART BİLGİLERİ

| Alan | Değer |
|------|-------|
| Kart numarası | `4111 1111 1111 1111` |
| Son kullanma | `12/29` |
| CVV | `123` |
| Kart adı | herhangi bir isim |

> Luhn algoritması kontrollü. Bu kart geçer; `1234 5678 9012 3456` geçmez.

---

## HOCA SORARSA HAZIR CEVAPLAR

| Soru | Cevap |
|------|-------|
| "Neden framework kullanmadın?" | "Dersin müfredatı Vanilla JS + component mimarisini öğretmek amacıyla tasarlandı. `Component` base sınıfı ile `setState/update` döngüsü kurarak kendi mini-framework'ümüzü yazdık." |
| "Aynı koltuğu iki kişi rezerve edebilir mi?" | "Hayır. Backend MongoDB'nin atomik `findOneAndUpdate` operasyonunu kullanıyor. Seat ikinci kez alınmaya çalışılırsa 409 Conflict döner." |
| "Şifreler nasıl saklanıyor?" | "bcryptjs ile 10-round salt + hash. Hem admin hem kullanıcı şifresi DB'de düz metin olarak tutulmuyor." |
| "JWT nerede saklanıyor?" | "Browser localStorage'da iki ayrı key: `flyticket_admin_token` ve `flyticket_user_token`. Admin ve kullanıcı token'ları birbirinden tamamen bağımsız." |
| "81 şehrin hepsi var mı?" | "Evet. `backend/seed/cities.json` dosyasında 81 il plaka numarasıyla (`01`–`81`) tam liste mevcut. `npm run seed` ile DB'ye yükleniyor." |
| "Uçuş kurallarını nerede zorunlu kılıyorsun?" | "`backend/utils/flightRules.js` — saat bazlı çakışma kontrolü hem kalkış hem iniş için yapılıyor. Sadece frontend değil, API seviyesinde zorunlu." |
| "Email gerçekten gidiyor mu?" | "`.env`'de SMTP bilgileri girilirse Nodemailer üzerinden gidiyor. Sunumda SMTP boş, o yüzden sessizce skip ediyor — rezervasyon başarılı olmaya devam ediyor." |

---

## VERİTABANI EXPORT

Sunum bitmeden önce çalıştır:
```powershell
cd C:\Users\baris\Desktop\FlyTicket\backend
npm run export
```
→ `database-export/` klasörüne JSON dosyaları kaydedilir:
- `cities.json` (81 şehir)
- `flights.json` (30 uçuş)
- `tickets.json` (rezervasyonlar)
- `admins.json` (admin hesabı)
- `users.json` (kayıtlı kullanıcılar)

---

## TEKNOLOJİ YIĞINI (Hızlı özet)

| Katman | Teknoloji |
|--------|-----------|
| Frontend | HTML5, CSS3, **Vanilla JavaScript ES6** (sınıf tabanlı component mimarisi) |
| UI Çerçevesi | **Bootstrap 5.3** (CDN) |
| HTTP İstemci | **Fetch API** (async/await) |
| Backend | **Node.js** + **Express.js** |
| Veritabanı | **MongoDB** + **Mongoose** ODM |
| Kimlik Doğrulama | **JWT** + **bcryptjs** |
| E-posta | **Nodemailer** (SMTP) |
| Doğrulama | **express-validator** (backend) + Vanilla JS (frontend) |

---

*CENG-3502 — FlyTicket Final Project — 2025*
