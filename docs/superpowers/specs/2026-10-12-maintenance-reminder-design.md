# Kursat Shop — Bakım Hatırlatıcısı Tasarım Dokümanı

Tarih: 2026-10-12
Önceki tasarımlar: [`2026-10-12-kursat-shop-design.md`](2026-10-12-kursat-shop-design.md), [`2026-10-12-portfolio-upgrade-design.md`](2026-10-12-portfolio-upgrade-design.md). İkisi de geçerliliğini korur.

## 1. Amaç ve neden

Garajına araç kaydeden kullanıcı şu soruya cevap bulamıyor: "Sıradaki bakımım ne zaman ve ne almalıyım?"

Bakım hatırlatıcısı bu soruyu cevaplar ve cevaptan sepete giden yolu tek tıka indirir. Portfolyo açısından mevcut parçaları (garaj, doğrulanmış uyumluluk, bakım setleri) bir araya getiren, akılda kalan bir özellik olur.

Başarı ölçütü: Garaj sayfasında aracının güncel km'sini ve bir kalemin son değişimini giren kullanıcı, o kalemin durumunu (gecikti / yaklaşıyor / zamanı var) ve aracına **doğrulanmış uyumlu** parçaları aynı kartta görür. Parçayı tek tıkla sepete ekleyebilir.

## 2. Hedefler, kapsam dışı ve başarısızlık sayılacaklar

**Hedefler**
- Garajdaki her araç için km ve tarih tabanlı bakım takvimi.
- Kalem başına durum ve uygun parça veya set önerisi.
- Kısa bakım geçmişi.
- Üç yerde görünürlük: garaj sayfası, ana sayfa şeridi, header rozeti.

**Kapsam dışı**
- E-posta, SMS, tarayıcı bildirimi ve takvim (.ics) dosyası.
- Araca özel veya admin'den yönetilen bakım aralıkları.
- Kullanıcının aralıkları değiştirmesi.
- Yıllık km'ye göre km tahmini.
- Sunucu tarafı saklama.

**Başarısızlık sayılacaklar**
- Örnek aralıkların üretici kuralı gibi sunulması. Ekranda her zaman "örnek aralık, kılavuzu kontrol et" notu yer alır.
- Uyumu doğrulanmamış veya bilinmeyen bir parçanın "aracına uygun" diye önerilmesi.
- Bilgisi girilmemiş bir kalemin "zamanı var" (yeşil) gösterilmesi. Bilinmeyen her zaman "Bilinmiyor" olarak gösterilir.
- Hydration uyumsuzluğu veya sunucuda localStorage okunması.

## 3. Kullanıcının verdiği kararlar

| Konu | Karar |
|---|---|
| Ana deneyim | Bakım takvimi: kalem listesi, durum ve kalem başına öneri. |
| Görünüm | Garaj sayfası, ana sayfa (seçili araç şeridi) ve header rozeti (Garajım ikonunda nokta). |
| Aralıklar | Genel demo tablosu + BMW'ye özel (LongLife) demo tablosu, "tahmini, kılavuzunu kontrol et" notuyla. |
| Bildirim | Sadece site içi. |
| Km | Yalnızca kullanıcının girdiği km kullanılır, tahmin yapılmaz. Km eskiyse güncelleme uyarısı gösterilir. |
| Kalemler | Aşağıdaki 7 kalem. |
| Geçmiş | Kısa geçmiş tutulur: araç kartında son 5 bakım kaydı görünür. |
| BMW genişletmesi | Daha fazla BMW modeli, parçası ve bakım seti (büyük kapsam, bkz. bölüm 11). |
| Sıralama | Önce BMW katalog genişletmesi, sonra bakım hatırlatıcısı. Tek plan, iki bölüm. |

## 4. Bakım kalemleri (demo aralıkları)

Bir kalemin km ve süre sınırlarından hangisi önce dolarsa o geçerli olur.

| id | Ad | Km | Süre | Geçerli olduğu araçlar |
|---|---|---|---|---|
| `engine-oil` | Motor yağı + yağ filtresi | 15.000 | 12 ay | Hepsi |
| `cabin-filter` | Polen filtresi | 15.000 | 12 ay | Hepsi |
| `air-filter` | Hava filtresi | 30.000 | 24 ay | Hepsi |
| `spark-plugs` | Bujiler | 60.000 | 48 ay | Benzinli (hibrit dahil) |
| `fuel-filter` | Yakıt filtresi | 60.000 | 48 ay | Hepsi |
| `brake-fluid` | Fren hidroliği | — | 24 ay | Hepsi |
| `coolant` | Antifriz | — | 48 ay | Hepsi |

