<script setup lang="ts">
import { ChartCandlestick, Gamepad2, Joystick, Smartphone, Sparkles, Gift } from 'lucide-vue-next'
import type { Category } from '#shared/types'

// Generic category pictograms only — real brand artwork is uploaded per product from the backend.
const props = withDefaults(defineProps<{ icon: Category['icon'] | string; size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' })

const map: Record<string, { icon: typeof Gift; tint: string }> = {
  steam: { icon: Gamepad2, tint: 'bg-slate-100 text-slate-700' },
  apple: { icon: Smartphone, tint: 'bg-zinc-100 text-zinc-700' },
  playstation: { icon: Joystick, tint: 'bg-blue-50 text-blue-700' },
  tradingview: { icon: ChartCandlestick, tint: 'bg-emerald-50 text-emerald-700' },
  ai: { icon: Sparkles, tint: 'bg-violet-50 text-violet-700' },
}
const entry = computed(() => map[props.icon] ?? { icon: Gift, tint: 'bg-navy-50 text-navy-700' })
const boxSize = computed(() => ({ sm: 'size-9 rounded-lg', md: 'size-12 rounded-xl', lg: 'size-16 rounded-2xl' })[props.size])
const iconSize = computed(() => ({ sm: 'size-4.5', md: 'size-6', lg: 'size-8' })[props.size])
</script>

<template>
  <span class="inline-flex shrink-0 items-center justify-center" :class="[boxSize, entry.tint]">
    <component :is="entry.icon" :class="iconSize" aria-hidden="true" stroke-width="1.75" />
  </span>
</template>
