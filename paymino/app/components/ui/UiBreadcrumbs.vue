<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next'
defineProps<{ items: Array<{ label: string; to?: string }> }>()
</script>

<template>
  <nav aria-label="مسیر صفحه" class="text-sm text-muted">
    <ol class="flex flex-wrap items-center gap-1.5">
      <li class="flex items-center gap-1.5"><NuxtLink to="/" class="hover:text-navy-900">خانه</NuxtLink></li>
      <li v-for="(item, i) in items" :key="i" class="flex items-center gap-1.5">
        <ChevronLeft class="size-3.5 text-navy-300" aria-hidden="true" />
        <NuxtLink v-if="item.to" :to="item.to" class="hover:text-navy-900">{{ item.label }}</NuxtLink>
        <span v-else aria-current="page" class="text-navy-800">{{ item.label }}</span>
      </li>
    </ol>
  </nav>
</template>
