// POST /api/auth/verify-email  { code }
export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  throttle(`verify:${user.id}`, 10)
  const body = (await readBody<Record<string, unknown>>(event)) ?? {}
  const code = normalizeDigits(String(body.code ?? '').trim())

  if (user.emailVerified) return { user: toPublicUser(user) }
  if (!user.verificationCode || code !== user.verificationCode) {
    fieldErrors({ code: ['کد واردشده صحیح نیست.'] })
  }
  user.emailVerified = true
  user.verificationCode = null
  return { user: toPublicUser(user) }
})
