<script setup lang="ts">
import { FlaskConical } from 'lucide-vue-next'
import type { Order } from '#shared/types'

// DEVELOPMENT ONLY: drives Django's sandbox gateway (DEBUG + PAYMENT_PROVIDER=sandbox) through signed events.
const props = defineProps<{ orderId: string }>()
const emit = defineEmits<{ updated: [order: Order] }>()
const busy = ref<string | null>(null)
const error = ref<string | null>(null)
const api = useApi()

const events = [
  { key: 'detected', label: 'شناسایی' },
  { key: 'confirming', label: 'در حال تأیید' },
  { key: 'confirmed', label: 'تأیید کامل' },
  { key: 'underpaid', label: 'کم‌پرداخت' },
  { key: 'overpaid', label: 'اضافه‌پرداخت' },
  { key: 'expired', label: 'انقضا' },
  { key: 'failed', label: 'ناموفق' },
  { key: 'fulfill', label: 'تحویل سفارش' },
]

async function send(event: string) {
  busy.value = event
  error.value = null
  try {
    emit('updated', await api<Order>(`/dev/orders/${props.orderId}/simulate`, { method: 'POST', body: { event } }))
  } catch (err) {
    error.value = normalizeApiError(err).message
  } finally {
    busy.value = null
  }
}
</script>

<template>
  <section class="rounded-[var(--radius-card)] border-2 border-dashed border-violet-300 bg-violet-50/50 p-4" aria-label="شبیه‌ساز پرداخت (فقط محیط توسعه)">
    <p class="mb-3 flex items-center gap-2 text-sm font-bold text-violet-900">
      <FlaskConical class="size-4" aria-hidden="true" />
      شبیه‌ساز درگاه — فقط در حالت توسعه نمایش داده می‌شود
    </p>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="e in events"
        :key="e.key"
        type="button"
        class="rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-sm text-violet-900 hover:bg-violet-100 disabled:opacity-50"
        :disabled="!!busy"
        @click="send(e.key)"
      >
        {{ busy === e.key ? '…' : e.label }}
      </button>
    </div>
    <p v-if="error" class="mt-2 text-sm text-red-700">{{ error }}</p>
  </section>
</template>
