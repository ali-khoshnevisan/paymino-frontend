<script setup lang="ts">
import { CircleCheck, ExternalLink, LifeBuoy, Package } from 'lucide-vue-next'
import type { Order } from '#shared/types'
import { FINAL_PAYMENT_STATES } from '#shared/utils/status'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'پرداخت سفارش', robots: 'noindex' })

const route = useRoute()
const api = useApi()
const orderId = String(route.params.id)
const isDev = import.meta.dev

const { data: order, error, status, refresh } = await useAsyncData(`pay:${orderId}`, () => api<Order>(`/orders/${orderId}`))

if (error.value && normalizeApiError(error.value).status === 404) {
  throw createError({ statusCode: 404, statusMessage: 'سفارش یافت نشد', fatal: true })
}

const invoice = computed(() => order.value?.invoice ?? null)
const payStatus = computed(() => order.value?.paymentStatus ?? null)
const isPaid = computed(() => payStatus.value === 'confirmed')
const isWaiting = computed(() => payStatus.value === 'awaiting_payment' && order.value?.status === 'pending_payment')
const isInFlight = computed(() => payStatus.value === 'detected' || payStatus.value === 'confirming')
const needsNewInvoice = computed(() => order.value?.status === 'pending_payment' && (payStatus.value === 'expired' || payStatus.value === 'failed'))
const isCancelled = computed(() => order.value?.status === 'cancelled')

// Poll the server while the payment is not final. Status only changes via verified gateway events.
let poll: ReturnType<typeof setInterval> | undefined
function startPolling() {
  stopPolling()
  poll = setInterval(() => {
    if (document.visibilityState === 'visible') refresh()
  }, 8000)
}
function stopPolling() {
  clearInterval(poll)
  poll = undefined
}
watch(
  payStatus,
  (s) => {
    if (!import.meta.client) return
    if (s && !FINAL_PAYMENT_STATES.includes(s) && !isCancelled.value) startPolling()
    else stopPolling()
  },
  { immediate: true },
)
onBeforeUnmount(stopPolling)

function onUpdated(o: Order) {
  order.value = o
}

const cancelling = ref(false)
const cancelError = ref<string | null>(null)
async function cancelOrder() {
  if (!confirm('این سفارش لغو شود؟ اگر مبلغی ارسال کرده‌اید، لغو نکنید و با پشتیبانی تماس بگیرید.')) return
  cancelling.value = true
  cancelError.value = null
  try {
    order.value = await api<Order>(`/orders/${orderId}/cancel`, { method: 'POST' })
  } catch (err) {
    cancelError.value = normalizeApiError(err).message
  } finally {
    cancelling.value = false
  }
}
</script>

