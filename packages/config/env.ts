import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
  MEILI_HOST: z.url(),
  MEILI_MASTER_KEY: z.string().min(16),
  AUTH_SECRET: z.string().min(32),
  NEXT_PUBLIC_SITE_URL: z.url(),
  DEFAULT_LOCALE: z.enum(['tr', 'en']).default('tr'),
  BASE_CURRENCY: z.string().length(3).default('TRY'),
  // Yalnızca `pnpm db:seed` kullanır; uygulama açılışı için zorunlu değil.
  SEED_ADMIN_PASSWORD: z.string().min(12).optional(),
});

export type Env = z.infer<typeof envSchema>;

export class EnvError extends Error {
  readonly code = 'ENV_INVALID';

  constructor(readonly variables: string[]) {
    super(
      `Ortam değişkenleri eksik veya hatalı: ${variables.join(', ')}. ` +
        '`.env.example` dosyasını `.env` olarak kopyalayıp değerleri doldurun.',
    );
    this.name = 'EnvError';
  }
}

// Hata mesajına yalnızca değişken adları girer; değerler asla loglanmaz.
export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const variables = [...new Set(result.error.issues.map((issue) => String(issue.path[0])))];
    throw new EnvError(variables);
  }
  return result.data;
}

function findRepoRoot(start: string): string | undefined {
  let dir = start;
  for (;;) {
    if (existsSync(join(dir, 'pnpm-workspace.yaml'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return undefined;
    dir = parent;
  }
}

function loadRootEnvFile(): void {
  const root = findRepoRoot(process.cwd());
  if (!root) return;
  const file = join(root, '.env');
  if (existsSync(file)) process.loadEnvFile(file);
}

let cached: Env | undefined;

// Uygulamalar açılışta çağırır; kökteki `.env` yüklenir, eksik değişkende EnvError fırlar.
export function getEnv(): Env {
  if (!cached) {
    loadRootEnvFile();
    cached = parseEnv(process.env);
  }
  return cached;
}
