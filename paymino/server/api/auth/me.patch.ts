// PATCH /api/auth/me  { fullName?, phone? }
export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const body = (await readBody<Record<string, unknown>>(event)) ?? {}
  const errors: Record<string, string[]> = {}

  if (body.fullName !== undefined) {
    const fullName = String(body.fullName).trim()
    if (fullName.length < 3) errors.fullName = ['نام و نام خانوادگی را کامل وارد کنید.']
    else user.fullName = fullName
  }
  if (body.phone !== undefined) {
    const phone = normalizeDigits(String(body.phone).trim()) || null
    if (phone && !IR_PHONE_RE.test(phone)) errors.phone = ['شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.']
    else if (phone && [...db.users.values()].some((u) => u.id !== user.id && u.phone === phone))
      errors.phone = ['این شماره موبایل قبلاً ثبت شده است.']
    else user.phone = phone
  }
  if (Object.keys(errors).length) fieldErrors(errors)
  return { user: toPublicUser(user) }
})
