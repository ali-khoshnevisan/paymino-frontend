// SAMPLE CATALOG for the mock API.
// Every price, rate and product below is placeholder data for frontend development.
// The real catalog will be managed in Django admin.

import type { Category, Product, ProductVariant, Provider, RequiredField } from '#shared/types'

// Sample conversion rates (Toman per unit of foreign currency) — placeholders only.
const SAMPLE_FX: Record<string, number> = { USD: 105_000, EUR: 114_000, GBP: 133_000 }
const SAMPLE_MARGIN = 1.06

function roundToman(n: number) {
  return Math.round(n / 1000) * 1000
}

function giftVariants(prefix: string, currency: string, values: number[], region: string, unavailable: number[] = []): ProductVariant[] {
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'
  return values.map((v) => ({
    id: `${prefix}-${v}`,
    label: `${symbol}${v}`,
    faceValue: v,
    faceCurrency: currency,
    region,
    priceToman: roundToman(v * SAMPLE_FX[currency]! * SAMPLE_MARGIN),
    available: !unavailable.includes(v),
  }))
}

function planVariant(id: string, label: string, months: number, usd: number, region = 'جهانی'): ProductVariant {
  return {
    id,
    label,
    durationMonths: months,
    region,
    priceToman: roundToman(usd * SAMPLE_FX.USD! * SAMPLE_MARGIN),
    available: true,
  }
}

const accountEmailField: RequiredField = {
  key: 'account_email',
  label: 'ایمیل حساب کاربری سرویس',
  type: 'email',
  placeholder: 'name@example.com',
  help: 'ایمیلی که با آن در این سرویس ثبت‌نام کرده‌اید. رمز عبور حساب هرگز از شما خواسته نمی‌شود.',
  required: true,
}

const giftCardRefund =
  'به دلیل ماهیت دیجیتال، کد گیفت کارت پس از ارسال قابل بازگشت نیست. اگر پیش از ارسال کد امکان تأمین سفارش وجود نداشته باشد، طبق قوانین بازپرداخت پی‌مینو اقدام می‌شود.'
const serviceRefund =
  'اگر پیش از شروع انجام سفارش درخواست لغو بدهید یا انجام سفارش ممکن نباشد، طبق قوانین بازپرداخت پی‌مینو اقدام می‌شود. پس از فعال‌سازی اشتراک، امکان لغو وجود ندارد.'

export const providers: Provider[] = [
  { slug: 'steam', name: 'Steam', categorySlug: 'steam' },
  { slug: 'apple', name: 'Apple', categorySlug: 'apple' },
  { slug: 'playstation', name: 'PlayStation', categorySlug: 'playstation' },
  { slug: 'tradingview', name: 'TradingView', categorySlug: 'tradingview' },
  { slug: 'openai', name: 'OpenAI', categorySlug: 'ai' },
  { slug: 'perplexity', name: 'Perplexity', categorySlug: 'ai' },
  { slug: 'midjourney', name: 'Midjourney', categorySlug: 'ai' },
]

const categoryMeta: Omit<Category, 'productCount'>[] = [
  { slug: 'steam', name: 'گیفت کارت استیم', description: 'شارژ کیف پول استیم برای خرید بازی و آیتم', icon: 'steam' },
  { slug: 'apple', name: 'گیفت کارت اپل', description: 'اعتبار اپ استور، اپل موزیک و iCloud', icon: 'apple' },
  { slug: 'playstation', name: 'گیفت کارت پلی‌استیشن', description: 'اعتبار PlayStation Store برای بازی و اشتراک', icon: 'playstation' },
  { slug: 'tradingview', name: 'اشتراک تریدینگ‌ویو', description: 'فعال‌سازی پلن‌های حرفه‌ای تحلیل بازار', icon: 'tradingview' },
  { slug: 'ai', name: 'سرویس‌های هوش مصنوعی', description: 'اشتراک دستیارها و ابزارهای هوش مصنوعی', icon: 'ai' },
]

