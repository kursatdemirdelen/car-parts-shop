# Kursat Shop — Yedek Parça E-Ticaret Prototipi

Türkiye pazarı için hazırlanmış, BMW ağırlıklı (Mercedes-Benz, Porsche, Audi ile) bir otomotiv yedek parça mağazasının
**çalışan frontend prototipi**. Müşteri vitrini ve basit bir yönetim paneli içerir. Her ikisi de aynı demo veri kümesini kullanır.

> **Bu bir demo prototiptir.** Gerçek ödeme alınmaz, sipariş gönderilmez. Ürün, fiyat, OEM ve uyumluluk verileri örnek veridir.
> Tüm değişiklikler yalnızca tarayıcının yerel depolama alanında tutulur. Canlı kullanıma hazır değildir.

## Gereksinimler

- Node.js 20.9 veya üzeri (Node 23 ile test edildi)
- npm

## Kurulum ve çalıştırma

```bash
npm install
npm run dev
```

Uygulama `http://localhost:3000` adresinde açılır.

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu |
| `npm test` | Vitest birim testleri (iş kuralları) |
| `npm run lint` | ESLint |
| `npm run typecheck` | Route tiplerini üretir ve `tsc --noEmit` çalıştırır |
| `npm run build` | Production build |
| `npm start` | Production build'i çalıştırır |

### Yönetim paneli (demo giriş)

`/admin` adresine gidin. Demo giriş bilgileri giriş ekranında yazar (`src/lib/seed/settings.ts`):

- E-posta: `admin@kursatshop.demo`
- Şifre: `demo1234`

**Bu gerçek bir kimlik doğrulama değildir.** Oturum, tarayıcıda tutulan bir işarettir ve hiçbir güvenlik sağlamaz.

## Teknoloji

- Next.js 16 (App Router, Cache Components, Turbopack), React 19, TypeScript (strict)
- Tailwind CSS 4 (tasarım değişkenleri `src/app/globals.css` içindeki `@theme` bloğunda)
- lucide-react ikonları
- Vitest (yalnızca saf iş kuralları için)
- Başka bir runtime bağımlılığı, UI kütüphanesi, state kütüphanesi veya backend yoktur.

## Proje yapısı

```
src/
  app/
    (store)/            Vitrin sayfaları (ortak header/footer layout)
    admin/login/        Demo giriş
    admin/(panel)/      Yönetim paneli sayfaları (sidebar layout)
    not-found.tsx       Özel 404 sayfası
    globals.css         Tasarım değişkenleri ve temel stiller
  lib/
    types.ts            Veri modeli (Product, Category, Vehicle, CompatibilityRecord, Order, …)
    seed/               Tek merkezi demo veri seti
    catalog/            Arama, listeleme/filtre, uyumluluk, araç seçici, stok kuralları
    cart.ts, orders.ts, shipping.ts, validation.ts, storage.ts, format.ts, ids.ts
  state/                localStorage tabanlı store'lar (katalog, sepet, favoriler, garaj, demo oturum)
  components/
    ui/                 Buton, form alanları, dialog/drawer, toast, boş/yükleniyor durumları …
    product/            Ürün kartı, görsel, fiyat, stok, uyumluluk rozeti, ürün detay
    store/              Header, arama, araç seçici, listeleme, sepet, ödeme …
    admin/              Admin kabuğu, tablo, ürün formu, yönetim sayfaları
public/products/        Ürün çizimleri (SVG)
tests/                  Vitest testleri
docs/                   Brief, tasarım dokümanı ve uygulama planı
```

### Veri akışı

- `src/lib/seed` mağazanın ve admin panelin **tek** başlangıç verisidir.
- `src/state/catalog-store.ts` bu veriyi `useSyncExternalStore` ile sunar. Sunucu render'ı ve ilk istemci render'ı seed'i kullanır
  (hydration uyumsuzluğu oluşmaz). Ardından tarayıcıda kayıtlı değişiklikler yüklenir.
- Admin panelinde yapılan her değişiklik (`catalogActions`) `localStorage`'a yazılır ve vitrine anında yansır.
- Bozuk veya eski formatta kayıtlı veri seed'e geri döner. Silinen ürün veya araçlara ait uyumluluk kayıtları otomatik temizlenir.
- **Ayarlar › Demo verilerini sıfırla** kataloğu ilk haline döndürür. Sepet, favoriler ve garaj korunur.

### Görselleri gerçek fotoğraflarla değiştirmek

Her ürünün `images[].src` alanı `/products/<alt-kategori>.svg` çizimlerinden birini gösterir. Gerçek fotoğrafa geçmek için
dosyaları `public/` altına koyup bu yolları seed'de veya admin ürün formunda güncellemek yeterlidir. Görsel yüklenemezse
`/products/fallback.svg` gösterilir.

## Uygulanan özellikler

**Vitrin**
- Ana sayfa: OEM / stok kodu / ürün adı araması, adım adım araç seçici, garaj kısayolları, kategoriler, öne çıkan ürünler, bilgi şeridi
- Otomatik tamamlamalı arama (ad, marka, stok kodu, OEM; boşluk/nokta/tire ile yazılmış OEM numaraları da eşleşir; Türkçe karakter duyarlı)
- 2 seviyeli kategori yapısı; kategori ve tüm ürünler listeleri; kategori, marka, fiyat, stok filtreleri; sıralama; aktif filtre çipleri;
  URL'de saklanan filtreler; mobilde filtre çekmecesi
