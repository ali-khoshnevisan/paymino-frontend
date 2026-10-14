// POST /api/auth/password-reset  { email }  → always 200 (no account enumeration)
import { randomBytes } from 'node:crypto'

export default defineEventHandler(async (event) => {
  ensureSeeded()
  throttle(`reset:${getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'}`, 5)
  const body = (await readBody<Record<string, unknown>>(event)) ?? {}
  const email = String(body.email ?? '').trim().toLowerCase()
  if (!EMAIL_RE.test(email)) fieldErrors({ email: ['ایمیل معتبر وارد کنید.'] })

  const user = [...db.users.values()].find((u) => u.email === email)
  if (user) {
    const token = randomBytes(24).toString('hex')
    db.resetTokens.set(token, { userId: user.id, expiresAt: Date.now() + 30 * 60 * 1000 })
    console.info(`[mock-email] Password reset link for ${email}: /auth/reset-password?token=${token}`)
  }
  return { ok: true }
})
