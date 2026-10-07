# DOMAIN — iş kavramları sözlüğü

Kod ve konuşmada aynı terimler kullanılır; İngilizce kod adı parantez içinde.

| Terim | Kod | Anlamı |
| --- | --- | --- |
| Liste fiyatı | `list_price_cents` | Ürün başına girilen tek fiyat; TL, KDV hariç, kuruş cinsinden tamsayı |
| KDV oranı | `vat_rate` | Ürün bazlı yüzde (1, 10, 20) |
| Statü | `tier` | Bayi seviyesi: Silver, Gold, Platinum. Firmaya atanır |
| İndirim matrisi | `tier_category_discount` | Statü × kategori → yüzde. Kategori NULL = o statünün genel yüzdesi |
| Ürün istisnası | `product_tier_override` | Tek ürün × statü → yüzde; matrisin önüne geçer |
| Bayi fiyatı | `resolveDealerPrice()` | Hesaplanır, saklanmaz: override → kategori → genel |
| Müşteri | `customer` | Bireysel alıcı (B2C) veya firma kullanıcısı |
| Firma | `company` | B2B müşteri; vergi no, statü, onay durumu, cari limiti |
| Müşteri grubu | `customer_group` | retail / dealer; ödeme yöntemi izinleri buna bağlı |
| Depo | `warehouse` | Fiziksel stok noktası; `priority` ile sıralanır |
| Stok seviyesi | `inventory_level` | Varyant × depo → adet (on_hand, reserved) |
| Çıkış deposu | `pickWarehouse()` | Stoğu yeten en yüksek öncelikli depo; yetmezse bölme |
| Ürün tipi | `product.type` | physical / digital / service / bundle |
| Varyant | `product_variant` | SKU taşıyan satılabilir birim; varyantsız ürün = tek varyant |
| Attribute set | `attribute_set` | Kategoriye bağlı özellik şablonu (soket, radyatör boyu…) |
| Sektör paketi | `sector_pack` | Kategori ağacı + attribute set'ler + tema + örnek veri |
| Kur | `currency_rate` | TCMB günlük kur; `base = TRY` |
| Sipariş türü | `order.kind` | retail / wholesale / quote |
| Teklif | `quote` | B2B'de onay bekleyen sipariş öncesi belge (RFQ) |
| Cari hesap | `company.credit_limit_cents`, `payment_term_days` | Vadeli ödeme izni |
| Kanal | `channel` | Satış kanalı: web, trendyol, hepsiburada |
| Kurulum | `installation` | Ürünleştirmede her müşteri kurulumu; lisans anahtarına bağlı |
