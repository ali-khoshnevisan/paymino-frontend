<script setup lang="ts">
import type { Component } from 'vue'
defineProps<{ icon?: Component; title: string; description?: string }>()
</script>

<template>
  <div class="flex flex-col items-center px-6 py-14 text-center">
    <div v-if="icon" class="mb-4 flex size-14 items-center justify-center rounded-2xl bg-navy-50 text-navy-500">
      <component :is="icon" class="size-7" aria-hidden="true" />
    </div>
    <h2 class="text-lg font-bold">{{ title }}</h2>
    <p v-if="description" class="mt-1.5 max-w-md text-sm leading-7 text-muted">{{ description }}</p>
    <div v-if="$slots.default" class="mt-5 flex flex-wrap justify-center gap-3"><slot /></div>
  </div>
</template>
