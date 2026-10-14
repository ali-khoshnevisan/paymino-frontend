<script setup lang="ts">
import { Eye, EyeOff } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    label: string
    type?: string
    error?: string
    hint?: string
    placeholder?: string
    autocomplete?: string
    inputmode?: 'text' | 'email' | 'tel' | 'numeric' | 'decimal' | 'url' | 'search'
    ltr?: boolean
    required?: boolean
    disabled?: boolean
    maxlength?: number
    hideLabel?: boolean
  }>(),
  { type: 'text', ltr: false, required: false, disabled: false, hideLabel: false },
)

const model = defineModel<string>({ default: '' })
const id = useId()
const showPassword = ref(false)
const isPassword = computed(() => props.type === 'password')
const actualType = computed(() => (isPassword.value && showPassword.value ? 'text' : props.type))
const describedBy = computed(() => [props.error ? `${id}-err` : '', props.hint ? `${id}-hint` : ''].filter(Boolean).join(' ') || undefined)
</script>

<template>
  <div>
    <label :for="id" :class="hideLabel ? 'sr-only' : 'field-label'">
      {{ label }}
      <span v-if="required" class="text-red-600" aria-hidden="true">*</span>
    </label>
    <div class="relative">
      <input
        :id="id"
        v-model="model"
        :type="actualType"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :required="required"
        :disabled="disabled"
        :maxlength="maxlength"
        :dir="ltr || isPassword ? 'ltr' : undefined"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
        class="h-11 w-full rounded-[var(--radius-control)] border bg-white px-3.5 text-[15px] text-navy-900 transition-colors placeholder:text-navy-300 focus:border-accent-500 focus:ring-3 focus:ring-accent-100 focus:outline-none disabled:bg-navy-50 disabled:text-navy-400"
        :class="[error ? 'border-red-400' : 'border-line hover:border-navy-200', ltr || isPassword ? 'text-left' : '', isPassword ? 'pe-11' : '']"
      />
      <button
        v-if="isPassword"
        type="button"
        class="absolute inset-y-0 end-0 flex w-11 items-center justify-center rounded-e-[var(--radius-control)] text-navy-400 hover:text-navy-700"
        :aria-label="showPassword ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'"
        :aria-pressed="showPassword"
        @click="showPassword = !showPassword"
      >
        <EyeOff v-if="showPassword" class="size-5" aria-hidden="true" />
        <Eye v-else class="size-5" aria-hidden="true" />
      </button>
    </div>
    <p v-if="error" :id="`${id}-err`" class="mt-1.5 text-sm text-red-700" role="alert">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-hint`" class="mt-1.5 text-xs leading-6 text-muted">{{ hint }}</p>
  </div>
</template>
