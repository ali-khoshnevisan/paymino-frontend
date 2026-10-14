// GET /api/catalog/products/:slug
export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug') ?? ''
  const product = findProductBySlug(slug)
  if (!product || !product.available) apiError(404, 'محصول یافت نشد.', { code: 'product_not_found' })
  return toPublicProduct(product)
})
