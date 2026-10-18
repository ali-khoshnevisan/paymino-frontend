<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'
import type { QuoteLine } from '#shared/types'
import type { CartLine } from '~/stores/cart'

const props = withDefaults(defineProps<{ line: CartLine; quoteLine?: QuoteLine; editable?: boolean }>(), { editable: true })
const cart = useCartStore()

const qty = computed({
  get: () => props.line.quantity,
  set: (v: number) => cart.setQuantity(props.line.lineId, v),
})
const unavailable = computed(() => props.quoteLine && !props.quoteLine.available)
const unit = computed(() => props.quoteLine?.unitPriceToman ?? props.line.unitPriceToman)
const total = computed(() => (unavailable.value ? 0 : unit.value * props.line.quantity))
// List price before the product's discount; only known once the server quote arrives
const listUnit = computed(() => {
  const l = props.quoteLine?.listUnitPriceToman
  return l && l > unit.value ? l : null
})
</script>

<template>
  <li class="flex gap-4 py-5 first:pt-0 last:pb-0" :class="unavailable ? 'opacity-70' : ''">
    <NuxtLink :to="`/p/${line.productSlug}`" class="shrink-0" tabindex="-1" aria-hidden="true">
      <CatalogCategoryIcon :icon="line.categorySlug" />
    </NuxtLink>
    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <div class="min-w-0">
          <NuxtLink :to="`/p/${line.productSlug}`" class="font-bold hover:text-accent-700">{{ line.name }}</NuxtLink>
          <p class="text-sm text-muted">
            <bdi class="ltr font-medium text-navy-700">{{ line.variantLabel }}</bdi>
            <span class="mx-1.5 text-navy-200">|</span>
            <s v-if="listUnit" class="tabular me-1.5 inline-block text-xs"><span class="sr-only">پیش از تخفیف:</span>{{ faNumber(listUnit) }}</s>
            <span class="tabular" :class="listUnit ? 'font-semibold text-[#c62a2f]' : ''">{{ formatToman(unit) }}</span>
          </p>
        </div>
        <p class="tabular text-end font-bold">
          <span v-if="unavailable" class="text-sm font-medium text-red-700">ناموجود</span>
          <template v-else>{{ formatToman(total) }}</template>
        </p>
      </div>

      <p v-if="quoteLine?.issue" class="mt-2 text-sm" :class="quoteLine.issue.code === 'price_changed' ? 'text-amber-700' : 'text-red-700'">
        {{ quoteLine.issue.message }}
      </p>

      <div v-if="editable" class="mt-3 flex items-center gap-3">
        <UiQuantity v-if="line.maxQuantity > 1 && !unavailable" v-model="qty" :max="line.maxQuantity" :label="`تعداد ${line.name}`" />
        <span v-else-if="!unavailable" class="text-sm text-muted">تعداد: {{ faNumber(line.quantity) }}</span>
        <button
          type="button"
          class="ms-auto inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-navy-500 hover:bg-red-50 hover:text-red-700"
          @click="cart.remove(line.lineId)"
        >
          <Trash2 class="size-4" aria-hidden="true" />
          حذف
        </button>
      </div>
      <p v-else class="mt-1 text-sm text-muted">تعداد: {{ faNumber(line.quantity) }}</p>
    </div>
  </li>
</template>
