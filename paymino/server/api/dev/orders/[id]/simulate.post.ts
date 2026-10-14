// POST /api/dev/orders/:id/simulate  { event: 'detected'|'confirming'|'confirmed'|'underpaid'|'overpaid'|'expired'|'failed'|'fulfill' }
// DEVELOPMENT ONLY. Sends a correctly signed webhook to our own webhook endpoint,
// so the UI can be tested through the same verified path a real gateway would use.
import type { PaymentStatus } from '#shared/types'
import { formatUnits, parseUnits } from '../../../../utils/payments'

export default defineEventHandler(async (event) => {
  if (!import.meta.dev) apiError(404, 'Not found')

  const user = requireUser(event)
  const order = getOwnedOrder(getRouterParam(event, 'id') ?? '', user.id)
  const body = (await readBody<{ event?: string }>(event)) ?? {}
  const kind = String(body.event ?? '')

  if (kind === 'fulfill') {
    if (order.status !== 'processing') apiError(409, 'Order is not processing')
    for (const item of order.items) {
      if (item.type === 'gift_card') {
        for (let i = 0; i < item.quantity; i++) {
          item.deliveries.push({ kind: 'code', value: `SAMPLE-${crypto.randomUUID().slice(0, 4).toUpperCase()}-XXXX-XXXX`, deliveredAt: nowIso() })
        }
      } else {
        item.deliveries.push({ kind: 'service_note', value: 'اشتراک روی حساب شما فعال شد (نمونه).', deliveredAt: nowIso() })
      }
    }
    order.status = 'completed'
    order.events.push({ at: nowIso(), status: 'completed', paymentStatus: null, message: 'سفارش تکمیل شد.' })
    order.updatedAt = nowIso()
    return toOrderDto(order)
  }

  const inv = order.invoice
  if (!inv) apiError(409, 'No invoice')

  const decimals = inv.amountCrypto.includes('.') ? inv.amountCrypto.split('.')[1]!.length : 0
  const d = Math.max(decimals, 8)
  const expected = parseUnits(inv.amountCrypto, d)
  const map: Record<string, { status: PaymentStatus; amount?: bigint; conf?: number }> = {
    detected: { status: 'detected', conf: 0 },
    confirming: { status: 'confirming', conf: Math.max(1, Math.floor(inv.confirmationsRequired / 2)) },
    confirmed: { status: 'confirmed', amount: expected },
    overpaid: { status: 'confirmed', amount: expected + expected / BigInt(10) },
    underpaid: { status: 'confirmed', amount: (expected * BigInt(7)) / BigInt(10) },
    expired: { status: 'expired' },
    failed: { status: 'failed' },
  }
  const step = map[kind]
  if (!step) apiError(400, 'Unknown event')

  const payload = {
    eventId: `sim_${crypto.randomUUID()}`,
    invoiceId: inv.id,
    status: step.status,
    currency: inv.currency,
    network: inv.network,
    amountReceived: step.amount !== undefined ? formatUnits(step.amount, d) : undefined,
    txHash: ['detected', 'confirming', 'confirmed', 'overpaid', 'underpaid'].includes(kind) ? `0xSAMPLE${crypto.randomUUID().replace(/-/g, '')}` : undefined,
    confirmations: step.conf,
  }
  const raw = JSON.stringify(payload)
  const secret = process.env.PAYMENT_WEBHOOK_SECRET || 'dev-only-webhook-secret'

  await $fetch('/api/payments/webhook', {
    method: 'POST',
    body: raw,
    headers: { 'content-type': 'application/json', 'x-signature': signPayload(raw, secret) },
  })
  return toOrderDto(db.orders.get(order.id)!)
})
