<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import type { ProductListItem } from '#shared/types'
const props = defineProps<{ product: ProductListItem }>()

const meta = computed(() => {
  const p = props.product
  const parts = [PRODUCT_TYPE[p.type]]
  if (p.regions[0]) parts.push(p.regions[0])
  if (p.variantCount > 1) parts.push(`${faNumber(p.variantCount)} ${p.durations.length ? 'پلن' : 'مبلغ'}`)
  return parts.join(' · ')
})
</script>

<template>
  <article
      class="group relative flex flex-col overflow-hidden rounded-[18px] bg-white ring-1 ring-navy-900/[0.06] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_40px_-24px_rgb(11_31_58/0.45)] has-[:focus-visible]:-translate-y-1"
  >
    <CatalogProductVisual
        :image-url="product.imageUrl"
        :provider-slug="product.providerSlug"
        :category-slug="product.categorySlug"
        :brand-name="product.brandName"
        :type="product.type"
    />
    <span
        v-if="product.discountPercent"
        class="pointer-events-none absolute top-3 start-3 z-20 rounded-full bg-[#e5484d] px-3 py-1 text-sm leading-6 font-extrabold text-white"
    >
      {{ faNumber(product.discountPercent) }}٪ تخفیف
    </span>
    <div class="flex flex-1 flex-col p-5">
      <p class="truncate text-[13px] text-muted">{{ meta }}</p>
      <h3 class="mt-1 text-[17px] leading-8 font-extrabold">
        <NuxtLink :to="`/p/${product.slug}`" class="after:absolute after:inset-0 after:z-10 focus-visible:outline-none">
          {{ product.name }}
        </NuxtLink>
      </h3>
      <p class="mt-1 line-clamp-2 text-sm leading-7 text-navy-700">{{ product.shortDescription }}</p>
      <div class="mt-auto flex items-center justify-between gap-3 pt-5">
        <div v-if="product.minPriceToman !== null" class="flex flex-col items-start">
          <s v-if="product.minOriginalPriceToman" class="tabular text-[13px] leading-5 text-muted">
            <span class="sr-only">قیمت پیش از تخفیف:</span>{{ faNumber(product.minOriginalPriceToman) }}
          </s>
          <UiPriceTag :amount="product.minPriceToman" size="lg" :prefix="product.variantCount > 1 ? 'از' : undefined" />
        </div>
        <span v-else class="text-sm font-semibold text-muted">ناموجود</span>
        <span
            class="flex size-11 shrink-0 items-center justify-center rounded-full bg-navy-900 text-white transition-[background-color,transform] duration-300 group-hover:-translate-x-1 group-hover:bg-accent-600"
            aria-hidden="true"
        >
          <ArrowLeft class="size-5" />
        </span>
      </div>
    </div>
  </article>
</template>
