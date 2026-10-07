# MAP — projenin haritası

Bir özellik üzerinde çalışırken buradan başla; yalnızca ilgili satırdaki klasörü aç.
Güncelleme kuralı: yeni dosya/modül ekleyen görev bu dosyayı da günceller.

## Kök yapı
```
apps/web/            Next.js (mağaza + admin). src/app/(store), src/app/(admin), src/app/api
apps/worker/         BullMQ işleri: mail, kur güncelleme, kargo, pazaryeri senkronu
packages/db/         Drizzle client, migration'lar, seed. Şema modüllerden toplanır.
packages/modules/    İş mantığı. Her modül kendi klasöründe (aşağıda).
packages/ui/         shadcn bileşenleri, tema değişkenleri
packages/config/     eslint, tsconfig, tailwind ortak ayarlar
docs/                MAP, CONVENTIONS, DOMAIN, specs/, decisions/
infra/               docker-compose.yml, Caddyfile, deploy scriptleri
```

## Modüller (`packages/modules/<ad>/`)
| Modül | Ne yapar | Ana tablolar | Durum |
| --- | --- | --- | --- |
| `catalog` | Ürün, varyant, kategori ağacı, attribute set, çeviri | product, product_variant, category, attribute_set, attribute_value, product_translation | Faz 0 şema |
| `pricing` | Liste fiyatı, statü indirim matrisi, bayi fiyat hesabı, kur | tier, tier_category_discount, product_tier_override, currency_rate | Faz 0 şema |
| `inventory` | Depolar, depo bazlı stok, rezervasyon, çıkış depo seçimi | warehouse, inventory_level, stock_reservation | Faz 0 şema |
| `customers` | Bireysel müşteri, firma (B2B), statü ataması, adresler | customer, company, company_user, address | Faz 0 şema |
| `auth` | Oturum, roller (admin / customer / dealer), yetki | user, role, session (Auth.js) | Faz 0 |
| `orders` | Sepet, sipariş, durum makinesi, teklif (RFQ) | cart, cart_item, order, order_item, quote | Faz 1 |
| `payments` | Sanal POS adaptörü, webhook, iade | payment, payment_attempt | Faz 1 |
| `shipping` | Kargo adaptörü, etiket, takip | shipment, shipment_event | Faz 1 |
| `notifications` | Mail şablonları (React Email), kuyruk | notification_log | Faz 1 |
| `media` | Görsel yükleme, işleme (sharp), depolama | media_asset | Faz 1 |
| `i18n` | Dil dosyaları, locale routing yardımcıları | — | Faz 1 |
| `invoicing` | e-Fatura / e-Arşiv entegratör adaptörü | invoice, invoice_line | Faz 2 (boş) |
| `marketplace` | Trendyol / Hepsiburada adaptörleri | channel, channel_listing, channel_order | Faz 3 (boş) |
| `licensing` | Kurulum kimliği, lisans anahtarı (ürünleştirme) | installation, license_key | Faz 3 (boş) |

## Sık yapılan işler → nereye bakılır
| İş | Dosya |
| --- | --- |
| Yeni tablo / kolon | `packages/modules/<modül>/schema.ts` → `pnpm db:generate` |
| Bayi fiyatı hesabı | `packages/modules/pricing/service.ts` → `resolveDealerPrice()` |
| Çıkış deposu seçimi | `packages/modules/inventory/service.ts` → `pickWarehouse()` |
| Yeni admin sayfası | `apps/web/src/app/(admin)/<alan>/page.tsx` |
| Yeni API ucu | `packages/modules/<modül>/routes.ts` + `apps/web/src/app/api/<modül>/route.ts` |
| Yeni kuyruk işi | `apps/worker/src/jobs/<ad>.ts` + kayıt `apps/worker/src/index.ts` |
| Ortam değişkeni | `.env.example` + `packages/config/env.ts` (Zod şeması) |
| Seed verisi | `packages/db/seed/*.ts` |

## Spec ve karar kayıtları
- Spec'ler: `docs/specs/NNN-ad.md` (sıralı). Açık olanlar listenin başında.
- Kararlar: `docs/decisions/ADR-NNN-ad.md`. Aynı tartışmayı tekrar açmadan önce oku.
