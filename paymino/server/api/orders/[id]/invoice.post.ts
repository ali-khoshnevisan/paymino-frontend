// POST /api/orders/:id/invoice  { currency, network }
// Issue a new invoice after the previous one expired/failed, or to switch currency.
// The order total (in Toman) stays locked; only the crypto amount is recalculated at the current rate.
import { isPayable } from '#shared/utils/status'

export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const order = getOwnedOrder(getRouterParam(event, 'id') ?? '', user.id)
  const body = (await readBody<Record<string, unknown>>(event)) ?? {}

  if (!isPayable(order.status, order.paymentStatus)) {
    apiError(409, 'برای این سفارش امکان صدور فاکتور جدید وجود ندارد.', { code: 'not_payable' })
  }

  const invoice = createInvoice(order.id, order.totalToman, String(body.currency), String(body.network))
  if (order.invoice && order.invoice.status === 'awaiting_payment') order.invoice.status = 'expired' // superseded
  order.invoice = invoice
  order.paymentStatus = 'awaiting_payment'
  order.paymentMethod = { currency: invoice.currency, network: invoice.network }
  order.events.push({ at: nowIso(), status: null, paymentStatus: 'awaiting_payment', message: 'فاکتور پرداخت جدید صادر شد.' })
  order.updatedAt = nowIso()
  return toOrderDto(order)
})
