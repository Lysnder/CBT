# MAP — projenin haritası

Bir özellik üzerinde çalışırken buradan başla; yalnızca ilgili satırdaki klasörü aç.
Güncelleme kuralı: yeni dosya/modül ekleyen görev bu dosyayı da günceller.

## Kök yapı

```
apps/web/            Next.js (mağaza + admin). src/app/(store), src/app/(admin), src/app/api
apps/worker/         BullMQ işleri: mail, kur güncelleme, kargo, pazaryeri senkronu. src/index.ts, src/connection.ts, src/scripts/
packages/db/         Drizzle client (src/client.ts), src/schema/index.ts, src/migrate.ts, migrations/, seed/, tests/ (ayrı `cbt_test` veritabanı). Şema modüllerden toplanır.
packages/modules/    İş mantığı. Her modül kendi klasöründe (aşağıda). Tek paket: `@cbt/modules/<ad>`.
packages/ui/         shadcn bileşenleri (src/components), `cn()` (src/lib), components.json
packages/config/     tsconfig.base.json, eslint.config.js, tailwind.css (tema değişkenleri), env.ts
docs/                MAP, CONVENTIONS, DOMAIN, specs/, decisions/
infra/               docker-compose.yml (Caddyfile ve deploy scriptleri sonraki spec'lerde)
```

Kök: `package.json` (scriptler), `pnpm-workspace.yaml`, `eslint.config.js`, `vitest.config.ts` + `vitest.workspace.ts`, `.env.example`.
Paket adları: `web`, `worker`, `@cbt/config`, `@cbt/db`, `@cbt/modules`, `@cbt/ui`.

## Modüller (`packages/modules/<ad>/`)

| Modül           | Ne yapar                                                    | Ana tablolar                                                                                                                                                                              | Durum            |
| --------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `catalog`       | Ürün, varyant, kategori ağacı, attribute set, çeviri        | category, category_translation, attribute_set, attribute, attribute_option, product, product_translation, product_attribute_value, product_variant, product_variant_option, product_image | Faz 0 · şema var |
| `pricing`       | Liste fiyatı, statü indirim matrisi, bayi fiyat hesabı, kur | tier_category_discount, product_tier_override, currency, currency_rate                                                                                                                    | Faz 0 · şema var |
| `inventory`     | Depolar, depo bazlı stok, rezervasyon, çıkış depo seçimi    | warehouse, inventory_level, stock_movement                                                                                                                                                | Faz 0 · şema var |
| `customers`     | Bireysel müşteri, firma (B2B), statü ataması, adresler      | customer_group, tier, company, customer, company_user, address                                                                                                                            | Faz 0 · şema var |
| `auth`          | Oturum, roller (admin / customer / dealer), yetki           | user, role, user_role, session                                                                                                                                                            | Faz 0 · şema var |
| `orders`        | Sepet, sipariş, durum makinesi, teklif (RFQ)                | cart, cart_item, order, order_item, quote                                                                                                                                                 | Faz 1 · boş      |
| `payments`      | Sanal POS adaptörü, webhook, iade                           | payment, payment_attempt                                                                                                                                                                  | Faz 1 · boş      |
| `shipping`      | Kargo adaptörü, etiket, takip                               | shipment, shipment_event                                                                                                                                                                  | Faz 1 · boş      |
| `notifications` | Mail şablonları (React Email), kuyruk                       | notification_log                                                                                                                                                                          | Faz 1 · boş      |
| `media`         | Görsel yükleme, işleme (sharp), depolama                    | media_asset                                                                                                                                                                               | Faz 1 · boş      |
| `i18n`          | Dil dosyaları, locale routing yardımcıları                  | —                                                                                                                                                                                         | Faz 1 · boş      |
| `invoicing`     | e-Fatura / e-Arşiv entegratör adaptörü                      | invoice, invoice_line                                                                                                                                                                     | Faz 2 · boş      |
| `marketplace`   | Trendyol / Hepsiburada adaptörleri                          | channel, channel_listing, channel_order                                                                                                                                                   | Faz 3 · boş      |
| `licensing`     | Kurulum kimliği, lisans anahtarı (ürünleştirme)             | installation, license_key                                                                                                                                                                 | Faz 3 · boş      |

## Sık yapılan işler → nereye bakılır

| İş                   | Dosya                                                                          |
| -------------------- | ------------------------------------------------------------------------------ |
| Yeni tablo / kolon   | `packages/modules/<modül>/schema.ts` → `pnpm db:generate`                      |
| Bayi fiyatı hesabı   | `packages/modules/pricing/service.ts` → `resolveDealerPrice()`                 |
| Çıkış deposu seçimi  | `packages/modules/inventory/service.ts` → `pickWarehouse()`                    |
| Yeni admin sayfası   | `apps/web/src/app/(admin)/<alan>/page.tsx`                                     |
| Yeni API ucu         | `packages/modules/<modül>/routes.ts` + `apps/web/src/app/api/<modül>/route.ts` |
| Yeni kuyruk işi      | `apps/worker/src/jobs/<ad>.ts` + kayıt `apps/worker/src/index.ts`              |
| Ortam değişkeni      | `.env.example` + `packages/config/env.ts` (Zod şeması)                         |
| Seed verisi          | `packages/db/seed/*.ts` (alan başına dosya; `index.ts` → `seedAll`)            |
| Yeni shadcn bileşeni | `packages/ui/src/components/<ad>.tsx` → `@cbt/ui/components/<ad>`              |
| Lokal servisler      | `infra/docker-compose.yml`                                                     |

## Spec ve karar kayıtları

- Spec'ler: `docs/specs/NNN-ad.md` (sıralı). Açık olanlar listenin başında.
- Kararlar: `docs/decisions/ADR-NNN-ad.md`. Aynı tartışmayı tekrar açmadan önce oku.
