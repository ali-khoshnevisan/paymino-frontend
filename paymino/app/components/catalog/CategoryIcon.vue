<script setup lang="ts">
import type { Category } from '#shared/types'

// Generic 3D category pictograms only — real brand artwork is uploaded per product from the backend.
const props = withDefaults(defineProps<{ icon: Category['icon'] | string; size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' })

const map: Record<string, { icon: string; tint: string }> = {
  steam: { icon: 'gamepad', tint: 'bg-slate-100' },
  apple: { icon: 'phone', tint: 'bg-zinc-100' },
  playstation: { icon: 'joystick', tint: 'bg-blue-50' },
  tradingview: { icon: 'chart', tint: 'bg-emerald-50' },
  ai: { icon: 'robot', tint: 'bg-orange-50' },
}
const entry = computed(() => map[props.icon] ?? { icon: 'gift', tint: 'bg-navy-50' })
const boxSize = computed(() => ({ sm: 'size-9 rounded-lg', md: 'size-12 rounded-xl', lg: 'size-16 rounded-2xl' })[props.size])
const iconSize = computed(() => ({ sm: 'size-6', md: 'size-8', lg: 'size-11' })[props.size])
</script>

<template>
  <span class="inline-flex shrink-0 items-center justify-center" :class="[boxSize, entry.tint]">
    <UiIcon3d :name="entry.icon" :class="iconSize" />
  </span>
</template>
