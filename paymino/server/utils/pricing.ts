// Server-side price calculation. The client never decides prices or totals.
import type { CartItemInput, Quote, QuoteLine } from '#shared/types'
import { findProductById } from './catalog'

export const SERVICE_FEE_RATE = 0.02 // sample: 2% service fee
export const QUOTE_TTL_MS = 10 * 60 * 1000

export function roundTo1000(n: number) {
  return Math.round(n / 1000) * 1000
}

export function buildQuote(items: CartItemInput[]): Quote {
  const lines: QuoteLine[] = items.map((item) => {
    const product = findProductById(item.productId)
    const variant = product?.variants.find((v) => v.id === item.variantId)

    if (!product || !variant) {
      return {
        lineId: item.lineId,
        productId: item.productId,
        variantId: item.variantId,
        productName: 'محصول نامشخص',
        brandName: '',
        variantLabel: '',
        quantity: 0,
        unitPriceToman: 0,
        lineTotalToman: 0,
        available: false,
        issue: { code: 'not_found', message: 'این محصول دیگر در فروشگاه موجود نیست.' },
      }
    }

    const available = product.available && variant.available
    const requestedQty = Number.isFinite(item.quantity) ? Math.floor(item.quantity) : 1
    const quantity = Math.min(Math.max(requestedQty, 1), product.maxQuantityPerItem)
    const unit = variant.priceToman

    const line: QuoteLine = {
      lineId: item.lineId,
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      brandName: product.brandName,
      variantLabel: variant.label,
      quantity,
      unitPriceToman: unit,
      lineTotalToman: available ? unit * quantity : 0,
      available,
    }

    if (!available) {
      line.issue = { code: 'unavailable', message: 'این گزینه در حال حاضر موجود نیست و در مبلغ نهایی محاسبه نمی‌شود.' }
    } else if (item.knownUnitPriceToman !== undefined && item.knownUnitPriceToman !== unit) {
      line.issue = { code: 'price_changed', message: 'قیمت این مورد از آخرین بازدید شما تغییر کرده است.' }
    } else if (quantity !== requestedQty) {
      line.issue = {
        code: 'quantity_adjusted',
        message: `حداکثر تعداد مجاز برای این محصول ${product.maxQuantityPerItem} عدد است.`,
      }
    }
    return line
  })

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotalToman, 0)
  const fee = subtotal > 0 ? roundTo1000(subtotal * SERVICE_FEE_RATE) : 0
  const discount = 0 // no discount system yet — never show fake discounts

  return {
    lines,
    subtotalToman: subtotal,
    serviceFeeToman: fee,
    serviceFeeRate: SERVICE_FEE_RATE,
    discountToman: discount,
    totalToman: subtotal + fee - discount,
    validUntil: new Date(Date.now() + QUOTE_TTL_MS).toISOString(),
  }
}
