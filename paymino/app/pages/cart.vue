<script setup lang="ts">
import { ArrowLeft, ShoppingBag, Wallet } from 'lucide-vue-next'

useSeoMeta({ title: 'سبد خرید', robots: 'noindex' })

const cart = useCartStore()
const quoteByLine = computed(() => Object.fromEntries((cart.quote?.lines ?? []).map((l) => [l.lineId, l])))
const priceChanged = computed(() => cart.issues.some((l) => l.issue?.code === 'price_changed'))
const hasUnavailable = computed(() => cart.issues.some((l) => !l.available))

// Re-quote whenever the cart content changes (debounced)
let timer: ReturnType<typeof setTimeout> | undefined
const signature = computed(() => cart.lines.map((l) => `${l.lineId}:${l.variantId}:${l.quantity}`).join('|'))
watch(
  signature,
  () => {
    if (!import.meta.client) return
    clearTimeout(timer)
    timer = setTimeout(() => cart.refreshQuote(), 250)
  },
  { immediate: true },
)
onMounted(() => cart.hydrate())
onBeforeUnmount(() => clearTimeout(timer))

async function acceptPrices() {
  cart.acceptPriceChanges()
  await cart.refreshQuote()
}
async function removeUnavailable() {
  cart.removeUnavailable()
  await cart.refreshQuote()
}

const canCheckout = computed(() => !!cart.quote && !cart.quoteLoading && !cart.quoteError && !cart.hasBlockingIssues && cart.quote.totalToman > 0)
</script>

<template>
  <div class="container-page py-8">
    <h1 class="mb-6 text-2xl font-extrabold">سبد خرید</h1>

    <ClientOnly>
      <div v-if="cart.isEmpty" class="card">
        <UiEmptyState :icon="ShoppingBag" title="سبد خرید شما خالی است" description="محصول موردنظر خود را از فروشگاه انتخاب کنید و به سبد اضافه کنید.">
          <UiButton to="/shop" variant="accent">مشاهده محصولات</UiButton>
        </UiEmptyState>
      </div>

      <div v-else class="grid gap-6 lg:grid-cols-[1fr_360px] lg:gap-8">
        <div class="space-y-4">
          <UiAlert v-if="priceChanged" tone="warning" title="قیمت برخی اقلام تغییر کرده است" live>
            قیمت جدید در سبد نمایش داده شده است. برای ادامه، قیمت‌های جدید را تأیید کنید.
            <div class="mt-2">
              <UiButton size="sm" variant="secondary" @click="acceptPrices">تأیید قیمت‌های جدید</UiButton>
            </div>
          </UiAlert>
          <UiAlert v-if="hasUnavailable" tone="danger" title="برخی اقلام موجود نیستند">
            این اقلام در مبلغ نهایی محاسبه نمی‌شوند. برای ادامه آن‌ها را از سبد حذف کنید.
            <div class="mt-2">
              <UiButton size="sm" variant="danger" @click="removeUnavailable">حذف اقلام ناموجود</UiButton>
            </div>
          </UiAlert>

          <section class="card p-5" aria-label="اقلام سبد خرید">
            <ul class="divide-y divide-line">
              <CartLineItem v-for="line in cart.lines" :key="line.lineId" :line="line" :quote-line="quoteByLine[line.lineId]" />
            </ul>
          </section>

          <NuxtLink to="/shop" class="inline-flex items-center gap-1 text-sm font-semibold text-accent-700 hover:underline">ادامه خرید</NuxtLink>
        </div>

        <aside class="space-y-4 lg:sticky lg:top-36 lg:self-start">
          <CartOrderSummary :quote="cart.quote" :loading="cart.quoteLoading" :error="cart.quoteError" @retry="cart.refreshQuote()">
            <UiButton to="/checkout" variant="accent" size="lg" block class="mt-5" :disabled="!canCheckout">
              ادامه فرآیند خرید
              <ArrowLeft class="size-5" aria-hidden="true" />
            </UiButton>
          </CartOrderSummary>
          <div class="flex gap-3 rounded-[var(--radius-card)] border border-line bg-white p-4 text-sm leading-7 text-muted">
            <Wallet class="mt-1 size-5 shrink-0 text-navy-400" aria-hidden="true" />
            <p>پرداخت با ارز دیجیتال انجام می‌شود. مبلغ دقیق ارز، شبکه و نرخ تبدیل پیش از پرداخت نمایش داده می‌شود.</p>
          </div>
        </aside>
      </div>

      <template #fallback>
        <div class="grid gap-6 lg:grid-cols-[1fr_360px]" aria-busy="true">
          <div class="skeleton h-64" />
          <div class="skeleton h-56" />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
