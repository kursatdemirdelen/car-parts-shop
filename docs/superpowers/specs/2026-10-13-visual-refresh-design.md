# Kursat Shop — Görsel Yenileme Tasarım Dokümanı

Tarih: 2026-10-13
Önceki tasarımlar geçerliliğini korur: [`kursat-shop`](2026-10-12-kursat-shop-design.md), [`portfolio-upgrade`](2026-10-12-portfolio-upgrade-design.md), [`maintenance-reminder`](2026-10-12-maintenance-reminder-design.md).

## 1. Amaç ve neden

Proje sahibine göre arayüz "fazla sade" kalmış: nötr gri palet, tek düze ikonlar, fotoğraf yok, hareket yok. Bu portfolyo projesinin ilk bakışta "canlı bir mağaza" hissi vermesi, ama mevcut güçlü yanlarını bozmaması gerekiyor. Korunacak güçlü yanlar şunlar:
- Arama-öncelikli ana sayfa.
- Dürüst uyumluluk dili.
- Erişilebilirlik.
- Lighthouse skorları.

**Başarı ölçütü:**
- Ana sayfa ilk ekranda renkli, fotoğraflı ve admin'den değiştirilebilir bir vitrin gösterir.
- Arama kutusu ve araç seçici yine ilk ekranda kalır.
- Lighthouse performansı ana sayfada **≥ 90**, erişilebilirlik **100** kalır.

## 2. Hedefler, kapsam dışı ve başarısızlık sayılacaklar

**Hedefler**
1. Admin'den yönetilen **hero slider** ve **kampanya şeridi**.
2. **Stok fotoğraflar.** Unsplash/Pexels lisanslı fotoğraflar repoya eklenir ve hero ile kategori kartlarında kullanılır.
3. **Renklendirme ve ikonlar.** Tek bir marka vurgu rengi ve ana grup başına renk kodu kullanılır; ikonlar renkli rozetler içinde gösterilir.
4. **Hafif ve hızlı animasyonlar.** Yalnızca CSS kullanılır, süreler 150–250 ms arasındadır.
5. **Spinner tarzı yüklenme durumları.** Bu her yerde geçerlidir.
6. **Hata ekranları.** 404, genel hata, bölüm içi hata kartları ve admin hata ekranları.

**Kapsam dışı**
- Görsel yükleme. Backend yok, bu yüzden admin yalnızca hazır fotoğraf kütüphanesinden seçer.
- Karanlık tema.
- Animasyon kütüphanesi (Framer Motion vb.).
- Ürün fotoğrafları. Ürünler SVG çizimde kalır, çünkü yanlış parçanın fotoğrafı yanıltıcı olur.
- Sayfa geçiş animasyonları.

**Başarısızlık sayılacaklar**
- Slider'ın arama kutusunu ya da araç seçiciyi ilk ekrandan itmesi.
- Otomatik dönen slider'ın durdurulamaması (WCAG 2.2.2).
- "Hareketi azalt" tercihine rağmen animasyon oynaması.
- Lisansı belirsiz veya kaynak belirtilmeden kullanılan fotoğraf.
- Fotoğraflarda belirgin marka logosu ya da plaka.
- Renk kontrastının AA'nın altına düşmesi.
- Sahte kampanya vaadi. Kampanya şeridi örnek metniyle gelir ve "demo" bağlamını bozmaz.
- Gerçek bir bekleme yokken yapay gecikme eklenip spinner gösterilmesi.

## 3. Kullanıcının verdiği kararlar

