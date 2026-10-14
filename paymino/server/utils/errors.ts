import type { ApiErrorBody } from '#shared/types'

/** Throw a DRF-shaped error: { detail, code, errors }. */
export function apiError(statusCode: number, detail: string, extra: Omit<ApiErrorBody, 'detail'> & Record<string, unknown> = {}): never {
  throw createError({
    statusCode,
    statusMessage: detail,
    data: { detail, ...extra },
  })
}

export function fieldErrors(errors: Record<string, string[]>): never {
  apiError(400, 'اطلاعات واردشده معتبر نیست.', { code: 'validation_error', errors })
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const IR_PHONE_RE = /^09\d{9}$/

export function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
}
