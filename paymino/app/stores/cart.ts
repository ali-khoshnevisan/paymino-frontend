import { defineStore } from 'pinia'
import type { Product, ProductVariant, Quote, RequiredField } from '#shared/types'

export interface CartLine {
  lineId: string
  productId: string
  productSlug: string
  variantId: string
  name: string
  brandName: string
  variantLabel: string
  categorySlug: string
  type: Product['type']
  unitPriceToman: number // last price shown to the user (display only — server re-prices)
  quantity: number
  maxQuantity: number
  requiredFields: RequiredField[]
  fields: Record<string, string>
  addedAt: string
}

const STORAGE_KEY = 'paymino.cart.v1'

export const useCartStore = defineStore('cart', () => {
  const lines = ref<CartLine[]>([])
  const quote = ref<Quote | null>(null)
  const quoteLoading = ref(false)
  const quoteError = ref<string | null>(null)
  const hydrated = ref(false)
  const lastAddedAt = ref(0)

  const count = computed(() => lines.value.reduce((n, l) => n + l.quantity, 0))
  const isEmpty = computed(() => lines.value.length === 0)
  const needsInfo = computed(() => lines.value.some((l) => l.requiredFields.length > 0))

  /** Lines with problems reported by the latest server quote. */
  const issues = computed(() => (quote.value?.lines ?? []).filter((l) => l.issue))
  const hasBlockingIssues = computed(() => issues.value.some((l) => l.issue && l.issue.code !== 'quantity_adjusted'))

  function persist() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines.value))
    } catch {
      /* storage unavailable (private mode) — cart stays in memory */
    }
  }

  function hydrate() {
    if (hydrated.value || !import.meta.client) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? (JSON.parse(raw) as CartLine[]) : []
      if (Array.isArray(parsed)) lines.value = parsed.filter((l) => l && l.lineId && l.productId && l.variantId)
    } catch {
      lines.value = []
    }
    hydrated.value = true
    watch(lines, persist, { deep: true })
  }

  function add(product: Product, variant: ProductVariant, quantity = 1) {
    const mergeable = product.requiredFields.length === 0
    const existing = mergeable ? lines.value.find((l) => l.variantId === variant.id) : undefined
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, existing.maxQuantity)
      existing.unitPriceToman = variant.priceToman
    } else {
      lines.value.push({
        lineId: uid(),
        productId: product.id,
        productSlug: product.slug,
        variantId: variant.id,
        name: product.name,
        brandName: product.brandName,
        variantLabel: variant.label,
        categorySlug: product.categorySlug,
        type: product.type,
        unitPriceToman: variant.priceToman,
        quantity: Math.min(Math.max(1, quantity), product.maxQuantityPerItem),
        maxQuantity: product.maxQuantityPerItem,
        requiredFields: product.requiredFields,
        fields: Object.fromEntries(product.requiredFields.map((f) => [f.key, ''])),
        addedAt: new Date().toISOString(),
      })
    }
    lastAddedAt.value = Date.now()
    quote.value = null
  }

  function remove(lineId: string) {
    lines.value = lines.value.filter((l) => l.lineId !== lineId)
    quote.value = null
  }

  function setQuantity(lineId: string, qty: number) {
    const line = lines.value.find((l) => l.lineId === lineId)
    if (!line) return
    line.quantity = Math.min(Math.max(1, Math.floor(qty) || 1), line.maxQuantity)
    quote.value = null
  }

  function setField(lineId: string, key: string, value: string) {
    const line = lines.value.find((l) => l.lineId === lineId)
    if (line) line.fields[key] = value
  }

  function clear() {
    lines.value = []
    quote.value = null
  }

  function toInput() {
    return lines.value.map((l) => ({
      lineId: l.lineId,
      productId: l.productId,
      variantId: l.variantId,
      quantity: l.quantity,
      knownUnitPriceToman: l.unitPriceToman,
    }))
  }

  /** Ask the server for authoritative prices, availability and totals. */
  async function refreshQuote() {
    if (!lines.value.length) {
      quote.value = null
      return null
    }
    quoteLoading.value = true
    quoteError.value = null
    try {
      quote.value = await useApi()<Quote>('/cart/quote', { method: 'POST', body: { items: toInput() } })
      // Apply server-side quantity limits immediately
      for (const ql of quote.value.lines) {
        const line = lines.value.find((l) => l.lineId === ql.lineId)
        if (line && ql.quantity > 0 && line.quantity !== ql.quantity) line.quantity = ql.quantity
      }
      return quote.value
    } catch (err) {
      quoteError.value = normalizeApiError(err).message
      return null
    } finally {
      quoteLoading.value = false
    }
  }

  /** User acknowledged changed prices → keep the new server prices as the shown prices. */
  function acceptPriceChanges() {
    for (const ql of quote.value?.lines ?? []) {
      const line = lines.value.find((l) => l.lineId === ql.lineId)
      if (line && ql.available) line.unitPriceToman = ql.unitPriceToman
    }
  }

  function removeUnavailable() {
    const bad = new Set((quote.value?.lines ?? []).filter((l) => !l.available).map((l) => l.lineId))
    lines.value = lines.value.filter((l) => !bad.has(l.lineId))
  }

  return {
    lines,
    quote,
    quoteLoading,
    quoteError,
    hydrated,
    lastAddedAt,
    count,
    isEmpty,
    needsInfo,
    issues,
    hasBlockingIssues,
    hydrate,
    add,
    remove,
    setQuantity,
    setField,
    clear,
    toInput,
    refreshQuote,
    acceptPriceChanges,
    removeUnavailable,
  }
})
