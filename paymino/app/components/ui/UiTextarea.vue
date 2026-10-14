<script setup lang="ts">
withDefaults(defineProps<{ label: string; error?: string; hint?: string; rows?: number; placeholder?: string; required?: boolean; maxlength?: number }>(), {
  rows: 5,
  required: false,
})
const model = defineModel<string>({ default: '' })
const id = useId()
</script>

<template>
  <div>
    <label :for="id" class="field-label">
      {{ label }}
      <span v-if="required" class="text-red-600" aria-hidden="true">*</span>
    </label>
    <textarea
      :id="id"
      v-model="model"
      :rows="rows"
      :placeholder="placeholder"
      :required="required"
      :maxlength="maxlength"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? `${id}-err` : hint ? `${id}-hint` : undefined"
      class="w-full rounded-[var(--radius-control)] border bg-white px-3.5 py-2.5 text-[15px] leading-7 text-navy-900 placeholder:text-navy-300 focus:border-accent-500 focus:ring-3 focus:ring-accent-100 focus:outline-none"
      :class="error ? 'border-red-400' : 'border-line hover:border-navy-200'"
    />
    <p v-if="error" :id="`${id}-err`" class="mt-1.5 text-sm text-red-700" role="alert">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-hint`" class="mt-1.5 text-xs text-muted">{{ hint }}</p>
  </div>
</template>
