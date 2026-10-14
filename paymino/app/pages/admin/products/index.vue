<script setup lang="ts">
import { ImageOff, Package, Plus, Search } from 'lucide-vue-next'
import type { AdminCategory, AdminList, AdminProductRow } from '#shared/types/admin'
import type { ProductType } from '#shared/types'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'محصولات — مدیریت', robots: 'noindex, nofollow' })

const api = useApi()
const search = ref('')
const q = useDebounced(search, 200)
const category = ref('')
const type = ref('')
const active = ref('')
const lowStock = ref(false)

const { data: cats } = await useAsyncData('admin:categories', () => api<AdminList<AdminCategory>>('/admin/categories'))
const { data, status, error, refresh } = await useAsyncData(
  'admin:products',
  () =>
    api<AdminList<AdminProductRow>>('/admin/products', {
      query: { q: q.value || undefined, category: category.value || undefined, type: type.value || undefined, active: active.value || undefined, lowStock: lowStock.value ? '1' : undefined },
    }),
  { watch: [q, category, type, active, lowStock] },
)

const typeOptions = (Object.keys(PRODUCT_TYPE) as ProductType[]).map((t) => ({ value: t, label: PRODUCT_TYPE[t] }))
</script>

<template>
  <div>
    <AdminHeader title="محصولات" subtitle="کاتالوگ، قیمت‌ها و موجودی کدها">
      <UiButton to="/admin/products/new" variant="accent"><Plus class="size-4" aria-hidden="true" /> محصول جدید</UiButton>
    </AdminHeader>

    <div class="card overflow-hidden">
      <div class="flex flex-wrap items-end gap-3 border-b border-line p-4">
        <div class="relative min-w-52 flex-1">
          <Search class="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-navy-300" aria-hidden="true" />
          <input v-model="search" type="search" placeholder="نام، نام لاتین یا نامک…" aria-label="جست‌وجوی محصول"
            class="h-9 w-full rounded-[var(--radius-control)] border border-line bg-white ps-9 pe-3 text-sm focus:border-accent-500 focus:outline-none" />
        </div>
        <UiSelect v-model="category" label="دسته" hide-label size="sm" placeholder="همه دسته‌ها" :options="(cats?.results ?? []).map((c) => ({ value: String(c.id), label: c.name }))" class="w-44" />
        <UiSelect v-model="type" label="نوع" hide-label size="sm" placeholder="همه انواع" :options="typeOptions" class="w-40" />
        <UiSelect v-model="active" label="وضعیت انتشار" hide-label size="sm" placeholder="منتشر و پیش‌نویس" :options="[{ value: '1', label: 'منتشرشده' }, { value: '0', label: 'غیرفعال' }]" class="w-40" />
        <label class="flex h-9 items-center gap-2 text-sm"><input v-model="lowStock" type="checkbox" class="size-4 accent-accent-600" /> ناموجود</label>
      </div>

      <UiErrorState v-if="error" :message="normalizeApiError(error).message" @retry="refresh()" />
      <div v-else-if="!data" class="space-y-2 p-4"><div v-for="i in 6" :key="i" class="skeleton h-14" /></div>
      <UiEmptyState v-else-if="!data.results.length" :icon="Package" title="محصولی یافت نشد">
        <UiButton to="/admin/products/new" variant="accent">افزودن محصول</UiButton>
      </UiEmptyState>
      <ul v-else class="divide-y divide-line" :class="status === 'pending' ? 'opacity-60' : ''">
        <li v-for="p in data.results" :key="p.id">
          <NuxtLink :to="`/admin/products/${p.id}`" class="flex items-center gap-4 px-4 py-3 hover:bg-navy-50/50">
            <div class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-navy-50">
              <img v-if="p.imageUrl" :src="p.imageUrl" alt="" class="size-full object-cover" loading="lazy" />
              <ImageOff v-else class="size-5 text-navy-300" aria-hidden="true" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate font-semibold">{{ p.name }}</p>
              <p class="truncate text-xs text-muted"><span class="ltr">{{ p.brandName }}</span> — {{ p.categoryName }} — {{ PRODUCT_TYPE[p.type] }}</p>
            </div>
            <div class="hidden text-end text-sm sm:block">
              <p class="tabular">{{ p.minPriceToman ? `از ${formatToman(p.minPriceToman)}` : '—' }}</p>
              <p class="text-xs text-muted">{{ faNumber(p.variantCount) }} گزینه</p>
            </div>
            <div class="flex w-28 flex-col items-end gap-1">
              <UiBadge :tone="p.isActive ? 'success' : 'neutral'" dot>{{ p.isActive ? 'منتشرشده' : 'غیرفعال' }}</UiBadge>
              <UiBadge v-if="p.stock !== null" :tone="p.lowStock ? 'danger' : 'accent'">موجودی کد: {{ faNumber(p.stock) }}</UiBadge>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>
