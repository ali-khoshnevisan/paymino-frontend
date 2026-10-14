import type { OrderStatus, PaymentStatus } from '../types'

/**
 * Allowed order (fulfillment) transitions. Payment status is tracked separately.
 * The Django backend should enforce the same table.
 */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ['payment_verification', 'paid', 'cancelled', 'failed'],
  payment_verification: ['paid', 'pending_payment', 'failed', 'cancelled'],
  paid: ['processing', 'awaiting_customer_info', 'refund_pending'],
  processing: ['awaiting_customer_info', 'completed', 'failed', 'refund_pending'],
  awaiting_customer_info: ['processing', 'cancelled', 'refund_pending'],
  completed: ['refund_pending'],
  failed: ['refund_pending'],
  cancelled: [],
  refund_pending: ['refunded'],
  refunded: [],
}

export function canTransitionOrder(from: OrderStatus, to: OrderStatus) {
  return from === to || ORDER_TRANSITIONS[from].includes(to)
}

/** Payment states that are final for a given invoice. */
export const FINAL_PAYMENT_STATES: PaymentStatus[] = ['confirmed', 'expired', 'failed', 'refunded']

const PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  awaiting_payment: ['detected', 'confirming', 'confirmed', 'underpaid', 'expired', 'failed'],
  detected: ['confirming', 'confirmed', 'underpaid', 'failed'],
  confirming: ['confirmed', 'underpaid', 'failed'],
  underpaid: ['confirming', 'confirmed', 'failed', 'refunded'],
  confirmed: ['refunded'],
  expired: [],
  failed: [],
  refunded: [],
}

export function canTransitionPayment(from: PaymentStatus, to: PaymentStatus) {
  return from === to || PAYMENT_TRANSITIONS[from].includes(to)
}

export function isPayable(orderStatus: OrderStatus, paymentStatus: PaymentStatus | null) {
  return (
    orderStatus === 'pending_payment' &&
    (paymentStatus === null || paymentStatus === 'awaiting_payment' || paymentStatus === 'expired' || paymentStatus === 'failed')
  )
}
