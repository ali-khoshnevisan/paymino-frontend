import type { ApiErrorBody } from '#shared/types'

/**
 * Typed fetch client for the Paymino API (mock today, Django REST later).
 * - Sends cookies (session auth); forwards the browser cookie during SSR.
 * - Never retries mutations automatically.
 */
export function useApi() {
  const config = useRuntimeConfig()
  const headers: Record<string, string> = import.meta.server ? (useRequestHeaders(['cookie']) as Record<string, string>) : {}

  return $fetch.create({
    baseURL: config.public.apiBase,
    credentials: 'include',
    headers,
    retry: 0,
    timeout: 20000,
  })
}

export interface NormalizedApiError {
  status: number
  message: string
  code: string | null
  fieldErrors: Record<string, string>
  data: Record<string, unknown> | null
}

/** Normalize Nuxt mock errors and DRF errors ({detail} or {field: [msg]}) into one shape. */
export function normalizeApiError(err: unknown, fallback = 'خطایی رخ داد. لطفاً دوباره تلاش کنید.'): NormalizedApiError {
  const e = err as { statusCode?: number; status?: number; data?: unknown; response?: { status?: number } }
  const status = e?.statusCode ?? e?.status ?? e?.response?.status ?? 0
  const raw = (e?.data as { data?: unknown })?.data ?? e?.data
  const body = (raw && typeof raw === 'object' ? raw : {}) as ApiErrorBody & Record<string, unknown>

  const fieldErrors: Record<string, string> = {}
  const source = body.errors ?? Object.fromEntries(Object.entries(body).filter(([, v]) => Array.isArray(v)))
  for (const [k, v] of Object.entries(source ?? {})) {
    if (Array.isArray(v) && v.length) fieldErrors[k] = String(v[0])
  }

  let message = typeof body.detail === 'string' ? body.detail : ''
  if (!message) {
    if (status === 0) message = 'ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید.'
    else if (status === 401) message = 'برای ادامه وارد حساب کاربری شوید.'
    else if (status === 403) message = 'اجازه دسترسی به این بخش را ندارید.'
    else if (status === 404) message = 'موردی یافت نشد.'
    else if (status === 429) message = 'تعداد درخواست‌ها زیاد است. کمی بعد دوباره تلاش کنید.'
    else if (status >= 500) message = 'خطای سرور. لطفاً چند لحظه بعد دوباره تلاش کنید.'
    else message = fallback
  }

  return { status, message, code: typeof body.code === 'string' ? body.code : null, fieldErrors, data: body }
}
