<script setup lang="ts">
import type { OrderStatus, PaymentStatus } from '#shared/types'
const props = defineProps<{ kind: 'order' | 'payment'; status: OrderStatus | PaymentStatus }>()
const info = computed(() =>
  props.kind === 'order' ? ORDER_STATUS[props.status as OrderStatus] : PAYMENT_STATUS[props.status as PaymentStatus],
)
</script>

<template>
  <UiBadge v-if="info" :tone="info.tone" dot>
    <span class="sr-only">{{ kind === 'order' ? 'وضعیت سفارش:' : 'وضعیت پرداخت:' }}</span>
    {{ info.label }}
  </UiBadge>
</template>
