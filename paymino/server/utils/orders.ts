import type { Order, OrderListItem } from '#shared/types'

export function toOrderDto(o: StoredOrder): Order {
  const { userId: _u, idempotencyKey: _k, ...rest } = o
  return rest
}

export function toOrderListItem(o: StoredOrder): OrderListItem {
  return {
    id: o.id,
    number: o.number,
    status: o.status,
    paymentStatus: o.paymentStatus,
    totalToman: o.totalToman,
    itemCount: o.items.reduce((n, i) => n + i.quantity, 0),
    firstItemName: o.items[0]?.productName ?? '',
    createdAt: o.createdAt,
  }
}

export function getOwnedOrder(orderId: string, userId: string) {
  const order = db.orders.get(orderId)
  // Same 404 for "missing" and "not yours" so order ids cannot be probed.
  if (!order || order.userId !== userId) apiError(404, 'سفارش یافت نشد.', { code: 'order_not_found' })
  refreshInvoiceExpiry(order)
  return order
}

/* ------------------------------- Demo seed ------------------------------- */

export function ensureSeeded() {
  if (db.seeded) return
  db.seeded = true

  const userId = 'usr_demo'
  db.users.set(userId, {
    id: userId,
    fullName: 'کاربر نمونه',
    email: 'demo@paymino.test',
    phone: '09120000000',
    passwordHash: hashPassword('Demo1234'),
    emailVerified: true,
    verificationCode: null,
    createdAt: '2026-09-01T10:00:00Z',
  })

  const day = (d: number) => new Date(Date.now() - d * 86400000).toISOString()

  const completed: StoredOrder = {
    id: 'ord_demo_completed',
    number: 'PM-10231',
    userId,
    idempotencyKey: null,
    status: 'completed',
    paymentStatus: 'confirmed',
    items: [
      {
        id: 'oi_1',
        productId: 'p_steam_us',
        productSlug: 'steam-wallet-usd',
        productName: 'گیفت کارت استیم آمریکا',
        brandName: 'Steam Wallet Gift Card (USD)',
        variantLabel: '$20',
        type: 'gift_card',
        quantity: 1,
        unitPriceToman: 2_226_000,
        lineTotalToman: 2_226_000,
        fields: {},
        fieldLabels: {},
        deliveries: [{ kind: 'code', value: 'SAMPLE-XXXX-XXXX-XXXX', deliveredAt: day(6) }],
      },
    ],
    subtotalToman: 2_226_000,
    serviceFeeToman: 45_000,
    discountToman: 0,
    totalToman: 2_271_000,
    paymentMethod: { currency: 'USDT', network: 'TRC20' },
    invoice: null,
    events: [
      { at: day(6), status: 'pending_payment', paymentStatus: 'awaiting_payment', message: 'سفارش ثبت شد.' },
      { at: day(6), status: null, paymentStatus: 'confirmed', message: 'پرداخت تأیید شد.' },
      { at: day(6), status: 'processing', paymentStatus: null, message: 'سفارش در حال انجام است.' },
      { at: day(6), status: 'completed', paymentStatus: null, message: 'کد گیفت کارت در پنل شما قرار گرفت.' },
    ],
    createdAt: day(6),
    updatedAt: day(6),
  }

  const processing: StoredOrder = {
    id: 'ord_demo_processing',
    number: 'PM-10238',
    userId,
    idempotencyKey: null,
    status: 'processing',
    paymentStatus: 'confirmed',
    items: [
      {
        id: 'oi_2',
        productId: 'p_tradingview',
        productSlug: 'tradingview-subscription',
        productName: 'اشتراک تریدینگ‌ویو',
        brandName: 'TradingView',
        variantLabel: 'Plus — ماهانه',
        type: 'subscription',
        quantity: 1,
        unitPriceToman: 3_339_000,
        lineTotalToman: 3_339_000,
        fields: { tv_username: 'demo_trader', account_email: 'demo@paymino.test' },
        fieldLabels: { tv_username: 'نام کاربری تریدینگ‌ویو', account_email: 'ایمیل حساب تریدینگ‌ویو' },
        deliveries: [],
      },
    ],
    subtotalToman: 3_339_000,
    serviceFeeToman: 67_000,
    discountToman: 0,
    totalToman: 3_406_000,
    paymentMethod: { currency: 'USDT', network: 'TRC20' },
    invoice: null,
    events: [
      { at: day(1), status: 'pending_payment', paymentStatus: 'awaiting_payment', message: 'سفارش ثبت شد.' },
      { at: day(1), status: null, paymentStatus: 'confirmed', message: 'پرداخت تأیید شد.' },
      { at: day(1), status: 'processing', paymentStatus: null, message: 'سفارش در حال انجام است.' },
    ],
    createdAt: day(1),
    updatedAt: day(1),
  }

  db.orders.set(completed.id, completed)
  db.orders.set(processing.id, processing)
}
