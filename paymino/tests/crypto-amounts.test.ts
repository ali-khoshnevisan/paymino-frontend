import { describe, expect, it } from 'vitest'
import { formatUnits, parseUnits, tomanToCrypto, verifySignature, signPayload } from '../server/utils/payments'

describe('crypto amount conversion', () => {
  it('rounds up so the customer never underpays', () => {
    // 2,271,000 / 105,500 = 21.5260… → 21.53
    expect(tomanToCrypto(2_271_000, 105_500, 2)).toBe('21.53')
  })

  it('handles exact divisions without a trailing fraction', () => {
    expect(tomanToCrypto(211_000, 105_500, 2)).toBe('2')
  })

  it('handles 8-decimal assets without float error', () => {
    const amount = tomanToCrypto(3_974_000, 6_850_000_000, 8)
    expect(amount).toBe('0.00058015')
  })

  it('round-trips units', () => {
    expect(formatUnits(parseUnits('37.67', 2), 2)).toBe('37.67')
    expect(parseUnits('1.5', 6)).toBe(BigInt(1_500_000))
  })
})

describe('webhook signature', () => {
  it('accepts a correct signature and rejects tampering', () => {
    const body = JSON.stringify({ eventId: 'e1', status: 'confirmed' })
    const sig = signPayload(body, 'secret')
    expect(verifySignature(body, sig, 'secret')).toBe(true)
    expect(verifySignature(body + ' ', sig, 'secret')).toBe(false)
    expect(verifySignature(body, sig, 'other')).toBe(false)
    expect(verifySignature(body, undefined, 'secret')).toBe(false)
  })
})