### 4.1 BMW'ye özel aralıklar (LongLife, demo)

Markası BMW olan araçlarda, **E30 ve E36 hariç** (LongLife öncesi, genel tabloyu kullanır), aşağıdaki tablo genel tablonun yerine geçer:

| id | Km | Süre | Not |
|---|---|---|---|
| `engine-oil` | 25.000 | 24 ay | |
| `cabin-filter` | 30.000 | 24 ay | |
| `air-filter` | 60.000 | 48 ay | |
| `spark-plugs` | 100.000 | 72 ay | Benzinli |
| `fuel-filter` | 60.000 / 100.000 | 48 / 72 ay | Dizel / benzinli |
| `brake-fluid` | — | 24 ay | |
| `coolant` | — | 48 ay | |

Arayüzde BMW tablosu kullanılan araçlarda nota "BMW LongLife örnek aralıkları" ifadesi eklenir.

**Yakıt tipi** buji kalemi (dizel araçlarda buji kalemi gösterilmez) ve BMW yakıt filtresi aralığı için gerekir. `Vehicle` tipinde yakıt alanı yok. Yakıt tipi motor metninden türetilir. Motor metninde `TDI`, `CDI`, `Diesel` ya da tek başına `d` geçiyorsa veya model kodu rakam+`d` ile bitiyorsa (`320d`, `C 220 d`, `530d`) araç dizeldir. Diğer araçlar benzinli sayılır. Bu, veri modelini değiştirmemek için yapılan bir builder kararıdır.

## 5. Durum hesabı

Girdiler:
- Kalemin aralığı.
- Aracın güncel km'si (yoksa `null`).
- Kalemin son değişimi: geçmişteki en yeni kayıt (`date`, ve yoksa `null` olabilen `km`).
- Bugünün tarihi. Testler için dışarıdan verilir.

Kurallar:
- **Bilinmiyor:** Kalemin hiç kaydı yoksa.
- **Gecikti:** Süre dolmuşsa (`bugün ≥ son tarih + ay`) ya da km dolmuşsa (`güncel km ≥ son km + aralık`; iki km değeri de biliniyorsa).
- **Yaklaşıyor:** Gecikmemişse ve süre dolmasına ≤ 30 gün veya km dolmasına ≤ 1.500 km kalmışsa.
- **Zamanı var:** Diğer durumlar.
- Km bilinmiyorsa yalnızca süreye bakılır. Kalemin km aralığı yoksa da yalnızca süreye bakılır.
- **Kalan miktar:** Ekranda kalan km ve kalan gün, hangisi daha yakınsa o gösterilir. Örnekler: "1.200 km kaldı", "3 ay kaldı", "2 ay gecikti".

**Km eskiliği:** Güncel km 90 günden önce girildiyse kartta "Km bilgisi 3 ay önce girildi, güncelle" uyarısı çıkar.

Sıralama: gecikti → yaklaşıyor → bilinmiyor → zamanı var. Aynı durumdakiler kalan miktara göre sıralanır.

## 6. Veri ve saklama

Yeni anahtar: `ks:v1:maintenance`. Yapısı:

```ts
type MaintenanceState = Record<VehicleID, {
  odometer: { km: number; updatedAt: string /* YYYY-MM-DD */ } | null;
  log: { id: string; itemId: MaintenanceItemId; date: string /* YYYY-MM-DD */; km: number | null }[];
}>;
```

**Tek doğruluk kaynağı log'dur.** Kalemin "son değişimi", o kaleme ait en yeni tarihli kayıttır. İki giriş yolu vardır, ikisi de log'a kayıt ekler:
- **"Bugün yaptım":** Bugünün tarihini ve güncel km'yi (biliniyorsa) yazar.
- **"Son değişimi gir":** Kullanıcı geçmiş bir tarih ve isteğe bağlı km girer.

