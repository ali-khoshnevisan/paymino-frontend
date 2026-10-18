<script setup lang="ts">
import type { Quote } from '#shared/types'
defineProps<{ quote: Quote | null; loading?: boolean; error?: string | null; title?: string }>()
defineEmits<{ retry: [] }>()
</script>

<template>
  <section class="card p-5" aria-labelledby="summary-title" :aria-busy="loading || undefined">
    <h2 id="summary-title" class="mb-4 font-bold">{{ title ?? 'خلاصه سفارش' }}</h2>

    <UiAlert v-if="error" tone="danger" class="mb-4">
      {{ error }}
      <button type="button" class="ms-1 font-semibold underline" @click="$emit('retry')">تلاش دوباره</button>
    </UiAlert>

    <dl v-if="quote" class="space-y-3 text-sm" :class="loading ? 'opacity-60' : ''">
      <div class="flex justify-between gap-3">
        <dt class="text-muted">جمع اقلام</dt>
        <dd class="tabular font-medium">{{ formatToman(quote.subtotalToman) }}</dd>
      </div>
      <div v-if="quote.discountToman > 0" class="flex justify-between gap-3 text-[#c62a2f]">
        <dt>تخفیف محصولات</dt>
        <dd class="tabular font-medium">−{{ formatToman(quote.discountToman) }}</dd>
      </div>
      <div v-if="quote.couponDiscountToman > 0" class="flex justify-between gap-3 text-[#c62a2f]">
        <dt>کد تخفیف <bdi class="ltr font-semibold">{{ quote.coupon?.code }}</bdi></dt>
        <dd class="tabular font-medium">−{{ formatToman(quote.couponDiscountToman) }}</dd>
      </div>
      <div class="flex justify-between gap-3">
        <dt class="text-muted">کارمزد خدمات ({{ faNumber(Math.round(quote.serviceFeeRate * 1000) / 10) }}٪)</dt>
        <dd class="tabular font-medium">{{ formatToman(quote.serviceFeeToman) }}</dd>
      </div>
      <div class="flex items-center justify-between gap-3 border-t border-line pt-4">
        <dt class="font-bold">مبلغ قابل پرداخت</dt>
        <dd><UiPriceTag :amount="quote.totalToman" size="lg" /></dd>
      </div>
    </dl>
    <div v-else-if="loading" class="space-y-3" aria-hidden="true">
      <div class="skeleton h-4" />
      <div class="skeleton h-4" />
      <div class="skeleton h-7" />
    </div>

    <slot />
  </section>
</template>
