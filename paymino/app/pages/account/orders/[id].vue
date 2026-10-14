<script setup lang="ts">
import { ArrowRight, LifeBuoy, Wallet } from 'lucide-vue-next'
import type { Order } from '#shared/types'
import { isPayable } from '#shared/utils/status'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const api = useApi()
const id = String(route.params.id)

const { data: order, status, error, refresh } = await useAsyncData(`order:${id}`, () => api<Order>(`/orders/${id}`))
if (error.value && normalizeApiError(error.value).status === 404) {
  throw createError({ statusCode: 404, statusMessage: 'سفارش یافت نشد', fatal: true })
}
useSeoMeta({ title: () => (order.value ? `سفارش ${order.value.number}` : 'جزئیات سفارش'), robots: 'noindex' })

const payable = computed(() => !!order.value && isPayable(order.value.status, order.value.paymentStatus))

// Light auto-refresh while something is still moving
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  timer = setInterval(() => {
    const s = order.value?.status
    if (document.visibilityState === 'visible' && s && ['payment_verification', 'paid', 'processing'].includes(s)) refresh()
  }, 15000)
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <AccountShell :title="order ? `سفارش ${order.number}` : 'جزئیات سفارش'" :subtitle="order ? `ثبت‌شده در ${formatDateTime(order.createdAt)}` : undefined">
    <template #actions>
      <UiButton to="/account/orders" variant="ghost" size="sm"><ArrowRight class="size-4" aria-hidden="true" />همه سفارش‌ها</UiButton>
    </template>

    <div v-if="error" class="card">
      <UiErrorState :message="normalizeApiError(error).message" :retrying="status === 'pending'" @retry="refresh()" />
    </div>

    <div v-else-if="order" class="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div class="min-w-0 space-y-6">
        <!-- Status -->
        <section class="card p-5" aria-labelledby="st-title">
          <h2 id="st-title" class="sr-only">وضعیت</h2>
          <div class="flex flex-wrap items-center gap-3">
            <OrderStatusBadge kind="order" :status="order.status" />
            <OrderStatusBadge v-if="order.paymentStatus" kind="payment" :status="order.paymentStatus" />
          </div>
          <p class="mt-3 text-[15px] leading-7 text-navy-700">{{ ORDER_STATUS[order.status].hint }}</p>
          <UiButton v-if="payable" :to="`/checkout/pay/${order.id}`" variant="accent" class="mt-4">
            <Wallet class="size-4" aria-hidden="true" />ادامه پرداخت
          </UiButton>
        </section>

        <!-- Items -->
        <section class="card p-5" aria-labelledby="it-title">
          <h2 id="it-title" class="mb-4 font-bold">اقلام سفارش</h2>
          <ul class="divide-y divide-line">
            <li v-for="item in order.items" :key="item.id" class="py-4 first:pt-0 last:pb-0">
              <div class="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <NuxtLink :to="`/p/${item.productSlug}`" class="font-semibold hover:text-accent-700">{{ item.productName }}</NuxtLink>
                  <p class="text-sm text-muted">
                    <bdi class="ltr">{{ item.variantLabel }}</bdi> · {{ PRODUCT_TYPE[item.type] }} · تعداد {{ faNumber(item.quantity) }}
                  </p>
                </div>
                <p class="tabular font-semibold">{{ formatToman(item.lineTotalToman) }}</p>
              </div>

              <dl v-if="Object.keys(item.fields).length" class="mt-3 space-y-1 rounded-lg bg-canvas p-3 text-sm">
                <div v-for="(v, k) in item.fields" :key="k" class="flex flex-wrap gap-2">
                  <dt class="text-muted">{{ item.fieldLabels[k] ?? k }}:</dt>
                  <dd class="ltr font-medium break-anywhere">{{ v }}</dd>
                </div>
              </dl>

              <div v-if="item.deliveries.length" class="mt-3 space-y-2">
                <p class="text-sm font-semibold text-accent-800">تحویل‌شده</p>
                <template v-for="(d, i) in item.deliveries" :key="i">
                  <OrderDeliveredCode v-if="d.kind === 'code'" :value="d.value" />
                  <p v-else class="rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-900">{{ d.value }}</p>
                </template>
                <p class="text-xs text-muted">کد را در اختیار دیگران قرار ندهید. پشتیبانی پی‌مینو هرگز کد شما را درخواست نمی‌کند.</p>
              </div>
            </li>
          </ul>
        </section>

        <!-- Timeline -->
        <section class="card p-5" aria-labelledby="tl-title">
          <h2 id="tl-title" class="mb-5 font-bold">تاریخچه سفارش</h2>
          <OrderTimeline :events="order.events" />
        </section>
      </div>

      <aside class="space-y-4">
        <section class="card p-5" aria-labelledby="pay-title">
          <h2 id="pay-title" class="mb-4 font-bold">مبلغ و پرداخت</h2>
          <dl class="space-y-2.5 text-sm">
            <div class="flex justify-between gap-3">
              <dt class="text-muted">جمع اقلام</dt>
              <dd class="tabular">{{ formatToman(order.subtotalToman) }}</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-muted">کارمزد خدمات</dt>
              <dd class="tabular">{{ formatToman(order.serviceFeeToman) }}</dd>
            </div>
            <div v-if="order.discountToman" class="flex justify-between gap-3">
              <dt class="text-muted">تخفیف</dt>
              <dd class="tabular">−{{ formatToman(order.discountToman) }}</dd>
            </div>
            <div class="flex justify-between gap-3 border-t border-line pt-2.5 font-bold">
              <dt>مبلغ کل</dt>
              <dd class="tabular">{{ formatToman(order.totalToman) }}</dd>
            </div>
          </dl>
          <dl v-if="order.paymentMethod" class="mt-4 space-y-2.5 border-t border-line pt-4 text-sm">
            <div class="flex justify-between gap-3">
              <dt class="text-muted">روش پرداخت</dt>
              <dd class="ltr font-medium">{{ order.paymentMethod.currency }} · {{ order.paymentMethod.network }}</dd>
            </div>
            <div v-if="order.invoice" class="flex justify-between gap-3">
              <dt class="text-muted">مبلغ فاکتور</dt>
              <dd class="ltr font-medium">{{ order.invoice.amountCrypto }} {{ order.invoice.currency }}</dd>
            </div>
            <div v-if="order.invoice" class="flex items-center justify-between gap-3">
              <dt class="text-muted">شناسه فاکتور</dt>
              <dd class="flex items-center gap-1.5">
                <code class="ltr font-mono text-xs">{{ shortHash(order.invoice.id, 6) }}</code>
                <UiCopyButton :value="order.invoice.id" label="کپی شناسه فاکتور" compact />
              </dd>
            </div>
            <div v-if="order.invoice?.txHash" class="flex items-center justify-between gap-3">
              <dt class="text-muted">شناسه تراکنش</dt>
              <dd class="flex items-center gap-1.5">
                <code class="ltr font-mono text-xs">{{ shortHash(order.invoice.txHash, 6) }}</code>
                <UiCopyButton :value="order.invoice.txHash" label="کپی شناسه تراکنش" compact />
              </dd>
            </div>
          </dl>
        </section>

        <section class="card p-5">
          <h2 class="font-bold">مشکلی در این سفارش دارید؟</h2>
          <p class="mt-1 text-sm leading-7 text-muted">درخواست پشتیبانی با شماره همین سفارش ثبت می‌شود.</p>
          <UiButton :to="{ path: '/account/support', query: { order: order.number } }" variant="secondary" block class="mt-4">
            <LifeBuoy class="size-4" aria-hidden="true" />درخواست پشتیبانی
          </UiButton>
        </section>
      </aside>
    </div>

    <div v-else class="space-y-4" aria-busy="true">
      <div class="skeleton h-28" />
      <div class="skeleton h-56" />
    </div>
  </AccountShell>
</template>
