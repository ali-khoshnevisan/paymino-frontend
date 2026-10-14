// GET /api/catalog/products?q=&category=&provider=&region=&duration=&minPrice=&maxPrice=&ordering=&page=&pageSize=
import type { CatalogFacets, FacetOption, Paginated, ProductListItem } from '#shared/types'

export default defineEventHandler((event): Paginated<ProductListItem> & { facets: CatalogFacets } => {
  const q = getQuery(event)
  const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined)
  const num = (v: unknown) => {
    const n = Number(v)
    return Number.isFinite(n) && String(v).trim() !== '' ? n : undefined
  }

  const search = str(q.q)
  const category = str(q.category)
  const provider = str(q.provider)
  const region = str(q.region)
  const duration = num(q.duration)
  const minPrice = num(q.minPrice)
  const maxPrice = num(q.maxPrice)
  const ordering = str(q.ordering) ?? 'popular'
  const page = Math.max(1, num(q.page) ?? 1)
  const pageSize = Math.min(48, Math.max(1, num(q.pageSize) ?? 24))

  const toItem = (p: (typeof catalog)[number]): ProductListItem => {
    const prices = p.variants.filter((v) => v.available).map((v) => v.priceToman)
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      brandName: p.brandName,
      categorySlug: p.categorySlug,
      providerSlug: p.providerSlug,
      type: p.type,
      shortDescription: p.shortDescription,
      imageUrl: p.imageUrl,
      regions: p.regions,
      available: p.available && prices.length > 0,
      createdAt: p.createdAt,
      minPriceToman: prices.length ? Math.min(...prices) : null,
      variantCount: p.variants.length,
      durations: [...new Set(p.variants.map((v) => v.durationMonths).filter((d): d is number => !!d))],
    }
  }

  // Base set: published products in the category / search scope (facets come from here)
  let base = catalog.filter((p) => p.available)
  if (category) base = base.filter((p) => p.categorySlug === category)
  if (search) {
    const needle = normalizeSearch(search)
    base = base.filter((p) =>
      [p.name, p.brandName, p.shortDescription, providerName(p.providerSlug)].some((t) => normalizeSearch(t).includes(needle)),
    )
  }

  let filtered = base
  if (provider) filtered = filtered.filter((p) => p.providerSlug === provider)
  if (region) filtered = filtered.filter((p) => p.regions.includes(region))
  if (duration) filtered = filtered.filter((p) => p.variants.some((v) => v.durationMonths === duration))

  let items = filtered.map((p) => ({ item: toItem(p), popularity: p.popularity }))
  if (minPrice !== undefined) items = items.filter((x) => x.item.minPriceToman !== null && x.item.minPriceToman >= minPrice)
  if (maxPrice !== undefined) items = items.filter((x) => x.item.minPriceToman !== null && x.item.minPriceToman <= maxPrice)

  const price = (x: (typeof items)[number]) => x.item.minPriceToman ?? Number.MAX_SAFE_INTEGER
  items.sort((a, b) => {
    switch (ordering) {
      case 'newest':
        return b.item.createdAt.localeCompare(a.item.createdAt)
      case 'price_asc':
        return price(a) - price(b)
      case 'price_desc':
        return price(b) - price(a)
      default:
        return b.popularity - a.popularity
    }
  })

  const count = items.length
  const results = items.slice((page - 1) * pageSize, page * pageSize).map((x) => x.item)

  // Facets
  const tally = (values: string[], label: (v: string) => string): FacetOption[] => {
    const m = new Map<string, number>()
    values.forEach((v) => m.set(v, (m.get(v) ?? 0) + 1))
    return [...m.entries()].map(([value, c]) => ({ value, label: label(value), count: c }))
  }
  const baseItems = base.map(toItem)
  const prices = baseItems.map((i) => i.minPriceToman).filter((p): p is number => p !== null)

  const facets: CatalogFacets = {
    providers: tally(base.map((p) => p.providerSlug), providerName),
    regions: tally(base.flatMap((p) => p.regions), (v) => v),
    durations: tally(
      baseItems.flatMap((i) => i.durations.map(String)),
      (v) => (v === '12' ? 'سالانه' : v === '1' ? 'ماهانه' : `${v} ماهه`),
    ),
    priceRange: prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : null,
  }

  return { count, results, facets }
})
