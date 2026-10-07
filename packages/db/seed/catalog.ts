import type { Db } from '../src/client';
import {
  attribute,
  attributeOption,
  attributeSet,
  category,
  categoryTranslation,
  inventoryLevel,
  product,
  productAttributeValue,
  productTranslation,
  productVariant,
  productVariantOption,
  warehouse,
} from '../src/schema/index';

type AttributeType = (typeof attribute.$inferInsert)['type'];

const ATTRIBUTE_SETS: {
  code: string;
  name: string;
  attributes: {
    code: string;
    name: string;
    type: AttributeType;
    unit?: string;
    isFilterable?: boolean;
    options?: string[];
  }[];
}[] = [
  {
    code: 'pc-case',
    name: 'Bilgisayar Kasası',
    attributes: [
      {
        code: 'form_factor',
        name: 'Form Faktörü',
        type: 'select',
        isFilterable: true,
        options: ['ATX', 'mATX', 'ITX'],
      },
      { code: 'max_gpu_length_mm', name: 'Maks. Ekran Kartı Uzunluğu', type: 'number', unit: 'mm' },
      { code: 'has_rgb', name: 'RGB', type: 'boolean', isFilterable: true },
      // Varyant ekseni (product_variant_option).
      {
        code: 'color',
        name: 'Renk',
        type: 'select',
        isFilterable: true,
        options: ['Siyah', 'Beyaz'],
      },
    ],
  },
  {
    code: 'liquid-cooler',
    name: 'Sıvı Soğutucu',
    attributes: [
      {
        code: 'radiator_mm',
        name: 'Radyatör Boyutu',
        type: 'select',
        unit: 'mm',
        isFilterable: true,
        options: ['120', '240', '360'],
      },
      { code: 'socket', name: 'Soket Uyumu', type: 'text' },
    ],
  },
];

const CATEGORIES: { slug: string; parent?: string; tr: string; en: string }[] = [
  { slug: 'bilgisayar-bilesenleri', tr: 'Bilgisayar Bileşenleri', en: 'Computer Components' },
  { slug: 'kasa', parent: 'bilgisayar-bilesenleri', tr: 'Kasa', en: 'Cases' },
  { slug: 'sogutma', parent: 'bilgisayar-bilesenleri', tr: 'Soğutma', en: 'Cooling' },
  { slug: 'sivi-sogutucu', parent: 'sogutma', tr: 'Sıvı Soğutucu', en: 'Liquid Coolers' },
];

type SeedProduct = {
  sku: string;
  slug: string;
  category: string;
  attributeSet: string;
  listPriceCents: number;
  tr: string;
  en: string;
  values: Record<string, string | number | boolean>;
  colors?: string[];
};

type SeedVariant = {
  product: SeedProduct;
  sku: string;
  name: string;
  color?: string;
  sortOrder: number;
};

const COLOR_SKU_SUFFIX: Record<string, string> = { Siyah: 'BK', Beyaz: 'WH' };

