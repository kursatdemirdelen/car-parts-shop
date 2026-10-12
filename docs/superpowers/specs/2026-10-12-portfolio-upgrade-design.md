# Kursat Shop — Portfolyo Yükseltmesi Tasarım Dokümanı

Tarih: 2026-10-12
Önceki tasarım: [`2026-10-12-kursat-shop-design.md`](2026-10-12-kursat-shop-design.md) (geçerliliğini korur; bu doküman onun üzerine eklenir).

## 1. Amaç ve neden

Proje sahibi bu prototipi **gerçek bir mağazaya değil, portfolyo / referans projeye** dönüştürmek istiyor. Elinde tedarikçi, şirket veya sektör ekibi yok.

Başarı ölçütü: projeye bakan biri (işveren, potansiyel müşteri, teknik değerlendirici) **2 dakika içinde** şunları görmeli:
1. Canlı ve çalışan bir ürün (link).
2. Ürün düşüncesi: sektör problemi, neden bu çözüm, verilen kararlar.
3. Kod kalitesi: test, CI, temiz mimari, erişilebilirlik ve performans kanıtı.
4. En az bir "akılda kalan" özellik.

Kapsam: **Paket 1 (görünürlük ve güven)** ve **Paket 2 (fark yaratan özellikler)**. Paket 3 (gerçek backend) bu dokümanın kapsamı dışında, sonraki adım.

## 2. Hedefler, kapsam dışı ve başarısızlık sayılacaklar

**Hedefler**
- Herkese açık canlı demo adresi.
- README bir vaka çalışmasına dönüşür.
- Her push'ta otomatik kalite kontrolü (CI) ve uçtan uca testler.
- Şasi numarası çözümleyici, araç ve OEM SEO sayfaları, bakım setleri ile birlikte önerilen parçalar.

**Kapsam dışı:** Gerçek ödeme, e-fatura ve kargo entegrasyonu; veritabanı ve sunucu tarafı kimlik doğrulama (Paket 3); TecDoc gibi ücretli veri; çoklu dil.

**Başarısızlık sayılacaklar**
- Demo olduğu halde gerçek bir ticari vaat gibi okunan herhangi bir metin.
- Şasi çözümleyicinin, gerçekte çözemediği bilgiyi (örneğin kesin model veya motor) çözmüş gibi göstermesi.
- Yapay indirim, sahte "çok satan" veya yorum gibi uydurma sosyal kanıtlar.
- CI'ın "yeşil" görünüp aslında önemli akışları test etmemesi.

