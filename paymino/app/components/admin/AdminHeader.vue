<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
defineProps<{ title: string; subtitle?: string; back?: string }>()
</script>

<template>
  <div class="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div class="min-w-0">
      <NuxtLink v-if="back" :to="back" class="mb-1 inline-flex items-center gap-1 text-sm text-muted hover:text-navy-900">
        <ChevronRight class="size-4" aria-hidden="true" /> بازگشت
      </NuxtLink>
      <h1 class="text-2xl font-extrabold">{{ title }}</h1>
      <p v-if="subtitle" class="section-subtitle">{{ subtitle }}</p>
    </div>
    <div class="flex flex-wrap items-center gap-2"><slot /></div>
  </div>
</template>
