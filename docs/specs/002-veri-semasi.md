# 002 · Veri şeması (Faz 0 çekirdeği)

Modüller: catalog, pricing, inventory, customers, auth · Faz: 0 · Tahmin: 2–3 gün
Dokunulacak: `packages/modules/{catalog,pricing,inventory,customers,auth}/schema.ts`, `packages/db/src/schema/index.ts`, `packages/db/seed/`, `packages/db/migrations/`, ilgili modül `README.md`'leri, `docs/MAP.md`
Dokunulmayacak: `apps/web` (UI yok), `apps/worker`, orders/payments/shipping ve diğer Faz 1+ modüller, `service.ts` dosyaları (003'ten sonra)

## Amaç
Faz 0 çekirdek tabloları Drizzle ile tanımlanır, migration üretilir ve uygulanır, küçük bir seed ile doğrulanır. B2B (statü, indirim matrisi, firma) ve çoklu depo baştan şemadadır. Hiçbir iş mantığı (fiyat hesabı, depo seçimi) bu spec'te yazılmaz; yalnızca tablolar, ilişkiler, index'ler ve seed.

## Ortak kurallar (CONVENTIONS.md'den)
- Her tabloda `id uuid pk default gen_random_uuid()` (uuid v7 yoksa v4 kabul), `created_at`, `updated_at timestamptz default now()`.
- Silinebilir kayıtlarda `deleted_at timestamptz null`.
- Para: `*_cents integer` + `currency char(3) default 'TRY'`. Yüzde: `numeric(5,2)`.
- Tablo/kolon snake_case; Drizzle export adları camelCase (`productVariant`).
- Her modülün şeması kendi `schema.ts`'inde; `packages/db/src/schema/index.ts` hepsini re-export eder. Modüller arası FK için diğer modülün şemasını import etmek serbesttir (yalnızca şema dosyaları arasında).
- Her tablonun altında Drizzle `relations()` tanımı.

## Tablolar

### auth
| Tablo | Kolonlar (id/zaman hariç) | Not |
| --- | --- | --- |
| `user` | email unique, password_hash null, name, locale default 'tr', is_active bool | Auth.js uyumlu; OAuth için password_hash null |
| `role` | code unique (admin / customer / dealer), name | Seed ile 3 satır |
| `user_role` | user_id fk, role_id fk | pk (user_id, role_id) |
| `session` | user_id fk, token unique, expires_at | Auth.js adapter tabloları gerekiyorsa Drizzle adapter şemasını kullan |

### customers
| Tablo | Kolonlar | Not |
| --- | --- | --- |
| `customer_group` | code unique (retail / dealer), name, show_vat_included bool, allowed_payment_methods text[] | Seed: retail (true), dealer (false) |
| `tier` | code unique (silver / gold / platinum), name, rank int, is_active | B2B statü; seed 3 satır |
| `company` | name, tax_number unique, tax_office, tier_id fk null, status enum (pending / approved / rejected / suspended), credit_limit_cents, payment_term_days default 0, currency | B2B firma; status default pending |
| `customer` | user_id fk unique, customer_group_id fk, company_id fk null, phone | B2C'de company_id null |
| `company_user` | company_id fk, user_id fk, role enum (owner / buyer / viewer) | pk (company_id, user_id) |
| `address` | customer_id fk, kind enum (shipping / billing), title, full_name, phone, country char(2) default 'TR', city, district, postal_code, line1, line2 null, is_default bool | |

### catalog
| Tablo | Kolonlar | Not |
| --- | --- | --- |
| `category` | parent_id fk self null, slug unique, sort_order int, is_active | Ağaç; path/level kolonu yok, recursive CTE ile |
| `category_translation` | category_id fk, locale char(2), name, description null | unique (category_id, locale) |
| `attribute_set` | code unique, name | Örn. `pc-case`, `liquid-cooler` |
| `attribute` | attribute_set_id fk, code, name, type enum (text / number / boolean / select), unit null, is_filterable bool, sort_order | unique (attribute_set_id, code) |
| `attribute_option` | attribute_id fk, value, sort_order | select tipi için seçenekler |
| `product` | type enum (physical / digital / service / bundle), sku unique, slug unique, category_id fk, attribute_set_id fk null, brand null, list_price_cents, currency, vat_rate numeric(5,2) default 20, status enum (draft / active / archived), has_variants bool | Tek liste fiyatı burada |
| `product_translation` | product_id fk, locale, name, short_description null, description null, meta_title null, meta_description null | unique (product_id, locale) |
| `product_attribute_value` | product_id fk, attribute_id fk, value_text null, value_number numeric null, value_bool null, option_id fk null | unique (product_id, attribute_id) |
| `product_variant` | product_id fk, sku unique, barcode null, name, price_delta_cents default 0, weight_grams int null, pack_size int default 1, min_order_qty int default 1, is_active, sort_order | Varyantsız ürün = 1 varyant (sku = product.sku) |
| `product_variant_option` | variant_id fk, attribute_id fk, option_id fk | Hangi seçenek kombinasyonu (renk: siyah) |
| `product_image` | product_id fk, variant_id fk null, url, alt null, sort_order, is_primary | Dosya depolama Faz 1; şimdilik url text |

### pricing
| Tablo | Kolonlar | Not |
| --- | --- | --- |
| `tier_category_discount` | tier_id fk, category_id fk null, discount_pct numeric(5,2) | unique (tier_id, category_id); category_id NULL = genel yüzde. Seed: silver 5, gold 10, platinum 15 (category NULL) |
| `product_tier_override` | product_id fk, tier_id fk, discount_pct | unique (product_id, tier_id); boş |
| `currency` | code char(3) pk, name, symbol, decimals int default 2, is_active | Seed: TRY, USD, EUR |
| `currency_rate` | base char(3) fk, quote char(3) fk, rate numeric(18,6), source text default 'TCMB', effective_date date | unique (base, quote, effective_date); seed yok |

### inventory
| Tablo | Kolonlar | Not |
| --- | --- | --- |
| `warehouse` | code unique, name, priority int, city, is_active | Seed: 2 depo (priority 1 ve 2) |
| `inventory_level` | variant_id fk, warehouse_id fk, on_hand int default 0, reserved int default 0 | pk (variant_id, warehouse_id); available = on_hand − reserved (hesaplanır, kolon değil) |
| `stock_movement` | variant_id fk, warehouse_id fk, delta int, reason enum (purchase / sale / return / adjustment / transfer), reference_type null, reference_id uuid null, note null | Audit; Faz 1'de doldurulur |

## Index'ler (asgari)
- `product(category_id)`, `product(status)`, `product_translation(locale, name)`
- `product_variant(product_id)`, `inventory_level(warehouse_id)`
- `company(status)`, `customer(company_id)`
- `currency_rate(quote, effective_date desc)`

## Seed (`packages/db/seed/`)
Dosya başına bir alan: `roles.ts`, `tiers.ts`, `groups.ts`, `currencies.ts`, `warehouses.ts`, `catalog.ts`. Idempotent (`onConflictDoNothing`).
- 3 rol, 3 statü, 2 müşteri grubu, 3 para birimi, 2 depo
- `tier_category_discount`: 3 genel satır (5 / 10 / 15)
- 1 attribute set `pc-case` (form_factor select: ATX/mATX/ITX; max_gpu_length_mm number; has_rgb boolean), 1 set `liquid-cooler` (radiator_mm select: 120/240/360; socket text)
- Kategori ağacı: Bilgisayar Bileşenleri → Kasa, Soğutma → Sıvı Soğutucu (tr + en çevirileri)
- 10 ürün: 6 kasa (2'si renk varyantlı), 4 sıvı soğutucu; her varyanta iki depoda stok
- 1 admin kullanıcı (şifre `.env`'den `SEED_ADMIN_PASSWORD`), 1 onaylı dealer firma (gold) + kullanıcısı, 1 retail müşteri

## Adımlar
1. Branch `feat/002-veri-semasi`.
2. Her modülün `schema.ts`'ini yukarıdaki tablolarla yaz; enum'lar `pgEnum` ile modül dosyasında.
3. `packages/db/src/schema/index.ts` re-export; `drizzle.config.ts` şema yolunu güncelle.
4. `pnpm db:generate` → migration dosyasını incele (drop/rename olmamalı; ilk migration).
5. `pnpm db:migrate` → Postgres'te tablolar oluşur.
6. Seed dosyalarını yaz; `pnpm db:seed` idempotent çalışır (iki kez çalıştırınca hata yok, satır sayısı artmaz).
7. `packages/db/tests/schema.test.ts`: migration'dan sonra beklenen tablo listesi `information_schema` ile doğrulanır; seed sonrası satır sayıları kontrol edilir.
8. Modül README'lerindeki "Tablolar" ve "Durum: şema var" satırlarını güncelle; `docs/MAP.md` tablo listesiyle uyumlu olsun.
9. `docs/decisions/ADR-004-sema-kurallari.md`: uuid seçimi, EAV yaklaşımı, çeviri tablosu deseni (kısa).

## Kabul kriterleri
- [ ] `pnpm db:generate` tek migration üretir; `pnpm db:migrate` hatasız
- [ ] `pnpm db:seed` iki kez üst üste hatasız; ikinci çalıştırma satır eklemez
- [ ] `pnpm test packages/db` geçer (tablo listesi + seed sayıları)
- [ ] `pnpm typecheck` hatasız
- [ ] DBeaver/psql ile: `select count(*) from product` = 10; `select * from tier_category_discount` 3 satır
- [ ] Tüm para kolonları `_cents integer`; float kolon yok (test ile doğrula: `information_schema.columns` içinde `double precision`/`real` yok)
- [ ] Modül README'leri ve `docs/MAP.md` güncel

## Bitiş
Kabul kriterleri geçince: commit (`feat(db): faz 0 çekirdek şeması ve seed (#002)`), `main`'e merge, push, branch sil, `/clear`.

## Notlar
- `service.ts` yazılmaz; `resolveDealerPrice` ve `pickWarehouse` 004 ve 005'te.
- Auth.js'in kendi adapter tabloları (account, verification_token) gerekiyorsa `auth/schema.ts`'e eklenir; kullanıcı tablosu bizimki kalır.
- Sektör paketi (`sector_pack`) tablosu bu spec'te yok; Faz 1'de kategori + attribute set + tema birlikte paketlenir.