Kurallar:
- **Geçmiş:** Araç kartında en yeni 5 kayıt listelenir; her kaydın yanlışlıkla eklenene karşı bir "Sil" butonu vardır. Araç başına en fazla 50 kayıt saklanır, en eskiler düşer.
- **Doğrulama:**
  - Km 0–2.000.000 arası bir tam sayı olmalı.
  - Tarih geçerli olmalı ve bugünden ileri olmamalı.
  - Bozuk veya eski şemalı veri kayıt kayıt temizlenir; tamamen bozuksa boş duruma dönülür. Mevcut `createPersistentStore` deseni (`isValid`, `normalize`) kullanılır.
- **Araç bağlantısı:**
  - Katalogda artık olmayan araçlara ait veri okumada yok sayılır, mevcut `sanitizeGarage` mantığına paraleldir.
  - Garajdan çıkarılan aracın bakım verisi silinmez; araç yeniden eklenince geri gelir. Bu bir builder kararıdır.
- **Sunucu tarafı:** Sunucu anlık görüntüsü boş durumdur. Bakım verisine bağlı tüm arayüz `useHydrated()` sonrasında gösterilir.

## 7. Öneriler (kalem → ürün)

Her kalem bir alt kategori ve ad anahtar kelimeleriyle ürünlere eşlenir. Böylece admin'in eklediği yeni ürünler de otomatik eşleşir. Arama `normalizeText` ile yapılır, Türkçe karakter katlanır.

| Kalem | Alt kategori | Ad içinde geçmesi gereken |
|---|---|---|
| engine-oil | filtreler, motor-yagi-sivilar | "yağ filtresi", "motor yağı" |
| cabin-filter | filtreler | "polen" |
| air-filter | filtreler | "hava filtresi" |
| spark-plugs | atesleme | "buji" (kızdırma bujisi hariç) |
| fuel-filter | filtreler | "yakıt filtresi" |
| brake-fluid | motor-yagi-sivilar | "fren hidroliği" |
| coolant | motor-yagi-sivilar, sogutma | "antifriz" |

Kurallar:
- Yalnızca **yayında** olan ürünler önerilir. Uyum için mevcut `fitmentFor` kullanılır: ürün ya o araç için `confirmed` olmalı ya da `universal` olmalı. Doğrulanmamış, bilinmeyen ve uyumsuz ürünler gösterilmez. Stokta olmayan ürün "Stokta yok" olarak gösterilir, sepete ekle butonu devre dışı kalır.
- Gecikmiş veya yaklaşan kalemde en fazla 3 ürün önerilir.
- Kalemi kapsayan bir bakım seti varsa (seti o araca uygun, `kitsForVehicle`, ve setin bir satırı o kalemle eşleşiyor) set ayrıca "Bu bakım için set" olarak önerilir. Set sepete mevcut `cartActions.addKit(kit, vehicleId)` ile eklenir.
- Eşleşen ürün yoksa "Aracına doğrulanmış ürün yok — kategoriye göz at" bağlantısı gösterilir.

**Yeni demo ürünler (antifriz):** Seed'e 2 antifriz ürünü eklenir (Motor Yağı & Sıvılar alt kategorisi, aracı belirli ürün):
- BMW standardına uygun antifriz konsantresi 1,5 L — seed'deki BMW araçlarıyla `confirmed` uyumluluk kayıtları.
- Mercedes-Benz / Audi standardına uygun antifriz konsantresi 1,5 L — seed'deki Mercedes-Benz ve Audi araçlarıyla `confirmed` kayıtlar.
Porsche için antifriz ürünü yoktur; orada "kategoriye göz at" bağlantısı çıkar. Ürün sayısı 50'den 52'ye çıkar ve seed testleri buna göre güncellenir. Açıklamada "aracının antifriz standardını kılavuzdan kontrol et" notu bulunur; liste fiyatı veya puan uydurulmaz.

## 8. Arayüz

