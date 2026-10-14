<script setup lang="ts">
import { ExternalLink, Lock, PackageCheck, Send, Zap } from 'lucide-vue-next'
import type { AdminOrder } from '#shared/types/admin'
import type { OrderStatus } from '#shared/types'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const api = useApi()
const id = String(route.params.id)
const { busy, errors, run } = useAdminAction()

const { data: order, error, refresh } = await useAsyncData(`admin:order:${id}`, () => api<AdminOrder>(`/admin/orders/${id}`))
useSeoMeta({ title: () => `سفارش ${order.value?.number ?? ''} — مدیریت`, robots: 'noindex, nofollow' })

function set(o: AdminOrder | null) {
  if (o) order.value = o
}

/* ---- status change ---- */
const nextStatus = ref<OrderStatus | ''>('')
const statusMessage = ref('')
const notify = ref(true)
const confirmPayment = ref(false)
const needsPaymentConfirm = computed(
  () => !!order.value && (nextStatus.value === 'paid' || nextStatus.value === 'processing') && order.value.paymentStatus !== 'confirmed',
)
const transitionOptions = computed(() => (order.value?.allowedTransitions ?? []).map((s) => ({ value: s, label: ORDER_STATUS[s].label })))

async function changeStatus() {
  if (!nextStatus.value) return
  const res = await run(
    'status',
    () =>
      api<AdminOrder>(`/admin/orders/${id}/status`, {
        method: 'POST',
        body: { status: nextStatus.value, message: statusMessage.value, notify: notify.value, confirmPayment: confirmPayment.value },
      }),
    'وضعیت سفارش تغییر کرد.',
  )
  if (res) {
    set(res)
    nextStatus.value = ''
    statusMessage.value = ''
    confirmPayment.value = false
  }
}

/* ---- deliveries ---- */
const deliveryDraft = reactive<Record<string, string>>({})
async function deliver(itemId: string, kind: 'code' | 'service_note') {
  const value = (deliveryDraft[itemId] ?? '').trim()
  if (!value) return
  const res = await run(`deliver:${itemId}`, () => api<AdminOrder>(`/admin/orders/${id}/deliveries`, { method: 'POST', body: { itemId, kind, value } }), 'تحویل ثبت شد.')
  if (res) {
    set(res)
    deliveryDraft[itemId] = ''
  }
}

async function autoFulfill() {
  set(await run('fulfill', () => api<AdminOrder>(`/admin/orders/${id}/fulfill`, { method: 'POST' }), 'تحویل خودکار اجرا شد.'))
}

/* ---- notes / review ---- */
const note = ref('')
const notePublic = ref(false)
async function addNote() {
  if (!note.value.trim()) return
  const res = await run('note', () => api<AdminOrder>(`/admin/orders/${id}/notes`, { method: 'POST', body: { message: note.value, public: notePublic.value, notify: notePublic.value } }), 'یادداشت ثبت شد.')
  if (res) {
    set(res)
    note.value = ''
  }
}
const adminNote = ref(order.value?.adminNote ?? '')
async function saveAdminNote() {
  set(await run('adminNote', () => api<AdminOrder>(`/admin/orders/${id}`, { method: 'PATCH', body: { adminNote: adminNote.value } }), 'ذخیره شد.'))
}
async function toggleReview() {
  if (!order.value) return
  set(await run('review', () => api<AdminOrder>(`/admin/orders/${id}`, { method: 'PATCH', body: { needsReview: !order.value!.needsReview } })))
}

const hasPendingCodes = computed(() => order.value?.items.some((i) => i.type === 'gift_card' && i.stockMode === 'codes' && i.deliveries.length < i.quantity))
const canDeliver = computed(() => !!order.value && ['processing', 'awaiting_customer_info', 'completed'].includes(order.value.status))
</script>

