# ADR-002 · Bayi fiyatlandırma: indirim matrisi

Tarih: 2026-10-07 · Durum: kabul edildi

## Karar

Ürün başına tek liste fiyatı. Bayi fiyatı saklanmaz; `resolveDealerPrice()` sırayla sorar:

1. `product_tier_override` (ürün × statü)
2. `tier_category_discount` (statü × kategori; en yakın üst kategori)
3. `tier_category_discount` (statü, kategori NULL = genel yüzde)

Başlangıç: Silver %5, Gold %10, Platinum %15, hepsi genel satır.

## Gerekçe

- Tek fiyat girişi; statü değişince tüm fiyatlar anında değişir.
- Üç katman baştan kodda; kategori/ürün bazlı ayrıştırma ileride sadece veri girişi.

## Reddedilen

- Ürün bazlı fiyat listeleri (price_list): aynı ürüne bayi başına sabit fiyat gerektiğinde anlamlı; şu anki ihtiyaç değil. Gerekirse 4. katman olarak eklenir.
