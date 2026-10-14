// GET /api/orders?status=active|completed|all
export default defineEventHandler((event) => {
  const user = requireUser(event)
  const filter = String(getQuery(event).status ?? 'all')
  const activeStates = ['pending_payment', 'payment_verification', 'paid', 'processing', 'awaiting_customer_info', 'refund_pending']

  const orders = [...db.orders.values()]
    .filter((o) => o.userId === user.id)
    .map((o) => {
      refreshInvoiceExpiry(o)
      return o
    })
    .filter((o) => (filter === 'active' ? activeStates.includes(o.status) : filter === 'completed' ? !activeStates.includes(o.status) : true))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(toOrderListItem)

  return { count: orders.length, results: orders }
})
