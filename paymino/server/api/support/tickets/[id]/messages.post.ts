// POST /api/support/tickets/:id/messages  { body }
export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const ticket = db.tickets.get(getRouterParam(event, 'id') ?? '')
  if (!ticket || ticket.userId !== user.id) apiError(404, 'درخواست یافت نشد.')
  if (ticket.status === 'closed') apiError(409, 'این درخواست بسته شده است.')

  const input = (await readBody<Record<string, unknown>>(event)) ?? {}
  const message = String(input.body ?? '').trim()
  if (message.length < 2) fieldErrors({ body: ['پیام را وارد کنید.'] })
  if (message.length > 3000) fieldErrors({ body: ['پیام بیش از حد طولانی است.'] })

  ticket.messages.push({ from: 'user', body: message, at: nowIso() })
  ticket.status = 'open'
  ticket.updatedAt = nowIso()
  const { userId: _u, ...dto } = ticket
  return dto
})
