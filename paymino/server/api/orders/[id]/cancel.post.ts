// POST /api/orders/:id/cancel — only before any payment was detected
import { canTransitionOrder } from '#shared/utils/status'

export default defineEventHandler((event) => {
  const user = requireUser(event)
  const order = getOwnedOrder(getRouterParam(event, 'id') ?? '', user.id)
  const cancellablePayment = order.paymentStatus === null || ['awaiting_payment', 'expired', 'failed'].includes(order.paymentStatus)

  if (!canTransitionOrder(order.status, 'cancelled') || order.status !== 'pending_payment' || !cancellablePayment) {
    apiError(409, 'این سفارش قابل لغو نیست. برای پیگیری با پشتیبانی تماس بگیرید.', { code: 'not_cancellable' })
  }
  if (order.invoice && order.invoice.status === 'awaiting_payment') order.invoice.status = 'expired'
  order.status = 'cancelled'
  order.events.push({ at: nowIso(), status: 'cancelled', paymentStatus: null, message: 'سفارش توسط شما لغو شد.' })
  order.updatedAt = nowIso()
  return toOrderDto(order)
})
