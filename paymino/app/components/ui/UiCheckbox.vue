<script setup lang="ts">
defineProps<{ error?: string }>()
const model = defineModel<boolean>({ default: false })
const id = useId()
</script>

<template>
  <div>
    <div class="flex items-start gap-3">
      <input
        :id="id"
        v-model="model"
        type="checkbox"
        :aria-invalid="error ? 'true' : undefined"
        class="mt-1 size-5 shrink-0 cursor-pointer rounded border-line accent-accent-600"
      />
      <label :for="id" class="cursor-pointer text-sm leading-7 text-navy-800"><slot /></label>
    </div>
    <p v-if="error" class="mt-1 ms-8 text-sm text-red-700" role="alert">{{ error }}</p>
  </div>
</template>
