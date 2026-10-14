// POST /api/auth/password-reset-confirm  { token, password }
export default defineEventHandler(async (event) => {
  const body = (await readBody<Record<string, unknown>>(event)) ?? {}
  const token = String(body.token ?? '')
  const password = String(body.password ?? '')

  const entry = db.resetTokens.get(token)
  if (!entry || entry.expiresAt < Date.now()) {
    apiError(400, 'لینک بازیابی نامعتبر است یا منقضی شده است.', { code: 'invalid_token' })
  }
  const problems = passwordProblems(password)
  if (problems.length) fieldErrors({ password: problems })

  const user = db.users.get(entry.userId)
  if (!user) apiError(400, 'لینک بازیابی نامعتبر است.', { code: 'invalid_token' })
  user.passwordHash = hashPassword(password)
  db.resetTokens.delete(token)
  for (const [t, s] of db.sessions) if (s.userId === user.id) db.sessions.delete(t)
  return { ok: true }
})
