// POST /api/auth/resend-verification
export default defineEventHandler((event) => {
  const user = requireUser(event)
  throttle(`resend:${user.id}`, 3, 5 * 60 * 1000)
  if (user.emailVerified) return { ok: true }
  user.verificationCode = makeVerificationCode()
  console.info(`[mock-email] Verification code for ${user.email}: ${user.verificationCode}`)
  return { ok: true }
})
