<script setup lang="ts">
import type { ProductListItem } from '#shared/types'
defineProps<{ product: ProductListItem }>()
</script>

<template>
  <article class="card group relative flex flex-col overflow-hidden transition-shadow hover:shadow-[var(--shadow-raised)]">
    <CatalogProductVisual :image-url="product.imageUrl" :provider-slug="product.providerSlug" :category-slug="product.categorySlug" :brand-name="product.brandName" />
    <div class="flex flex-1 flex-col p-4">
      <div class="mb-2 flex flex-wrap items-center gap-1.5">
        <UiBadge>{{ PRODUCT_TYPE[product.type] }}</UiBadge>
        <UiBadge v-for="r in product.regions.slice(0, 1)" :key="r" tone="accent">{{ r }}</UiBadge>
      </div>
      <h3 class="text-[15px] leading-7 font-bold">
        <NuxtLink :to="`/p/${product.slug}`" class="after:absolute after:inset-0 focus-visible:outline-none">
          {{ product.name }}
        </NuxtLink>
      </h3>
      <p class="mt-1 line-clamp-2 text-sm leading-6 text-muted">{{ product.shortDescription }}</p>
      <div class="mt-auto flex items-end justify-between gap-2 pt-4">
        <UiPriceTag v-if="product.minPriceToman !== null" :amount="product.minPriceToman" :prefix="product.variantCount > 1 ? 'از' : undefined" />
        <span v-else class="text-sm text-muted">ناموجود</span>
        <span
            class="relative rounded-lg bg-navy-900 px-3 py-1.5 text-sm font-semibold text-white transition-colors group-hover:bg-accent-600"
            aria-hidden="true"
        >خرید</span
        >
      </div>
    </div>
  </article>
</template>