<template>
  <div>
    <UiErrorState v-if="error" :message="normalizeApiError(error).message" @retry="refresh()" />
    <template v-else-if="order">
      <AdminHeader :title="`سفارش ${order.number}`" :subtitle="`ثبت: ${formatDateTime(order.createdAt)} — آخرین تغییر: ${formatDateTime(order.updatedAt)}`" back="/admin/orders">
        <OrderStatusBadge kind="order" :status="order.status" />
        <OrderStatusBadge v-if="order.paymentStatus" kind="payment" :status="order.paymentStatus" />
        <UiButton size="sm" :variant="order.needsReview ? 'danger' : 'secondary'" :loading="busy === 'review'" @click="toggleReview">
          {{ order.needsReview ? 'برداشتن علامت بررسی' : 'علامت «نیازمند بررسی»' }}
        </UiButton>
      </AdminHeader>

      <UiAlert v-if="order.needsReview" tone="warning" title="این سفارش نیازمند بررسی است" class="mb-6">
        پرداخت غیرعادی (کم/اضافه‌پرداخت، پرداخت دیرهنگام) یا کمبود موجودی کد. رویدادهای داخلی پایین صفحه را ببینید.
      </UiAlert>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div class="min-w-0 space-y-6">
          <!-- Items -->
          <section class="card overflow-hidden" aria-labelledby="items-title">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3">
              <h2 id="items-title" class="font-bold">اقلام سفارش</h2>
              <UiButton v-if="order.status === 'processing' && hasPendingCodes" size="sm" variant="secondary" :loading="busy === 'fulfill'" @click="autoFulfill">
                <Zap class="size-4" aria-hidden="true" /> تحویل خودکار از انبار
              </UiButton>
            </div>
            <ul class="divide-y divide-line">
              <li v-for="item in order.items" :key="item.id" class="p-5">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="font-semibold">{{ item.productName }}</p>
                    <p class="text-sm text-muted">
                      <span class="ltr">{{ item.variantLabel }}</span> × {{ faNumber(item.quantity) }} — {{ PRODUCT_TYPE[item.type] }}
                      <UiBadge :tone="item.stockMode === 'codes' ? 'accent' : 'neutral'" class="ms-1">{{ item.stockMode === 'codes' ? 'تحویل خودکار' : 'انجام دستی' }}</UiBadge>
                    </p>
                  </div>
                  <p class="tabular text-sm font-semibold">{{ formatToman(item.lineTotalToman) }}</p>
                </div>

                <dl v-if="Object.keys(item.fields).length" class="mt-3 grid gap-2 rounded-[var(--radius-control)] bg-canvas p-3 text-sm sm:grid-cols-2">
                  <div v-for="(value, key) in item.fields" :key="key" class="min-w-0">
                    <dt class="text-xs text-muted">{{ item.fieldLabels[key] ?? key }}</dt>
                    <dd class="flex items-center gap-1">
                      <span class="ltr min-w-0 truncate font-mono">{{ value }}</span>
                      <UiCopyButton :value="value" :label="`کپی ${item.fieldLabels[key] ?? key}`" compact />
                    </dd>
                  </div>
                </dl>

                <div class="mt-3">
                  <p class="text-xs font-semibold text-muted">
                    تحویل‌ها ({{ faNumber(item.deliveries.length) }}{{ item.type === 'gift_card' ? ` از ${faNumber(item.quantity)}` : '' }})
                  </p>
                  <ul v-if="item.deliveries.length" class="mt-1.5 space-y-1">
                    <li v-for="(d, i) in item.deliveries" :key="i" class="flex items-center gap-2 text-sm">
                      <PackageCheck class="size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                      <span :class="d.kind === 'code' ? 'ltr font-mono' : ''" class="min-w-0 break-all">{{ d.value }}</span>
                      <span class="ms-auto shrink-0 text-xs text-muted">{{ formatDateTime(d.deliveredAt) }}</span>
                    </li>
                  </ul>
                </div>

                <form v-if="canDeliver" class="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start" @submit.prevent="deliver(item.id, item.type === 'gift_card' ? 'code' : 'service_note')">
                  <textarea
                    v-model="deliveryDraft[item.id]"
                    rows="2"
                    :dir="item.type === 'gift_card' ? 'ltr' : undefined"
                    :placeholder="item.type === 'gift_card' ? 'کد(ها) — هر کد در یک خط' : 'یادداشت انجام برای مشتری، مثلاً: اشتراک Plus روی حساب شما فعال شد.'"
                    :aria-label="`تحویل دستی ${item.productName}`"
                    class="min-w-0 flex-1 rounded-[var(--radius-control)] border border-line bg-white px-3 py-2 text-sm focus:border-accent-500 focus:outline-none"
                  />
                  <UiButton type="submit" size="sm" variant="accent" :loading="busy === `deliver:${item.id}`" :disabled="!deliveryDraft[item.id]?.trim()">
                    ثبت تحویل
                  </UiButton>
                </form>
              </li>
            </ul>
            <div class="space-y-1 border-t border-line bg-canvas/60 px-5 py-3 text-sm">
              <div class="flex justify-between"><span class="text-muted">جمع اقلام</span><span class="tabular">{{ formatToman(order.subtotalToman) }}</span></div>
              <div class="flex justify-between"><span class="text-muted">کارمزد خدمات</span><span class="tabular">{{ formatToman(order.serviceFeeToman) }}</span></div>
              <div class="flex justify-between font-bold"><span>مبلغ کل</span><span class="tabular">{{ formatToman(order.totalToman) }}</span></div>
            </div>
          </section>

          <!-- Invoices -->
          <section class="card overflow-hidden" aria-labelledby="inv-title">
            <h2 id="inv-title" class="border-b border-line px-5 py-3 font-bold">فاکتورهای پرداخت</h2>
            <p v-if="!order.invoices.length" class="px-5 py-4 text-sm text-muted">فاکتوری صادر نشده است.</p>
            <ul v-else class="divide-y divide-line">
              <li v-for="inv in order.invoices" :key="inv.id" class="space-y-1.5 px-5 py-4 text-sm">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="ltr font-mono font-semibold">{{ inv.amountCrypto }} {{ inv.currency }}</span>
                  <span class="text-muted">({{ inv.network }})</span>
                  <OrderStatusBadge kind="payment" :status="inv.status" />
                  <UiBadge v-if="inv.id === order.invoice?.id" tone="accent">فعلی</UiBadge>
                  <UiBadge v-if="inv.sandbox" tone="danger">آزمایشی</UiBadge>
                </div>
                <p class="text-xs text-muted">
                  دریافتی: <span class="ltr">{{ inv.amountReceived ?? '—' }}</span> — تأیید: {{ faNumber(inv.confirmations) }}/{{ faNumber(inv.confirmationsRequired) }} — نرخ: {{ formatToman(inv.rateToman) }} — انقضا: {{ formatDateTime(inv.expiresAt) }}
                </p>
                <p class="ltr text-xs break-all text-muted">{{ inv.address }}<template v-if="inv.providerRef"> · {{ inv.provider }}:{{ inv.providerRef }}</template></p>
                <p v-if="inv.txHash || inv.explorerUrl" class="flex items-center gap-2 text-xs">
                  <span v-if="inv.txHash" class="ltr font-mono break-all">{{ inv.txHash }}</span>
                  <a v-if="inv.explorerUrl" :href="inv.explorerUrl" target="_blank" rel="noopener noreferrer" class="inline-flex shrink-0 items-center gap-1 text-accent-700 hover:underline">
                    مشاهده تراکنش <ExternalLink class="size-3" aria-hidden="true" />
                  </a>
                </p>
              </li>
            </ul>
          </section>

          <!-- Timeline -->
          <section class="card overflow-hidden" aria-labelledby="tl-title">
            <h2 id="tl-title" class="border-b border-line px-5 py-3 font-bold">تاریخچه</h2>
            <ol class="divide-y divide-line">
              <li v-for="(e, i) in [...order.allEvents].reverse()" :key="i" class="flex gap-3 px-5 py-3 text-sm" :class="e.internal ? 'bg-amber-50/40' : ''">
                <Lock v-if="e.internal" class="mt-1 size-3.5 shrink-0 text-amber-600" aria-label="داخلی" />
                <div class="min-w-0 flex-1">
                  <p>{{ e.message }}</p>
                  <p class="text-xs text-muted">
                    {{ formatDateTime(e.at) }}<template v-if="e.actor"> — {{ e.actor }}</template>
                    <template v-if="e.internal"> — فقط برای مدیران</template>
                  </p>
                </div>
              </li>
            </ol>
          </section>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <section class="card p-5" aria-labelledby="cust-title">
            <h2 id="cust-title" class="mb-2 font-bold">مشتری</h2>
            <NuxtLink :to="`/admin/users/${order.user.id}`" class="font-semibold hover:underline">{{ order.user.fullName }}</NuxtLink>
            <p class="ltr text-sm text-muted">{{ order.user.email }}</p>
            <p v-if="order.user.phone" class="ltr text-sm text-muted">{{ order.user.phone }}</p>
            <div v-if="order.tickets.length" class="mt-3 border-t border-line pt-3">
              <p class="mb-1 text-xs font-semibold text-muted">تیکت‌های مرتبط</p>
              <NuxtLink v-for="t in order.tickets" :key="t.id" :to="`/admin/tickets/${t.id}`" class="me-2 inline-flex items-center gap-1 text-sm text-accent-700 hover:underline">
                {{ t.number }} <UiBadge :tone="TICKET_STATUS[t.status].tone">{{ TICKET_STATUS[t.status].label }}</UiBadge>
              </NuxtLink>
            </div>
          </section>

          <section class="card p-5" aria-labelledby="st-title">
            <h2 id="st-title" class="mb-3 font-bold">تغییر وضعیت</h2>
            <p v-if="!transitionOptions.length" class="text-sm text-muted">این سفارش در وضعیت نهایی است.</p>
            <form v-else class="space-y-3" @submit.prevent="changeStatus">
              <UiSelect v-model="nextStatus" label="وضعیت جدید" placeholder="انتخاب کنید" :options="transitionOptions" :error="errors.status" />
              <UiTextarea v-model="statusMessage" label="پیام برای مشتری (اختیاری)" :rows="3" hint="خالی بماند، متن پیش‌فرض نمایش داده می‌شود." />
              <UiCheckbox v-model="notify">ارسال ایمیل به مشتری</UiCheckbox>
              <UiAlert v-if="needsPaymentConfirm" tone="warning">
                پرداخت این سفارش توسط درگاه تأیید نشده است.
                <UiCheckbox v-model="confirmPayment" class="mt-2">پرداخت را دستی بررسی کرده‌ام و تأیید می‌کنم</UiCheckbox>
              </UiAlert>
              <UiButton type="submit" block :loading="busy === 'status'" :disabled="!nextStatus || (needsPaymentConfirm && !confirmPayment)">اعمال وضعیت</UiButton>
            </form>
          </section>

          <section class="card p-5" aria-labelledby="note-title">
            <h2 id="note-title" class="mb-3 font-bold">یادداشت در تاریخچه</h2>
            <form class="space-y-3" @submit.prevent="addNote">
              <UiTextarea v-model="note" label="متن یادداشت" :rows="3" :error="errors.message" placeholder="مثلاً: با مشتری تماس گرفته شد…" />
              <UiCheckbox v-model="notePublic">نمایش به مشتری (و ارسال ایمیل)</UiCheckbox>
              <UiButton type="submit" variant="secondary" block :loading="busy === 'note'" :disabled="!note.trim()">
                <Send class="size-4" aria-hidden="true" /> ثبت یادداشت
              </UiButton>
            </form>
          </section>

          <section class="card p-5" aria-labelledby="an-title">
            <h2 id="an-title" class="mb-3 font-bold">یادداشت داخلی سفارش</h2>
            <UiTextarea v-model="adminNote" label="فقط مدیران می‌بینند" :rows="4" />
            <UiButton class="mt-2" variant="secondary" size="sm" :loading="busy === 'adminNote'" @click="saveAdminNote">ذخیره</UiButton>
          </section>
        </div>
      </div>
    </template>
  </div>
</template>
