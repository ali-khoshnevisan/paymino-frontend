const numberFmt = new Intl.NumberFormat('fa-IR')
const dateTimeFmt = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' })
const dateFmt = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' })

export function faNumber(n: number | string) {
  const v = typeof n === 'string' ? Number(n) : n
  return Number.isFinite(v) ? numberFmt.format(v) : String(n)
}

/** Persian digits for an arbitrary string (keeps Latin text). */
export function faDigits(s: string | number) {
  return String(s).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]!)
}

export function formatToman(n: number) {
  return `${faNumber(n)} تومان`
}

export function formatDateTime(iso: string) {
  return dateTimeFmt.format(new Date(iso))
}

export function formatDate(iso: string) {
  return dateFmt.format(new Date(iso))
}

export function durationLabel(months?: number) {
  if (!months) return ''
  if (months === 1) return 'ماهانه'
  if (months === 12) return 'سالانه'
  return `${faNumber(months)} ماهه`
}

/** Convert Persian/Arabic digits typed by users to ASCII. */
export function toAsciiDigits(s: string) {
  return s
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
}

export function safeRedirect(target: unknown, fallback = '/account') {
  const t = typeof target === 'string' ? target : ''
  return t.startsWith('/') && !t.startsWith('//') && !t.startsWith('/\\') ? t : fallback
}

/** Random id that also works on plain-http origins (crypto.randomUUID needs a secure context). */
export function uid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}

export function shortHash(s: string, keep = 8) {
  return s.length > keep * 2 + 3 ? `${s.slice(0, keep)}…${s.slice(-keep)}` : s
}

/** Preview of the server's discount rounding (catalog/models.py → discounted_price). Server prices are authoritative. */
export function discountedPrice(price: number, percent: number | null | undefined) {
  if (!percent) return price
  const final = Math.round((price * (100 - percent)) / 100 / 1000) * 1000
  return final > 0 && final < price ? final : price
}
