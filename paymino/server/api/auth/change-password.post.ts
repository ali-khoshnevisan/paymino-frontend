// POST /api/auth/change-password  { currentPassword, newPassword }
export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  throttle(`change-pw:${user.id}`, 5)
  const body = (await readBody<Record<string, unknown>>(event)) ?? {}
  const current = String(body.currentPassword ?? '')
  const next = String(body.newPassword ?? '')

  if (!verifyPassword(current, user.passwordHash)) fieldErrors({ currentPassword: ['رمز عبور فعلی اشتباه است.'] })
  const problems = passwordProblems(next)
  if (problems.length) fieldErrors({ newPassword: problems })

  user.passwordHash = hashPassword(next)
  // Invalidate other sessions, keep the current one
  for (const [token, s] of db.sessions) if (s.userId === user.id) db.sessions.delete(token)
  startSession(event, user.id)
  return { ok: true }
})
