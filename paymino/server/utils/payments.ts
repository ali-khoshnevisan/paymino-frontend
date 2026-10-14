// Mock crypto payment provider. Mirrors how a real gateway integration should behave:
// invoices are created server-side, and ONLY verified provider events change payment state.

import { createHmac, timingSafeEqual } from 'node:crypto'
import type { CryptoCurrency, PaymentInvoice, PaymentStatus } from '#shared/types'
import { canTransitionOrder, canTransitionPayment } from '#shared/utils/status'

export const INVOICE_TTL_MINUTES = 30

// SAMPLE currencies and rates — the real list comes from the chosen gateway + admin settings.
const rateUpdatedAt = () => new Date(Date.now() - 2 * 60 * 1000).toISOString()

export function listCurrencies(): CryptoCurrency[] {
  return [
    {
      code: 'USDT',
      name: 'Tether',
      rateToman: 105_500,
      rateUpdatedAt: rateUpdatedAt(),
      networks: [
        { code: 'TRC20', name: 'Tron (TRC20)', minAmount: 1, confirmationsRequired: 19, networkFeeNote: 'کارمزد شبکه ترون را کیف پول شما دریافت می‌کند.' },
        { code: 'BEP20', name: 'BNB Smart Chain (BEP20)', minAmount: 1, confirmationsRequired: 15, networkFeeNote: 'کارمزد شبکه BSC را کیف پول شما دریافت می‌کند.' },
      ],
    },
    {
      code: 'TRX',
      name: 'Tron',
      rateToman: 31_800,
      rateUpdatedAt: rateUpdatedAt(),
      networks: [
        { code: 'TRC20', name: 'Tron', minAmount: 10, confirmationsRequired: 19, networkFeeNote: 'کارمزد شبکه ترون را کیف پول شما دریافت می‌کند.' },
      ],
    },
    {
      code: 'BTC',
      name: 'Bitcoin',
      rateToman: 6_850_000_000,
      rateUpdatedAt: rateUpdatedAt(),
      networks: [
        { code: 'BTC', name: 'Bitcoin', minAmount: 0.0001, confirmationsRequired: 2, networkFeeNote: 'کارمزد شبکه بیت‌کوین ممکن است قابل توجه باشد و به عهده پرداخت‌کننده است.' },
      ],
    },
    {
      code: 'TON',
      name: 'Toncoin',
      rateToman: 330_000,
      rateUpdatedAt: rateUpdatedAt(),
      networks: [
        { code: 'TON', name: 'The Open Network', minAmount: 1, confirmationsRequired: 1, networkFeeNote: 'برای پرداخت در شبکه TON، وارد کردن Memo الزامی است.' },
      ],
    },
  ]
}

const DECIMALS: Record<string, number> = { USDT: 2, TRX: 2, BTC: 8, TON: 4 }

export function findNetwork(currency: string, network: string) {
  const cur = listCurrencies().find((c) => c.code === currency)
  const net = cur?.networks.find((n) => n.code === network)
  return cur && net ? { currency: cur, network: net } : null
}

/** Exact decimal conversion with BigInt; always rounds up so the customer never underpays. */
export function tomanToCrypto(totalToman: number, rateToman: number, decimals: number) {
  const scale = BigInt(10) ** BigInt(decimals)
  const num = BigInt(totalToman) * scale
  const den = BigInt(rateToman)
  const units = (num + den - BigInt(1)) / den
  return formatUnits(units, decimals)
}

export function formatUnits(units: bigint, decimals: number) {
  const s = units.toString().padStart(decimals + 1, '0')
  const intPart = s.slice(0, s.length - decimals)
  const frac = s.slice(s.length - decimals).replace(/0+$/, '')
  return frac ? `${intPart}.${frac}` : intPart
}

export function parseUnits(value: string, decimals: number) {
  const [i = '0', f = ''] = value.split('.')
  return BigInt(i) * BigInt(10) ** BigInt(decimals) + BigInt((f + '0'.repeat(decimals)).slice(0, decimals) || '0')
}

export function createInvoice(orderId: string, totalToman: number, currencyCode: string, networkCode: string): PaymentInvoice {
  const found = findNetwork(currencyCode, networkCode)
  if (!found) apiError(400, 'ارز یا شبکه انتخاب‌شده پشتیبانی نمی‌شود.', { code: 'unsupported_currency' })
  const { currency, network } = found
  const decimals = DECIMALS[currency.code] ?? 6
  const amount = tomanToCrypto(totalToman, currency.rateToman, decimals)

  if (Number(amount) < network.minAmount) {
    apiError(400, `حداقل مبلغ پرداخت در این شبکه ${network.minAmount} ${currency.code} است.`, { code: 'below_minimum' })
  }

  const id = newId('inv')
  // Clearly fake address: the mock must never look payable.
  const address = `TEST-ONLY-${network.code}-${id.slice(4, 16).toUpperCase()}`
  return {
    id,
    orderId,
    provider: 'sandbox',
    currency: currency.code,
    network: network.code,
    amountCrypto: amount,
    amountReceived: null,
    rateToman: currency.rateToman,
    totalToman,
    address,
    memo: network.code === 'TON' ? String(Math.floor(10000000 + Math.random() * 89999999)) : null,
    paymentUri: null,
    expiresAt: new Date(Date.now() + INVOICE_TTL_MINUTES * 60 * 1000).toISOString(),
    createdAt: nowIso(),
    status: 'awaiting_payment',
    confirmations: 0,
    confirmationsRequired: network.confirmationsRequired,
    txHash: null,
    explorerUrl: null,
    sandbox: true,
  }
}

