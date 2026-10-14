<script setup lang="ts">
import { Eye, EyeOff } from 'lucide-vue-next'
const props = defineProps<{ value: string }>()
const revealed = ref(false)
const masked = computed(() => props.value.replace(/[A-Za-z0-9]/g, '•'))
</script>

<template>
  <div class="flex items-center gap-2">
    <code class="ltr min-w-0 flex-1 rounded-lg border border-line bg-canvas px-3 py-2 font-mono text-sm tracking-wider break-anywhere">
      {{ revealed ? value : masked }}
    </code>
    <button
      type="button"
      class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-line bg-white text-navy-700 hover:bg-navy-50"
      :aria-label="revealed ? 'پنهان کردن کد' : 'نمایش کد'"
      :aria-pressed="revealed"
      @click="revealed = !revealed"
    >
      <EyeOff v-if="revealed" class="size-4" aria-hidden="true" />
      <Eye v-else class="size-4" aria-hidden="true" />
    </button>
    <UiCopyButton :value="value" label="کپی کد" compact />
  </div>
</template>
