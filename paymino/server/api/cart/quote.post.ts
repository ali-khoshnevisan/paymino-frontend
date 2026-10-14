// POST /api/cart/quote  { items: CartItemInput[] }  → Quote (server-side prices only)
import type { CartItemInput } from '#shared/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ items?: CartItemInput[] }>(event)
  const items = Array.isArray(body?.items) ? body.items.slice(0, 50) : []
  return buildQuote(
    items.map((i) => ({
      lineId: String(i.lineId ?? ''),
      productId: String(i.productId ?? ''),
      variantId: String(i.variantId ?? ''),
      quantity: Number(i.quantity ?? 1),
      knownUnitPriceToman: typeof i.knownUnitPriceToman === 'number' ? i.knownUnitPriceToman : undefined,
    })),
  )
})
