// GET /api/support/tickets/:id
export default defineEventHandler((event) => {
  const user = requireUser(event)
  const ticket = db.tickets.get(getRouterParam(event, 'id') ?? '')
  if (!ticket || ticket.userId !== user.id) apiError(404, 'درخواست یافت نشد.')
  const { userId: _u, ...dto } = ticket
  return dto
})
