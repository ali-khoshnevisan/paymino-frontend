<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import type { Category } from '#shared/types'
const props = withDefaults(defineProps<{ category: Category; featured?: boolean }>(), { featured: false })

// Field colour and 3D icon per category; the field is a flat tone, the icon carries the depth.
const looks: Record<string, { icon: string; field: string; ink: string }> = {
  steam: { icon: 'gamepad', field: '#dfe7f0', ink: '#1b2838' },
  apple: { icon: 'phone', field: '#ececf0', ink: '#1d1d1f' },
  playstation: { icon: 'joystick', field: '#dce8fb', ink: '#003791' },
  tradingview: { icon: 'chart', field: '#ddf1e8', ink: '#0d3b2c' },
  ai: { icon: 'robot', field: '#f8e7da', ink: '#5a2814' },
}
const look = computed(() => looks[props.category.icon] ?? { icon: 'gift', field: '#dfe6f1', ink: '#0b1f3a' })
</script>

<template>
  <NuxtLink
      :to="`/c/${category.slug}`"
      class="group relative isolate flex flex-col justify-between gap-4 overflow-hidden rounded-[22px] p-5 transition-transform duration-300 hover:-translate-y-1 sm:p-6"
      :class="featured ? 'sm:flex-row sm:items-end lg:flex-col lg:items-stretch' : ''"
      :style="{ background: look.field, color: look.ink }"
  >
    <UiIcon3d
        :name="look.icon"
        :eager="featured"
        class="self-end drop-shadow-[0_14px_14px_rgb(0_0_0/0.18)] transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:-rotate-6"
        :class="featured ? 'w-32 sm:order-last sm:w-44 lg:order-none lg:w-64' : 'w-20 sm:w-24'"
    />
    <div class="min-w-0">
      <h3 class="leading-snug font-extrabold" :class="featured ? 'text-2xl sm:text-3xl lg:text-4xl' : 'text-lg'" :style="{ color: look.ink }">{{ category.name }}</h3>
      <p class="mt-1 line-clamp-2 leading-7 opacity-80" :class="featured ? 'text-base sm:text-lg' : 'text-sm'">{{ category.description }}</p>
      <p class="mt-3 flex items-center gap-1.5 text-sm font-bold">
        {{ faNumber(category.productCount) }} محصول
        <ArrowLeft class="size-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
      </p>
    </div>
  </NuxtLink>
</template>
