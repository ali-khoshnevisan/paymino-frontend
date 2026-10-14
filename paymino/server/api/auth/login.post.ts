// POST /api/auth/login  { identifier (email or phone), password }
export default defineEventHandler(async (event) => {
  ensureSeeded()
  const body = (await readBody<Record<string, unknown>>(event)) ?? {}
  const identifier = String(body.identifier ?? '').trim()
  const password = String(body.password ?? '')

  throttle(`login:${getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'}:${identifier.toLowerCase()}`)

  const errors: Record<string, string[]> = {}
  if (!identifier) errors.identifier = ['ایمیل یا شماره موبایل را وارد کنید.']
  if (!password) errors.password = ['رمز عبور را وارد کنید.']
  if (Object.keys(errors).length) fieldErrors(errors)

  const user = findUserByIdentifier(identifier)
  // One generic message: never reveal whether the account exists.
  if (!user || !verifyPassword(password, user.passwordHash)) {
    apiError(400, 'ایمیل/موبایل یا رمز عبور اشتباه است.', { code: 'invalid_credentials' })
  }

  startSession(event, user.id)
  return { user: toPublicUser(user) }
})
