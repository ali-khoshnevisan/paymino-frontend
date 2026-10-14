<script setup lang="ts">
import { Check, Clock, Globe, PackageCheck, ShieldCheck, ShoppingBag, TriangleAlert, FileText, Undo2 } from 'lucide-vue-next'
import type { Product } from '#shared/types'

const route = useRoute()
const api = useApi()
const cart = useCartStore()
const toast = useToast()
const { data: categories } = useCategories()

const { data: product, error, status, refresh } = await useAsyncData(`product:${route.params.slug}`, () =>
  api<Product>(`/catalog/products/${route.params.slug}`),
)

if (error.value && normalizeApiError(error.value).status === 404) {
  throw createError({ statusCode: 404, statusMessage: 'محصول یافت نشد', fatal: true })
}

const category = computed(() => categories.value.find((c) => c.slug === product.value?.categorySlug))

const selectedId = ref<string>('')
watch(
  product,
  (p) => {
    if (p && !p.variants.some((v) => v.id === selectedId.value)) {
      selectedId.value = p.variants.find((v) => v.available)?.id ?? ''
    }
  },
  { immediate: true },
)
const selected = computed(() => product.value?.variants.find((v) => v.id === selectedId.value))
const quantity = ref(1)
watch(selectedId, () => (quantity.value = 1))
const lineTotal = computed(() => (selected.value ? selected.value.priceToman * quantity.value : 0))

function addToCart() {
  if (!product.value || !selected.value?.available) return
  cart.add(product.value, selected.value, quantity.value)
  toast.show(`${product.value.name} (${selected.value.label}) به سبد خرید اضافه شد.`, { action: { label: 'مشاهده سبد', to: '/cart' } })
}

useSeoMeta({
  title: () => product.value?.name ?? 'محصول',
  description: () => product.value?.shortDescription ?? '',
})
</script>

