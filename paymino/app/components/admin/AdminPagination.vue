<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
const props = defineProps<{ count: number; pageSize: number }>()
const page = defineModel<number>({ default: 1 })
const pages = computed(() => Math.max(1, Math.ceil(props.count / props.pageSize)))
</script>

<template>
  <div v-if="pages > 1" class="flex items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm">
    <span class="text-muted">{{ faNumber(count) }} مورد — صفحه {{ faNumber(page) }} از {{ faNumber(pages) }}</span>
    <div class="flex gap-1">
      <UiButton size="sm" variant="secondary" :disabled="page <= 1" aria-label="صفحه قبل" @click="page--">
        <ChevronRight class="size-4" aria-hidden="true" />
      </UiButton>
      <UiButton size="sm" variant="secondary" :disabled="page >= pages" aria-label="صفحه بعد" @click="page++">
        <ChevronLeft class="size-4" aria-hidden="true" />
      </UiButton>
    </div>
  </div>
</template>
