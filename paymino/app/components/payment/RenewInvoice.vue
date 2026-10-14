<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next'
import type { CryptoCurrency, Order } from '#shared/types'

const props = defineProps<{ order: Order }>()
const emit = defineEmits<{ renewed: [order: Order] }>()
const api = useApi()

const { data } = await useAsyncData(`renew-currencies:${props.order.id}`, () => api<{ currencies: CryptoCurrency[] }>('/payments/currencies'), {
  server: false,
  lazy: true,
})
const currency = ref(props.order.paymentMethod?.currency ?? 'USDT')
const network = ref(props.order.paymentMethod?.network ?? 'TRC20')
const currencyOptions = computed(() => (data.value?.currencies ?? []).map((c) => ({ value: c.code, label: `${c.code} — ${c.name}` })))
const networkOptions = computed(() => (data.value?.currencies.find((c) => c.code === currency.value)?.networks ?? []).map((n) => ({ value: n.code, label: n.name })))
watch(currency, () => {
  if (!networkOptions.value.some((n) => n.value === network.value)) network.value = networkOptions.value[0]?.value ?? ''
})

const loading = ref(false)
const error = ref<string | null>(null)
async function renew() {
  loading.value = true
  error.value = null
  try {
    emit('renewed', await api<Order>(`/orders/${props.order.id}/invoice`, { method: 'POST', body: { currency: currency.value, network: network.value } }))
  } catch (err) {
    error.value = normalizeApiError(err).message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="renew">
    <div class="grid gap-3 sm:grid-cols-2">
      <UiSelect v-model="currency" label="ارز" :options="currencyOptions" />
      <UiSelect v-model="network" label="شبکه" :options="networkOptions" />
    </div>
    <UiAlert v-if="error" tone="danger">{{ error }}</UiAlert>
    <UiButton type="submit" variant="accent" :loading="loading" :disabled="!network">
      <RefreshCw v-if="!loading" class="size-4" aria-hidden="true" />
      دریافت فاکتور جدید با نرخ به‌روز
    </UiButton>
  </form>
</template>
