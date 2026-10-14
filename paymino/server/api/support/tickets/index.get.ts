// GET /api/support/tickets
export default defineEventHandler((event) => {
  const user = requireUser(event)
  const results = [...db.tickets.values()]
    .filter((t) => t.userId === user.id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map(({ userId: _u, ...t }) => t)
  return { count: results.length, results }
})
