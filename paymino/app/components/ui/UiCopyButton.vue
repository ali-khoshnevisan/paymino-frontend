<script setup lang="ts">
import { Check, Copy } from 'lucide-vue-next'
const props = withDefaults(defineProps<{ value: string; label?: string; compact?: boolean }>(), { label: 'کپی', compact: false })
const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

async function copy() {
  try {
    await navigator.clipboard.writeText(props.value)
  } catch {
    // Fallback for non-secure contexts
    const ta = document.createElement('textarea')
    ta.value = props.value
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
  }
  copied.value = true
  clearTimeout(timer)
  timer = setTimeout(() => (copied.value = false), 1800)
}
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <button
    type="button"
    class="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-white text-sm font-medium text-navy-700 hover:bg-navy-50"
    :class="compact ? 'size-9 justify-center' : 'h-9 px-3'"
    :aria-label="compact ? label : undefined"
    @click="copy"
  >
    <Check v-if="copied" class="size-4 text-accent-600" aria-hidden="true" />
    <Copy v-else class="size-4" aria-hidden="true" />
    <span v-if="!compact">{{ copied ? 'کپی شد' : label }}</span>
    <span class="sr-only" aria-live="polite">{{ copied ? 'کپی شد' : '' }}</span>
  </button>
</template>
