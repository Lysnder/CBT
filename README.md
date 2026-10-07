# CBT
CBT Teknoloji E-Ticaret Sitesi

## Lokal kurulum
Gerekenler: Node 22 (`.nvmrc`), pnpm 9 (`corepack enable`), Docker.

```
cp .env.example .env
docker compose -f infra/docker-compose.yml up -d   # postgres, redis, meilisearch
pnpm install
pnpm dev                                           # web :3000 + worker
```

- http://localhost:3000 → "Kurulum tamam", `/admin` → "Admin".
- Worker "worker ready" yazar; `pnpm --filter worker ping` → "pong".
- `pnpm lint` · `pnpm typecheck` · `pnpm test <yol>`.

Yapı ve modüller: `docs/MAP.md`. Kurallar: `docs/CONVENTIONS.md`.
