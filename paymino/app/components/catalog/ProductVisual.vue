<script setup lang="ts">
// Product image from the backend, or a neutral category tile when none is uploaded.
const props = withDefaults(defineProps<{ imageUrl: string | null; categorySlug: string; brandName: string; size?: 'card' | 'hero' }>(), {
  size: 'card',
})
const tints: Record<string, string> = {
  steam: 'from-slate-100 to-slate-50',
  apple: 'from-zinc-100 to-zinc-50',
  playstation: 'from-blue-50 to-slate-50',
  tradingview: 'from-emerald-50 to-slate-50',
  ai: 'from-violet-50 to-slate-50',
}
const tint = computed(() => tints[props.categorySlug] ?? 'from-navy-50 to-white')
</script>

<template>
  <div class="relative overflow-hidden bg-gradient-to-br" :class="[tint, size === 'hero' ? 'aspect-[16/9] rounded-[var(--radius-card)] sm:aspect-[4/3]' : 'aspect-[16/10]']">
    <img v-if="imageUrl" :src="imageUrl" :alt="brandName" loading="lazy" decoding="async" class="size-full object-cover" />
    <div v-else class="flex size-full flex-col items-center justify-center gap-3 p-4">
      <CatalogCategoryIcon :icon="categorySlug" :size="size === 'hero' ? 'lg' : 'md'" class="bg-white/80 shadow-[var(--shadow-card)]" />
      <span class="ltr max-w-full truncate text-center font-semibold text-navy-700" :class="size === 'hero' ? 'text-base' : 'text-xs'">{{ brandName }}</span>
    </div>
  </div>
</template>
