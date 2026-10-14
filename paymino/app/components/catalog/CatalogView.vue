<script setup lang="ts">
import { PackageSearch, SlidersHorizontal, X } from 'lucide-vue-next'
import type { CatalogFacets, Paginated, ProductListItem } from '#shared/types'

const props = defineProps<{ category?: string }>()

const route = useRoute()
const router = useRouter()
const api = useApi()
const { data: categories } = useCategories()

const str = (v: unknown) => (typeof v === 'string' ? v : '')
const query = computed(() => ({
  q: str(route.query.q),
  category: props.category ?? str(route.query.category),
  provider: str(route.query.provider),
  region: str(route.query.region),
  duration: str(route.query.duration),
  minPrice: str(route.query.minPrice),
  maxPrice: str(route.query.maxPrice),
  ordering: str(route.query.ordering) || 'popular',
}))

const { data, status, error, refresh } = await useAsyncData(
  () => `catalog:${JSON.stringify(query.value)}`,
  () =>
    api<Paginated<ProductListItem> & { facets: CatalogFacets }>('/catalog/products', {
      query: Object.fromEntries(Object.entries(query.value).filter(([, v]) => v !== '')),
    }),
  { watch: [query] },
)

function setParam(key: string, value: string) {
  const next: Record<string, string> = {}
  for (const [k, v] of Object.entries(route.query)) if (typeof v === 'string' && v) next[k] = v
  if (value) next[key] = value
  else delete next[key]
  router.replace({ query: next })
}

const minPrice = ref(query.value.minPrice)
const maxPrice = ref(query.value.maxPrice)
watch(query, (q) => {
  minPrice.value = q.minPrice
  maxPrice.value = q.maxPrice
})

function applyPrice() {
  const next: Record<string, string> = {}
  for (const [k, v] of Object.entries(route.query)) if (typeof v === 'string' && v) next[k] = v
  const min = toAsciiDigits(minPrice.value).replace(/\D/g, '')
  const max = toAsciiDigits(maxPrice.value).replace(/\D/g, '')
  if (min) next.minPrice = min
  else delete next.minPrice
  if (max) next.maxPrice = max
  else delete next.maxPrice
  router.replace({ query: next })
}

const activeFilters = computed(() => {
  const f: Array<{ key: string; label: string }> = []
  const facets = data.value?.facets
  if (query.value.q) f.push({ key: 'q', label: `«${query.value.q}»` })
  if (!props.category && query.value.category)
    f.push({ key: 'category', label: categories.value.find((c) => c.slug === query.value.category)?.name ?? query.value.category })
  if (query.value.provider) f.push({ key: 'provider', label: facets?.providers.find((p) => p.value === query.value.provider)?.label ?? query.value.provider })
  if (query.value.region) f.push({ key: 'region', label: query.value.region })
  if (query.value.duration) f.push({ key: 'duration', label: durationLabel(Number(query.value.duration)) })
  if (query.value.minPrice) f.push({ key: 'minPrice', label: `از ${formatToman(Number(query.value.minPrice))}` })
  if (query.value.maxPrice) f.push({ key: 'maxPrice', label: `تا ${formatToman(Number(query.value.maxPrice))}` })
  return f
})

function clearAll() {
  router.replace({ query: query.value.ordering !== 'popular' ? { ordering: query.value.ordering } : {} })
}