const PRODUCTS: SeedProduct[] = [
  {
    sku: 'CASE-ATX-001',
    slug: 'aero-atx-kasa',
    category: 'kasa',
    attributeSet: 'pc-case',
    listPriceCents: 2_499_00,
    tr: 'Aero ATX Kasa',
    en: 'Aero ATX Case',
    values: { form_factor: 'ATX', max_gpu_length_mm: 400, has_rgb: true },
    colors: ['Siyah', 'Beyaz'],
  },
  {
    sku: 'CASE-ATX-002',
    slug: 'titan-atx-kasa',
    category: 'kasa',
    attributeSet: 'pc-case',
    listPriceCents: 3_299_00,
    tr: 'Titan ATX Kasa',
    en: 'Titan ATX Case',
    values: { form_factor: 'ATX', max_gpu_length_mm: 420, has_rgb: false },
    colors: ['Siyah', 'Beyaz'],
  },
  {
    sku: 'CASE-ATX-003',
    slug: 'nova-atx-kasa',
    category: 'kasa',
    attributeSet: 'pc-case',
    listPriceCents: 1_899_00,
    tr: 'Nova ATX Kasa',
    en: 'Nova ATX Case',
    values: { form_factor: 'ATX', max_gpu_length_mm: 380, has_rgb: true },
  },
  {
    sku: 'CASE-MATX-001',
    slug: 'cube-matx-kasa',
    category: 'kasa',
    attributeSet: 'pc-case',
    listPriceCents: 1_499_00,
    tr: 'Cube mATX Kasa',
    en: 'Cube mATX Case',
    values: { form_factor: 'mATX', max_gpu_length_mm: 350, has_rgb: false },
  },
  {
    sku: 'CASE-MATX-002',
    slug: 'prism-matx-kasa',
    category: 'kasa',
    attributeSet: 'pc-case',
    listPriceCents: 1_749_00,
    tr: 'Prism mATX Kasa',
    en: 'Prism mATX Case',
    values: { form_factor: 'mATX', max_gpu_length_mm: 360, has_rgb: true },
  },
  {
    sku: 'CASE-ITX-001',
    slug: 'mini-itx-kasa',
    category: 'kasa',
    attributeSet: 'pc-case',
    listPriceCents: 2_199_00,
    tr: 'Mini ITX Kasa',
    en: 'Mini ITX Case',
    values: { form_factor: 'ITX', max_gpu_length_mm: 330, has_rgb: false },
  },
  {
    sku: 'LC-120-001',
    slug: 'frost-120-sivi-sogutucu',
    category: 'sivi-sogutucu',
    attributeSet: 'liquid-cooler',
    listPriceCents: 1_799_00,
    tr: 'Frost 120 Sıvı Soğutucu',
    en: 'Frost 120 Liquid Cooler',
    values: { radiator_mm: '120', socket: 'AM4, AM5, LGA1700' },
  },
  {
    sku: 'LC-240-001',
    slug: 'frost-240-sivi-sogutucu',
    category: 'sivi-sogutucu',
    attributeSet: 'liquid-cooler',
    listPriceCents: 2_899_00,
    tr: 'Frost 240 Sıvı Soğutucu',
    en: 'Frost 240 Liquid Cooler',
    values: { radiator_mm: '240', socket: 'AM4, AM5, LGA1700' },
  },
  {
    sku: 'LC-240-002',
    slug: 'glacier-240-sivi-sogutucu',
    category: 'sivi-sogutucu',
    attributeSet: 'liquid-cooler',
    listPriceCents: 3_499_00,
    tr: 'Glacier 240 Sıvı Soğutucu',
    en: 'Glacier 240 Liquid Cooler',
    values: { radiator_mm: '240', socket: 'AM5, LGA1700, LGA1851' },
  },
  {
    sku: 'LC-360-001',
    slug: 'glacier-360-sivi-sogutucu',
    category: 'sivi-sogutucu',
    attributeSet: 'liquid-cooler',
    listPriceCents: 4_599_00,
    tr: 'Glacier 360 Sıvı Soğutucu',
    en: 'Glacier 360 Liquid Cooler',
    values: { radiator_mm: '360', socket: 'AM5, LGA1700, LGA1851' },
  },
];

// Depo önceliğine göre başlangıç stoğu.
const ON_HAND_BY_PRIORITY: Record<number, number> = { 1: 20, 2: 10 };

async function seedAttributes(db: Db) {
  await db
    .insert(attributeSet)
    .values(ATTRIBUTE_SETS.map(({ code, name }) => ({ code, name })))
    .onConflictDoNothing();
  const setIds = new Map((await db.select().from(attributeSet)).map((s) => [s.code, s.id]));

  await db
    .insert(attribute)
    .values(
      ATTRIBUTE_SETS.flatMap((set) =>
        set.attributes.map((a, sortOrder) => ({
          attributeSetId: setIds.get(set.code)!,
          code: a.code,
          name: a.name,
          type: a.type,
          unit: a.unit,
          isFilterable: a.isFilterable ?? false,
          sortOrder,
        })),
      ),
    )
    .onConflictDoNothing();

  const setCodes = new Map([...setIds].map(([code, id]) => [id, code]));
  const attributes = new Map(
    (await db.select().from(attribute)).map((a) => [
      `${setCodes.get(a.attributeSetId)}/${a.code}`,
      a,
    ]),
  );

  await db
    .insert(attributeOption)
    .values(
      ATTRIBUTE_SETS.flatMap((set) =>
        set.attributes.flatMap((a) =>
          (a.options ?? []).map((value, sortOrder) => ({
            attributeId: attributes.get(`${set.code}/${a.code}`)!.id,
            value,
            sortOrder,
          })),
        ),
      ),
    )
    .onConflictDoNothing();
  const optionIds = new Map(
    (await db.select().from(attributeOption)).map((o) => [`${o.attributeId}/${o.value}`, o.id]),
  );

  return { setIds, attributes, optionIds };
}

