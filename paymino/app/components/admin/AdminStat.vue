<script setup lang="ts">
import type { Component } from 'vue'
import { NuxtLink } from '#components'
defineProps<{ label: string; value: string; hint?: string; icon?: Component; to?: string; tone?: 'default' | 'warning' }>()
</script>

<template>
  <component :is="to ? NuxtLink : 'div'" :to="to" class="card block p-4 transition-colors" :class="to ? 'hover:border-navy-200' : ''">
    <div class="flex items-start justify-between gap-3">
      <p class="text-sm text-muted">{{ label }}</p>
      <component :is="icon" v-if="icon" class="size-5" :class="tone === 'warning' ? 'text-amber-500' : 'text-navy-300'" aria-hidden="true" />
    </div>
    <p class="tabular mt-2 text-2xl font-extrabold" :class="tone === 'warning' ? 'text-amber-700' : ''">{{ value }}</p>
    <p v-if="hint" class="mt-0.5 text-xs text-muted">{{ hint }}</p>
  </component>
</template>
