# Kursat Shop — Tasarım Dokümanı

Tarih: 2026-10-12
Temel gereksinimler: [`docs/brief.md`](../../brief.md). Bu doküman briefi tekrar etmez. Brief'e ek olarak verilen kararları, netleştirmeleri ve önceliklendirmeyi kaydeder. Çelişki olursa bu doküman geçerlidir.

## 1. Amaç ve neden

Kursat Shop, Türkiye pazarı için **örnek bir şablon proje**. Gerçek bir mağaza değil. Uçtan uca çalışan bir yedek parça e-ticaret vitrini ve yönetim paneli olacak. Hedefi, gösterilebilir olması ve ileride gerçek bir mağazaya dönüştürülebilecek temiz bir başlangıç noktası sunması.

Projenin varlık nedeni, Türkiye'deki alışılmış yedek parça sitelerinin sorunlarından ayrışmak. Proje sahibinin şikâyetleri:

1. **Tasarımlar eski.**
2. **Parça aramak zor.**
3. **Kategoriler iç içe ve anlamsız.**
4. **Görseller ve alışveriş akışı kötü.**
5. **Ürün sayfaları iyi değil.**

Her tasarım kararı bu beş maddeden en az birini çözmeli.

**Ton:** Profesyonel, samimi ve kullanışlı. Teknik bilgi güven verecek ama soğuk durmayacak. Metinler sade ve doğal bir Türkçeyle yazılacak. Kurumsal klişe ve abartılı pazarlama dili kullanılmayacak.

## 2. Hedefler, kapsam dışı ve başarısızlık sayılacaklar

**Hedefler**
- Bir kullanıcı ürünü 2 yoldan biriyle, en fazla birkaç tıklamada bulabilmeli: (a) OEM numarası, stok kodu ya da ürün adıyla arama, (b) aracını seçip kategoriye inme.
- Ürün sayfası teknik açıdan şeffaf olmalı: teknik özellikler, OEM numaraları ve uyumlu araçlar sekmelere gizlenmeden görünmeli.
- Briefteki tüm route'lar ve 30 kabul kriteri karşılanmalı.

**Kapsam dışı:** Brief §11'deki maddelerin hepsi.

**Başarısızlık sayılacaklar (teknik olarak çalışsa bile):**
- Görünüm sıradan bir yedek parça sitesine ya da hazır bir SaaS şablonuna benziyorsa.
- Kategori menüsü 2 seviyeden derine iniyorsa.
- Uyumluluk kaydı olmayan bir ürün herhangi bir yerde "uyumlu" görünüyorsa.
- Ölü buton, sahte filtre ya da hiçbir yere gitmeyen link varsa.
- Ürün görselleri tutarsızsa (farklı oranlar, farklı stiller, rastgele stok fotoğrafları).

## 3. Proje sahibinin verdiği kararlar

### 3.1 Katalog içeriği
- **Araç markaları:** Ağırlık BMW'de. Yanında Mercedes-Benz, Porsche ve Audi var (proje sahibi belirledi). Modeller için bkz. §4.
- **Üç ana ürün grubu** (kategori ağacının üst seviyesi):
  1. **OEM Parçalar:** fren, filtre, süspansiyon, ateşleme, soğutma, motor parçaları vb.
  2. **Performans:** egzoz, hava emiş, yay ve amortisör, fren yükseltme vb.
  3. **Bakım & Temizlik:** motor yağı ve sıvılar, dış temizlik, cila ve koruma, iç temizlik vb.
- Bakım & Temizlik ürünleri genelde araçtan bağımsız. Bu ürünlerde uyumluluk alanı "Araca bağlı değil" olarak gösterilir. Bu durum "doğrulanmamış" ile karışmamalı.

### 3.2 Ana sayfa (taslak A+B birleşimi onaylandı)
Yukarıdan aşağı sıra:
1. Header.
2. Hero: kısa bir başlık (örn. "Aracına uygun parçayı bul") ve tek satırlık açıklama.
3. **Büyük arama kutusu.** Sayfanın en baskın öğesi. Placeholder'da OEM numarası örneği yer alır. Yazarken otomatik öneri çıkar.
4. **Hemen altında tek satır araç seçici:** Marka › Model › Kasa/Nesil › Yıl › Motor ve "Parçaları göster" butonu. Mobilde alt alta dizilir.
5. Garajda kayıtlı araçlar varsa çip olarak gösterilir. Tek tıkla seçilir.
6. 3 ana grup kartı. Her kartta alt kategorilerin isimleri link olarak görünür.
7. Öne çıkan ürünler.
8. Güven/bilgi şeridi (kargo, iade, destek).
9. Footer.