| Konu | Karar |
|---|---|
| Hero | Slider ve kampanya şeridi, ikisi de admin'den yönetilir. |
| Fotoğraf | Unsplash/Pexels'ten indirilip repoya eklenir. Dosya listesi indirmeden önce onaya sunulur. |
| Renk | Vurgu rengi + ana grup renkleri; ikonlar renkli zeminli rozetlerde. Palet: `#1B262C`, `#0F4C75`, `#3282B8`, `#BBE1FA`. |
| Animasyon | Hafif ve hızlı (150–250 ms), CSS ile; "hareketi azalt" tercihine uyar. |
| Yüklenme | Karma: ürün ızgaraları ve listelerde iskelet (shimmer efektiyle), butonlar, sayfa geçişleri ve küçük alanlarda spinner. |
| Slider | Her zaman otomatik geçiş (6 sn), durdurulabilir. |
| Teslim | Tek parti; sonunda bağımsız kod incelemesi. |
| Ek | Paylaşım (OG) görselleri ve favicon yeni palete geçer. |
| Hatalar | 404 yenilenir; genel hata sayfası; bölüm içi hata kartları; admin hata ekranları. |
| Filtreler | Grup başlıklarında ikon; kategori satırlarında kategori ikonu ve rengi; markalarda harf monogramı ve ülke; stok satırlarında durum ikonu; seçili satır vurgu zemininde. |
| Açılır listeler | Kademeli özel select: alanın solunda ikon; destekleyen tarayıcıda seçeneklerin içinde de ikon ve renk; diğerlerinde standart liste. |
| Etiketler | Tek tip ikonlu etiket sistemi. |
| Ekstralar | Araç seçici adım göstergesi, teknik özellik ikonları, boş durum illüstrasyonları. |

## 4. Hero slider ve kampanya şeridi

### 4.1 Veri

`CatalogData`'ya `heroSlides: HeroSlide[]` ve `announcement: Announcement` eklenir. (`StoreSettings` yerine ayrı alan: ayarlar formu düz metin alanlarıyla çalışıyor, iç içe nesne o formu karmaşıklaştırır.)

```ts
interface HeroSlide {
  id: ID;
  title: string;        // zorunlu, en fazla 60 karakter
  subtitle: string;     // isteğe bağlı, en fazla 140 karakter
  ctaLabel: string;     // isteğe bağlı, en fazla 24 karakter; boşsa buton yok
  ctaHref: string;      // ctaLabel varsa zorunlu; site içi yol ("/" ile başlar)
  photo: PhotoKey;      // fotoğraf kütüphanesinden bir anahtar
  tone: "dark" | "accent" | "light"; // metin/örtü renk düzeni
  status: PublicationStatus;
}
interface Announcement { enabled: boolean; text: string /* ≤ 90 */; href: string /* isteğe bağlı, site içi */ }
```

- **Sıra:** Slaytların sırası dizideki sıradır.
- **Seed:** 3 slayt (genel arama, bakım hatırlatıcısı, BMW kataloğu) ve açık bir örnek kampanya şeridi. Şerit metni dürüst bir demo bilgisidir: "1.500 TL üzeri siparişlerde ücretsiz kargo (demo)". Eşik ayarlardaki `freeShippingThreshold` ile tutarlıdır.
- **Migrasyon:** `migrateCatalog` eski tarayıcı verisine eksikse seed `heroSlides` ve `announcement` ekler. `isCatalogData` yeni alanları denetler.

### 4.2 Mağaza tarafı

**Kampanya şeridi**
- Header'ın üstünde tam genişlikte, ince ve vurgu renkli bir şerittir.
- Bağlantı varsa tıklanabilir. Kapatma (×) seçimi oturum boyunca `sessionStorage`'ta tutulur.
- `enabled: false` veya metin boşsa görünmez.

**Hero slider**
- Ana sayfanın üstünde yer alır. **Arama kutusu ve araç seçici kartı slider'ın hemen altında, ilk ekranda kalır.** Kart, slider'ın alt kenarına hafifçe biner.
- Yükseklik masaüstünde yaklaşık 320 px, mobilde yaklaşık 220 px.
- Fotoğraf, okunabilirlik için `tone`'a göre bir renk örtüsüyle kaplanır.
- Otomatik geçiş 6 saniyede bir olur.
- Fare üstündeyken veya odak içerideyken geçiş durur. Görünür bir **Durdur/Oynat** butonu vardır. Önceki/sonraki okları ve nokta göstergeleri bulunur; klavyeyle kullanılabilir.
- "Hareketi azalt" tercihinde otomatik geçiş kapalıdır.
- Geçiş efekti 250 ms'lik crossfade'dir.
- Erişilebilirlik: `aria-roledescription="carousel"`, her slayt "slayt 1 / 3" olarak etiketlenir ve yalnızca aktif slayt erişilebilirlik ağacında görünür.
- İlk slaytın görseli LCP adayıdır: `next/image` ile `priority`, `sizes` ve WebP kullanılır.
- Yayında slayt yoksa slider alanı hiç render edilmez ve sayfa bugünkü arama-öncelikli hero'ya döner.

