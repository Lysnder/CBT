import { randomBytes, scryptSync } from 'node:crypto';
import { EnvError, getEnv } from '@cbt/config/env';
import type { Db } from '../src/client';
import { role, user, userRole } from '../src/schema/index';

export const SEED_USERS = {
  admin: 'admin@cbt.local',
  dealer: 'bayi@cbt.local',
  retail: 'musteri@cbt.local',
} as const;

const SCRYPT = { N: 16384, r: 8, p: 1, keyLength: 64 };

// Biçim: scrypt$N$r$p$salt$hash (base64). Auth modülü doğrulamayı aynı biçimle yapar (ADR-004).
function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, SCRYPT.keyLength, SCRYPT);
  return [
    'scrypt',
    SCRYPT.N,
    SCRYPT.r,
    SCRYPT.p,
    salt.toString('base64'),
    hash.toString('base64'),
  ].join('$');
}

export async function seedRoles(db: Db): Promise<void> {
  const adminPassword = getEnv().SEED_ADMIN_PASSWORD;
  if (!adminPassword) throw new EnvError(['SEED_ADMIN_PASSWORD']);

  await db
    .insert(role)
    .values([
      { code: 'admin', name: 'Yönetici' },
      { code: 'customer', name: 'Müşteri' },
      { code: 'dealer', name: 'Bayi' },
    ])
    .onConflictDoNothing();

  await db
    .insert(user)
    .values([
      { email: SEED_USERS.admin, name: 'Admin', passwordHash: hashPassword(adminPassword) },
      { email: SEED_USERS.dealer, name: 'Örnek Bayi Kullanıcısı' },
      { email: SEED_USERS.retail, name: 'Örnek Müşteri' },
    ])
    .onConflictDoNothing();

  const roleIds = new Map((await db.select().from(role)).map((r) => [r.code, r.id]));
  const userIds = new Map((await db.select().from(user)).map((u) => [u.email, u.id]));

  await db
    .insert(userRole)
    .values([
      { userId: userIds.get(SEED_USERS.admin)!, roleId: roleIds.get('admin')! },
      { userId: userIds.get(SEED_USERS.dealer)!, roleId: roleIds.get('dealer')! },
      { userId: userIds.get(SEED_USERS.retail)!, roleId: roleIds.get('customer')! },
    ])
    .onConflictDoNothing();
}
