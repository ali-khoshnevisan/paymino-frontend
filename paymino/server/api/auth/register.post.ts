// POST /api/auth/register  { fullName, email, phone?, password }
export default defineEventHandler(async (event) => {
  ensureSeeded()
  throttle(`register:${getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'}`, 10)

  const body = (await readBody<Record<string, unknown>>(event)) ?? {}
  const fullName = String(body.fullName ?? '').trim()
  const email = String(body.email ?? '').trim().toLowerCase()
  const phoneRaw = normalizeDigits(String(body.phone ?? '').trim())
  const phone = phoneRaw || null
  const password = String(body.password ?? '')

  const errors: Record<string, string[]> = {}
  if (fullName.length < 3) errors.fullName = ['نام و نام خانوادگی را کامل وارد کنید.']
  if (!EMAIL_RE.test(email)) errors.email = ['ایمیل معتبر وارد کنید.']
  if (phone && !IR_PHONE_RE.test(phone)) errors.phone = ['شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.']
  const pw = passwordProblems(password)
  if (pw.length) errors.password = pw

  for (const u of db.users.values()) {
    if (u.email === email) errors.email = ['با این ایمیل قبلاً حساب ساخته شده است.']
    if (phone && u.phone === phone) errors.phone = ['این شماره موبایل قبلاً ثبت شده است.']
  }
  if (Object.keys(errors).length) fieldErrors(errors)

  const code = makeVerificationCode()
  const user: StoredUser = {
    id: newId('usr'),
    fullName,
    email,
    phone,
    passwordHash: hashPassword(password),
    emailVerified: false,
    verificationCode: code,
    createdAt: nowIso(),
  }
  db.users.set(user.id, user)
  // Mock "email delivery": the code appears in the dev server console.
  console.info(`[mock-email] Verification code for ${email}: ${code}`)

  startSession(event, user.id)
  setResponseStatus(event, 201)
  return { user: toPublicUser(user) }
})
