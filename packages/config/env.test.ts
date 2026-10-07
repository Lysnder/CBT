import { describe, expect, it } from 'vitest';
import { EnvError, parseEnv } from './env';

const valid = {
  DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
  REDIS_URL: 'redis://localhost:6379',
  MEILI_HOST: 'http://localhost:7700',
  MEILI_MASTER_KEY: 'test_master_key_0123456789',
  AUTH_SECRET: 'test_auth_secret_0123456789_0123456789',
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
};

describe('parseEnv', () => {
  it('geçerli ortamı çözer ve varsayılanları uygular', () => {
    const env = parseEnv(valid);
    expect(env.DATABASE_URL).toBe(valid.DATABASE_URL);
    expect(env.DEFAULT_LOCALE).toBe('tr');
    expect(env.BASE_CURRENCY).toBe('TRY');
  });

  it('eksik değişkende adını içeren EnvError fırlatır', () => {
    const { DATABASE_URL: _omitted, ...rest } = valid;
    expect(() => parseEnv(rest)).toThrowError(EnvError);
    expect(() => parseEnv(rest)).toThrowError(/DATABASE_URL/);
  });

  it('hata mesajına değişken değerini yazmaz', () => {
    try {
      parseEnv({ ...valid, AUTH_SECRET: 'kisa-gizli' });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(EnvError);
      expect((error as EnvError).variables).toEqual(['AUTH_SECRET']);
      expect((error as EnvError).message).not.toContain('kisa-gizli');
    }
  });
});