**Garaj sayfası:** Her araç kartında katlanabilir bir "Bakım takvimi" bölümü bulunur. Aracın gecikmiş/yaklaşan kalemi varsa bölüm açık başlar.
- **Km satırı:** Güncel km alanı ve kaydet butonu, yanında son güncelleme tarihi ve gerekiyorsa eskilik uyarısı.
- **Kalem listesi:** Her kalemde ad, durum rozeti, kalan miktar ve son değişim ("12.03.2026 · 98.000 km"). Eylemler: "Bugün yaptım" ve "Son değişimi gir". İkincisi kalemin altında satır içi küçük bir form (tarih + km) açar.
- **Öneriler:** Gecikmiş/yaklaşan kalemlerin altında öneri ürünleri ve set kartı. Mevcut `ProductCard`/`KitCard` bileşenlerinin sıkıştırılmış bir varyantı kullanılır.
- **Geçmiş:** Son 5 kayıt.
- **Not:** "Örnek aralıklardır; aracınızın bakım kılavuzunu kontrol edin."
- **Durum rozetleri:** Renk tek başına anlam taşımaz; her rozette metin ve ikon da vardır (erişilebilirlik).

**Ana sayfa şeridi:** Seçili araç varsa gösterilir.
- Veri girilmişse: "E46 320d: 2 bakım gecikti, 1 yaklaşıyor — Garajda gör".
- Veri hiç girilmemişse: "Bakım takvimini başlat".
- Her şey zamanındaysa şerit görünmez.

**Header rozeti:** Garajdaki herhangi bir araçta gecikmiş kalem varsa Garajım bağlantısında küçük bir nokta çıkar. Bağlantının erişilebilir adına "(gecikmiş bakım var)" eklenir.

**Mobil:** Kart tek sütundur ve yatay taşma olmaz. Mevcut e2e taşma kontrolü bu sayfaya da uygulanır.

## 9. Test ve kalite

**Birim testleri (Vitest)**
- Durum hesabı: bilinmiyor; yalnızca süre; yalnızca km; ikisi birden ve hangisi önce dolarsa; 30 gün ve 1.500 km eşikleri; km aralığı olmayan kalem; ay sonu tarih aritmetiği (31 Ocak + 1 ay).
- Yakıt tipi türetme: seed'deki tüm motor metinleri.
- Kalem → ürün eşleme: kızdırma bujisi buji kalemine girmez; yalnızca confirmed/universal ürünler önerilir.
- Store'un temizleme ve doğrulama mantığı; 50 kayıt sınırı.

**E2e (Playwright):** Garajda araç seç → km gir → yağ değişimini 13 ay öncesine gir → "Gecikti" görünür → öneriden sepete ekle → header noktası görünür → "Bugün yaptım" → durum "Zamanı var" olur.

**Dokümantasyon:** README'ye özellik ve ekran görüntüsü eklenir; test sayıları güncellenir.

## 10. Builder'a bırakılanlar

- Bileşen ve dosya bölümlemesi; mevcut düzen korunur (`src/lib/maintenance.ts`, `src/state/maintenance-store.ts`, `src/components/store/…`).
- Katlanabilir bölümün tam görsel tasarımı. Mevcut tasarım değişkenleri ve bileşenleri kullanılır.
- Kalan miktar metninin tam biçimi (ay/gün yuvarlaması).

## 11. BMW katalog genişletmesi (ilk bölüm)

Bakım hatırlatıcısından **önce** uygulanır; kendi commit'leri ve testleriyle tek başına çalışır durumda olmalıdır. Amaç, BMW kullanıcılarının bakım takviminde önerilerin neredeyse hiç boş kalmaması ve katalog derinliğinin portfolyoda BMW odağını göstermesidir.

**Yeni araçlar (25).** Mevcut `generations` yapısına eklenir; id kuralı (`v-bmw-<kasa>-<motor>`) korunur.

