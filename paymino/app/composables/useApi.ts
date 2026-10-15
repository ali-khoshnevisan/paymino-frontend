import axios, { type Method } from 'axios'
import type { ApiErrorBody } from '#shared/types'

export interface ApiRequestOptions {
  method?: Method
  body?: unknown
  query?: Record<string, unknown>
  headers?: Record<string, string>
}

/**
 * Axios client for the Paymino Django REST API.
 * - Sends cookies (session auth); forwards the browser cookie during SSR.
 * - During SSR, uses the internal apiBaseServer when configured.
 * - Never retries requests automatically.
 *
 * Usage: `const api = useApi(); const user = await api<User>('/auth/me')`
 *        `await api('/orders', { method: 'POST', body, headers: { 'Idempotency-Key': key } })`
 */
export function useApi() {
  const config = useRuntimeConfig()
  // Resolve to a plain string so this doesn't depend on Nuxt's generated runtime-config types
  const serverBase = String((config as { apiBaseServer?: unknown }).apiBaseServer ?? '')
  const publicBase = String(config.public.apiBase ?? '')
  const baseURL: string = import.meta.server && serverBase ? serverBase : publicBase

  const client = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 20000,
    headers: {
      Accept: 'application/json',
      ...(import.meta.server ? (useRequestHeaders(['cookie']) as Record<string, string>) : {}),
    },
  })

  return async function api<T = unknown>(url: string, opts: ApiRequestOptions = {}): Promise<T> {
    const res = await client.request<T>({
      url,
      method: opts.method ?? 'GET',
      data: opts.body,
      params: opts.query,
      headers: opts.headers,
    })
    return res.data
  }
}

export interface NormalizedApiError {
  status: number
  message: string
  code: string | null
  fieldErrors: Record<string, string>
  data: Record<string, unknown> | null
}

/** Normalize axios errors with DRF bodies ({detail}, {errors: {field: [msg]}} or {field: [msg]}) into one shape. */
export function normalizeApiError(err: unknown, fallback = 'خطایی رخ داد. لطفاً دوباره تلاش کنید.'): NormalizedApiError {
  const e = err as { response?: { status?: number; data?: unknown } }
  const status = e?.response?.status ?? 0 // 0 = network error / timeout
  const raw = e?.response?.data
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