async function seedCategories(db: Db) {
  const ids = new Map<string, string>();
  // Üstten alta sırayla; her satırın parent'ı kendinden önce eklenmiş olur.
  for (const [sortOrder, c] of CATEGORIES.entries()) {
    await db
      .insert(category)
      .values({ slug: c.slug, parentId: c.parent ? ids.get(c.parent)! : null, sortOrder })
      .onConflictDoNothing();
    for (const row of await db.select().from(category)) ids.set(row.slug, row.id);
  }

  await db
    .insert(categoryTranslation)
    .values(
      CATEGORIES.flatMap((c) => [
        { categoryId: ids.get(c.slug)!, locale: 'tr', name: c.tr },
        { categoryId: ids.get(c.slug)!, locale: 'en', name: c.en },
      ]),
    )
    .onConflictDoNothing();

  return ids;
}

export async function seedCatalog(db: Db): Promise<void> {
  const { setIds, attributes, optionIds } = await seedAttributes(db);
  const categoryIds = await seedCategories(db);

  await db
    .insert(product)
    .values(
      PRODUCTS.map((p) => ({
        sku: p.sku,
        slug: p.slug,
        categoryId: categoryIds.get(p.category)!,
        attributeSetId: setIds.get(p.attributeSet)!,
        brand: 'CBT',
        listPriceCents: p.listPriceCents,
        status: 'active' as const,
        hasVariants: Boolean(p.colors),
      })),
    )
    .onConflictDoNothing();
  const productIds = new Map((await db.select().from(product)).map((p) => [p.sku, p.id]));

  await db
    .insert(productTranslation)
    .values(
      PRODUCTS.flatMap((p) => [
        { productId: productIds.get(p.sku)!, locale: 'tr', name: p.tr },
        { productId: productIds.get(p.sku)!, locale: 'en', name: p.en },
      ]),
    )
    .onConflictDoNothing();

  await db
    .insert(productAttributeValue)
    .values(
      PRODUCTS.flatMap((p) =>
        Object.entries(p.values).map(([code, value]) => {
          const attr = attributes.get(`${p.attributeSet}/${code}`)!;
          return {
            productId: productIds.get(p.sku)!,
            attributeId: attr.id,
            valueText: attr.type === 'text' ? String(value) : null,
            valueNumber: attr.type === 'number' ? String(value) : null,
            valueBool: attr.type === 'boolean' ? Boolean(value) : null,
            optionId: attr.type === 'select' ? optionIds.get(`${attr.id}/${value}`)! : null,
          };
        }),
      ),
    )
    .onConflictDoNothing();

  // Varyantsız ürün = tek varyant (sku = product.sku).
  const variants = PRODUCTS.flatMap<SeedVariant>((p) =>
    p.colors
      ? p.colors.map((color, sortOrder) => ({
          product: p,
          sku: `${p.sku}-${COLOR_SKU_SUFFIX[color]}`,
          name: `${p.tr} - ${color}`,
          color,
          sortOrder,
        }))
      : [{ product: p, sku: p.sku, name: p.tr, color: undefined, sortOrder: 0 }],
  );

  await db
    .insert(productVariant)
    .values(
      variants.map((v) => ({
        productId: productIds.get(v.product.sku)!,
        sku: v.sku,
        name: v.name,
        sortOrder: v.sortOrder,
      })),
    )
    .onConflictDoNothing();
  const variantIds = new Map((await db.select().from(productVariant)).map((v) => [v.sku, v.id]));

  await db
    .insert(productVariantOption)
    .values(
      variants
        .filter((v) => v.color)
        .map((v) => {
          const colorAttr = attributes.get(`${v.product.attributeSet}/color`)!;
          return {
            variantId: variantIds.get(v.sku)!,
            attributeId: colorAttr.id,
            optionId: optionIds.get(`${colorAttr.id}/${v.color}`)!,
          };
        }),
    )
    .onConflictDoNothing();

  const warehouses = await db.select().from(warehouse);
  await db
    .insert(inventoryLevel)
    .values(
      variants.flatMap((v) =>
        warehouses.map((w) => ({
          variantId: variantIds.get(v.sku)!,
          warehouseId: w.id,
          onHand: ON_HAND_BY_PRIORITY[w.priority] ?? 0,
        })),
      ),
    )
    .onConflictDoNothing();
}
