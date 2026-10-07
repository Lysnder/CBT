# ADR-003 · Çoklu depo ve çıkış kuralı

Tarih: 2026-10-07 · Durum: kabul edildi

## Karar

Stok `inventory_level` (varyant × depo). Her deponun `priority` değeri var. `pickWarehouse()`: stoğu yeten en yüksek öncelikli depo; yetmezse öncelik sırasıyla bölünür.

## Gerekçe

Depo sayısı belirsiz (1–3 beklenir). "En yakın depo" il bazlı mesafe tablosu ve adres eşleme gerektirir; bu ölçekte karşılığı yok.

## İleride

Depo sayısı 3'ü geçince `pickWarehouse` stratejisi `nearest` seçeneği alır (il → depo mesafe tablosu). Arayüz değişmez, strateji eklenir.
