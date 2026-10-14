<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next'
import type { OrderListItem } from '#shared/types'
import { isPayable } from '#shared/utils/status'
defineProps<{ order: OrderListItem }>()
</script>

<template>
  <li class="relative flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 hover:bg-navy-50/40">
    <div class="min-w-0 flex-1">
      <p class="font-semibold">
        <NuxtLink :to="`/account/orders/${order.id}`" class="after:absolute after:inset-0">
          سفارش <bdi class="ltr">{{ order.number }}</bdi>
        </NuxtLink>
      </p>
      <p class="mt-0.5 truncate text-sm text-muted">
        {{ order.firstItemName }}<template v-if="order.itemCount > 1"> و {{ faNumber(order.itemCount - 1) }} مورد دیگر</template>
        <span class="mx-1.5 text-navy-200">|</span>
        <time :datetime="order.createdAt">{{ formatDate(order.createdAt) }}</time>
      </p>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <OrderStatusBadge kind="order" :status="order.status" />
      <OrderStatusBadge v-if="order.paymentStatus && order.paymentStatus !== 'confirmed'" kind="payment" :status="order.paymentStatus" />
    </div>
    <p class="tabular w-full text-sm font-bold sm:w-auto">{{ formatToman(order.totalToman) }}</p>
    <NuxtLink
      v-if="isPayable(order.status, order.paymentStatus)"
      :to="`/checkout/pay/${order.id}`"
      class="relative z-10 rounded-lg bg-accent-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-accent-700"
    >
      پرداخت
    </NuxtLink>
    <ChevronLeft v-else class="hidden size-5 text-navy-300 sm:block" aria-hidden="true" />
  </li>
</template>