interface SeedProduct extends Product {
  popularity: number
}

const giftNotesCommon = [
  'کد پس از تأیید پرداخت در بخش «سفارش‌های من» نمایش داده می‌شود.',
  'پیش از خرید، کشور یا منطقه حساب خود را بررسی کنید.',
]

const seed: SeedProduct[] = [
  {
    id: 'p_steam_us',
    slug: 'steam-wallet-usd',
    name: 'گیفت کارت استیم آمریکا',
    brandName: 'Steam Wallet Gift Card (USD)',
    categorySlug: 'steam',
    providerSlug: 'steam',
    type: 'gift_card',
    shortDescription: 'شارژ کیف پول استیم با واحد دلار آمریکا',
    description:
      'با این گیفت کارت می‌توانید کیف پول حساب استیم خود را شارژ کنید و از آن برای خرید بازی، DLC و آیتم‌های بازار استیم استفاده کنید.',
    imageUrl: null,
    regions: ['ایالات متحده'],
    restrictions: [
      'فقط برای حساب‌هایی که واحد پول کیف پولشان دلار آمریکا (USD) است قابل استفاده است.',
      'پس از ثبت کد، اعتبار قابل انتقال به حساب دیگر نیست.',
    ],
    redemptionNotes: [...giftNotesCommon, 'برای ثبت کد: Steam ← Games ← Redeem a Steam Wallet Code'],
    deliveryMethod: 'ارسال کد دیجیتال در پنل کاربری',
    fulfillmentEstimate: null,
    refundPolicy: giftCardRefund,
    requiredFields: [],
    maxQuantityPerItem: 5,
    variants: giftVariants('steam-us', 'USD', [5, 10, 20, 50, 100], 'ایالات متحده'),
    available: true,
    createdAt: '2026-06-01T08:00:00Z',
    popularity: 98,
  },
  {
    id: 'p_steam_eu',
    slug: 'steam-wallet-eur',
    name: 'گیفت کارت استیم اروپا',
    brandName: 'Steam Wallet Gift Card (EUR)',
    categorySlug: 'steam',
    providerSlug: 'steam',
    type: 'gift_card',
    shortDescription: 'شارژ کیف پول استیم با واحد یورو',
    description: 'مناسب حساب‌های استیم با واحد پول یورو. برای خرید بازی و آیتم در فروشگاه استیم.',
    imageUrl: null,
    regions: ['اتحادیه اروپا'],
    restrictions: ['فقط برای حساب‌هایی که واحد پول کیف پولشان یورو (EUR) است قابل استفاده است.'],
    redemptionNotes: giftNotesCommon,
    deliveryMethod: 'ارسال کد دیجیتال در پنل کاربری',
    fulfillmentEstimate: null,
    refundPolicy: giftCardRefund,
    requiredFields: [],
    maxQuantityPerItem: 5,
    variants: giftVariants('steam-eu', 'EUR', [5, 10, 20, 50, 100], 'اتحادیه اروپا', [100]),
    available: true,
    createdAt: '2026-07-10T08:00:00Z',
    popularity: 70,
  },
  {
    id: 'p_apple_us',
    slug: 'apple-gift-card-usd',
    name: 'گیفت کارت اپل آمریکا',
    brandName: 'Apple Gift Card (US)',
    categorySlug: 'apple',
    providerSlug: 'apple',
    type: 'gift_card',
    shortDescription: 'اعتبار اپل آیدی آمریکا برای اپ استور و سرویس‌های اپل',
    description:
      'اعتبار این کارت به Apple ID اضافه می‌شود و برای خرید از App Store، اشتراک iCloud+، Apple Music و سایر سرویس‌های اپل قابل استفاده است.',
    imageUrl: null,
    regions: ['ایالات متحده'],
    restrictions: [
      'کشور یا منطقه Apple ID شما باید ایالات متحده باشد؛ در غیر این صورت کد ثبت نمی‌شود.',
      'اعتبار ثبت‌شده قابل انتقال یا تبدیل به وجه نقد نیست.',
    ],
    redemptionNotes: [...giftNotesCommon, 'برای ثبت کد: App Store ← حساب کاربری ← Redeem Gift Card or Code'],
    deliveryMethod: 'ارسال کد دیجیتال در پنل کاربری',
    fulfillmentEstimate: null,
    refundPolicy: giftCardRefund,
    requiredFields: [],
    maxQuantityPerItem: 5,
    variants: giftVariants('apple-us', 'USD', [10, 25, 50, 100], 'ایالات متحده'),
    available: true,
    createdAt: '2026-05-20T08:00:00Z',
    popularity: 95,
  },
  {
    id: 'p_apple_uk',
    slug: 'apple-gift-card-gbp',
    name: 'گیفت کارت اپل انگلستان',
    brandName: 'Apple Gift Card (UK)',
    categorySlug: 'apple',
    providerSlug: 'apple',
    type: 'gift_card',
    shortDescription: 'اعتبار اپل آیدی انگلستان با واحد پوند',
    description: 'برای Apple IDهایی با منطقه بریتانیا. قابل استفاده در App Store و سرویس‌های اپل.',
    imageUrl: null,
    regions: ['بریتانیا'],
    restrictions: ['کشور یا منطقه Apple ID شما باید بریتانیا باشد.'],
    redemptionNotes: giftNotesCommon,
    deliveryMethod: 'ارسال کد دیجیتال در پنل کاربری',
    fulfillmentEstimate: null,
    refundPolicy: giftCardRefund,
    requiredFields: [],
    maxQuantityPerItem: 5,
    variants: giftVariants('apple-uk', 'GBP', [10, 25, 50], 'بریتانیا'),
    available: true,
    createdAt: '2026-08-02T08:00:00Z',
    popularity: 52,
  },
  {
    id: 'p_psn_us',
    slug: 'playstation-gift-card-usd',
    name: 'گیفت کارت پلی‌استیشن آمریکا',
    brandName: 'PlayStation Store Gift Card (US)',
    categorySlug: 'playstation',
    providerSlug: 'playstation',
    type: 'gift_card',
    shortDescription: 'اعتبار PlayStation Store برای حساب‌های آمریکا',
    description:
      'اعتبار کیف پول حساب PlayStation Network برای خرید بازی، افزودنی‌ها و اشتراک PlayStation Plus.',
    imageUrl: null,
    regions: ['ایالات متحده'],
    restrictions: [
      'منطقه حساب PSN شما باید ایالات متحده باشد.',
      'محدودیت سقف کیف پول PSN برای هر حساب اعمال می‌شود.',
    ],
    redemptionNotes: giftNotesCommon,
    deliveryMethod: 'ارسال کد دیجیتال در پنل کاربری',
    fulfillmentEstimate: null,
    refundPolicy: giftCardRefund,
    requiredFields: [],
    maxQuantityPerItem: 5,
    variants: giftVariants('psn-us', 'USD', [10, 25, 50, 100], 'ایالات متحده'),
    available: true,
    createdAt: '2026-06-15T08:00:00Z',
    popularity: 90,
  },
  {
    id: 'p_psn_uk',
    slug: 'playstation-gift-card-gbp',
    name: 'گیفت کارت پلی‌استیشن انگلستان',
    brandName: 'PlayStation Store Gift Card (UK)',
    categorySlug: 'playstation',
    providerSlug: 'playstation',
    type: 'gift_card',
    shortDescription: 'اعتبار PlayStation Store برای حساب‌های بریتانیا',
    description: 'برای حساب‌های PSN با منطقه بریتانیا.',
    imageUrl: null,
    regions: ['بریتانیا'],
    restrictions: ['منطقه حساب PSN شما باید بریتانیا باشد.'],
    redemptionNotes: giftNotesCommon,
    deliveryMethod: 'ارسال کد دیجیتال در پنل کاربری',
    fulfillmentEstimate: null,
    refundPolicy: giftCardRefund,
    requiredFields: [],
    maxQuantityPerItem: 5,
    variants: giftVariants('psn-uk', 'GBP', [10, 20, 50], 'بریتانیا'),
    available: true,
    createdAt: '2026-09-01T08:00:00Z',
    popularity: 40,
  },
  {
    id: 'p_tradingview',
    slug: 'tradingview-subscription',
    name: 'اشتراک تریدینگ‌ویو',
    brandName: 'TradingView',
    categorySlug: 'tradingview',
    providerSlug: 'tradingview',
    type: 'subscription',
    shortDescription: 'فعال‌سازی پلن‌های Essential، Plus و Premium روی حساب شما',
    description:
      'پلن انتخابی روی حساب تریدینگ‌ویوی خودتان فعال می‌شود. فقط نام کاربری و ایمیل حساب لازم است و رمز عبور شما هرگز درخواست نمی‌شود.',
    imageUrl: null,
    regions: ['جهانی'],
    restrictions: [
      'اگر حساب شما اشتراک فعال دیگری دارد، پیش از ثبت سفارش با پشتیبانی هماهنگ کنید.',
      'شرایط استفاده از سرویس طبق قوانین تریدینگ‌ویو است.',
    ],
    redemptionNotes: ['پس از فعال‌سازی، وضعیت سفارش به «تکمیل‌شده» تغییر می‌کند.'],
    deliveryMethod: 'فعال‌سازی روی حساب شما',
    fulfillmentEstimate: null,
    refundPolicy: serviceRefund,
    requiredFields: [
      {
        key: 'tv_username',
        label: 'نام کاربری تریدینگ‌ویو',
        type: 'text',
        placeholder: 'username',
        help: 'نام کاربری نمایش‌داده‌شده در پروفایل تریدینگ‌ویو.',
        required: true,
      },
      { ...accountEmailField, label: 'ایمیل حساب تریدینگ‌ویو' },
    ],
    maxQuantityPerItem: 1,
    variants: [
      planVariant('tv-essential-1', 'Essential — ماهانه', 1, 15),
      planVariant('tv-essential-12', 'Essential — سالانه', 12, 155),
      planVariant('tv-plus-1', 'Plus — ماهانه', 1, 30),
      planVariant('tv-plus-12', 'Plus — سالانه', 12, 300),
      planVariant('tv-premium-1', 'Premium — ماهانه', 1, 60),
      planVariant('tv-premium-12', 'Premium — سالانه', 12, 600),
    ],
    available: true,
    createdAt: '2026-07-01T08:00:00Z',
    popularity: 80,
  },
  {
    id: 'p_chatgpt_plus',
    slug: 'chatgpt-plus',
    name: 'اشتراک ChatGPT Plus',
    brandName: 'ChatGPT Plus',
    categorySlug: 'ai',
    providerSlug: 'openai',
    type: 'subscription',
    shortDescription: 'فعال‌سازی اشتراک پلاس روی حساب ChatGPT شما',
    description:
      'اشتراک ماهانه ChatGPT Plus روی حساب خودتان فعال می‌شود. فقط ایمیل حساب لازم است.',
    imageUrl: null,
    regions: ['طبق مناطق پشتیبانی‌شده سرویس'],
    restrictions: ['ارائه این سرویس منوط به قوانین و مناطق پشتیبانی‌شده ارائه‌دهنده است.'],
    redemptionNotes: ['پس از فعال‌سازی، وضعیت سفارش به «تکمیل‌شده» تغییر می‌کند.'],
    deliveryMethod: 'فعال‌سازی روی حساب شما',
    fulfillmentEstimate: null,
    refundPolicy: serviceRefund,
    requiredFields: [accountEmailField],
    maxQuantityPerItem: 1,
    variants: [planVariant('gpt-plus-1', 'Plus — ماهانه', 1, 20, 'طبق مناطق پشتیبانی‌شده')],
    available: true,
    createdAt: '2026-08-20T08:00:00Z',
    popularity: 99,
  },
  {
    id: 'p_perplexity_pro',
    slug: 'perplexity-pro',
    name: 'اشتراک Perplexity Pro',
    brandName: 'Perplexity Pro',
    categorySlug: 'ai',
    providerSlug: 'perplexity',
    type: 'subscription',
    shortDescription: 'جست‌وجوی هوشمند با اشتراک ماهانه یا سالانه',
    description: 'پلن Pro روی حساب Perplexity شما فعال می‌شود.',
    imageUrl: null,
    regions: ['طبق مناطق پشتیبانی‌شده سرویس'],
    restrictions: ['ارائه این سرویس منوط به قوانین و مناطق پشتیبانی‌شده ارائه‌دهنده است.'],
    redemptionNotes: ['پس از فعال‌سازی، وضعیت سفارش به «تکمیل‌شده» تغییر می‌کند.'],
    deliveryMethod: 'فعال‌سازی روی حساب شما',
    fulfillmentEstimate: null,
    refundPolicy: serviceRefund,
    requiredFields: [accountEmailField],
    maxQuantityPerItem: 1,
    variants: [
      planVariant('pplx-pro-1', 'Pro — ماهانه', 1, 20, 'طبق مناطق پشتیبانی‌شده'),
      planVariant('pplx-pro-12', 'Pro — سالانه', 12, 200, 'طبق مناطق پشتیبانی‌شده'),
    ],
    available: true,
    createdAt: '2026-09-10T08:00:00Z',
    popularity: 60,
  },
  {
    id: 'p_midjourney',
    slug: 'midjourney-subscription',
    name: 'اشتراک Midjourney',
    brandName: 'Midjourney',
    categorySlug: 'ai',
    providerSlug: 'midjourney',
    type: 'subscription',
    shortDescription: 'ساخت تصویر با هوش مصنوعی؛ پلن‌های Basic و Standard',
    description: 'پلن انتخابی روی حساب Midjourney شما فعال می‌شود.',
    imageUrl: null,
    regions: ['طبق مناطق پشتیبانی‌شده سرویس'],
    restrictions: ['ارائه این سرویس منوط به قوانین و مناطق پشتیبانی‌شده ارائه‌دهنده است.'],
    redemptionNotes: ['پس از فعال‌سازی، وضعیت سفارش به «تکمیل‌شده» تغییر می‌کند.'],
    deliveryMethod: 'فعال‌سازی روی حساب شما',
    fulfillmentEstimate: null,
    refundPolicy: serviceRefund,
    requiredFields: [accountEmailField],
    maxQuantityPerItem: 1,
    variants: [
      planVariant('mj-basic-1', 'Basic — ماهانه', 1, 10, 'طبق مناطق پشتیبانی‌شده'),
      planVariant('mj-standard-1', 'Standard — ماهانه', 1, 30, 'طبق مناطق پشتیبانی‌شده'),
    ],
    available: true,
    createdAt: '2026-04-12T08:00:00Z',
    popularity: 55,
  },
]

export const catalog: SeedProduct[] = seed

export function toPublicProduct(p: SeedProduct): Product {
  const { popularity: _popularity, ...rest } = p
  return rest
}

export function findProductById(id: string) {
  return catalog.find((p) => p.id === id)
}

export function findProductBySlug(slug: string) {
  return catalog.find((p) => p.slug === slug)
}

export function listCategories(): Category[] {
  return categoryMeta.map((c) => ({
    ...c,
    productCount: catalog.filter((p) => p.categorySlug === c.slug && p.available).length,
  }))
}

export function providerName(slug: string) {
  return providers.find((p) => p.slug === slug)?.name ?? slug
}

/** Normalize Arabic letters and digits so Persian search behaves as users expect. */
export function normalizeSearch(text: string) {
  return text
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[‌‏]/g, ' ')
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .toLowerCase()
    .trim()
}
