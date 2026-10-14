<script setup lang="ts">
import { Check } from 'lucide-vue-next'
defineProps<{ steps: string[]; current: number; completed: number[] }>()
defineEmits<{ go: [index: number] }>()
</script>

<template>
  <nav aria-label="مراحل خرید">
    <ol class="flex items-center gap-1 overflow-x-auto pb-1 sm:gap-2">
      <li v-for="(s, i) in steps" :key="s" class="flex shrink-0 items-center gap-1 sm:gap-2">
        <button
          type="button"
          class="flex items-center gap-2 rounded-full py-1 ps-1 pe-3 text-sm transition-colors disabled:cursor-default"
          :class="i === current ? 'bg-navy-900 text-white' : completed.includes(i) ? 'text-navy-800 hover:bg-navy-50' : 'text-navy-400'"
          :disabled="!completed.includes(i) || i === current"
          :aria-current="i === current ? 'step' : undefined"
          @click="$emit('go', i)"
        >
          <span
            class="tabular flex size-6 items-center justify-center rounded-full text-xs font-bold"
            :class="i === current ? 'bg-white text-navy-900' : completed.includes(i) ? 'bg-accent-600 text-white' : 'bg-navy-100 text-navy-500'"
          >
            <Check v-if="completed.includes(i) && i !== current" class="size-3.5" aria-hidden="true" />
            <template v-else>{{ faNumber(i + 1) }}</template>
          </span>
          <span class="whitespace-nowrap" :class="i === current ? 'inline' : 'hidden sm:inline'">{{ s }}</span>
        </button>
        <span v-if="i < steps.length - 1" class="h-px w-4 bg-line sm:w-6" aria-hidden="true" />
      </li>
    </ol>
  </nav>
</template>