### 4.3 Admin

Yeni menü öğesi **"Ana sayfa"** (`/admin/home`), iki bölümden oluşur.

**1. Slaytlar**
- Liste: küçük önizleme, başlık, durum.
- İşlemler: ekle, düzenle, sil (onaylı), yukarı/aşağı taşı, yayınla/taslağa al.
- Düzenleme formu: başlık, alt metin, buton metni ve linki, renk düzeni (`tone`), fotoğraf seçici (kütüphaneden küçük resim ızgarası) ve canlı önizleme.
- En fazla 6 slayt (4'ü yayında) olabilir. Sınır aşılırsa kaydetme engellenir ve açıklayıcı bir hata gösterilir.

**2. Kampanya şeridi**
- Aç/kapat, metin ve link alanları, önizleme.

**Doğrulama** `validation.ts` içinde yapılır ve mevcut Türkçe hata mesajı stilini izler:
- Zorunlu alanlar ve uzunluk sınırları.
- Linkler `/` ile başlamalı, `//` ile başlamamalı (harici linke izin verilmez).
- Fotoğraf anahtarı kütüphanede bulunmalı.

## 4.4 Paylaşım görselleri ve favicon

- `src/lib/og.tsx` kartı yeni palete geçer: `#1B262C` zemin, `#BBE1FA` vurgu metni, `#3282B8` ince çizgi/rozet. Fiyat yine "TL" ile yazılır (OG fontunda ₺ yok).
- Favicon ve uygulama ikonu: "KS" monogramı, `#0F4C75` zemin üzerinde beyaz; `src/app/icon.svg` (ve `apple-icon.png`, 180 px) olarak üretilir, eski `favicon.ico` kaldırılır veya yenisiyle değiştirilir.

## 5. Fotoğraf kütüphanesi

- **Sayı ve konular:** 8–12 fotoğraf.
  - Atölye ve bakım: yağ değişimi, lift, alet çantası.
  - Parça yakın çekimleri: fren diski, filtre, buji.
  - Yol ve sürüş görüntüleri.
  - Detaylı temizlik / cila.
- **Kurallar:** Belirgin marka logosu, plaka ve tanınabilir yüz bulunmaz.
- **Kaynak ve lisans:** Yalnızca Unsplash License veya Pexels License.
- **Onay:** İndirmeden önce dosya adı, kaynak URL'si, fotoğrafçı ve yaklaşık boyut listesi kullanıcıya sunulur ve onay alınır.
- **İşleme:** `public/photos/<key>.webp` olarak saklanır. Hero görselleri en fazla 1600 px genişlik ve ≤ 200 KB, kart görselleri en fazla 800 px ve ≤ 90 KB olur. Dönüştürme bir betikle yapılır (`sharp`, Next ile zaten kurulu).
- **Kayıt:** `src/lib/photos.ts` içinde `PHOTOS: Record<PhotoKey, { src, alt, credit, sourceUrl, license, focal? }>` tutulur. Türkçe `alt` metni zorunludur.
- **Kredi:** README'ye "Fotoğraf kaynakları" bölümü eklenir. Her fotoğraf için fotoğrafçı ve bağlantı verilir.
- **Kullanım yerleri:** hero slaytları; 3 ana kategori kartı (OEM, Performans, Bakım); 404 sayfası. Ürünlerde fotoğraf kullanılmaz.

## 6. Renk ve ikonlar

**Yeni tasarım değişkenleri (`globals.css` `@theme`)**
- **Marka paleti (kullanıcının seçtiği):** `#1B262C` (gece), `#0F4C75` (derin mavi), `#3282B8` (orta mavi), `#BBE1FA` (buz mavisi). Ölçülen kontrastlar:

  | Ön plan | Zemin | Oran | Kullanım |
  |---|---|---|---|
  | `#0F4C75` | beyaz | 9.09 | Vurgu metni, bağlantılar, birincil buton zemini (üstünde beyaz metin 9.09) |
  | `#3282B8` | beyaz | 4.18 | **Metin için kullanılmaz.** Yalnızca ikonlar, odak halkası, slider kontrolleri, dekoratif çizgiler, büyük başlık vurguları (≥ 24 px) |
  | `#0F4C75` | `#BBE1FA` | 6.60 | Yumuşak rozet ve seçili çip |
  | `#1B262C` | beyaz | 15.44 | Ana metin (`--color-ink` bu renge geçer) |
  | `#BBE1FA` / beyaz | `#1B262C` | 11.22 / 15.44 | Koyu hero örtüsü, footer, kampanya şeridi |

  Değişkenler: `--color-ink: #1B262C`, `--color-accent: #0F4C75`, `--color-accent-hover: #0B3A5A`, `--color-accent-bright: #3282B8`, `--color-accent-soft: #BBE1FA`, `--color-night: #1B262C`. `--color-primary` vurgu rengine eşitlenir.
- **Ana grup renkleri:**
  - OEM: marka mavisi (`#0F4C75` / `#BBE1FA` ile aynı aile; `--color-cat-oem` / `-soft`).
  - Performans: kırmızı-turuncu (`--color-cat-perf` / `-soft`).
  - Bakım & Temizlik: yeşil (`--color-cat-care` / `-soft`).
- **Kontrast:** Tüm metin/zemin çiftleri AA düzeyinde olmalı. Bunu kontrol eden bir birim testi eklenir; değişken değerleri tek bir TS kaynağından okunur.

**Kullanım**
- **Vurgu rengi:** Birincil butonlar vurgu rengine geçer. Siyah birincil buton gerekiyorsa `variant="dark"` kalır. Bağlantı vurguları, odak halkası, slider kontrolleri, kampanya şeridi ve seçili çipler de vurgu rengini kullanır.
- **Kategori rengi:** Veri modeline alan eklenmez. Renk, kökün slug'ından türetilir; yardımcı `categoryTone(category, categories)` bunu döndürür. Kategori kartları, mega menü, breadcrumb rozetleri ve ürün kartındaki kategori etiketi bu rengi kullanır.
- **İkonlar:** Her alt kategori için bir lucide ikonu (`categoryIcon(slug)`; bilinmeyen slug için varsayılan ikon). İkonlar yumuşak renkli yuvarlak rozetlerde gösterilir. Kullanım yerleri:
  - Kategori kartları ve mega menü.
  - Güven şeridi (TrustStrip).
  - Boş durumlar.
  - Admin gösterge paneli kartları.
  - Garaj ve bakım bölüm başlıkları.
- **Durum renkleri:** Mevcut success/warn/danger renkleri değişmez.

## 6.1 Filtreler, açılır listeler ve etiketler

**Filtre paneli** (`ProductListing` filtre bölümü ve mobil çekmece)
- Grup başlıklarında ikon: Kategori `LayoutGrid`, Marka `Tags`, Fiyat `Banknote`, Stok `PackageCheck`, Uyum `ShieldCheck`.
- Kategori satırlarında `categoryIcon` ikonu, `categoryTone` renginde küçük bir rozet içinde.
- Marka satırlarında harf monogramı (markanın baş harfleri, nötr rozet) ve küçük gri ülke adı. Gerçek logo kullanılmaz (marka hakkı).
- Stok satırları: "Stokta" yeşil tik, "Az stok" turuncu saat.
- Seçili satır `accent-soft` zemin ve `accent` metinle gösterilir; onay kutusu `accent-color: var(--color-accent)` alır.
- Ürün sayıları gri rozet olarak kalır.

**Açılır listeler — kademeli özel select**
- Tüm `<select>` kullanımları ortak bir `Select` bileşenine geçer. Bileşen yerel `<select>` olarak kalır; e2e testleri `selectOption` ile çalışmaya devam eder ve erişilebilirlik tarayıcıda kalır.
- **Her tarayıcıda:** Alanın solunda bağlama uygun bir ikon gösterilir:
  - araç seçici adımları: Marka `CarFront`, Model `Car`, Kasa `Layers`, Yıl `Calendar`, Motor `Cog`;
  - sıralama: `ArrowUpDown`;
  - admin seçimleri: alanın anlamına uygun ikon.
- **Seçim yapılmış alan** vurgu renginde ince bir çerçeve alır.
- **`appearance: base-select` destekleyen tarayıcılarda** (Chrome/Edge 135+, Safari 27; Firefox desteklemez) seçenek listesi markalı görünür:
  - yumuşak gölge, köşe yarıçapı, vurgu renginde seçili satır;
  - seçenek içinde ikon (örn. kategori seçiminde kategori ikonu ve rengi, sıralamada yön ikonu);
  - açılışta 150 ms fade/scale.
  - Tetikleyici `<button><selectedcontent></selectedcontent></button>` ile seçili seçeneği ikonuyla gösterir.
- **Desteklemeyen tarayıcılar** standart listeyi gösterir. Bu kabul edilen davranıştır, polyfill yok.
- **Risk ve doğrulama:** React'in `<select>` içinde `<button>`/`<selectedcontent>` render edip etmediği (hydration uyarısı vermeden) uygulamanın ilk adımında küçük bir denemeyle doğrulanır. Sorun çıkarsa zengin seçenek içeriği bırakılır; yalnızca alan ikonu ve CSS ile markalı liste stili (`::picker(select)`) uygulanır. Bu karar ledger'a yazılır.

**Tek tip etiket sistemi**
- `Tag` bileşeni: `tone` (neutral/accent/success/warn/danger/cat-oem/cat-perf/cat-care) + `icon` + metin. Mevcut `Badge`, `FitmentBadge`, stok durumu, bakım durum rozeti, sipariş durumu ve aktif filtre çipleri bu bileşeni kullanır.
- **Uyum:** Doğrulanmış uyum `ShieldCheck` yeşil; Doğrulanmamış `ShieldQuestion` turuncu; Uyumsuz `ShieldX` kırmızı; Araca bağlı değil `Globe` nötr. Metinler değişmez.
- **Stok:** Stokta `CheckCircle2` yeşil; Az stok `Clock` turuncu; Stokta yok `XCircle` kırmızı.
- **Sipariş durumu:** Alındı `Inbox` mavi, Hazırlanıyor `PackageOpen` turuncu, Kargoda `Truck` vurgu, Teslim edildi `PackageCheck` yeşil, İptal `Ban` kırmızı.
- **Aktif filtre çipleri:** Türüne göre ikon ve renk (kategori çipi kategori rengiyle, marka çipi monogramla, fiyat `Banknote`, stok `PackageCheck`, uyum `ShieldCheck`). Kaldırma butonu "… filtresini kaldır" etiketini korur.
- **Kural:** Renk tek başına anlam taşımaz; her etikette metin ve ikon birlikte vardır.

**Ekstralar**
- **Araç seçici adım göstergesi:** 5 numaralı adım. Tamamlanan adım tikli ve vurgu renklidir, aktif adım vurgu çerçevelidir, sonrakiler gridir. Adımlar arasında ilerleme çizgisi vardır. Satır içi (ana sayfa) ve dikey (garaj) yerleşimlerde uyumlu çalışır; mobilde taşma olmaz. Gösterge `aria-hidden` değildir: "Adım 3 / 5: Kasa" metnini taşır.
- **Teknik özellik ikonları:** Ürün sayfasındaki özellik satırlarının başında etiket adına göre ikon gösterilir (Pozisyon `Crosshair`, Çap `Circle`, Kalınlık `Ruler`, Viskozite `Droplet`, Hacim `Beaker`, Motor `Cog`, Kasa `Car`, Adet `Hash`, Tip `Shapes`). Eşlenmeyen etikette ikon gösterilmez.
- **Boş durum illüstrasyonları:** Boş sepet, boş favoriler, boş garaj ve sonuçsuz arama için büyük, renkli bir ikon kompozisyonu gösterilir: palet renklerinde katmanlı daireler ve ana ikon. Ayrıca kısa, yönlendirici bir metin ve 1–2 eylem butonu vardır. SVG/CSS ile yapılır; fotoğraf kullanılmaz.

## 7. Animasyonlar

- **Değişkenler:** `--ease-out: cubic-bezier(.2,.8,.2,1)`, `--dur-fast: 150ms`, `--dur-base: 220ms`.
- **Uygulama:** Tamamı CSS ile yapılır. Tailwind sınıfları ve `globals.css` içindeki birkaç `@keyframes` kullanılır.
- **Animasyon listesi:**
  - Buton basışında `scale(.98)`.
  - Kart üzerine gelince 2 px yükselme ve gölge.
  - Hydration sonrası beliren içerikte 200 ms fade-in.
  - Sepet ve favori sayacında değişimde küçük "bump" (bounce).
  - Dialog ve drawer'da fade + kayma.
  - Toast'larda alttan kayarak giriş.
  - Slider'da crossfade.
  - Mega menü ve popover'da fade/scale.
  - Bakım panelinin açılışında yumuşak açılım (yalnızca destekleyen tarayıcılarda: `interpolate-size` / `::details-content`, desteklemeyende anında açılır).
- **Hareketi azalt:** `@media (prefers-reduced-motion: reduce)` altında tüm `transition`/`animation` süreleri ~0'a indirilir ve slider otomatik geçişi kapanır.
- **Performans kuralı:** Yalnızca `transform` ve `opacity` animasyonu yapılır. Layout tetikleyen özellikler (genişlik, yükseklik, top) animasyonlanmaz; detay açılımındaki yükseklik geçişi bunun tek istisnasıdır.

## 8. Yüklenme durumları (iskelet + spinner)

- **`Spinner` bileşeni** (`components/ui/Spinner.tsx`):
  - Boyutlar: `sm` / `md` / `lg`. Renk vurgu rengidir ve `currentColor` desteklenir.
  - `role="status"` ve `sr-only` etiketi taşır ("Yükleniyor…").
  - Hareketi azalt tercihinde dönme yerine yavaş nabız animasyonu oynar.
- **`ProductGridSkeleton` ve liste iskeletleri** (`LoadingState` satır blokları) kalır, palete uygun bir shimmer efektiyle tazelenir: `accent-soft` tonlu, soldan sağa kayan açık bant (1.2 s, hareketi azaltta durağan). Ürün ızgaraları, admin tabloları ve sepet/favori listeleri iskelet kullanır.
- **Spinner kullanılan yerler:** butonlar, rota geçişleri (`loading.tsx`), küçük alanlar (öneri kartı, bakım paneli, hero slider hydration öncesi değil — o sunucuda render edilir), arama öneri kutusu.
- **`loading.tsx`:** Rota segmentlerinde ortalanmış spinner ve sayfa yüksekliği kadar yer ayrılır.
- **Butonlar:** `Button`'a `loading` prop'u eklenir. Bu prop spinner gösterir, butonu `disabled` ve `aria-busy` yapar ve metni korur.
- **Butonda spinner nerede kullanılır:**
  - Yalnızca gerçek bir bekleme olan yerlerde: rota geçişi süren gönderimler (ödeme → sipariş onayı, admin kaydet → listeye dönüş) ve `next/link` bekleyen gezinmeler. Gezinme beklemesi Next 16 `useLinkStatus` mevcutsa onunla izlenir; yoksa `useTransition` kullanılır.
  - Senkron işlemlere (sepete ekle vb.) **yapay gecikme eklenmez**. Bunlar bunun yerine mikro animasyonla geri bildirim verir.

## 9. Hata ekranları

**404 (`not-found.tsx`)**
- Fotoğraf veya illüstrasyon ve kısa, samimi bir metin.
- Arama kutusu.
- 3 ana kategori kısayolu (renkli rozetlerle).
- Seçili araç varsa "BMW F30 320d için parçalar" bağlantısı (hydration sonrası).
- Ana sayfa ve yardım bağlantıları.
- Bilinmeyen `/arac` ve `/oem` sayfaları da aynı tasarımı kullanır ve `noindex` kuralı korunur.

**Genel hata (`error.tsx`) ve `global-error.tsx`**
- Mevcut "tekrar dene + demo kataloğunu geri yükle" mantığı korunur.
- Yeni görünümde ikon rozeti, açıklama ve ana sayfa bağlantısı yer alır.
- Geliştirme ortamında hata `digest`'i küçük gri yazıyla gösterilir.
- `global-error.tsx` kök layout çöktüğünde kendi `<html>`/`<body>` yapısıyla aynı ekranı gösterir.
- Next 16 imzası bu repoda `retry` kullanır; mevcut `error.tsx`'teki gibi korunur.

**Bölüm içi hata kartları**
- `SectionBoundary` adlı bir istemci hata sınırı bileşeni eklenir. Bir bölüm çökerse sayfa yerine yalnızca o bölüm şunu gösterir: "Bu bölüm yüklenemedi" + "Tekrar dene".
- Sarılacak bölümler:
  - Ana sayfa: öne çıkanlar, kategori vitrini, bakım şeridi, hero slider.
  - Ürün sayfası: birlikte değiştirilenler, benzer ürünler.
  - Garaj: araç başına bakım paneli.
  - Sepet: bakım setleri.
- Hata `console.error` ile loglanır.

**Admin hata ekranları**
- `src/app/admin/(panel)/not-found.tsx` ve `error.tsx` panel düzeni (kenar menü) içinde gösterilir.
- Mesaj "Bu kayıt bulunamadı veya silinmiş" olur ve ilgili listeye dönüş bağlantısı verilir.
- Bilinmeyen ürün ID'siyle düzenleme sayfası da bu ekrana düşer.

## 10. Test ve kalite

**Birim testleri (Vitest)**
- Slayt ve kampanya şeridi doğrulaması: uzunluk sınırları, harici link reddi, bilinmeyen fotoğraf anahtarı reddi, yayındaki slayt sınırı.
- `migrateCatalog` eksik `heroSlides` ve `announcement` alanlarını ekler; bozuk slayt dizisi seed'e döner.
- Fotoğraf kütüphanesi: her dosya `public/photos` altında var, kredi/lisans/alt alanları dolu ve dosyalar boyut sınırının altında.
- `categoryTone` / `categoryIcon` her seed kategori için bir sonuç döndürür.
- `specIcon(label)` bilinen etiketler için ikon, bilinmeyenler için `null` döndürür; `brandMonogram(name)` doğru baş harfleri üretir ("Febi Bilstein" → "FB", "NGK" → "NGK" ilk 3, "K&N" → "KN").
- Sipariş, stok, uyum ve bakım durumlarının her biri için etiket eşlemesi tanımlıdır (eksik durum yok).
- Renk kontrastı: tüm metin/zemin çiftleri ≥ 4.5:1 (büyük metin ≥ 3:1).

**E2E (Playwright)**
- Admin bir slayt başlığını değiştirir ve yayınlar → ana sayfada görünür. Durdur butonu otomatik geçişi durdurur. Kampanya şeridi kapatılınca kaybolur.
- 404 sayfasında arama ve kategori kısayolları görünür; admin'de bilinmeyen ürün düzenleme sayfası admin 404'üne düşer.
- `prefers-reduced-motion: reduce` emülasyonunda slider otomatik geçmez.
- Mevcut 9 test geçmeye devam eder. Mobil taşma kontrolü yeni sayfalara da uygulanır.

**Lighthouse:** Ana sayfa ve ürün sayfası yeniden ölçülür, README'deki değerler güncellenir. Hedefler: performans ≥ 90, erişilebilirlik 100, en iyi uygulamalar 100, SEO 100.

**Dokümantasyon:** README'ye yeni ekran görüntüleri ve "Fotoğraf kaynakları" bölümü eklenir; "Product decisions" tablosuna vitrin ve kampanya satırı eklenir.

## 11. Builder'a bırakılanlar

- Performans ve Bakım grup renklerinin kesin değerleri (kontrast testini geçmek şartıyla) ve ikon eşlemesinin ayrıntıları.
- Slider'ın tam görsel düzeni ve bileşen bölümlemesi (`components/store/HeroSlider.tsx`, `AnnouncementBar.tsx`, `components/admin/HomeAdmin.tsx` önerilir).
- Fotoğrafların seçimi (onaylanacak listeyle) ve kırpma odakları.