<template>
  <div class="container-page max-w-3xl py-8">
    <div v-if="error" class="card">
      <UiErrorState :message="normalizeApiError(error).message" :retrying="status === 'pending'" @retry="refresh()" />
    </div>

    <template v-else-if="order">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-extrabold">{{ isPaid ? 'سفارش ثبت و پرداخت شد' : 'پرداخت سفارش' }}</h1>
          <p class="mt-1 text-sm text-muted">
            شماره سفارش: <bdi class="ltr font-semibold text-navy-800">{{ order.number }}</bdi>
          </p>
        </div>
        <OrderStatusBadge v-if="payStatus" kind="payment" :status="payStatus" />
      </div>

      <!-- Confirmation (step 7) -->
      <section v-if="isPaid" class="card p-6 sm:p-8" aria-live="polite">
        <div class="flex flex-col items-center text-center">
          <div class="flex size-16 items-center justify-center rounded-full bg-accent-50 text-accent-600">
            <CircleCheck class="size-9" aria-hidden="true" />
          </div>
          <h2 class="mt-4 text-xl font-bold">پرداخت شما تأیید شد</h2>
          <p class="mt-2 max-w-md text-[15px] leading-8 text-muted">
            سفارش <bdi class="ltr font-semibold text-navy-800">{{ order.number }}</bdi> اکنون در وضعیت «{{ ORDER_STATUS[order.status].label }}» است.
          </p>
        </div>
        <div class="mt-6 rounded-[var(--radius-control)] bg-canvas p-4 text-sm leading-7">
          <p class="mb-2 font-semibold">مراحل بعدی</p>
          <ul class="list-disc space-y-1 ps-5 text-navy-700">
            <li>وضعیت انجام سفارش را در صفحه جزئیات سفارش دنبال کنید.</li>
            <li>کد گیفت کارت‌ها پس از انجام سفارش در همان صفحه نمایش داده می‌شود.</li>
            <li>برای اشتراک‌ها، پس از فعال‌سازی وضعیت سفارش «تکمیل‌شده» می‌شود.</li>
          </ul>
        </div>
        <div class="mt-6 flex flex-wrap justify-center gap-3">
          <UiButton :to="`/account/orders/${order.id}`" variant="primary"><Package class="size-4" aria-hidden="true" />جزئیات سفارش</UiButton>
          <UiButton to="/shop" variant="secondary">ادامه خرید</UiButton>
        </div>
      </section>

      <!-- Cancelled -->
      <section v-else-if="isCancelled" class="card p-6">
        <UiEmptyState title="این سفارش لغو شده است" description="در صورت نیاز می‌توانید سفارش جدیدی ثبت کنید.">
          <UiButton to="/shop" variant="accent">مشاهده محصولات</UiButton>
        </UiEmptyState>
      </section>

      <template v-else>
        <section class="card space-y-6 p-5 sm:p-6">
          <PaymentTracker v-if="invoice && payStatus" :status="payStatus" :confirmations="invoice.confirmations" :required="invoice.confirmationsRequired" />

          <!-- Awaiting -->
          <PaymentCryptoInvoice v-if="isWaiting && invoice" :invoice="invoice" @expired="refresh()" />

          <!-- Detected / confirming -->
          <div v-else-if="isInFlight && invoice" class="space-y-4" aria-live="polite">
            <UiAlert tone="info" :title="PAYMENT_STATUS[payStatus!].label">
              {{ PAYMENT_STATUS[payStatus!].hint }} این صفحه به‌صورت خودکار به‌روز می‌شود.
            </UiAlert>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between gap-3">
                <dt class="text-muted">مبلغ فاکتور</dt>
                <dd class="ltr font-semibold">{{ invoice.amountCrypto }} {{ invoice.currency }} · {{ invoice.network }}</dd>
              </div>
              <div v-if="invoice.txHash" class="flex justify-between gap-3">
                <dt class="text-muted">شناسه تراکنش</dt>
                <dd class="flex items-center gap-2">
                  <code class="ltr font-mono text-xs">{{ shortHash(invoice.txHash) }}</code>
                  <UiCopyButton :value="invoice.txHash" label="کپی شناسه تراکنش" compact />
                </dd>
              </div>
            </dl>
          </div>

          <!-- Underpaid -->
          <div v-else-if="payStatus === 'underpaid' && invoice" class="space-y-4">
            <UiAlert tone="danger" title="مبلغ دریافتی کمتر از مبلغ فاکتور است">
              مبلغ دریافت‌شده: <bdi class="ltr font-semibold">{{ invoice.amountReceived }} {{ invoice.currency }}</bdi> — مبلغ فاکتور:
              <bdi class="ltr font-semibold">{{ invoice.amountCrypto }} {{ invoice.currency }}</bdi>.
              <br />
              سفارش تا بررسی پشتیبانی متوقف است. لطفاً با ذکر شماره سفارش درخواست پشتیبانی ثبت کنید و مبلغ اضافه‌ای ارسال نکنید.
            </UiAlert>
            <UiButton :to="{ path: '/account/support', query: { order: order.number } }" variant="primary">
              <LifeBuoy class="size-4" aria-hidden="true" />ثبت درخواست پشتیبانی
            </UiButton>
          </div>

          <!-- Expired / failed -->
          <div v-else-if="needsNewInvoice" class="space-y-4">
            <UiAlert :tone="payStatus === 'failed' ? 'danger' : 'warning'" :title="payStatus === 'failed' ? 'پرداخت ناموفق بود' : 'مهلت پرداخت به پایان رسید'">
              اگر مبلغی ارسال <strong>نکرده‌اید</strong>، فاکتور جدید با نرخ به‌روز دریافت کنید. اگر پرداخت کرده‌اید، فاکتور جدید نگیرید و با پشتیبانی تماس بگیرید.
            </UiAlert>
            <PaymentRenewInvoice :order="order" @renewed="onUpdated" />
          </div>

          <!-- Payment verification without invoice details -->
          <div v-else>
            <UiAlert tone="info">{{ ORDER_STATUS[order.status].hint }}</UiAlert>
          </div>

          <a v-if="invoice?.explorerUrl" :href="invoice.explorerUrl" target="_blank" rel="noopener" class="inline-flex items-center gap-1 text-sm text-accent-700 hover:underline">
            مشاهده تراکنش در کاوشگر بلاک‌چین <ExternalLink class="size-3.5" aria-hidden="true" />
          </a>
        </section>

        <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
          <NuxtLink :to="`/account/orders/${order.id}`" class="text-sm font-semibold text-accent-700 hover:underline">جزئیات سفارش</NuxtLink>
          <UiButton v-if="isWaiting || needsNewInvoice" variant="ghost" size="sm" :loading="cancelling" @click="cancelOrder">لغو سفارش</UiButton>
        </div>
        <UiAlert v-if="cancelError" tone="danger" class="mt-3">{{ cancelError }}</UiAlert>
      </template>

      <PaymentDevPaymentSimulator v-if="isDev && (invoice?.sandbox ?? true) && !isCancelled" class="mt-8" :order-id="order.id" @updated="onUpdated" />
    </template>
  </div>
</template>
