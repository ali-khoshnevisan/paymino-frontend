<script setup lang="ts">
import type { Tone } from '~/utils/labels'

const props = withDefaults(defineProps<{ tone?: Tone; dot?: boolean }>(), { tone: 'neutral', dot: false })

const toneClass = computed(
  () =>
    ({
      neutral: 'bg-navy-50 text-navy-700 ring-navy-100',
      info: 'bg-sky-50 text-sky-800 ring-sky-100',
      warning: 'bg-amber-50 text-amber-800 ring-amber-100',
      success: 'bg-emerald-50 text-emerald-800 ring-emerald-100',
      danger: 'bg-red-50 text-red-700 ring-red-100',
      accent: 'bg-accent-50 text-accent-800 ring-accent-100',
    })[props.tone],
)
const dotClass = computed(
  () =>
    ({
      neutral: 'bg-navy-400',
      info: 'bg-sky-500',
      warning: 'bg-amber-500',
      success: 'bg-emerald-500',
      danger: 'bg-red-500',
      accent: 'bg-accent-500',
    })[props.tone],
)
</script>

<template>
  <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset" :class="toneClass">
    <span v-if="dot" class="size-1.5 rounded-full" :class="dotClass" aria-hidden="true" />
    <slot />
  </span>
</template>
