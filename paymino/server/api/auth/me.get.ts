// GET /api/auth/me → current user or 401
export default defineEventHandler((event) => {
  const user = requireUser(event)
  return { user: toPublicUser(user) }
})