### 3.3 Ürün sayfası (taslak B, tek sayfa, onaylandı)
- Sekme yok. Tüm bölümler alt alta sıralanır.
- Üst blok: sol tarafta galeri (ana görsel ve küçük görseller), sağ tarafta marka, ürün adı, stok kodu, fiyat (varsa liste fiyatı üstü çizili), stok durumu, **uyumluluk satırı**, adet seçici, sepete ekle ve favori.
- Uyumluluk satırı seçili araca göre şu durumlardan birini gösterir:
  - ✓ **Doğrulanmış uyum:** açık bir kayıt varsa.
  - ? **Doğrulanmamış:** kayıt yoksa ya da kayıt "unverified" ise.
  - ✕ **Uyumsuz:** sadece açık bir "incompatible" kaydı varsa.
  - **Araca bağlı değil:** genel ürünlerde.
  - Araç seçilmemişse "Uyumluluğu görmek için aracını seç" daveti çıkar ve seçiciyi açar.
- Alt bölümler sırasıyla: Teknik özellikler (tablo), OEM numaraları, Uyumlu araçlar (kayıtlı olanlar ve durumları), Açıklama, İlgili ürünler.

### 3.4 Kategori yapısı
- **En fazla 2 seviye:** ana grup › alt kategori. Daha derin seviye yok.
- `/categories/[slug]` hem ana grup hem alt kategori için çalışır. Ana grup sayfası kendi alt kategorilerinin ürünlerini birlikte listeler ve alt kategorileri filtre/çip olarak sunar.

### 3.5 Görseller
- Proje sahibinin elinde görsel yok. Görsellerin hazırlanması bana bırakıldı.

## 4. Benim kararlarım (proje sahibi itiraz edebilir)

- **Görsel yaklaşımı:** Her alt kategori için yerel bir **SVG çizim** hazırlanacak (`public/products/...`). Tek çizgi kalınlığında, antrasit çizgilerle, açık gri zemin üzerinde. Fren diski, balata, filtre, buji, amortisör, egzoz, yağ şişesi, sprey şişe gibi nesneler çizilecek. Her ürünün `images` alanı bu yollara işaret eder. Gerçek fotoğrafa geçmek için sadece yolları değiştirmek yeterli. Kartlarda oran 1:1, `object-contain`. Görsel yoksa ya da yüklenemezse nötr bir yedek görsel gösterilir. Ürün sayfasında bir ürünün 2-3 görseli olabilir (farklı açı/varyasyon çizimleri ya da ambalaj).
- **Görsellerin demo olduğu belli edilir:** Ürün sayfasında görselin altında küçük, gri bir "Temsili görsel" notu yer alır.
- **Renk:** Brief'teki nötr palet kullanılacak. Ayrı bir vurgu rengi yok. Birincil butonlar antrasit. Yeşil sadece stok/uyum durumu için, kırmızı sadece hata/uyumsuz durumu için. Sıcaklık hissi renkten değil; tipografi, boşluk, yuvarlatılmış köşeler (8-10px) ve metin tonundan gelir.
- **Tipografi:** Inter (`next/font`). Fiyat ve teknik kodlarda (stok kodu, OEM) tabular rakamlar kullanılacak.
- **Header:** Masaüstünde logo, "Kategoriler" açılır menüsü (2 seviye, mega menü değil, sade bir panel), arama, Garajım (seçili aracı gösterir), Favoriler, Hesap ve Sepet (adet rozetiyle) yer alır. Mobilde üstte logo ve ikonlar, altında tam genişlikte arama, onun altında da seçili araç çubuğu olur. Kategoriler menüsü mobilde çekmeceye dönüşür.
- **Hesap girişi:** Müşteri hesabı kapsam dışı. Hesap ikonu küçük bir menü açar: Garajım, Favoriler, Yardım ve Yönetim paneli (demo). Ölü link olmaz. Briefte olmayan yeni bir route eklenmez.
- **Araç filtresinin katalogda davranışı:** Bir araç seçiliyken liste sayfalarında üstte "BMW G20 320i için gösteriliyor" çubuğu ve "Sadece uyumlu ürünler" anahtarı (varsayılan kapalı) bulunur. Anahtar açıkken sadece ✓ doğrulanmış ve "araca bağlı değil" ürünler listelenir. Kapalıyken tüm ürünler görünür, her kartta küçük bir uyum etiketi olur.
- **Araç veri seti:** BMW kasaları **proje sahibi tarafından belirlendi:**
  - 3 Serisi: **E30** (1982–1994), **E36** (1990–2000), **E46** (1998–2006), **E90** sedan (2005–2012), **E92** coupé (2006–2013), **G20** (2019–)
  - 5 Serisi: **E39** (1995–2004), **E60** (2003–2010), **F10** (2010–2017), **G30** (2017–)
  - 1 Serisi: **F20** (2011–2019)

  Her kasa için 2-3 yaygın motor varyantı girilecek (örn. E46 318i / 320d / 330i, E39 520i / 530d / M5). Diğer markalar **BMW, Mercedes-Benz, Porsche, Audi** olarak belirlendi (proje sahibi). Modelleri seçmek bana bırakıldı *(benim kararım)*:
  - Mercedes-Benz: C-Serisi **W204** (2007–2014), **W205** (2014–2021); E-Serisi **W211** (2002–2009), **W212** (2009–2016)
  - Porsche: 911 **997** (2004–2012), **991** (2011–2019); Boxster/Cayman **987** (2005–2012); Cayenne **958** (2010–2017)
  - Audi: A4 **B7** (2004–2008), **B8** (2007–2015), **B9** (2015–); A3 **8V** (2012–2020)

  BMW dışındaki kasalarda 1-2 motor varyantı girilecek. Toplam yaklaşık 40-45 araç kaydı olacak. Volkswagen yok. Yıl seçimi kaydın üretim aralığından türetilir. Klasik kasalar (E30, E36, E39) için bakım ve OEM parça ağırlıklı, modern kasalar için performans ürünlerinin de olduğu bir uyumluluk dağılımı yapılacak.
