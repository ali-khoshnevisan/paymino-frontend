<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import type { PaymentStatus } from '#shared/types'

const props = defineProps<{ status: PaymentStatus; confirmations: number; required: number }>()

const steps = [
  { key: 'awaiting_payment', label: 'در انتظار پرداخت' },
  { key: 'detected', label: 'شناسایی تراکنش' },
  { key: 'confirming', label: 'تأیید شبکه' },
  { key: 'confirmed', label: 'تأیید پرداخت' },
]
const order = ['awaiting_payment', 'detected', 'confirming', 'confirmed']
const index = computed(() => {
  if (props.status === 'underpaid') return 2
  const i = order.indexOf(props.status)
  return i === -1 ? 0 : i
})
</script>

<template>
  <ol class="grid grid-cols-4 gap-2" aria-label="مراحل پرداخت">
    <li v-for="(s, i) in steps" :key="s.key" class="flex flex-col gap-2" :aria-current="i === index ? 'step' : undefined">
      <div
        class="h-1.5 rounded-full"
        :class="i < index || (i === index && status === 'confirmed') ? 'bg-accent-500' : i === index ? (status === 'underpaid' ? 'bg-red-400' : 'bg-accent-300 animate-pulse') : 'bg-navy-100'"
      />
      <div class="flex items-center gap-1.5 text-xs" :class="i <= index ? 'font-semibold text-navy-800' : 'text-navy-400'">
        <Check v-if="i < index || status === 'confirmed'" class="size-3.5 shrink-0 text-accent-600" aria-hidden="true" />
        <span>{{ s.label }}</span>
      </div>
      <p v-if="s.key === 'confirming' && (status === 'confirming' || status === 'detected')" class="tabular text-xs text-muted">
        {{ faNumber(confirmations) }} از {{ faNumber(required) }}
      </p>
    </li>
  </ol>
</template>
