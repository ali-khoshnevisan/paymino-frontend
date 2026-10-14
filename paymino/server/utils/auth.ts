import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import type { User } from '#shared/types'

const SESSION_COOKIE = 'pm_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `scrypt$${salt}$${hash}`
}

export function verifyPassword(password: string, stored: string) {
  const [, salt, hash] = stored.split('$')
  if (!salt || !hash) return false
  const candidate = scryptSync(password, salt, 64)
  const expected = Buffer.from(hash, 'hex')
  return candidate.length === expected.length && timingSafeEqual(candidate, expected)
}

export function passwordProblems(password: string): string[] {
  const problems: string[] = []
  if (password.length < 8) problems.push('رمز عبور باید حداقل ۸ کاراکتر باشد.')
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) problems.push('رمز عبور باید شامل حرف و عدد باشد.')
  return problems
}

export function startSession(event: H3Event, userId: string) {
  const token = randomBytes(32).toString('hex')
  db.sessions.set(token, { userId, expiresAt: Date.now() + SESSION_TTL_MS })
  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  })
}

export function endSession(event: H3Event) {
  const token = getCookie(event, SESSION_COOKIE)
  if (token) db.sessions.delete(token)
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}

export function getSessionUser(event: H3Event) {
  ensureSeeded()
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) return null
  const session = db.sessions.get(token)
  if (!session || session.expiresAt < Date.now()) {
    if (session) db.sessions.delete(token)
    return null
  }
  return db.users.get(session.userId) ?? null
}

export function requireUser(event: H3Event) {
  const user = getSessionUser(event)
  if (!user) apiError(401, 'برای ادامه وارد حساب کاربری شوید.', { code: 'not_authenticated' })
  return user
}

export function toPublicUser(u: StoredUser): User {
  return {
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    phone: u.phone,
    emailVerified: u.emailVerified,
    createdAt: u.createdAt,
  }
}

export function findUserByIdentifier(identifier: string) {
  const id = normalizeDigits(identifier.trim().toLowerCase())
  for (const u of db.users.values()) {
    if (u.email === id || (u.phone && u.phone === id)) return u
  }
  return null
}

/** Simple in-memory throttle: max `limit` attempts per window per key. */
export function throttle(key: string, limit = 8, windowMs = 10 * 60 * 1000) {
  const now = Date.now()
  const entry = db.loginAttempts.get(key)
  if (!entry || entry.resetAt < now) {
    db.loginAttempts.set(key, { count: 1, resetAt: now + windowMs })
    return
  }
  entry.count += 1
  if (entry.count > limit) {
    apiError(429, 'تعداد تلاش‌ها بیش از حد مجاز است. چند دقیقه بعد دوباره امتحان کنید.', { code: 'throttled' })
  }
}

export function makeVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}
