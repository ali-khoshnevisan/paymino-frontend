<script setup lang="ts">
// Product visual, in order of preference:
// 1. Product photo (imageUrl, e.g. a Django upload)
// 2. Code-drawn card art in the provider's colours (CatalogProductArt)
import type { Product } from '#shared/types'

const props = withDefaults(
    defineProps<{
      imageUrl: string | null
      providerSlug: string
      categorySlug: string
      brandName: string
      type?: Product['type']
      size?: 'card' | 'hero'
    }>(),
    { size: 'card' },
)

const photoFailed = ref(false)
watch(
    () => props.imageUrl,
    () => (photoFailed.value = false),
)
const showPhoto = computed(() => !!props.imageUrl && !photoFailed.value)

// A server-rendered <img> can fail before hydration attaches @error, so check once on mount too.
const photo = ref<HTMLImageElement>()
onMounted(() => {
  if (photo.value?.complete && photo.value.naturalWidth === 0) photoFailed.value = true
})
</script>

<template>
  <div class="@container relative overflow-hidden bg-navy-50" :class="size === 'hero' ? 'aspect-[16/10] rounded-[var(--radius-card)]' : 'aspect-[16/11]'">
    <img
        v-if="showPhoto"
        ref="photo"
        :src="imageUrl!"
        :alt="brandName"
        :loading="size === 'hero' ? 'eager' : 'lazy'"
        decoding="async"
        width="800"
        height="550"
        class="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        @error="photoFailed = true"
    />
    <CatalogProductArt
        v-else
        :provider-slug="providerSlug"
        :category-slug="categorySlug"
        :brand-name="brandName"
        :type="type"
    />
  </div>
</template>
