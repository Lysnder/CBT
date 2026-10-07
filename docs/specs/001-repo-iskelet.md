# 001 · Repo iskeleti ve lokal geliştirme ortamı

Modül: tümü (iskelet) · Faz: 0 · Tahmin: 1–2 gün
Dokunulacak: kök dosyalar, `apps/web`, `apps/worker`, `packages/*` klasör iskeleti, `infra/docker-compose.yml`
Dokunulmayacak: iş mantığı, şema içeriği (bunlar 002'de), CI/CD (003'te)

## Amaç
pnpm monorepo kurulur; `docker compose up` + `pnpm dev` ile boş bir Next.js sayfası ve çalışan bir worker ayağa kalkar. Her modül klasörü README'si ile yerinde durur ama içi boştur.

## Adımlar
1. `pnpm init` + `pnpm-workspace.yaml` (`apps/*`, `packages/*`). Node 22, pnpm 9. `.nvmrc` ekle.
2. `packages/config`: ortak `tsconfig.base.json` (strict, paths), `eslint.config.js`, `tailwind.preset.ts`, `env.ts` (Zod ile `process.env` doğrulama; eksik değişkende açılışta hata).
3. `apps/web`: `create-next-app` (TypeScript, App Router, Tailwind, src dizini, import alias `@/`). shadcn/ui init. Route grupları: `(store)`, `(admin)`, `api`. Anasayfa "Kurulum tamam" yazsın; `/admin` sayfası "Admin" yazsın.
4. `apps/worker`: tek `index.ts`; BullMQ bağlanır, `ping` kuyruğunu dinler, log yazar. `tsx watch` ile çalışır.
5. `packages/db`: Drizzle client (`postgres-js`), `drizzle.config.ts`, boş `schema/index.ts` (modül şemalarını re-export edecek), `migrate.ts`, `seed/index.ts` (boş).
6. `packages/modules/<her modül>/`: MAP.md'deki 14 modül için klasör + `README.md` (şablon aşağıda) + boş `index.ts`. Başka dosya yok.
7. `packages/ui`: shadcn bileşenleri buraya taşınır; `apps/web` buradan import eder.
8. `infra/docker-compose.yml`: `postgres:16`, `redis:7`, `getmeili/meilisearch:v1.x`; named volume'lar; sağlık kontrolleri. Portlar: 5432, 6379, 7700.
9. `.env.example`: DATABASE_URL, REDIS_URL, MEILI_HOST, MEILI_MASTER_KEY, AUTH_SECRET, NEXT_PUBLIC_SITE_URL, DEFAULT_LOCALE=tr, BASE_CURRENCY=TRY.
10. Kök `package.json` scriptleri: `dev` (web + worker paralel), `test`, `lint`, `db:generate`, `db:migrate`, `db:seed`, `typecheck`.
11. `.claudeignore`, `.gitignore`, `.editorconfig`, `.prettierrc`.
12. Vitest kurulumu (kökte `vitest.workspace.ts`); örnek bir test `packages/config/env.test.ts` geçsin.

## Modül README şablonu
```markdown
# <modül>
Ne yapar: (1–2 cümle)
Public API (index.ts): (fonksiyon listesi; henüz yoksa "—")
Bağımlı olduğu modüller: (liste)
Tablolar: (liste)
Durum: Faz N · boş / şema var / servis var / UI var
```

## Kabul kriterleri
- [ ] `docker compose up -d` sonrası üç servis `healthy`
- [ ] `pnpm dev` → http://localhost:3000 "Kurulum tamam", /admin "Admin"
- [ ] Worker konsola "worker ready" yazar; Redis'e `ping` işi eklenince "pong" loglar
- [ ] `pnpm lint` ve `pnpm typecheck` hatasız
- [ ] `pnpm test` tek örnek testi geçer
- [ ] 14 modül klasörü README ile mevcut
- [ ] `.env` yokken uygulama açılışta anlamlı hata verir (env.ts)
- [ ] `docs/MAP.md` gerçek klasör yapısıyla birebir uyuşur

## Notlar
- Hiçbir modüle şema veya iş mantığı yazılmaz; bu spec sadece iskelet.
- Paket sürümleri sabitlenir (`^` yok), pnpm lock commit'lenir.
