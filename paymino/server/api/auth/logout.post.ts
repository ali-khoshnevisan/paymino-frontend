// POST /api/auth/logout
export default defineEventHandler((event) => {
  endSession(event)
  return { ok: true }
})
