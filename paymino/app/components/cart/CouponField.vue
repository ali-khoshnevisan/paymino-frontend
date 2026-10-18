<script setup lang="ts">
import { TicketPercent, X } from 'lucide-vue-next'

// Discount code for the invoice. The server checks the code on every quote; this field only sends it.
const cart = useCartStore()
const input = ref('')
const id = useId()

const applied = computed(() => (cart.quote?.coupon?.valid ? cart.quote.coupon : null))

async function apply() {
  if (!input.value.trim() || cart.quoteLoading) return
  await cart.applyCoupon(input.value)
  if (cart.quote?.coupon?.valid) input.value = ''
}
</script>

<template>
  <div>
    <div v-if="applied" class="flex items-center gap-3 rounded-[var(--radius-control)] bg-accent-50 p-3" role="status">
      <TicketPercent class="size-5 shrink-0 text-accent-700" aria-hidden="true" />
      <div class="min-w-0 flex-1 text-sm">
        <p class="font-semibold text-accent-900">
          کد <bdi class="ltr font-bold">{{ applied.code }}</bdi> اعمال شد
        </p>
        <p class="text-accent-800">{{ faDigits(applied.label ?? '') }} — {{ formatToman(applied.discountToman) }} کمتر می‌پردازید</p>
      </div>
      <button
          type="button"
          class="flex size-9 shrink-0 items-center justify-center rounded-lg text-accent-800 hover:bg-accent-100 disabled:opacity-50"
          :disabled="cart.quoteLoading"
          :aria-label="`حذف کد تخفیف ${applied.code}`"
          @click="cart.removeCoupon()"
      >
        <X class="size-4" aria-hidden="true" />
      </button>
    </div>

    <form v-else novalidate @submit.prevent="apply">
      <label :for="id" class="field-label">کد تخفیف دارید؟</label>
      <div class="flex gap-2">
        <input
            :id="id"
            v-model="input"
            type="text"
            dir="ltr"
            autocomplete="off"
            autocapitalize="characters"
            spellcheck="false"
            maxlength="40"
            placeholder="CODE"
            class="h-11 min-w-0 flex-1 rounded-[var(--radius-control)] border bg-white px-3 text-start font-semibold uppercase placeholder:font-normal placeholder:normal-case placeholder:text-navy-300 focus-visible:outline-2 focus-visible:outline-accent-500"
            :class="cart.couponError ? 'border-red-300' : 'border-line'"
            :aria-invalid="cart.couponError ? 'true' : undefined"
            :aria-describedby="cart.couponError ? `${id}-err` : undefined"
            @input="cart.couponError = null"
        />
        <UiButton type="submit" variant="secondary" :loading="cart.quoteLoading && !!cart.couponCode" :disabled="!input.trim()">اعمال</UiButton>
      </div>
      <p v-if="cart.couponError" :id="`${id}-err`" class="mt-1.5 text-sm text-red-700" role="alert">{{ cart.couponError }}</p>
    </form>
  </div>
</template>
