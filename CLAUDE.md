# Proje: E-Ticaret Platformu (B2B + B2C, çok sektör)

Dil: TypeScript her yerde. Stack: Next.js 15 (App Router) · Drizzle · PostgreSQL 16 · Redis · Meilisearch · BullMQ worker · Tailwind + shadcn/ui · Auth.js v5 · Zod · pnpm.

## Her görevde (sırayla)
1. `docs/MAP.md` oku; ilgili modülü ve dosyaları bul. Başka modül okuma.
2. `docs/specs/` içinde görevin spec'i varsa onu uygula. Yoksa önce spec yaz, onay al, sonra kod.
3. Sadece spec'te adı geçen dosyalara dokun. Spec dışı refactor yok.
4. Test: `pnpm test <modül yolu>` — tüm testleri değil, ilgili modülü çalıştır.
5. Bitince: modülün `README.md`'si ve `docs/MAP.md` güncel mi kontrol et; kısa commit mesajı yaz.

## Yasaklar
- Tüm repoyu `grep`/`glob` ile tarama; önce `docs/MAP.md`.
- `node_modules`, `.next`, `dist`, `public/uploads`, `*.lock` okuma.
- Hata çıktısını tamamını yapıştırma; `| tail -40`.
- Bir modülün iç fonksiyonunu başka modülden import etme; sadece `index.ts` public API.
- Kart verisi, gizli anahtar, `.env` içeriği koda veya loga yazma.

## Kurallar (özet; ayrıntı docs/CONVENTIONS.md)
- Para: tamsayı kuruş (`price_cents`), para birimi kodu ayrı kolon. Float yok.
- Tüm dış girdiler Zod ile doğrulanır; SQL yalnızca Drizzle.
- Hata: `AppError(code, message, status)`; `throw new Error('...')` yok.
- Dosya adı kebab-case, tip/sınıf PascalCase, fonksiyon camelCase.
- Her modül: `schema.ts` · `service.ts` · `routes.ts` · `index.ts` · `README.md` · `tests/`.

## Komutlar
```
pnpm dev            # app + worker
pnpm test <yol>     # vitest, modül bazlı
pnpm lint           # eslint + tsc --noEmit
pnpm db:generate    # drizzle migration üret
pnpm db:migrate     # migration uygula
pnpm db:seed        # küçük seed (10 ürün, 3 statü, 2 depo)
docker compose -f infra/docker-compose.yml up -d
```

## İş kuralları (kısa; sözlük docs/DOMAIN.md)
- Ürün başına TEK liste fiyatı (TL, KDV hariç). Bayi fiyatı saklanmaz, hesaplanır: ürün override → kategori yüzdesi → statü genel yüzdesi.
- Statüler: Silver %5, Gold %10, Platinum %15 (başlangıç).
- Stok depo bazlı; çıkış = stoğu yeten en yüksek öncelikli depo.
- Fiyat TL'de tutulur; döviz gösterim anında `currency_rate` ile çevrilir (TCMB, günlük).
