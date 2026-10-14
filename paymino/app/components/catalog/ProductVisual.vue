<script setup lang="ts">
// Product visual, in order of preference:
// 1. Product photo (imageUrl, e.g. /products/<slug>.webp or a Django upload)
// 2. Official brand logo from /brands/<providerSlug>.svg on a soft background
// 3. Neutral category icon
const props = withDefaults(
    defineProps<{ imageUrl: string | null; providerSlug: string; categorySlug: string; brandName: string; size?: 'card' | 'hero' }>(),
    { size: 'card' },
)

const tints: Record<string, string> = {
  steam: 'from-slate-100 to-slate-50',
  apple: 'from-zinc-100 to-zinc-50',
  playstation: 'from-blue-50 to-slate-50',
  tradingview: 'from-emerald-50 to-slate-50',
  ai: 'from-violet-50 to-slate-50',
}
const tint = computed(() => tints[props.categorySlug] ?? 'from-navy-50 to-white')
const logoUrl = computed(() => `/brands/${props.providerSlug}.svg`)

const photoFailed = ref(false)
const logoFailed = ref(false)
watch(
    () => [props.imageUrl, props.providerSlug],
    () => {
      photoFailed.value = false
      logoFailed.value = false
    },
)
const showPhoto = computed(() => !!props.imageUrl && !photoFailed.value)
const showLogo = computed(() => !showPhoto.value && !logoFailed.value)

// A server-rendered <img> can fail before hydration attaches @error, so check once on mount too.
const photo = ref<HTMLImageElement>()
const logo = ref<HTMLImageElement>()
const broken = (el?: HTMLImageElement) => !!el && el.complete && el.naturalWidth === 0
onMounted(() => {
  if (broken(photo.value)) photoFailed.value = true
  nextTick(() => {
    if (broken(logo.value)) logoFailed.value = true
  })
})
</script>

<template>
  <div class="relative overflow-hidden bg-gradient-to-br" :class="[tint, size === 'hero' ? 'aspect-[16/10] rounded-[var(--radius-card)]' : 'aspect-[16/10]']">
    <img
        v-if="showPhoto"
        ref="photo"
        :src="imageUrl!"
        :alt="brandName"
        :loading="size === 'hero' ? 'eager' : 'lazy'"
        decoding="async"
        width="800"
        height="500"
        class="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        @error="photoFailed = true"
    />

    <div v-else-if="showLogo" class="flex size-full items-center justify-center p-6">
      <img
          ref="logo"
          :src="logoUrl"
          :alt="brandName"
          :loading="size === 'hero' ? 'eager' : 'lazy'"
          decoding="async"
          class="max-h-[42%] max-w-[55%] object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
          @error="logoFailed = true"
      />
    </div>

    <div v-else class="flex size-full flex-col items-center justify-center gap-3 p-4">
      <CatalogCategoryIcon :icon="categorySlug" :size="size === 'hero' ? 'lg' : 'md'" class="bg-white/80 shadow-[var(--shadow-card)]" />
      <span class="ltr max-w-full truncate text-center font-semibold text-navy-700" :class="size === 'hero' ? 'text-base' : 'text-xs'">{{ brandName }}</span>
    </div>
  </div>
</template>