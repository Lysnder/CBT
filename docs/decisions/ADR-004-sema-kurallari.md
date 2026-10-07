# ADR-004 · Şema kuralları
Tarih: 2026-10-07 · Durum: kabul edildi

## Karar
- **id**: `uuid`, `gen_random_uuid()` (v4). Bileşik anahtarlı bağlantı tablolarında (`user_role`, `company_user`, `inventory_level`, `product_variant_option`) ve `currency`'de (`code`) ayrı `id` yok.
- **Attribute değerleri (EAV)**: `product_attribute_value` tipli kolonlarla (`value_text` / `value_number` / `value_bool` / `option_id`); attribute tipine göre biri dolar. JSONB kullanılmaz.
- **Çeviri**: `<tablo>_translation (…_id, locale, alanlar)`, unique `(…_id, locale)`. Ana tabloda çevrilebilir metin tutulmaz.
- **Genel indirim satırı**: `tier_category_discount.category_id` NULL = statünün genel yüzdesi; unique `NULLS NOT DISTINCT` ile statü başına tek satır.
- **Modüller arası ilişki**: FK için şema dosyaları birbirini import eder (auth ← customers ← pricing; catalog ← pricing, inventory). `relations()` yalnızca bağımlı tarafta `one` olarak yazılır; ters yöndeki `many` tanımlanmaz.
- **Şifre hash'i**: `node:crypto` scrypt, `scrypt$N$r$p$salt$hash` (base64). Seed bu biçimde yazar; auth doğrulaması aynı biçimi okur.
- **Test veritabanı**: testler ayrı `cbt_test` veritabanında koşar (her koşuda drop/create → migrate → seed).

## Gerekçe
- PostgreSQL 16'da yerel uuid v7 yok; uygulama tarafında üretmek ek bağımlılık ve DB dışı insert'lerde boş id riski getirir. v4 bu ölçekte index açısından sorun değil.
- Tipli EAV kolonları filtreleme ve sıralamada (`value_number` aralığı, `option_id` eşitliği) index kullanabilir; JSONB tip doğrulamasını uygulamaya bırakır.
- Postgres düz unique'te NULL'ları ayrık sayar; `NULLS NOT DISTINCT` olmadan genel yüzde satırı çoğalabilir ve seed idempotent olmaz.
- Ters `many` ilişkisi için `catalog`'un `inventory`/`pricing` şemasını import etmesi gerekir; bu modül bağımlılık yönünü (CONVENTIONS) bozar.
- drizzle-kit enum ve FK'leri `"public".` ile niteler; `search_path` ile `test_` şeması izolasyonu çalışmaz.

## İleride
PostgreSQL 18'e geçişte `uuidv7()` varsayılanı değerlendirilir (yeni satırlar için; mevcut id'ler değişmez). Auth.js adapter tabloları (`account`, `verification_token`) auth spec'inde gerekirse eklenir.
