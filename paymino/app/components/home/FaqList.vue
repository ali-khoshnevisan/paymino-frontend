<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'
withDefaults(defineProps<{ items: Array<{ q: string; a: string }> }>(), {})
</script>

<template>
  <div class="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
    <details v-for="(item, i) in items" :key="i" class="group">
      <summary class="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold hover:bg-navy-50/50 [&::-webkit-details-marker]:hidden">
        {{ item.q }}
        <ChevronDown class="size-5 shrink-0 text-navy-400 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <p class="px-5 pb-5 text-[15px] leading-8 text-navy-700">{{ item.a }}</p>
    </details>
  </div>
</template>
