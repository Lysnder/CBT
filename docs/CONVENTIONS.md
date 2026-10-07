# CONVENTIONS — kod kuralları

## Yapı
- Monorepo: `apps/` (çalışan uygulamalar), `packages/` (paylaşılan kod). İş mantığı yalnızca `packages/modules/`.
- Her modül: `schema.ts` (Drizzle tabloları) · `service.ts` (iş mantığı, saf fonksiyonlar) · `routes.ts` (Zod şemaları + handler'lar) · `index.ts` (public API; sadece buradan import edilir) · `README.md` · `tests/`.
- Modüller birbirini yalnızca `index.ts` üzerinden çağırır. Döngüsel bağımlılık yasak (`catalog` ← `pricing` ← `orders`; tersi yok).

## İsimlendirme
- Dosya: kebab-case. Tip/sınıf/bileşen: PascalCase. Fonksiyon/değişken: camelCase. DB tablo/kolon: snake_case.
- Boolean: `is_`/`has_` öneki. Para kolonları `_cents` soneki. Zaman kolonları `_at` soneki (timestamptz, UTC).
- Her tabloda `id` (uuid v7), `created_at`, `updated_at`. Silinebilir kayıtlarda `deleted_at` (soft delete).

## Veri
- Para: tamsayı kuruş + `currency` kolonu (ISO 4217). Hesaplar `Dinero.js` veya elle tamsayı; float asla.
- Yüzdeler: 0–100 arası `numeric(5,2)`.
- Çeviri: `<tablo>_translation` (locale, alan…). Varsayılan locale `tr`; `en` yoksa `tr`'ye düşer.
- JSONB yalnızca attribute değerleri ve dış servis ham cevapları için.

## Doğrulama ve hata
- Tüm dış girdiler (form, API, webhook, CSV) `Zod` ile doğrulanır; şema `routes.ts`'te, tip `z.infer` ile türetilir.
- Hata: `AppError(code: string, message: string, status: number)`. Kodlar `UPPER_SNAKE` (`PRICE_NOT_FOUND`). Kullanıcıya gösterilen mesajlar i18n anahtarı.
- Dış servis çağrıları (POS, kargo, kur) adaptör arayüzü arkasında: `PaymentProvider`, `ShippingProvider`, `RateProvider`. Test için `Fake*` uygulaması.

## Test
- Vitest. Her modül kendi `tests/`; servis fonksiyonları birim test, route'lar entegrasyon (test DB: `docker compose` içindeki Postgres, ayrı `cbt_test` veritabanı).
- Kritik hesaplar için tablo tabanlı test: `resolveDealerPrice`, `pickWarehouse`, KDV hesabı.
- Playwright: yalnızca checkout ve admin ürün ekleme akışı (Faz 1).

## Git
- Branch: `feat/NNN-kisa-ad` (spec numarası). Commit: `feat(pricing): indirim matrisi hesabı (#004)`.
- Küçük commit; bir spec = bir PR. `main` korumalı, CI yeşil olmadan merge yok.

## Güvenlik
- Gizli değerler yalnızca `.env`; `packages/config/env.ts` açılışta doğrular.
- Kart verisi sunucuya gelmez (POS hosted form). Webhook'lar imza doğrulamalı.
- Admin route'ları `requireRole('admin')`; bayi route'ları `requireRole('dealer')` + firma onayı kontrolü.
- Yükleme: MIME + boyut kontrolü, `sharp` ile yeniden işleme, rastgele dosya adı.

## Claude Code ile çalışma
- Görev = spec. Spec yoksa önce spec.
- Bir oturum = bir spec. Bitince `/clear`.
- Arama gerekiyorsa Explore subagent; ana bağlama dosya dökme yok.
- Çıktılar kısa: `pnpm test <yol> 2>&1 | tail -40`.