const showFilters = ref(false)
const sortOptions = [
  { value: 'popular', label: 'محبوب‌ترین' },
  { value: 'newest', label: 'جدیدترین' },
  { value: 'price_asc', label: 'ارزان‌ترین' },
  { value: 'price_desc', label: 'گران‌ترین' },
]
const sortModel = computed({
  get: () => query.value.ordering,
  set: (v: string) => setParam('ordering', v === 'popular' ? '' : v),
})
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[260px_1fr] lg:gap-8">
    <!-- Filters -->
    <aside :class="showFilters ? 'block' : 'hidden lg:block'" aria-label="فیلتر محصولات">
      <div class="card space-y-6 p-5 lg:sticky lg:top-36">
        <div class="flex items-center justify-between">
          <h2 class="font-bold">فیلترها</h2>
          <button v-if="activeFilters.length" type="button" class="text-sm text-accent-700 hover:underline" @click="clearAll">حذف همه</button>
        </div>

        <fieldset v-if="!category && categories.length">
          <legend class="mb-2 text-sm font-semibold text-navy-800">دسته‌بندی</legend>
          <div class="space-y-1">
            <label v-for="c in [{ slug: '', name: 'همه' }, ...categories]" :key="c.slug" class="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-navy-50">
              <input type="radio" name="category" class="accent-accent-600" :checked="query.category === c.slug" @change="setParam('category', c.slug)" />
              {{ c.name }}
            </label>
          </div>
        </fieldset>

        <fieldset v-if="(data?.facets.providers.length ?? 0) > 1">
          <legend class="mb-2 text-sm font-semibold text-navy-800">ارائه‌دهنده</legend>
          <div class="space-y-1">
            <label class="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-navy-50">
              <input type="radio" name="provider" class="accent-accent-600" :checked="!query.provider" @change="setParam('provider', '')" />
              همه
            </label>
            <label v-for="p in data?.facets.providers" :key="p.value" class="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-navy-50">
              <input type="radio" name="provider" class="accent-accent-600" :checked="query.provider === p.value" @change="setParam('provider', p.value)" />
              <span class="ltr">{{ p.label }}</span>
              <span class="ms-auto text-xs text-muted">{{ faNumber(p.count) }}</span>
            </label>
          </div>
        </fieldset>

        <fieldset v-if="(data?.facets.regions.length ?? 0) > 1">
          <legend class="mb-2 text-sm font-semibold text-navy-800">منطقه</legend>
          <div class="space-y-1">
            <label class="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-navy-50">
              <input type="radio" name="region" class="accent-accent-600" :checked="!query.region" @change="setParam('region', '')" />
              همه
            </label>
            <label v-for="r in data?.facets.regions" :key="r.value" class="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-navy-50">
              <input type="radio" name="region" class="accent-accent-600" :checked="query.region === r.value" @change="setParam('region', r.value)" />
              {{ r.label }}
              <span class="ms-auto text-xs text-muted">{{ faNumber(r.count) }}</span>
            </label>
          </div>
        </fieldset>

        <fieldset v-if="(data?.facets.durations.length ?? 0) > 0">
          <legend class="mb-2 text-sm font-semibold text-navy-800">مدت اشتراک</legend>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="d in [{ value: '', label: 'همه' }, ...(data?.facets.durations ?? [])]"
              :key="d.value"
              type="button"
              class="rounded-full border px-3 py-1 text-sm"
              :class="query.duration === d.value ? 'border-accent-500 bg-accent-50 text-accent-800' : 'border-line hover:border-navy-200'"
              :aria-pressed="query.duration === d.value"
              @click="setParam('duration', d.value)"
            >
              {{ d.label }}
            </button>
          </div>
        </fieldset>

        <form class="space-y-3" @submit.prevent="applyPrice">
          <p class="text-sm font-semibold text-navy-800">محدوده قیمت (تومان)</p>
          <div class="grid grid-cols-2 gap-2">
            <UiInput v-model="minPrice" label="حداقل قیمت" hide-label placeholder="از" inputmode="numeric" />
            <UiInput v-model="maxPrice" label="حداکثر قیمت" hide-label placeholder="تا" inputmode="numeric" />
          </div>
          <UiButton type="submit" variant="secondary" size="sm" block>اعمال قیمت</UiButton>
        </form>
      </div>
    </aside>

    <!-- Results -->
    <section aria-label="نتایج" class="min-w-0">
      <div class="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          class="inline-flex h-9 items-center gap-2 rounded-[var(--radius-control)] border border-line bg-white px-3 text-sm font-medium lg:hidden"
          :aria-expanded="showFilters"
          @click="showFilters = !showFilters"
        >
          <SlidersHorizontal class="size-4" aria-hidden="true" />
          فیلترها
          <span v-if="activeFilters.length" class="rounded-full bg-accent-600 px-1.5 text-xs text-white">{{ faNumber(activeFilters.length) }}</span>
        </button>
        <p class="text-sm text-muted" aria-live="polite">
          <template v-if="status !== 'pending' && data">{{ faNumber(data.count) }} محصول</template>
        </p>
        <div class="ms-auto w-40">
          <UiSelect v-model="sortModel" label="مرتب‌سازی" hide-label :options="sortOptions" size="sm" />
        </div>
      </div>

      <div v-if="activeFilters.length" class="mb-4 flex flex-wrap gap-2">
        <button
          v-for="f in activeFilters"
          :key="f.key"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full bg-navy-900 py-1 ps-3 pe-2 text-sm text-white hover:bg-navy-800"
          :aria-label="`حذف فیلتر ${f.label}`"
          @click="setParam(f.key, '')"
        >
          {{ f.label }}
          <X class="size-3.5" aria-hidden="true" />
        </button>
      </div>

      <div v-if="status === 'pending' && !data" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <CatalogProductCardSkeleton v-for="i in 6" :key="i" />
      </div>

      <div v-else-if="error" class="card">
        <UiErrorState :message="normalizeApiError(error).message" :retrying="status === 'pending'" @retry="refresh()" />
      </div>

      <div v-else-if="data && data.results.length === 0" class="card">
        <UiEmptyState
          :icon="PackageSearch"
          title="محصولی پیدا نشد"
          description="با این فیلترها محصولی وجود ندارد. فیلترها را تغییر دهید یا عبارت دیگری جست‌وجو کنید."
        >
          <UiButton v-if="activeFilters.length" variant="secondary" @click="clearAll">حذف فیلترها</UiButton>
          <UiButton to="/shop" variant="ghost">مشاهده همه محصولات</UiButton>
        </UiEmptyState>
      </div>

      <div v-else-if="data" class="grid gap-4 transition-opacity sm:grid-cols-2 xl:grid-cols-3" :class="status === 'pending' ? 'opacity-60' : ''">
        <CatalogProductCard v-for="p in data.results" :key="p.id" :product="p" />
      </div>
    </section>
  </div>
</template>
