<script setup lang="ts">
import { Clock, TriangleAlert } from 'lucide-vue-next'
import type { PaymentInvoice } from '#shared/types'

const props = defineProps<{ invoice: PaymentInvoice }>()
const emit = defineEmits<{ expired: [] }>()

const expiresAt = computed(() => props.invoice.expiresAt)
const { seconds, label } = useCountdown(expiresAt)
watch(seconds, (s, prev) => {
  if (s === 0 && prev > 0) emit('expired')
})

const qr = ref<string | null>(null)
async function renderQr() {
  if (!import.meta.client) return
  const { toDataURL } = await import('qrcode')
  // Encode only the address (most wallets don't agree on URI formats across networks).
  qr.value = await toDataURL(props.invoice.paymentUri ?? props.invoice.address, { margin: 1, width: 220, color: { dark: '#0B1F3A', light: '#FFFFFF' } })
}
onMounted(renderQr)
watch(() => props.invoice.id, renderQr)
</script>

<template>
  <div class="space-y-5">
    <UiAlert v-if="invoice.sandbox" tone="danger" title="محیط آزمایشی — پرداخت نکنید">
      این فاکتور توسط سرور آزمایشی ساخته شده است و آدرس آن واقعی نیست. هیچ مبلغی به این آدرس ارسال نکنید.
    </UiAlert>

    <div class="flex items-center justify-between gap-3 rounded-[var(--radius-control)] bg-amber-50 px-4 py-3 text-amber-900">
      <span class="flex items-center gap-2 text-sm font-medium">
        <Clock class="size-4" aria-hidden="true" />
        زمان باقی‌مانده برای پرداخت
      </span>
      <span class="tabular ltr text-lg font-bold" role="timer" :aria-label="`${label} دقیقه باقی مانده`">{{ label }}</span>
    </div>

    <div class="grid gap-6 sm:grid-cols-[220px_1fr] sm:items-start">
      <div class="mx-auto flex size-[220px] items-center justify-center rounded-xl border border-line bg-white p-2">
        <img v-if="qr" :src="qr" width="200" height="200" alt="کد QR آدرس پرداخت" class="size-full" />
        <div v-else class="skeleton size-full" />
      </div>

      <dl class="min-w-0 space-y-4">
        <div>
          <dt class="text-sm text-muted">مبلغ دقیق قابل ارسال</dt>
          <dd class="mt-1 flex items-center gap-2">
            <span class="ltr text-2xl font-extrabold tracking-tight text-navy-900">{{ invoice.amountCrypto }} {{ invoice.currency }}</span>
            <UiCopyButton :value="invoice.amountCrypto" label="کپی مبلغ" compact />
          </dd>
        </div>
        <div>
          <dt class="text-sm text-muted">شبکه</dt>
          <dd class="mt-1"><UiBadge tone="accent"><bdi class="ltr">{{ invoice.network }}</bdi></UiBadge></dd>
        </div>
        <div>
          <dt class="text-sm text-muted">آدرس مقصد</dt>
          <dd class="mt-1 flex items-start gap-2">
            <code class="ltr block min-w-0 flex-1 rounded-lg bg-canvas px-3 py-2 font-mono text-sm break-anywhere text-navy-900">{{ invoice.address }}</code>
            <UiCopyButton :value="invoice.address" label="کپی آدرس" compact />
          </dd>
        </div>
        <div v-if="invoice.memo">
          <dt class="text-sm font-semibold text-red-700">Memo / Tag (الزامی)</dt>
          <dd class="mt-1 flex items-center gap-2">
            <code class="ltr rounded-lg bg-canvas px-3 py-2 font-mono text-sm">{{ invoice.memo }}</code>
            <UiCopyButton :value="invoice.memo" label="کپی Memo" compact />
          </dd>
        </div>
      </dl>
    </div>

    <dl class="grid gap-3 rounded-[var(--radius-control)] border border-line p-4 text-sm sm:grid-cols-3">
      <div>
        <dt class="text-muted">مبلغ سفارش</dt>
        <dd class="tabular font-semibold">{{ formatToman(invoice.totalToman) }}</dd>
      </div>
      <div>
        <dt class="text-muted">نرخ تبدیل</dt>
        <dd class="tabular font-semibold">{{ formatToman(invoice.rateToman) }}</dd>
      </div>
      <div>
        <dt class="text-muted">تأیید موردنیاز</dt>
        <dd class="tabular font-semibold">{{ faNumber(invoice.confirmationsRequired) }} تأیید شبکه</dd>
      </div>
    </dl>

    <div class="flex gap-3 rounded-[var(--radius-control)] border border-amber-200 bg-amber-50/60 p-4 text-sm leading-7 text-amber-900">
      <TriangleAlert class="mt-1 size-5 shrink-0 text-amber-600" aria-hidden="true" />
      <ul class="list-disc space-y-1 ps-4">
        <li>فقط <bdi class="ltr font-semibold">{{ invoice.currency }}</bdi> و فقط در شبکه <bdi class="ltr font-semibold">{{ invoice.network }}</bdi> ارسال کنید.</li>
        <li>مبلغ را دقیقاً مطابق فاکتور ارسال کنید. کارمزد شبکه از کیف پول شما کسر می‌شود و نباید از مبلغ فاکتور کم شود.</li>
        <li>پس از ارسال، این صفحه را باز نگه دارید یا بعداً از «سفارش‌های من» وضعیت را بررسی کنید.</li>
      </ul>
    </div>
  </div>
</template>
