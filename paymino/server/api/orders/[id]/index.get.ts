// GET /api/orders/:id
export default defineEventHandler((event) => {
  const user = requireUser(event)
  const order = getOwnedOrder(getRouterParam(event, 'id') ?? '', user.id)
  return toOrderDto(order)
})