<template>
  <div class="container-page py-8">
    <div v-if="error" class="card">
      <UiErrorState :message="normalizeApiError(error).message" :retrying="status === 'pending'" @retry="refresh()" />
    </div>

    <template v-else-if="product">
      <UiBreadcrumbs
        :items="[
          { label: 'محصولات', to: '/shop' },
          ...(category ? [{ label: category.name, to: `/c/${category.slug}` }] : []),
          { label: product.name },
        ]"
      />

      <!-- Mobile order: header → purchase → details. Desktop: purchase panel in its own column. -->
      <div class="mt-6 grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-x-10">
        <div class="order-1 min-w-0 lg:order-none lg:col-start-1 lg:row-start-1">
          <div class="grid gap-6 sm:grid-cols-[minmax(0,280px)_1fr] sm:items-start">
            <CatalogProductVisual :image-url="product.imageUrl" :category-slug="product.categorySlug" :brand-name="product.brandName" size="hero" />
            <div>
              <div class="mb-3 flex flex-wrap gap-1.5">
                <UiBadge>{{ PRODUCT_TYPE[product.type] }}</UiBadge>
                <UiBadge v-for="r in product.regions" :key="r" tone="accent">{{ r }}</UiBadge>
              </div>
              <h1 class="text-2xl leading-[1.6] font-extrabold sm:text-[28px]">{{ product.name }}</h1>
              <p class="mt-1 text-sm text-muted"><bdi class="ltr">{{ product.brandName }}</bdi></p>
              <p class="mt-4 text-[15px] leading-8 text-navy-700">{{ product.description }}</p>
            </div>
          </div>
        </div>

        <div class="order-3 min-w-0 space-y-8 lg:order-none lg:col-start-1 lg:row-start-2">
          <section aria-labelledby="spec-title" class="card p-5 sm:p-6">
            <h2 id="spec-title" class="mb-4 text-lg font-bold">مشخصات و تحویل</h2>
            <dl class="grid gap-4 sm:grid-cols-2">
              <div class="flex gap-3">
                <PackageCheck class="mt-1 size-5 shrink-0 text-navy-400" aria-hidden="true" />
                <div>
                  <dt class="text-sm text-muted">روش تحویل</dt>
                  <dd class="font-medium">{{ product.deliveryMethod }}</dd>
                </div>
              </div>
              <div class="flex gap-3">
                <Clock class="mt-1 size-5 shrink-0 text-navy-400" aria-hidden="true" />
                <div>
                  <dt class="text-sm text-muted">زمان تحویل</dt>
                  <dd class="font-medium">{{ product.fulfillmentEstimate ?? 'پس از تأیید پرداخت؛ وضعیت در صفحه سفارش نمایش داده می‌شود' }}</dd>
                </div>
              </div>
              <div class="flex gap-3">
                <Globe class="mt-1 size-5 shrink-0 text-navy-400" aria-hidden="true" />
                <div>
                  <dt class="text-sm text-muted">منطقه قابل استفاده</dt>
                  <dd class="font-medium">{{ product.regions.join('، ') }}</dd>
                </div>
              </div>
              <div class="flex gap-3">
                <ShieldCheck class="mt-1 size-5 shrink-0 text-navy-400" aria-hidden="true" />
                <div>
                  <dt class="text-sm text-muted">اطلاعات موردنیاز</dt>
                  <dd class="font-medium">
                    {{ product.requiredFields.length ? product.requiredFields.map((f) => f.label).join('، ') : 'اطلاعات اضافه‌ای لازم نیست' }}
                  </dd>
                </div>
              </div>
            </dl>
          </section>

          <section v-if="product.restrictions.length" aria-labelledby="res-title">
            <h2 id="res-title" class="mb-3 flex items-center gap-2 text-lg font-bold">
              <TriangleAlert class="size-5 text-amber-600" aria-hidden="true" /> محدودیت‌ها و شرایط استفاده
            </h2>
            <UiAlert tone="warning">
              <ul class="list-disc space-y-1 ps-5">
                <li v-for="(r, i) in product.restrictions" :key="i">{{ r }}</li>
              </ul>
            </UiAlert>
          </section>

          <section v-if="product.redemptionNotes.length" aria-labelledby="red-title">
            <h2 id="red-title" class="mb-3 flex items-center gap-2 text-lg font-bold">
              <FileText class="size-5 text-navy-400" aria-hidden="true" /> راهنمای استفاده
            </h2>
            <ul class="space-y-2">
              <li v-for="(n, i) in product.redemptionNotes" :key="i" class="flex gap-2.5 text-[15px] leading-7 text-navy-700">
                <Check class="mt-1.5 size-4 shrink-0 text-accent-600" aria-hidden="true" />
                <span>{{ n }}</span>
              </li>
            </ul>
          </section>

          <section aria-labelledby="ref-title" class="card p-5 sm:p-6">
            <h2 id="ref-title" class="mb-2 flex items-center gap-2 text-lg font-bold">
              <Undo2 class="size-5 text-navy-400" aria-hidden="true" /> شرایط لغو و بازپرداخت
            </h2>
            <p class="text-[15px] leading-8 text-navy-700">{{ product.refundPolicy }}</p>
            <NuxtLink to="/refund-policy" class="mt-2 inline-block text-sm font-semibold text-accent-700 hover:underline">قوانین کامل بازپرداخت</NuxtLink>
          </section>
        </div>

        <!-- Purchase panel -->
        <aside aria-label="خرید" class="order-2 lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div class="card p-5 lg:sticky lg:top-36">
            <fieldset>
              <legend class="mb-3 font-bold">{{ product.type === 'gift_card' ? 'مبلغ کارت را انتخاب کنید' : 'پلن را انتخاب کنید' }}</legend>
              <div class="grid gap-2" :class="product.type === 'gift_card' ? 'grid-cols-3' : 'grid-cols-1'">
                <label
                  v-for="v in product.variants"
                  :key="v.id"
                  class="relative flex cursor-pointer rounded-[var(--radius-control)] border p-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent-500"
                  :class="[
                    !v.available ? 'cursor-not-allowed border-dashed border-line bg-canvas text-navy-300' : selectedId === v.id ? 'border-accent-500 bg-accent-50 ring-1 ring-accent-500' : 'border-line hover:border-navy-200',
                    product.type === 'gift_card' ? 'flex-col items-center text-center' : 'items-center justify-between gap-3',
                  ]"
                >
                  <input v-model="selectedId" type="radio" name="variant" :value="v.id" :disabled="!v.available" class="sr-only" />
                  <span class="font-bold" :class="product.type === 'gift_card' ? 'ltr text-lg' : 'text-sm'">{{ v.label }}</span>
                  <span v-if="!v.available" class="text-xs">ناموجود</span>
                  <span v-else class="tabular text-xs text-muted">{{ formatToman(v.priceToman) }}</span>
                </label>
              </div>
            </fieldset>

            <div v-if="selected" class="mt-5 space-y-4 border-t border-line pt-5">
              <dl class="space-y-2 text-sm">
                <div v-if="selected.region" class="flex justify-between gap-3">
                  <dt class="text-muted">منطقه</dt>
                  <dd class="font-medium">{{ selected.region }}</dd>
                </div>
                <div v-if="selected.durationMonths" class="flex justify-between gap-3">
                  <dt class="text-muted">مدت</dt>
                  <dd class="font-medium">{{ durationLabel(selected.durationMonths) }}</dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-muted">قیمت واحد</dt>
                  <dd class="tabular font-medium">{{ formatToman(selected.priceToman) }}</dd>
                </div>
              </dl>

              <div v-if="product.maxQuantityPerItem > 1" class="flex items-center justify-between">
                <span class="text-sm text-muted">تعداد</span>
                <UiQuantity v-model="quantity" :max="product.maxQuantityPerItem" />
              </div>

              <div class="flex items-center justify-between rounded-[var(--radius-control)] bg-canvas px-4 py-3">
                <span class="text-sm font-semibold">جمع</span>
                <UiPriceTag :amount="lineTotal" size="lg" />
              </div>

              <UiButton variant="accent" size="lg" block :disabled="!selected.available" @click="addToCart">
                <ShoppingBag class="size-5" aria-hidden="true" />
                افزودن به سبد خرید
              </UiButton>

              <p class="text-xs leading-6 text-muted">
                کارمزد خدمات و مبلغ نهایی در سبد خرید نمایش داده می‌شود.
                <template v-if="product.requiredFields.length"> اطلاعات حساب ({{ product.requiredFields.map((f) => f.label).join('، ') }}) هنگام تکمیل خرید دریافت می‌شود.</template>
              </p>
            </div>
            <UiAlert v-else tone="warning" class="mt-4">در حال حاضر هیچ گزینه‌ای از این محصول موجود نیست.</UiAlert>
          </div>
        </aside>
      </div>
    </template>

    <div v-else class="grid gap-8 lg:grid-cols-[1fr_400px]" aria-busy="true">
      <div class="space-y-4">
        <div class="skeleton h-6 w-40" />
        <div class="skeleton h-64" />
      </div>
      <div class="skeleton h-96" />
    </div>
  </div>
</template>