- **Ürün veri seti:** Yaklaşık 40-50 ürün. Parça markaları gerçek yedek parça markaları olacak: Bosch, Brembo, Mann-Filter, Mahle, NGK, Bilstein, Lemförder, Febi, Castrol, Liqui Moly, Meguiar's ve performans tarafında birkaç marka. OEM numaraları gerçek formatta (BMW 11 haneli vb.) olacak ama veri **demo** kabul edilir. README ve footer'da "Ürün, fiyat ve uyumluluk verileri demo amaçlıdır" notu bulunur. Stok durumları karışık olacak: stokta, az stok (≤5), tükendi. Birkaç ürün yayında değil.
- **Uyumluluk verisi:** Doğrulanmış, doğrulanmamış ve birkaç açık "uyumsuz" kaydın karışımı. Kayıt olmayan çok sayıda ürün-araç çifti de bulunur (bilinmiyor durumu).
- **Kalıcılık:** Tek bir `storage` adaptörü (versiyonlu anahtar, örn. `ks:v1:*`, JSON parse hatasında seed'e geri döner). Katalog verisi (ürün, kategori, marka, araç, uyumluluk, sipariş, ayarlar) seed'den başlar. Admin değişiklikleri localStorage'a yazılır. Vitrin de aynı kaynaktan okur. Admin panelinde "Demo verilerini sıfırla" butonu bulunur. Sepet, favoriler ve garaj ayrı anahtarlarda tutulur.
- **SSR/hydration:** Katalog verisi istemci tarafında değişebildiği için vitrin sayfaları seed ile sunucuda render edilir. Ardından istemcide bir `CatalogProvider` localStorage'daki veriyle hydrate olur (mount sonrası). Hydration uyumsuzluğu yaşanmaması için tarayıcıya özgü değerler mount'tan önce okunmaz. Admin'de oluşturulan yeni ürünlerin `/products/[slug]` sayfası istemci tarafında çözülür. Seed'de olmayan slug için sunucu `notFound()` yerine istemci tarafı yükleme durumu gösterir, sonra ürün bulunamazsa not-found içeriğine düşer.
- **Kargo:** Sabit demo kural. 2.500 ₺ ve üzeri siparişlerde ücretsiz, altında 149,90 ₺. Eşik ve ücret admin ayarlarından değiştirilebilir. KDV dahil fiyatlar gösterilir.
- **Checkout:** Tek sayfa, 3 bölüm (İletişim, Teslimat adresi, Sipariş özeti). Ödeme bölümünde sadece "Kapıda ödeme (demo)" ya da "Havale/EFT (demo)" seçenekleri var. Kart alanı yok. Sipariş oluşturulunca stok düşer, sipariş `KS-YYMMDD-XXXX` formatında bir numarayla kaydedilir, `/order-success?ref=...` sayfasına gidilir.
- **Admin giriş:** Demo kimlik bilgileri giriş ekranında açıkça yazar. Bir localStorage bayrağı tutulur. Ekranda "Bu güvenli bir kimlik doğrulama değildir" uyarısı bulunur.
- **Bildirimler:** Hafif, kendi yazdığımız bir toast bileşeni. Ek kütüphane kullanılmaz.
- **Versiyonlar:** Kurulum günündeki güncel kararlı Next.js, React, Tailwind ve TypeScript sürümleri. Paket yöneticisi npm. Node 23 mevcut.

## 5. Kısıtlar
- Brief §2 (stack) ve §8 (state) aynen geçerli. Redux, UI kütüphanesi, backend ve veritabanı yok.
- Tüm metinler Türkçe. Para birimi `Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' })` ile tek bir yardımcıdan biçimlenir.
- Mobil, tablet ve masaüstünde yatay taşma olmamalı.
- Teslimden önce `lint`, `tsc --noEmit` ve `build` temiz geçmeli.

## 6. Uygulayıcıya bırakılanlar
- Klasör yapısı ve bileşen sınırları (brief §9 ve §8'deki ayrıma uyarak).
- Kategori, alt kategori ve ürün isimlerinin tam listesi (§4'teki çerçeve içinde).
- SVG çizimlerin detayları (§4'teki stil kurallarına uyarak).
- Admin tablolarının ve formlarının tam yerleşimi (briefteki alanların hepsi yer almalı).
- Yardım, kargo-iade ve yasal sayfaların metinleri. Kısa, gerçekçi ve "demo" olduğu belli metinler olmalı.
- Boş durumlar ve yükleme durumlarının görsel detayı.

## 7. Onaylanan taslaklar
Görsel taslaklar `.superpowers/brainstorm/` altında saklanıyor (`home-direction.html`, `home-merged-and-pdp.html`).
