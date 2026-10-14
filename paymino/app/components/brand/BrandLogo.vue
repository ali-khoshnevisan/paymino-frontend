<script setup lang="ts">
withDefaults(defineProps<{ inverted?: boolean; compact?: boolean }>(), { inverted: false, compact: false })
</script>

<template>
  <span class="inline-flex items-center gap-2.5" :aria-label="'پی‌مینو'">
    <svg viewBox="0 0 40 40" class="size-9 shrink-0" aria-hidden="true">
      <rect width="40" height="40" rx="11" :fill="inverted ? '#ffffff' : '#0B1F3A'" />
      <path
        d="M14 30V10h7a7 7 0 0 1 0 14h-7"
        fill="none"
        :stroke="inverted ? '#0B1F3A' : '#ffffff'"
        stroke-width="3.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle cx="21" cy="17" r="2.7" fill="#2FB2A3" />
    </svg>
    <span v-if="!compact" class="flex flex-col leading-none">
      <span class="text-lg font-extrabold tracking-tight" :class="inverted ? 'text-white' : 'text-navy-900'">پی‌مینو</span>
      <span class="ltr mt-1 text-[10px] font-medium tracking-[0.18em] uppercase" :class="inverted ? 'text-navy-200' : 'text-muted'">Paymino</span>
    </span>
  </span>
</template>
