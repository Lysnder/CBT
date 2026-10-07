import type { Db } from '../src/client';
import { company, companyUser, customer, customerGroup, tier, user } from '../src/schema/index';
import { SEED_USERS } from './roles';

const DEALER_TAX_NUMBER = '1234567890';

export async function seedGroups(db: Db): Promise<void> {
  await db
    .insert(customerGroup)
    .values([
      {
        code: 'retail',
        name: 'Bireysel',
        showVatIncluded: true,
        allowedPaymentMethods: ['card', 'bank_transfer'],
      },
      {
        code: 'dealer',
        name: 'Bayi',
        showVatIncluded: false,
        allowedPaymentMethods: ['card', 'bank_transfer', 'credit'],
      },
    ])
    .onConflictDoNothing();

  const groupIds = new Map((await db.select().from(customerGroup)).map((g) => [g.code, g.id]));
  const tierIds = new Map((await db.select().from(tier)).map((t) => [t.code, t.id]));
  const userIds = new Map((await db.select().from(user)).map((u) => [u.email, u.id]));

  await db
    .insert(company)
    .values({
      name: 'Örnek Bilişim Ltd. Şti.',
      taxNumber: DEALER_TAX_NUMBER,
      taxOffice: 'Kadıköy',
      tierId: tierIds.get('gold')!,
      status: 'approved',
      creditLimitCents: 50_000_00,
      paymentTermDays: 30,
    })
    .onConflictDoNothing();

  const companyIds = new Map((await db.select().from(company)).map((c) => [c.taxNumber, c.id]));
  const dealerCompanyId = companyIds.get(DEALER_TAX_NUMBER)!;
  const dealerUserId = userIds.get(SEED_USERS.dealer)!;

  await db
    .insert(companyUser)
    .values({ companyId: dealerCompanyId, userId: dealerUserId, role: 'owner' })
    .onConflictDoNothing();

  await db
    .insert(customer)
    .values([
      {
        userId: dealerUserId,
        customerGroupId: groupIds.get('dealer')!,
        companyId: dealerCompanyId,
      },
      { userId: userIds.get(SEED_USERS.retail)!, customerGroupId: groupIds.get('retail')! },
    ])
    .onConflictDoNothing();
}
