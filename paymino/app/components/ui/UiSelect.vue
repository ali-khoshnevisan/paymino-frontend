<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    label: string
    options: Array<{ value: string; label: string; disabled?: boolean }>
    placeholder?: string
    error?: string
    hideLabel?: boolean
    size?: 'sm' | 'md'
  }>(),
  { hideLabel: false, size: 'md' },
)
const model = defineModel<string>({ default: '' })
const id = useId()
</script>

<template>
  <div>
    <label :for="id" :class="hideLabel ? 'sr-only' : 'field-label'">{{ label }}</label>
    <div class="relative">
      <select
        :id="id"
        v-model="model"
        :aria-invalid="error ? 'true' : undefined"
        class="w-full appearance-none rounded-[var(--radius-control)] border border-line bg-white ps-3.5 pe-10 text-navy-900 hover:border-navy-200 focus:border-accent-500 focus:ring-3 focus:ring-accent-100 focus:outline-none"
        :class="size === 'sm' ? 'h-9 text-sm' : 'h-11 text-[15px]'"
      >
        <option v-if="placeholder" value="">{{ placeholder }}</option>
        <option v-for="o in options" :key="o.value" :value="o.value" :disabled="o.disabled">{{ o.label }}</option>
      </select>
      <ChevronDown class="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-navy-400" aria-hidden="true" />
    </div>
    <p v-if="error" class="mt-1.5 text-sm text-red-700" role="alert">{{ error }}</p>
  </div>
</template>
