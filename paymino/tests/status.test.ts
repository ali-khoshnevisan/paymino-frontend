import { describe, expect, it } from 'vitest'
import { canTransitionOrder, canTransitionPayment, isPayable } from '../shared/utils/status'

describe('order status transitions', () => {
  it('allows the normal paid → processing → completed path', () => {
    expect(canTransitionOrder('pending_payment', 'paid')).toBe(true)
    expect(canTransitionOrder('paid', 'processing')).toBe(true)
    expect(canTransitionOrder('processing', 'completed')).toBe(true)
  })

  it('blocks impossible jumps', () => {
    expect(canTransitionOrder('pending_payment', 'completed')).toBe(false)
    expect(canTransitionOrder('cancelled', 'paid')).toBe(false)
    expect(canTransitionOrder('refunded', 'processing')).toBe(false)
  })
})

describe('payment status transitions', () => {
  it('never moves a confirmed payment backwards', () => {
    expect(canTransitionPayment('confirmed', 'detected')).toBe(false)
    expect(canTransitionPayment('confirmed', 'awaiting_payment')).toBe(false)
    expect(canTransitionPayment('confirmed', 'refunded')).toBe(true)
  })

  it('treats expired invoices as final', () => {
    expect(canTransitionPayment('expired', 'confirmed')).toBe(false)
  })
})

describe('isPayable', () => {
  it('is payable only before payment', () => {
    expect(isPayable('pending_payment', 'awaiting_payment')).toBe(true)
    expect(isPayable('pending_payment', 'expired')).toBe(true)
    expect(isPayable('payment_verification', 'detected')).toBe(false)
    expect(isPayable('paid', 'confirmed')).toBe(false)
  })
})
