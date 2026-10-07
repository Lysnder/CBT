# ADR-001 · Teknoloji yığını
Tarih: 2026-10-07 · Durum: kabul edildi

## Karar
Next.js 15 + TypeScript + Drizzle + PostgreSQL 16 + Redis + Meilisearch + BullMQ, pnpm monorepo, modüler monolit, tek Linux VDS (Docker Compose).

## Gerekçe
- Tek dil (TS) ve yaygın ekosistem: Claude Code en az hata ve token ile üretir.
- Modüler monolit: tek kişilik ekipte deploy ve hata ayıklama basit; modül sınırları ileride ayrıştırmaya izin verir.
- Drizzle: şema dosyası küçük ve SQL'e yakın; migration'lar okunur.
- Linux VDS: Windows lisansı yok; Compose ile tüm servisler tek dosyadan.

## Reddedilenler
- .NET + MSSQL: Windows lisansı, frontend ayrı; Claude Code ekosistem avantajı daha düşük.
- Medusa/Saleor: hazır çekirdek ama B2B indirim matrisi ve çoklu depo kurallarında kısıt; "kendi ürünüm" hedefiyle çelişir.
- Mikroservis / Kubernetes / GraphQL: tek kişi için gereksiz karmaşıklık.
