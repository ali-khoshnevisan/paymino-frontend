import type { NormalizedApiError } from './useApi'

/**
 * Small helper for admin mutations: runs the request, shows a toast,
 * and exposes field errors for the form that triggered it.
 */
export function useAdminAction() {
  const busy = ref<string | null>(null)
  const errors = ref<Record<string, string>>({})
  const toast = useToast()

  async function run<T>(key: string, fn: () => Promise<T>, success?: string): Promise<T | null> {
    busy.value = key
    errors.value = {}
    try {
      const res = await fn()
      if (success) toast.show(success)
      return res
    } catch (err) {
      const e: NormalizedApiError = normalizeApiError(err)
      errors.value = e.fieldErrors
      toast.show(Object.keys(e.fieldErrors).length ? 'برخی فیلدها نیاز به اصلاح دارند.' : e.message, { tone: 'danger', duration: 6000 })
      return null
    } finally {
      busy.value = null
    }
  }

  return { busy, errors, run }
}

/** Debounced copy of a ref (search boxes). */
export function useDebounced<T>(source: Ref<T>, ms = 350) {
  const out = ref(source.value) as Ref<T>
  let t: ReturnType<typeof setTimeout> | undefined
  watch(source, (v) => {
    clearTimeout(t)
    t = setTimeout(() => (out.value = v), ms)
  })
  return out
}