<script setup lang="ts">
import type { OrderEvent } from '#shared/types'
const props = defineProps<{ events: OrderEvent[] }>()
const sorted = computed(() => [...props.events].reverse())
</script>

<template>
  <ol class="relative space-y-5 border-s border-line ps-6">
    <li v-for="(e, i) in sorted" :key="i" class="relative">
      <span
        class="absolute -start-[31px] top-1.5 size-3 rounded-full ring-4 ring-white"
        :class="i === 0 ? 'bg-accent-500' : 'bg-navy-200'"
        aria-hidden="true"
      />
      <p class="text-sm font-semibold" :class="i === 0 ? 'text-navy-900' : 'text-navy-700'">{{ e.message }}</p>
      <div class="mt-1 flex flex-wrap items-center gap-2">
        <time :datetime="e.at" class="tabular text-xs text-muted">{{ formatDateTime(e.at) }}</time>
        <OrderStatusBadge v-if="e.status" kind="order" :status="e.status" />
        <OrderStatusBadge v-if="e.paymentStatus" kind="payment" :status="e.paymentStatus" />
      </div>
    </li>
  </ol>
</template>
