<script setup lang="ts">
import { ArrowLeft, ArrowRight, Info, LogIn, ShoppingBag, UserRound } from 'lucide-vue-next'
import type { CryptoCurrency, Order, Quote } from '#shared/types'

useSeoMeta({ title: 'تکمیل خرید', robots: 'noindex' })

const cart = useCartStore()
const auth = useAuthStore()
const api = useApi()
const route = useRoute()
const router = useRouter()

const STEPS = ['بررسی سبد', 'اطلاعات سفارش', 'حساب کاربری', 'بررسی نهایی', 'پرداخت']
const step = ref(0)

/* ------------------------------- Step data ------------------------------- */
const fieldErrors = ref<Record<string, string>>({})
const submitError = ref<string | null>(null)
const submitting = ref(false)
const acceptedTerms = ref(false)
const termsError = ref('')
const idempotencyKey = ref(uid())

const { data: payOptions, status: payStatus, error: payError, refresh: refreshPay } = await useAsyncData(
  'payment-currencies',
  () => api<{ currencies: CryptoCurrency[]; invoiceTtlMinutes: number; sandbox: boolean }>('/payments/currencies'),
  { server: false, lazy: true },
)
const currencyCode = ref('')
const networkCode = ref('')
watch(
  payOptions,
  (p) => {
    if (p && !currencyCode.value) {
      currencyCode.value = p.currencies[0]?.code ?? ''
      networkCode.value = p.currencies[0]?.networks[0]?.code ?? ''
    }
  },
  { immediate: true },
)
const currency = computed(() => payOptions.value?.currencies.find((c) => c.code === currencyCode.value))
const network = computed(() => currency.value?.networks.find((n) => n.code === networkCode.value))
watch(currencyCode, () => {
  if (!currency.value?.networks.some((n) => n.code === networkCode.value)) networkCode.value = currency.value?.networks[0]?.code ?? ''
})
const estimate = computed(() => {
  if (!cart.quote || !currency.value) return null
  const decimals = currency.value.code === 'BTC' ? 8 : currency.value.code === 'TON' ? 4 : 2
  const factor = 10 ** decimals
  return (Math.ceil((cart.quote.totalToman / currency.value.rateToman) * factor) / factor).toFixed(decimals).replace(/\.?0+$/, '')
})

/* ------------------------------- Validation ------------------------------ */
const infoLines = computed(() => cart.lines.filter((l) => l.requiredFields.length > 0))
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validateInfo() {
  const errs: Record<string, string> = {}
  for (const line of infoLines.value) {
    for (const f of line.requiredFields) {
      const v = (line.fields[f.key] ?? '').trim()
      const k = `${line.lineId}.${f.key}`
      if (f.required && !v) errs[k] = `${f.label} الزامی است.`
      else if (v && f.type === 'email' && !EMAIL.test(v)) errs[k] = 'ایمیل معتبر وارد کنید.'
    }
  }
  fieldErrors.value = errs
  return Object.keys(errs).length === 0
}

const quoteOk = computed(() => !!cart.quote && !cart.quoteLoading && !cart.hasBlockingIssues && cart.quote.totalToman > 0)

const completed = computed(() => {
  const done: number[] = []
  if (quoteOk.value) done.push(0)
  if (done.includes(0) && infoLines.value.every((l) => l.requiredFields.every((f) => !f.required || (l.fields[f.key] ?? '').trim()))) done.push(1)
  if (done.includes(1) && auth.isLoggedIn) done.push(2)
  if (done.includes(2)) done.push(3)
  return done
})

