<script setup lang="ts">
import { Minus, Plus } from 'lucide-vue-next'
const props = withDefaults(defineProps<{ min?: number; max: number; label?: string }>(), { min: 1, label: 'تعداد' })
const model = defineModel<number>({ required: true })
const set = (v: number) => (model.value = Math.min(props.max, Math.max(props.min, v)))
</script>

<template>
  <div class="inline-flex h-10 items-center rounded-[var(--radius-control)] border border-line bg-white" role="group" :aria-label="label">
    <button
      type="button"
      class="flex size-10 items-center justify-center text-navy-700 hover:bg-navy-50 disabled:text-navy-200 rounded-s-[var(--radius-control)]"
      :disabled="model >= max"
      aria-label="افزایش تعداد"
      @click="set(model + 1)"
    >
      <Plus class="size-4" aria-hidden="true" />
    </button>
    <output class="tabular min-w-8 text-center text-sm font-semibold" aria-live="polite">{{ faNumber(model) }}</output>
    <button
      type="button"
      class="flex size-10 items-center justify-center text-navy-700 hover:bg-navy-50 disabled:text-navy-200 rounded-e-[var(--radius-control)]"
      :disabled="model <= min"
      aria-label="کاهش تعداد"
      @click="set(model - 1)"
    >
      <Minus class="size-4" aria-hidden="true" />
    </button>
  </div>
</template>
