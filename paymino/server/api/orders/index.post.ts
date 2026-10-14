// POST /api/orders   Header: Idempotency-Key
// Body: CreateOrderInput. Prices come from the server quote, never from the client.
import type { CreateOrderInput, OrderItem } from '#shared/types'

export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const idemKey = getHeader(event, 'idempotency-key')?.slice(0, 80) || null

  // Duplicate submit (double click, retry, refresh) → return the original order
  if (idemKey) {
    const existing = [...db.orders.values()].find((o) => o.userId === user.id && o.idempotencyKey === idemKey)
    if (existing) return toOrderDto(existing)
  }

  const body = (await readBody<CreateOrderInput>(event)) ?? ({} as CreateOrderInput)
  if (!body.acceptedTerms) fieldErrors({ acceptedTerms: ['برای ثبت سفارش، پذیرش قوانین الزامی است.'] })
  const inputItems = Array.isArray(body.items) ? body.items.slice(0, 50) : []
  if (!inputItems.length) apiError(400, 'سبد خرید خالی است.', { code: 'empty_cart' })

  // Validate required per-item fields
  const errors: Record<string, string[]> = {}
  for (const it of inputItems) {
    const product = findProductById(String(it.productId))
    if (!product) continue
    for (const f of product.requiredFields) {
      const value = String(it.fields?.[f.key] ?? '').trim()
      if (f.required && !value) errors[`${it.lineId}.${f.key}`] = [`${f.label} الزامی است.`]
      else if (value && f.type === 'email' && !EMAIL_RE.test(value)) errors[`${it.lineId}.${f.key}`] = ['ایمیل معتبر وارد کنید.']
      else if (value.length > 200) errors[`${it.lineId}.${f.key}`] = ['مقدار واردشده بیش از حد طولانی است.']
    }
  }
  if (Object.keys(errors).length) fieldErrors(errors)

  const quote = buildQuote(
    inputItems.map((i) => ({
      lineId: String(i.lineId),
      productId: String(i.productId),
      variantId: String(i.variantId),
      quantity: Number(i.quantity),
      knownUnitPriceToman: i.knownUnitPriceToman,
    })),
  )

  const blocking = quote.lines.filter((l) => !l.available || l.issue?.code === 'price_changed' || l.issue?.code === 'quantity_adjusted')
  if (blocking.length || quote.totalToman !== Number(body.expectedTotalToman)) {
    apiError(409, 'قیمت یا موجودی برخی اقلام تغییر کرده است. لطفاً سبد خرید را دوباره بررسی کنید.', {
      code: 'quote_changed',
      quote,
    })
  }

  const orderId = newId('ord')
  const invoice = createInvoice(orderId, quote.totalToman, String(body.currency), String(body.network))

  const items: OrderItem[] = quote.lines.map((line) => {
    const product = findProductById(line.productId)!
    const input = inputItems.find((i) => i.lineId === line.lineId)!
    const fields: Record<string, string> = {}
    const fieldLabels: Record<string, string> = {}
    for (const f of product.requiredFields) {
      fields[f.key] = String(input.fields?.[f.key] ?? '').trim()
      fieldLabels[f.key] = f.label
    }
    return {
      id: newId('oi'),
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      brandName: product.brandName,
      variantLabel: line.variantLabel,
      type: product.type,
      quantity: line.quantity,
      unitPriceToman: line.unitPriceToman,
      lineTotalToman: line.lineTotalToman,
      fields,
      fieldLabels,
      deliveries: [],
    }
  })

  const at = nowIso()
  const order: StoredOrder = {
    id: orderId,
    number: nextOrderNumber(),
    userId: user.id,
    idempotencyKey: idemKey,
    status: 'pending_payment',
    paymentStatus: 'awaiting_payment',
    items,
    subtotalToman: quote.subtotalToman,
    serviceFeeToman: quote.serviceFeeToman,
    discountToman: quote.discountToman,
    totalToman: quote.totalToman,
    paymentMethod: { currency: invoice.currency, network: invoice.network },
    invoice,
    events: [{ at, status: 'pending_payment', paymentStatus: 'awaiting_payment', message: 'سفارش ثبت شد و فاکتور پرداخت صادر شد.' }],
    createdAt: at,
    updatedAt: at,
  }
  db.orders.set(order.id, order)
  setResponseStatus(event, 201)
  return toOrderDto(order)
})