- Araç seçici: marka › model › kasa › yıl › motor (yalnızca veri setinde olan kombinasyonlar)
- Uyumluluk: *Doğrulanmış uyum* yalnızca açık kayıtla gösterilir; kayıt yoksa *Doğrulanmamış*; *Uyumsuz* yalnızca açık kayıtla; genel ürünler *Araca bağlı değil*
- "Sadece aracıma uygun olanlar" filtresi (yalnızca doğrulanmış ve araca bağlı olmayan ürünler)
- Ürün detayı (tek sayfa): galeri, fiyat, stok, uyumluluk satırı, adet, sepete ekle, favori, teknik özellikler, OEM numaraları (kopyalanabilir),
  uyumlu araç tablosu, açıklama, benzer ürünler
- Sepet: adet güncelleme, silme, stok yetersiz / satışta değil uyarıları, kargo hesabı; sorunlu satır varken ödeme kapalı
- Demo ödeme: iletişim, adres, ödeme yöntemi (kapıda ödeme / havale — demo), doğrulama; sipariş anlık görüntüsü, stok düşümü, `KS-YYMMDD-XXXX` numarası
- Favoriler, garaj (kaydet / seç / kaldır), yardım, kargo-iade, yasal bilgiler, 404 sayfası

**Yönetim paneli**
- Gösterge paneli: ürün, yayında, az stok, tükenen, kategori/marka ve demo sipariş sayıları; son siparişler; stok takibi
- Ürünler: ad/stok kodu/OEM araması, kategori/marka/durum/stok filtreleri, sıralama, onaylı silme
- Ürün formu: temel bilgiler, kodlar (birden çok OEM), görseller, teknik özellikler, araç uyumluluğu, yayın durumu, sınıflandırma, fiyat ve stok;
  alan bazlı doğrulama; kaydedilmemiş değişiklik uyarısı
- Kategoriler (2 seviye kuralı), markalar: ekle/düzenle/sil; ürünü olan kategori veya marka silinemez
- Araçlar: ekle/düzenle/sil (ilgili uyumluluk kayıtları da silinir)
- Uyumluluk: ürüne veya araca göre açık kayıt yönetimi
- Siparişler: liste, durum filtresi, detay ve durum güncelleme
- Ayarlar: mağaza/iletişim, kargo eşiği ve ücreti, az stok eşiği; demo verilerini sıfırlama

## Bilinen sınırlamalar

- **Backend yok:** Tüm veriler tarayıcının `localStorage` alanındadır. Kullanıcılar veya cihazlar arasında paylaşılmaz, tarayıcı verisi temizlenince kaybolur.
- **Güvenli kimlik doğrulama yok:** Admin girişi sunum amaçlı bir tarayıcı işaretidir. Panel içeriği teknik olarak herkese açıktır.
- **Gerçek ödeme ve gönderim yok:** Kart bilgisi istenmez, ödeme sağlayıcısı veya kargo entegrasyonu yoktur.
- **Demo veri:** Ürün, fiyat, OEM, teknik özellik ve uyumluluk kayıtları örnektir. Doğruluğu garanti edilmez.
- **Eşzamanlılık yok:** Stok kontrolü yalnızca bu tarayıcıdaki veriye göre yapılır. Gerçek stok tutarlılığı sağlanmaz.
- **Müşteri hesabı yok:** Hesap menüsü garaj, favoriler ve yardıma yönlendirir.
- **ProductVariant yok:** Demo katalogda ayrı satın alınabilir varyantı olan ürün bulunmadığından model bilinçli olarak eklenmedi.
- **Görseller temsilidir:** Her alt kategori için tek tip çizim kullanılır.
- Admin'de oluşturulan yeni ürün ve kategori sayfaları önceden render edilmez, tarayıcıda çözülür.

## Canlıya geçmeden önce yapılması gerekenler

Gerçek müşterilerden sipariş almadan önce en az şunlar ayrıca ele alınmalıdır:

1. **Backend ve veritabanı:** `src/lib/storage.ts` ve `src/state/catalog-store.ts` yerine bir API ve veritabanı (ürün, stok, sipariş, uyumluluk).
2. **Güvenli admin kimlik doğrulama ve yetkilendirme:** Sunucu taraflı oturum ve rol kontrolü, yönetim API'lerinin korunması.
3. **Stok tutarlılığı:** Sipariş anında sunucuda atomik stok düşümü ve rezervasyon.
4. **Ödeme:** Lisanslı bir ödeme kuruluşu entegrasyonu (3D Secure). Kart verisi bu uygulamada işlenmemelidir.
5. **Kargo:** Gerçek kargo firması entegrasyonu ve takip.
6. **Yasal süreçler:** KVKK aydınlatma metni ve açık rıza, mesafeli satış sözleşmesi, ön bilgilendirme formu, iade/cayma süreçleri, e-fatura/e-arşiv.
7. **Doğrulanmış katalog ve uyumluluk verisi:** Tedarikçi veya fitment veri kaynağı.
