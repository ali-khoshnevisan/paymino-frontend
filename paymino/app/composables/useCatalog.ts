import type { Category } from '#shared/types'

export function useCategories() {
  const api = useApi()
  return useAsyncData('categories', () => api<Category[]>('/catalog/categories'), {
    default: () => [] as Category[],
    getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
  })
}
