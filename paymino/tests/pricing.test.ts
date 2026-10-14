import { describe, expect, it } from 'vitest'
import { buildQuote, SERVICE_FEE_RATE } from '../server/utils/pricing'
import { catalog } from '../server/utils/catalog'

const steam = catalog.find((p) => p.id === 'p_steam_us')!
const steam20 = steam.variants.find((v) => v.faceValue === 20)!
const steamEu = catalog.find((p) => p.id === 'p_steam_eu')!
const steamEu100 = steamEu.variants.find((v) => v.faceValue === 100)! // unavailable in sample data

describe('cart quote (server-side pricing)', () => {
  it('uses server prices and computes fee and total', () => {
    const q = buildQuote([{ lineId: 'a', productId: steam.id, variantId: steam20.id, quantity: 2 }])
    expect(q.subtotalToman).toBe(steam20.priceToman * 2)
    expect(q.serviceFeeToman).toBe(Math.round((q.subtotalToman * SERVICE_FEE_RATE) / 1000) * 1000)
    expect(q.totalToman).toBe(q.subtotalToman + q.serviceFeeToman - q.discountToman)
    expect(q.discountToman).toBe(0)
  })

  it('ignores a price sent by the client and flags the change', () => {
    const q = buildQuote([{ lineId: 'a', productId: steam.id, variantId: steam20.id, quantity: 1, knownUnitPriceToman: 1 }])
    expect(q.lines[0]!.unitPriceToman).toBe(steam20.priceToman)
    expect(q.lines[0]!.issue?.code).toBe('price_changed')
  })

  it('excludes unavailable variants from totals', () => {
    const q = buildQuote([
      { lineId: 'a', productId: steam.id, variantId: steam20.id, quantity: 1 },
      { lineId: 'b', productId: steamEu.id, variantId: steamEu100.id, quantity: 1 },
    ])
    expect(q.lines[1]!.available).toBe(false)
    expect(q.lines[1]!.issue?.code).toBe('unavailable')
    expect(q.subtotalToman).toBe(steam20.priceToman)
  })

  it('clamps quantity to the product limit', () => {
    const q = buildQuote([{ lineId: 'a', productId: steam.id, variantId: steam20.id, quantity: 99 }])
    expect(q.lines[0]!.quantity).toBe(steam.maxQuantityPerItem)
    expect(q.lines[0]!.issue?.code).toBe('quantity_adjusted')
  })

  it('rejects unknown products', () => {
    const q = buildQuote([{ lineId: 'a', productId: 'nope', variantId: 'nope', quantity: 1 }])
    expect(q.lines[0]!.issue?.code).toBe('not_found')
    expect(q.totalToman).toBe(0)
    expect(q.serviceFeeToman).toBe(0)
  })
})