## 3. Proje sahibinin verdiği kararlar
- Yön: portfolyo / demo (gerçek satış yok).
- Paket 1 ve Paket 2 yapılacak.
- GitHub deposu herkese açık (yapıldı; commit e-postaları GitHub'ın gizli noreply adresine çevrildi).
- README: **İngilizce ana metin + başta kısa Türkçe özet.** Uygulama arayüzü Türkçe kalır.
- Klasör yapısı **yeniden düzenlenmez** (mevcut `lib / state / components`).
- **Bakım setleri admin panelinden de yönetilir** (oluştur / düzenle / sil).
- Şasi çözümleyici: araç seçicide **ve** ayrı bir açıklama sayfası `/sasi-sorgula`. Harici şasi verisi yoktur; yalnızca standart (ISO 3779) kısımlar çözülür.
- Vercel: proje sahibinin hesabı var; projeyi bağlamayı uygulayıcı yapar (gerekirse sahibinden onay alır).
- Yürütme: native (tek oturum + sonda bağımsız inceleme).

## 4. Paket 1 — Görünürlük ve güven

### 4.1 Canlı demo
- Vercel'e deploy, `master` dalından otomatik yayın.
- `NEXT_PUBLIC_SITE_URL` ortam değişkeni ile `metadataBase`, sitemap ve paylaşım görselleri doğru adresi kullanır.
- Ana sayfada ve footer'da küçük bir "Bu bir demo projedir · GitHub" bağlantısı.

### 4.2 README → vaka çalışması
Yapı:
1. Tek cümlelik özet, canlı demo linki, CI ve test rozetleri, 3–4 ekran görüntüsü veya kısa GIF.
2. **Problem:** Türkiye pazarında teknik parçaların online payının düşük olması ve "yanlış parça" korkusu (önceki analiz, kaynaklarıyla).
3. **Çözüm ve ürün kararları:** doğrulanmış / doğrulanmamış uyumluluk, OEM odaklı arama, şasi çözümleyici, bakım setleri.
4. **Mimari:** veri akışı şeması (seed → store → vitrin ve admin), iş kurallarının UI'dan ayrılması, Next 16 kullanımı.
5. **Kalite:** test sayısı, CI, Lighthouse ve erişilebilirlik puanları.
6. **Üretime geçseydim:** önceki README'deki liste (backend, ödeme, KVKK …) ve iş modeli seçenekleri (niş mağaza / B2B / SaaS) kısaca.
7. Kurulum ve komutlar (mevcut içerik).

### 4.3 CI ve uçtan uca testler
- GitHub Actions: `lint`, `typecheck`, `test`, `build`, ardından Playwright e2e (production build üzerinde).
- E2E senaryoları (en az):
  1. OEM numarasıyla arama (boşluklu yazım) → ürün sayfası.
  2. Araç seçimi → "Sadece aracıma uygun" listesi → doğrulanmış rozet.
  3. Sepete ekle → adet değiştir → demo ödeme (doğrulama hatası + başarı) → onay sayfası.
  4. Admin girişi → ürün oluştur → mağazada görünür → sil.
  5. Şasi numarası çözümleyici akışı (Paket 2).
- Her senaryo ayrıca 375 px genişlikte yatay taşma kontrolü yapar.

### 4.4 Kalan küçük düzeltmeler
Önceki final incelemesinden ertelenen 10 madde kapatılır: kart stok etiketinin eşiği, metin + OEM birleşik arama, ödeme sonrası boş sepet flaşı, adet kutusunun temizlenebilmesi, sepet rozetinin yalnızca satın alınabilir ürünleri sayması, arama combobox erişilebilirliği, başka sekmede depolama temizlenmesi, depolama yazma hatasında uyarı, sepetteki yinelenen satırların birleştirilmesi, admin ürün listesi metni.

### 4.5 Kalite kanıtları
- Lighthouse (mobil) ana sayfa ve ürün sayfası: Performans ≥ 90, Erişilebilirlik ≥ 95, En iyi uygulamalar ≥ 95, SEO 100. Puanlar README'de.
- Güven şeridindeki ticari vaat gibi okunabilecek metinler ("Hızlı kargo" vb.) demo bağlamına uygun hale getirilir.

## 5. Paket 2 — Fark yaratan özellikler

### 5.1 Şasi numarası (VIN) çözümleyici
- **Girdi:** 17 karakter; boşluk ve küçük harf tolere edilir; `I`, `O`, `Q` geçersizdir (standart).
- **Çözülen (standart ve güvenilir):**
  - 1–3. karakter (WMI) → üretici. Demo kapsamındaki WMI'lar: BMW, Mercedes-Benz, Porsche, Audi (ör. `WBA`, `WBS`, `WDD`, `W1K`, `WP0`, `WP1`, `WAU`, `WUA`). Tam liste uygulayıcıda.
  - 10. karakter → model yılı. Kod 30 yılda bir tekrarlar; demo araçların üretim aralıklarıyla örtüşen yıl(lar) seçilir. Belirsizse iki aday da gösterilir.
- **Çözülmeyen (dürüstçe söylenir):** model, kasa ve motor. Ekranda "Şasi numarasının bu kısmı üreticiye özeldir; kesin eşleştirme için kasa ve motoru seçin" notu.
- **Sonuç:** Üretici ve yıla göre filtrelenmiş demo araç listesi; kullanıcı birini seçer → garaja kaydedilir.
- **Nerede:** Araç seçicide "Adım adım" / "Şasi numarası ile" geçişi (ana sayfa, garaj, ürün sayfasındaki araç seçme dialogu).
- **Açıklama sayfası `/sasi-sorgula`:** Girilen (veya örnek) şasi numarasını karakter gruplarına bölerek görselleştirir: WMI (üretici), VDS (4–9, araç tanımı — üreticiye özel), model yılı (10), fabrika (11), seri (12–17). Hangi kısmın çözüldüğü, hangisinin çözülemediği ve neden (ücretli üretici verisi gerekir) açıkça yazılır. Sonuçtan araç seçiciye geçilebilir. Footer ve yardım sayfasından bağlantı.
- Çözümleme mantığı `src/lib` içinde saf fonksiyon ve birim testli.

### 5.2 SEO sayfaları
- **Araç sayfası** `/arac/[slug]` (ör. `/arac/bmw-e46-320d`): araç bilgisi, kategoriye göre gruplanmış **doğrulanmış uyumlu** parçalar, "doğrulanmamış kayıtlar" ayrı ve açıkça etiketli, uygun bakım setleri, "Bu aracı seç" butonu. Tüm seed araçları için `generateStaticParams`.
- **OEM sayfası** `/oem/[numara]`: bu OEM numarasına karşılık gelen tüm ürünler (çapraz referans), açıklama "OEM numarası nedir". Tüm seed OEM numaraları için ön render. Normalize edilmiş numara kanonik URL'dir (boşluk ve noktalar kaldırılmış).
- Ürün sayfasında `Product` + `Offer` (TRY, stok durumu) ve tüm listeleme sayfalarında `BreadcrumbList` yapılandırılmış verisi (JSON-LD). Yorum veya puan verisi **eklenmez**.
- `sitemap.xml` (statik sayfalar, kategoriler, ürünler, araçlar, OEM sayfaları) ve `robots.txt` (admin hariç).
- Ürün ve araç sayfaları için dinamik paylaşım görseli (Open Graph), marka diline uygun sade tasarım.
- Ürün sayfasındaki uyumlu araç satırları ve OEM numaraları bu yeni sayfalara bağlanır (iç linkleme).

### 5.3 Bakım setleri ve birlikte önerilen parçalar
- **Bakım seti:** belirli araç(lar) için bir ürün listesi (ör. "E46 320d periyodik bakım seti": yağ filtresi, hava filtresi, polen filtresi, motor yağı ×2). Set fiyatı = parçaların toplamı (**sahte indirim yok**). "Seti sepete ekle" tek tıkla tüm satırları ekler; stokta olmayan parça varsa hangisinin eklenmediği söylenir.
- Gösterim: araç sayfası ve (seçili araç varsa) sepet sayfası.
- **Birlikte önerilenler:** Ürün sayfasında "Bununla birlikte genellikle değiştirilenler" (ör. disk ↔ balata ↔ aşınma sensörü). Yalnızca seçili araçla **doğrulanmış uyumlu** veya araca bağlı olmayan ürünler önerilir; araç seçili değilse öneri, uyumluluk etiketiyle birlikte gösterilir.
- Veri: seed'de 4–6 bakım seti ve ürünler arası "birlikte önerilen" ilişkileri. Admin ürün formunda "Birlikte önerilen ürünler" alanı düzenlenebilir.
- **Admin › Bakım setleri** (`/admin/kits`): liste, oluştur / düzenle / sil (onaylı). Alanlar: ad, slug, açıklama, uygun araçlar (çoklu), satırlar (ürün + adet), yayın durumu. Doğrulama: ad ve slug zorunlu, en az bir satır, adet ≥ 1, aynı ürün iki kez yok. Ürün silinince setlerdeki satırları da temizlenir; araç silinince setin araç listesinden çıkar.

## 6. Kısıtlar
- Önceki tasarımdaki tüm kısıtlar geçerli (Türkçe arayüz, nötr palet, uyumluluk dürüstlüğü, demo uyarıları).
- Yeni runtime bağımlılığı eklenmez. Geliştirme bağımlılığı olarak `@playwright/test` eklenebilir.
- Yeni veri alanları eski kayıtlı tarayıcı verisini bozmamalı: eksik yeni alanlar güvenli varsayılanla okunur (doğrulayıcı güncellenir, test eklenir).

## 7. Benim kararlarım (itiraz edilebilir)
- **Klasör yapısını yeniden düzenlemiyorum.** Mevcut `lib / state / components` ayrımı tutarlı. Özellik bazlı klasörlere taşımak büyük bir karışıklık yaratır ve portfolyoda net bir kazanç sağlamaz. Yeni özellikler mevcut düzene uyar.
- Şasi çözümleyici yalnızca üretici ve model yılını çözer; BMW'ye özgü model kodu tablosu eklenmez (doğrulanamayan veri olur).
- Ekran görüntüleri ve GIF, production build üzerinde Playwright ile otomatik üretilir ve `docs/media/` altında tutulur.

## 8. Uygulayıcıya bırakılanlar
- WMI tablosunun tam içeriği (yalnızca dört markanın yaygın kodları).
- Seed'deki bakım setlerinin ve "birlikte önerilen" ilişkilerinin seçimi (uyumluluk kayıtlarıyla tutarlı olmalı).
- Paylaşım görsellerinin görsel detayı.
- Lighthouse hedeflerine ulaşmak için gereken optimizasyonlar.
