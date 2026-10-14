<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next'
import type { Category } from '#shared/types'
defineProps<{ category: Category }>()
</script>

<template>
  <NuxtLink
    :to="`/c/${category.slug}`"
    class="card group flex items-center gap-4 p-4 transition-all hover:border-navy-200 hover:shadow-[var(--shadow-raised)] sm:flex-col sm:items-start sm:p-5"
  >
    <CatalogCategoryIcon :icon="category.icon" />
    <div class="min-w-0 flex-1">
      <h3 class="font-bold">{{ category.name }}</h3>
      <p class="mt-0.5 line-clamp-2 text-sm leading-6 text-muted">{{ category.description }}</p>
    </div>
    <span class="flex items-center gap-1 text-sm font-semibold text-accent-700 sm:mt-1">
      <span class="hidden sm:inline">مشاهده</span>
      <ChevronLeft class="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
    </span>
  </NuxtLink>
</template>
