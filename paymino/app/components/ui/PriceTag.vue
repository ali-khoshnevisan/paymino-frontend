<script setup lang="ts">
withDefaults(defineProps<{ amount: number; size?: 'sm' | 'md' | 'lg' | 'xl'; prefix?: string }>(), { size: 'md' })
</script>

<template>
  <span class="tabular inline-flex items-baseline gap-1 whitespace-nowrap">
    <span v-if="prefix" class="text-xs font-normal text-muted">{{ prefix }}</span>
    <span
      class="font-bold text-navy-900"
      :class="{ 'text-sm': size === 'sm', 'text-base': size === 'md', 'text-xl': size === 'lg', 'text-2xl sm:text-3xl': size === 'xl' }"
      >{{ faNumber(amount) }}</span
    >
    <span class="text-xs font-medium text-muted">تومان</span>
  </span>
</template>
