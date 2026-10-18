<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
withDefaults(defineProps<{ items: Array<{ q: string; a: string }> }>(), {})
</script>

<template>
  <div class="grid gap-2">
    <details v-for="(item, i) in items" :key="i" class="group rounded-[18px] bg-white transition-colors open:bg-white">
      <summary class="flex cursor-pointer list-none items-center justify-between gap-4 rounded-[18px] px-5 py-4 text-[17px] font-bold hover:bg-navy-50/60 sm:px-6 [&::-webkit-details-marker]:hidden">
        {{ item.q }}
        <span class="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy-50 text-navy-700 transition-transform duration-300 group-open:rotate-45">
          <Plus class="size-4" aria-hidden="true" />
        </span>
      </summary>
      <p class="px-5 pb-5 text-[15px] leading-8 text-navy-700 sm:px-6">{{ item.a }}</p>
    </details>
  </div>
</template>
