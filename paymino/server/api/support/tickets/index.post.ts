// POST /api/support/tickets  { subject, orderNumber?, body }
export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  throttle(`ticket:${user.id}`, 10, 60 * 60 * 1000)
  const input = (await readBody<Record<string, unknown>>(event)) ?? {}
  const subject = String(input.subject ?? '').trim()
  const message = String(input.body ?? '').trim()
  const orderNumber = String(input.orderNumber ?? '').trim() || null

  const errors: Record<string, string[]> = {}
  if (subject.length < 3) errors.subject = ['موضوع درخواست را وارد کنید.']
  if (message.length < 10) errors.body = ['توضیحات باید حداقل ۱۰ کاراکتر باشد.']
  if (message.length > 3000) errors.body = ['توضیحات بیش از حد طولانی است.']
  if (orderNumber && ![...db.orders.values()].some((o) => o.userId === user.id && o.number === orderNumber)) {
    errors.orderNumber = ['سفارشی با این شماره در حساب شما یافت نشد.']
  }
  if (Object.keys(errors).length) fieldErrors(errors)

  const at = nowIso()
  const ticket: StoredTicket = {
    id: newId('tkt'),
    number: nextTicketNumber(),
    userId: user.id,
    subject,
    orderNumber,
    status: 'open',
    messages: [{ from: 'user', body: message, at }],
    createdAt: at,
    updatedAt: at,
  }
  db.tickets.set(ticket.id, ticket)
  setResponseStatus(event, 201)
  const { userId: _u, ...dto } = ticket
  return dto
})