/* ----------------------------- Webhook handling ----------------------------- */

export function signPayload(rawBody: string, secret: string) {
  return createHmac('sha256', secret).update(rawBody).digest('hex')
}

export function verifySignature(rawBody: string, signature: string | undefined, secret: string) {
  if (!signature) return false
  const expected = Buffer.from(signPayload(rawBody, secret), 'hex')
  let given: Buffer
  try {
    given = Buffer.from(signature, 'hex')
  } catch {
    return false
  }
  return given.length === expected.length && timingSafeEqual(given, expected)
}

export interface PaymentEvent {
  eventId: string
  invoiceId: string
  status: PaymentStatus
  currency: string
  network: string
  amountReceived?: string
  txHash?: string
  confirmations?: number
}

const PAYMENT_MESSAGES: Record<PaymentStatus, string> = {
  awaiting_payment: 'در انتظار پرداخت',
  detected: 'تراکنش شما در شبکه شناسایی شد.',
  confirming: 'تراکنش در حال دریافت تأییدهای شبکه است.',
  confirmed: 'پرداخت تأیید شد.',
  expired: 'مهلت پرداخت به پایان رسید.',
  underpaid: 'مبلغ دریافتی کمتر از مبلغ فاکتور است.',
  failed: 'پرداخت ناموفق بود.',
  refunded: 'مبلغ پرداختی بازگردانده شد.',
}

/**
 * Apply a VERIFIED provider event to an invoice and its order.
 * Idempotent: the same eventId is processed once. Never called from client-side state.
 */
export function applyPaymentEvent(evt: PaymentEvent) {
  if (db.processedWebhooks.has(evt.eventId)) return { duplicate: true }

  const order = [...db.orders.values()].find((o) => o.invoice?.id === evt.invoiceId)
  const invoice = order?.invoice
  if (!order || !invoice) apiError(404, 'فاکتور یافت نشد.', { code: 'invoice_not_found' })

  if (evt.currency !== invoice.currency || evt.network !== invoice.network) {
    apiError(400, 'ارز یا شبکه رویداد با فاکتور مطابقت ندارد.', { code: 'mismatch' })
  }

  let status = evt.status
  const decimals = DECIMALS[invoice.currency] ?? 6
  let note: string | null = null

  if (evt.amountReceived !== undefined) {
    invoice.amountReceived = evt.amountReceived
    const received = parseUnits(evt.amountReceived, decimals)
    const expected = parseUnits(invoice.amountCrypto, decimals)
    if (status === 'confirmed' && received < expected) status = 'underpaid'
    if (status === 'confirmed' && received > expected) note = 'مبلغ اضافه دریافت شد و برای بررسی به پشتیبانی ارجاع شد.'
  }

  if (!canTransitionPayment(invoice.status, status)) {
    db.processedWebhooks.add(evt.eventId)
    return { ignored: true }
  }

  invoice.status = status
  if (evt.txHash) invoice.txHash = evt.txHash
  if (evt.confirmations !== undefined) invoice.confirmations = evt.confirmations
  if (status === 'confirmed') invoice.confirmations = Math.max(invoice.confirmations, invoice.confirmationsRequired)

  order.paymentStatus = status
  const at = nowIso()
  order.events.push({ at, status: null, paymentStatus: status, message: PAYMENT_MESSAGES[status] })
  if (note) order.events.push({ at, status: null, paymentStatus: null, message: note })

  const moveOrder = (to: typeof order.status, message: string) => {
    if (order.status !== to && canTransitionOrder(order.status, to)) {
      order.status = to
      order.events.push({ at: nowIso(), status: to, paymentStatus: null, message })
    }
  }

  if (status === 'detected' || status === 'confirming' || status === 'underpaid') {
    moveOrder('payment_verification', 'سفارش در مرحله بررسی پرداخت است.')
  } else if (status === 'confirmed') {
    moveOrder('paid', 'پرداخت سفارش تأیید شد.')
    moveOrder('processing', 'سفارش در حال انجام است.')
  } else if (status === 'expired' || status === 'failed') {
    moveOrder('pending_payment', 'برای ادامه، فاکتور پرداخت جدید ایجاد کنید.')
  }

  order.updatedAt = nowIso()
  db.processedWebhooks.add(evt.eventId)
  return { ok: true }
}

/** Lazily expire stale invoices (a real gateway sends an "expired" webhook instead). */
export function refreshInvoiceExpiry(order: StoredOrder) {
  const inv = order.invoice
  if (inv && inv.status === 'awaiting_payment' && new Date(inv.expiresAt).getTime() < Date.now()) {
    applyPaymentEvent({
      eventId: `expiry_${inv.id}`,
      invoiceId: inv.id,
      status: 'expired',
      currency: inv.currency,
      network: inv.network,
    })
  }
}