| Model | Kasa | Kasa tipi | Yıllar | Motorlar |
|---|---|---|---|---|
| 1 Serisi | E87 | Hatchback | 2004–2011 | 116i 1.6 (122 HP), 120d 2.0 (177 HP) |
| 1 Serisi | F40 | Hatchback | 2019– | 118i 1.5 (140 HP) |
| 3 Serisi | F30 | Sedan | 2012–2019 | 320i 2.0 (184 HP), 320d 2.0 (190 HP) |
| M3 | F80 | Sedan | 2014–2018 | M3 3.0 (431 HP) |
| M3 | G80 | Sedan | 2021– | M3 Competition 3.0 (510 HP) |
| 4 Serisi | F32 | Coupé | 2013–2020 | 420d 2.0 (190 HP), 430i 2.0 (252 HP) |
| 4 Serisi | G22 | Coupé | 2020– | 420i 2.0 (184 HP), M440i 3.0 (374 HP) |
| 7 Serisi | F01 | Sedan | 2008–2015 | 730d 3.0 (245 HP) |
| 7 Serisi | G11 | Sedan | 2015–2022 | 730d 3.0 (265 HP), 740i 3.0 (326 HP) |
| X1 | F48 | SUV | 2015–2022 | sDrive18i 1.5 (136 HP), xDrive20d 2.0 (190 HP) |
| X3 | F25 | SUV | 2010–2017 | xDrive20d 2.0 (184 HP) |
| X3 | G01 | SUV | 2017– | xDrive20d 2.0 (190 HP), xDrive30i 2.0 (252 HP) |
| X5 | E70 | SUV | 2006–2013 | xDrive30d 3.0 (245 HP) |
| X5 | F15 | SUV | 2013–2018 | xDrive30d 3.0 (258 HP) |
| X5 | G05 | SUV | 2018– | xDrive30d 3.0 (286 HP) |
| Z4 | E89 | Roadster | 2009–2016 | sDrive20i 2.0 (184 HP) |
| Z4 | G29 | Roadster | 2018– | sDrive30i 2.0 (258 HP), M40i 3.0 (340 HP) |

Araç seçicideki BMW model sırası mantıklı kalır (1, 3, 4, 5, 7, M3, X1, X3, X5, Z4). X serisi ABD üretimi olduğundan şasi çözümleyicideki üretici tablosuna `5UX` (BMW, ABD) eklenir.

**Yeni parçalar (yaklaşık 20).** Mevcut ürün şemasıyla, mevcut markalar (MANN, MAHLE, Bosch, NGK, Brembo, ATE, Castrol, Liqui Moly, Febi, Lemförder vb.) kullanılarak eklenir:
- Yağ, hava, polen ve yakıt filtreleri: B47/N47 dizel, N20/B48 benzinli, B58/N55 altı silindir ve S55/S58 (M3) motor ailelerine göre.
- Bujiler: N20/B48 ve B58/N55 için.
- Fren: F30/F32, G20/G22, X5 (F15/G05) ve X3 (G01) için ön balata ve disk.
- Motor yağı: BMW LongLife-04 onaylı 0W-30 ve 5W-30 (universal değil; LL-04 onayı gerektiren BMW araçlarıyla `confirmed`).

Kurallar:
- Her ürün açıklamasında motor/kasa kodu yer alır.
- Her ürün için ilgili BMW araçlarıyla `confirmed` uyumluluk kayıtları girilir.
- Liste fiyatı, indirim veya puan uydurulmaz.
- Görseller mevcut alt kategori SVG çizimlerini kullanır.

**Kapsam ölçütü:** E30 ve E36 hariç her yeni ve mevcut BMW aracı için en az 4 bakım kalemi (motor yağı veya yağ filtresi, hava filtresi, polen filtresi, ve yakıt tipine göre buji ya da yakıt filtresi) en az bir `confirmed` ürünle eşleşir. Bu ölçüt bir birim testiyle doğrulanır.

**Yeni bakım setleri (6).** F30 320d, F10 520d, F20 118d, E90 320i, G20 320d, F15 X5 xDrive30d. Mevcut kural geçerlidir: setin her satırı listelenen her araç için `confirmed` veya universal olmalıdır (mevcut seed testi bunu doğrular).

**Etkiler:**
- `/arac` sayfaları, sitemap ve `generateStaticParams` seed'den beslendiği için otomatik genişler.
- Brief'teki "en fazla 50 ürün / 40–45 araç" sınırları bilerek aşılır. Seed testlerindeki üst sınırlar yeni sayılara göre güncellenir (yaklaşık 72 ürün, 70 araç).
- README'deki katalog sayıları güncellenir.
- Tarayıcıda eski katalog verisi olan kullanıcılar: mevcut `migrateCatalog` yalnızca eksik alanları tamamlar. Yeni seed kayıtlarının eski tarayıcı verisine eklenmesi gerekmez; kullanıcı admin'deki "Demo verilerini sıfırla" ile yeni kataloğu alır. Bu bir builder kararıdır. Eğer mevcut store seed değişikliğinde zaten sıfırlanıyorsa o davranış korunur.