function go(i: number) {
  step.value = i
  router.replace({ query: { ...route.query, step: String(i + 1) } })
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

function next() {
  if (step.value === 0 && !quoteOk.value) return
  if (step.value === 1 && !validateInfo()) {
    nextTick(() => document.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus())
    return
  }
  let target = step.value + 1
  if (target === 1 && infoLines.value.length === 0) target = 2
  if (target === 2 && auth.isLoggedIn) target = 3
  go(target)
}
function back() {
  let target = step.value - 1
  if (target === 2 && auth.isLoggedIn) target = 1
  if (target === 1 && infoLines.value.length === 0) target = 0
  go(Math.max(0, target))
}

/* ------------------------------- Lifecycle ------------------------------- */
onMounted(async () => {
  cart.hydrate()
  if (cart.isEmpty) return
  await cart.refreshQuote()
  // Resume after login/register: ?step=N, but never skip unmet requirements
  const requested = Math.min(Math.max(Number(route.query.step ?? 1) - 1, 0), STEPS.length - 1)
  let allowed = 0
  while (allowed < requested && completed.value.includes(allowed)) allowed++
  // A signed-in user has nothing to do on the account step
  if (allowed === 2 && auth.isLoggedIn) allowed = 3
  step.value = allowed
})

const loginTarget = computed(() => ({ path: '/auth/login', query: { redirect: '/checkout?step=4' } }))
const registerTarget = computed(() => ({ path: '/auth/register', query: { redirect: '/checkout?step=4' } }))

/* --------------------------------- Submit -------------------------------- */
async function placeOrder() {
  submitError.value = null
  termsError.value = ''
  if (!acceptedTerms.value) {
    termsError.value = 'برای ثبت سفارش، پذیرش قوانین الزامی است.'
    return
  }
  if (!currency.value || !network.value || !cart.quote) return
  if (!validateInfo()) return go(1)

  submitting.value = true
  try {
    const order = await api<Order>('/orders', {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey.value },
      body: {
        items: cart.lines.map((l) => ({
          lineId: l.lineId,
          productId: l.productId,
          variantId: l.variantId,
          quantity: l.quantity,
          knownUnitPriceToman: l.unitPriceToman,
          fields: Object.fromEntries(Object.entries(l.fields).map(([k, v]) => [k, v.trim()])),
        })),
        currency: currency.value.code,
        network: network.value.code,
        acceptedTerms: true,
        couponCode: cart.couponCode || undefined,
        expectedTotalToman: cart.quote.totalToman,
      },
    })
    cart.clear()
    await navigateTo(`/checkout/pay/${order.id}`, { replace: true })
  } catch (err) {
    const e = normalizeApiError(err)
    if (e.status === 401) {
      await auth.fetchUser()
      submitError.value = 'نشست شما منقضی شده است. دوباره وارد شوید.'
      return go(2)
    }
    if (e.code === 'coupon_invalid') {
      // The code stopped applying (used up, expired…): show the new total here and let the user decide
      cart.quote = (e.data?.quote as Quote) ?? null
      cart.syncCoupon(cart.quote)
      idempotencyKey.value = uid()
      submitError.value = `${e.message} مبلغ نهایی بدون این کد به‌روز شد.`
      return
    }
    if (e.code === 'quote_changed') {
      cart.quote = (e.data?.quote as Quote) ?? null
      idempotencyKey.value = uid()
      submitError.value = e.message
      return go(0)
    }
    if (Object.keys(e.fieldErrors).some((k) => k.includes('.'))) {
      fieldErrors.value = e.fieldErrors
      return go(1)
    }
    if (e.fieldErrors.acceptedTerms) termsError.value = e.fieldErrors.acceptedTerms
    submitError.value = e.message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="container-page py-8">
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-extrabold">تکمیل خرید</h1>
      <ClientOnly>
        <CheckoutStepper v-if="!cart.isEmpty" :steps="STEPS" :current="step" :completed="completed" @go="go" />
      </ClientOnly>
    </div>

    <ClientOnly>
      <div v-if="cart.isEmpty" class="card">
        <UiEmptyState :icon="ShoppingBag" title="سبد خرید شما خالی است" description="برای تکمیل خرید، ابتدا محصولی به سبد اضافه کنید.">
          <UiButton to="/shop" variant="accent">مشاهده محصولات</UiButton>
        </UiEmptyState>
      </div>

      <div v-else class="grid gap-6 lg:grid-cols-[1fr_360px] lg:gap-8">
        <div class="min-w-0 space-y-4">
          <UiAlert v-if="submitError" tone="danger">{{ submitError }}</UiAlert>

          <!-- Step 1: review -->
          <section v-if="step === 0" class="card p-5 sm:p-6" aria-labelledby="s1">
            <h2 id="s1" class="mb-4 text-lg font-bold">بررسی اقلام سبد</h2>
            <UiAlert v-if="cart.hasBlockingIssues" tone="warning" class="mb-4">
              قیمت یا موجودی برخی اقلام تغییر کرده است. برای ادامه، سبد خرید را بررسی کنید.
              <NuxtLink to="/cart" class="ms-1 font-semibold underline">رفتن به سبد خرید</NuxtLink>
            </UiAlert>
            <ul class="divide-y divide-line">
              <CartLineItem
                v-for="line in cart.lines"
                :key="line.lineId"
                :line="line"
                :quote-line="cart.quote?.lines.find((q) => q.lineId === line.lineId)"
                :editable="false"
              />
            </ul>
            <NuxtLink to="/cart" class="mt-4 inline-block text-sm font-semibold text-accent-700 hover:underline">ویرایش سبد خرید</NuxtLink>
          </section>

          <!-- Step 2: per-item information -->
          <section v-else-if="step === 1" class="card p-5 sm:p-6" aria-labelledby="s2">
            <h2 id="s2" class="text-lg font-bold">اطلاعات لازم برای انجام سفارش</h2>
            <p class="mt-1 mb-5 text-sm leading-7 text-muted">برای هر سرویس، اطلاعات حساب مقصد را وارد کنید. رمز عبور حساب‌های شما هرگز درخواست نمی‌شود.</p>
            <div class="space-y-6">
              <fieldset v-for="line in infoLines" :key="line.lineId" class="rounded-[var(--radius-control)] border border-line p-4">
                <legend class="px-1 font-semibold">
                  {{ line.name }} — <bdi class="ltr">{{ line.variantLabel }}</bdi>
                </legend>
                <div class="mt-2 grid gap-4 sm:grid-cols-2">
                  <UiInput
                    v-for="f in line.requiredFields"
                    :key="f.key"
                    :model-value="line.fields[f.key] ?? ''"
                    :label="f.label"
                    :type="f.type === 'email' ? 'email' : 'text'"
                    :placeholder="f.placeholder"
                    :hint="f.help"
                    :required="f.required"
                    :error="fieldErrors[`${line.lineId}.${f.key}`]"
                    :autocomplete="f.type === 'email' ? 'email' : 'off'"
                    :maxlength="200"
                    ltr
                    @update:model-value="(v: string) => cart.setField(line.lineId, f.key, v)"
                  />
                </div>
              </fieldset>
            </div>
          </section>

          <!-- Step 3: account -->
          <section v-else-if="step === 2" class="card p-5 sm:p-6" aria-labelledby="s3">
            <h2 id="s3" class="text-lg font-bold">ورود به حساب کاربری</h2>
            <template v-if="auth.isLoggedIn">
              <div class="mt-4 flex items-center gap-3 rounded-[var(--radius-control)] bg-canvas p-4">
                <UserRound class="size-5 text-navy-500" aria-hidden="true" />
                <p class="text-sm">
                  وارد شده‌اید با <bdi class="ltr font-semibold">{{ auth.user?.email }}</bdi>
                </p>
              </div>
            </template>
            <template v-else>
              <p class="mt-1 text-sm leading-7 text-muted">
                برای پیگیری سفارش و دریافت کد، وارد حساب خود شوید یا حساب جدید بسازید. سبد خرید شما حفظ می‌شود.
              </p>
              <div class="mt-5 flex flex-wrap gap-3">
                <UiButton :to="loginTarget" variant="primary"><LogIn class="size-4" aria-hidden="true" />ورود</UiButton>
                <UiButton :to="registerTarget" variant="secondary">ساخت حساب جدید</UiButton>
              </div>
            </template>
          </section>

          <!-- Step 4: final review -->
          <section v-else-if="step === 3" class="space-y-4" aria-labelledby="s4">
            <div class="card p-5 sm:p-6">
              <h2 id="s4" class="mb-4 text-lg font-bold">بررسی نهایی سفارش</h2>
              <ul class="divide-y divide-line">
                <li v-for="line in cart.lines" :key="line.lineId" class="py-4 first:pt-0 last:pb-0">
                  <div class="flex flex-wrap justify-between gap-2">
                    <p class="font-semibold">
                      {{ line.name }} <span class="text-muted">—</span> <bdi class="ltr">{{ line.variantLabel }}</bdi>
                      <span class="text-sm font-normal text-muted"> × {{ faNumber(line.quantity) }}</span>
                    </p>
                    <p class="tabular font-semibold">
                      {{ formatToman((cart.quote?.lines.find((q) => q.lineId === line.lineId)?.lineTotalToman) ?? line.unitPriceToman * line.quantity) }}
                    </p>
                  </div>
                  <dl v-if="line.requiredFields.length" class="mt-2 space-y-1 text-sm">
                    <div v-for="f in line.requiredFields" :key="f.key" class="flex gap-2">
                      <dt class="text-muted">{{ f.label }}:</dt>
                      <dd class="ltr font-medium break-anywhere">{{ line.fields[f.key] }}</dd>
                    </div>
                  </dl>
                </li>
              </ul>
            </div>
            <UiAlert tone="warning" title="پیش از پرداخت بررسی کنید">
              <ul class="list-disc space-y-1 ps-5">
                <li>منطقه گیفت کارت باید با کشور یا منطقه حساب مقصد یکسان باشد.</li>
                <li>اطلاعات حساب واردشده را دوباره بررسی کنید؛ سفارش روی همین حساب انجام می‌شود.</li>
                <li>کد گیفت کارت پس از تحویل قابل بازگشت نیست و اشتراک پس از فعال‌سازی قابل لغو نیست.</li>
              </ul>
              <NuxtLink to="/refund-policy" target="_blank" class="mt-2 inline-block font-semibold underline">قوانین لغو و بازپرداخت</NuxtLink>
            </UiAlert>
          </section>

          <!-- Step 5: payment method -->
          <section v-else-if="step === 4" class="card p-5 sm:p-6" aria-labelledby="s5">
            <h2 id="s5" class="text-lg font-bold">روش پرداخت</h2>
            <p class="mt-1 mb-5 text-sm text-muted">پرداخت با ارز دیجیتال. ارز و شبکه موردنظر را انتخاب کنید.</p>

            <div v-if="payStatus === 'pending' && !payOptions" class="space-y-3" aria-busy="true">
              <div class="skeleton h-14" />
              <div class="skeleton h-14" />
            </div>
            <UiErrorState v-else-if="payError" :message="normalizeApiError(payError).message" @retry="refreshPay()" />

            <div v-else-if="payOptions" class="space-y-6">
              <fieldset>
                <legend class="field-label">ارز</legend>
                <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <label
                    v-for="c in payOptions.currencies"
                    :key="c.code"
                    class="flex cursor-pointer flex-col items-center rounded-[var(--radius-control)] border p-3 text-center has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent-500"
                    :class="currencyCode === c.code ? 'border-accent-500 bg-accent-50 ring-1 ring-accent-500' : 'border-line hover:border-navy-200'"
                  >
                    <input v-model="currencyCode" type="radio" name="currency" :value="c.code" class="sr-only" />
                    <span class="ltr font-bold">{{ c.code }}</span>
                    <span class="ltr text-xs text-muted">{{ c.name }}</span>
                  </label>
                </div>
              </fieldset>

              <fieldset v-if="currency">
                <legend class="field-label">شبکه</legend>
                <div class="space-y-2">
                  <label
                    v-for="n in currency.networks"
                    :key="n.code"
                    class="flex cursor-pointer items-center gap-3 rounded-[var(--radius-control)] border p-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent-500"
                    :class="networkCode === n.code ? 'border-accent-500 bg-accent-50 ring-1 ring-accent-500' : 'border-line hover:border-navy-200'"
                  >
                    <input v-model="networkCode" type="radio" name="network" :value="n.code" class="accent-accent-600" />
                    <span class="ltr font-semibold">{{ n.name }}</span>
                    <span class="ms-auto text-xs text-muted">حداقل <bdi class="ltr">{{ n.minAmount }} {{ currency.code }}</bdi></span>
                  </label>
                </div>
              </fieldset>

              <div v-if="currency && network && estimate" class="rounded-[var(--radius-control)] bg-canvas p-4">
                <dl class="space-y-2 text-sm">
                  <div class="flex justify-between gap-3">
                    <dt class="text-muted">مبلغ تقریبی پرداخت</dt>
                    <dd class="ltr font-bold text-navy-900">{{ estimate }} {{ currency.code }}</dd>
                  </div>
                  <div class="flex justify-between gap-3">
                    <dt class="text-muted">نرخ تبدیل (هر {{ currency.code }})</dt>
                    <dd class="tabular">{{ formatToman(currency.rateToman) }}</dd>
                  </div>
                  <div class="flex justify-between gap-3">
                    <dt class="text-muted">به‌روزرسانی نرخ</dt>
                    <dd class="tabular">{{ formatDateTime(currency.rateUpdatedAt) }}</dd>
                  </div>
                </dl>
                <ul class="mt-3 space-y-1.5 border-t border-line pt-3 text-xs leading-6 text-muted">
                  <li class="flex gap-2">
                    <Info class="mt-1 size-3.5 shrink-0" aria-hidden="true" />
                    <span>مبلغ دقیق با نرخ لحظه صدور فاکتور محاسبه می‌شود و فاکتور {{ faNumber(payOptions.invoiceTtlMinutes) }} دقیقه اعتبار دارد.</span>
                  </li>
                  <li class="flex gap-2">
                    <Info class="mt-1 size-3.5 shrink-0" aria-hidden="true" />
                    <span>{{ network.networkFeeNote }}</span>
                  </li>
                  <li class="flex gap-2">
                    <Info class="mt-1 size-3.5 shrink-0" aria-hidden="true" />
                    <span>فقط در شبکه <bdi class="ltr font-semibold">{{ network.name }}</bdi> ارسال کنید؛ ارسال در شبکه دیگر ممکن است باعث از دست رفتن دارایی شود.</span>
                  </li>
                </ul>
              </div>

              <CartCouponField />

              <UiCheckbox v-model="acceptedTerms" :error="termsError">
                <NuxtLink to="/terms" target="_blank" class="font-semibold text-accent-700 underline">قوانین و شرایط</NuxtLink>
                و
                <NuxtLink to="/refund-policy" target="_blank" class="font-semibold text-accent-700 underline">قوانین لغو و بازپرداخت</NuxtLink>
                را خوانده‌ام و می‌پذیرم.
              </UiCheckbox>
            </div>
          </section>

          <!-- Navigation -->
          <div class="flex items-center justify-between gap-3">
            <UiButton v-if="step > 0" variant="ghost" @click="back">
              <ArrowRight class="size-4" aria-hidden="true" />
              مرحله قبل
            </UiButton>
            <span v-else />
            <UiButton v-if="step < 4" variant="primary" :disabled="(step === 0 && !quoteOk) || (step === 2 && !auth.isLoggedIn)" @click="next">
              ادامه
              <ArrowLeft class="size-4" aria-hidden="true" />
            </UiButton>
          </div>
        </div>

        <aside class="lg:sticky lg:top-36 lg:self-start">
          <CartOrderSummary :quote="cart.quote" :loading="cart.quoteLoading" :error="cart.quoteError" @retry="cart.refreshQuote()">
            <template v-if="step === 4">
              <div v-if="currency && estimate" class="mt-4 flex justify-between rounded-[var(--radius-control)] bg-accent-50 px-3 py-2.5 text-sm">
                <span class="text-accent-800">معادل تقریبی</span>
                <span class="ltr font-bold text-accent-900">{{ estimate }} {{ currency.code }}</span>
              </div>
              <UiButton
                variant="accent"
                size="lg"
                block
                class="mt-5"
                :loading="submitting"
                :disabled="!quoteOk || !currency || !network || !auth.isLoggedIn"
                @click="placeOrder"
              >
                ثبت سفارش و دریافت فاکتور پرداخت
              </UiButton>
              <p class="mt-3 text-xs leading-6 text-muted">با ثبت سفارش، فاکتور پرداخت صادر می‌شود. تا زمان تأیید پرداخت، هزینه‌ای از شما کسر نمی‌شود.</p>
            </template>
          </CartOrderSummary>
        </aside>
      </div>

      <template #fallback>
        <div class="grid gap-6 lg:grid-cols-[1fr_360px]" aria-busy="true">
          <div class="skeleton h-72" />
          <div class="skeleton h-56" />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
