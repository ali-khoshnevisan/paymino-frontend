<script setup lang="ts">
import { Pencil, Plus, Trash2 } from 'lucide-vue-next'
import type { AdminCurrency, AdminNetwork, AdminSettings } from '#shared/types/admin'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'تنظیمات — مدیریت', robots: 'noindex, nofollow' })

const api = useApi()
const { busy, errors, run } = useAdminAction()
const { data: settings } = await useAsyncData('admin:settings', () => api<AdminSettings>('/admin/settings'))
const { data: currencies, refresh } = await useAsyncData('admin:currencies', () => api<{ results: AdminCurrency[] }>('/admin/currencies'))

/* store settings (fee shown as percent) */
const sf = reactive({ feePercent: '', invoiceTtlMinutes: '', lowStockThreshold: '', supportEmail: '', ordersEnabled: true })
watch(
    settings,
    (s) =>
        s && Object.assign(sf, { feePercent: String(+(s.serviceFeeRate * 100).toFixed(2)), invoiceTtlMinutes: String(s.invoiceTtlMinutes), lowStockThreshold: String(s.lowStockThreshold), supportEmail: s.supportEmail, ordersEnabled: s.ordersEnabled }),
    { immediate: true },
)
async function saveSettings() {
  const body = {
    serviceFeeRate: Number(toAsciiDigits(sf.feePercent)) / 100,
    invoiceTtlMinutes: toAsciiDigits(sf.invoiceTtlMinutes),
    lowStockThreshold: toAsciiDigits(sf.lowStockThreshold),
    supportEmail: sf.supportEmail,
    ordersEnabled: sf.ordersEnabled,
  }
  const res = await run('settings', () => api<AdminSettings>('/admin/settings', { method: 'PATCH', body }), 'تنظیمات ذخیره شد.')
  if (res) settings.value = res
}

/* rates: inline quick edit */
const rateDraft = reactive<Record<number, string>>({})
watch(currencies, (c) => c?.results.forEach((x) => (rateDraft[x.id] = String(x.rateToman))), { immediate: true })
async function saveRate(c: AdminCurrency) {
  const res = await run(`rate:${c.id}`, () => api<{ results: AdminCurrency[] }>(`/admin/currencies/${c.id}`, { method: 'PATCH', body: { rateToman: toAsciiDigits(rateDraft[c.id] ?? '').replace(/[,٬\s]/g, '') } }), `نرخ ${c.code} به‌روز شد.`)
  if (res) currencies.value = res
}

/* currency modal */
const curOpen = ref(false)
const editingCur = ref<AdminCurrency | null>(null)
const cf = reactive({ code: '', name: '', decimals: '2', rateToman: '', isActive: true, sortOrder: '0' })
function openCur(c: AdminCurrency | null) {
  editingCur.value = c
  Object.assign(cf, { code: c?.code ?? '', name: c?.name ?? '', decimals: String(c?.decimals ?? 2), rateToman: c ? String(c.rateToman) : '', isActive: c?.isActive ?? true, sortOrder: String(c?.sortOrder ?? 0) })
  errors.value = {}
  curOpen.value = true
}
async function saveCur() {
  const body = { ...cf, decimals: toAsciiDigits(cf.decimals), rateToman: toAsciiDigits(cf.rateToman), sortOrder: toAsciiDigits(cf.sortOrder) }
  const res = editingCur.value
      ? await run('cur', () => api<{ results: AdminCurrency[] }>(`/admin/currencies/${editingCur.value!.id}`, { method: 'PATCH', body }), 'ارز ذخیره شد.')
      : await run('cur', () => api<{ results: AdminCurrency[] }>('/admin/currencies', { method: 'POST', body }), 'ارز اضافه شد.')
  if (res) {
    currencies.value = res
    curOpen.value = false
  }
}
async function deleteCur(c: AdminCurrency) {
  if (!confirm(`ارز ${c.code} و همه شبکه‌هایش حذف شود؟ (برای توقف موقت، غیرفعالش کنید.)`)) return
  const res = await run(`cd:${c.id}`, () => api<{ results: AdminCurrency[] }>(`/admin/currencies/${c.id}`, { method: 'DELETE' }), 'حذف شد.')
  if (res) currencies.value = res
}

/* network modal */
const netOpen = ref(false)
const netCurrency = ref<AdminCurrency | null>(null)
const editingNet = ref<AdminNetwork | null>(null)
const nf = reactive({ code: '', name: '', minAmount: '1', confirmationsRequired: '1', networkFeeNote: '', gatewayCode: '', explorerTxUrl: '', isActive: true })
function openNet(c: AdminCurrency, n: AdminNetwork | null) {
  netCurrency.value = c
  editingNet.value = n
  Object.assign(nf, {
    code: n?.code ?? '', name: n?.name ?? '', minAmount: n?.minAmount ?? '1', confirmationsRequired: String(n?.confirmationsRequired ?? 1),
    networkFeeNote: n?.networkFeeNote ?? '', gatewayCode: n?.gatewayCode ?? '', explorerTxUrl: n?.explorerTxUrl ?? '', isActive: n?.isActive ?? true,
  })
  errors.value = {}
  netOpen.value = true
}
async function saveNet() {
  const body = { ...nf, minAmount: toAsciiDigits(nf.minAmount), confirmationsRequired: toAsciiDigits(nf.confirmationsRequired) }
  const res = editingNet.value
      ? await run('net', () => api<{ results: AdminCurrency[] }>(`/admin/networks/${editingNet.value!.id}`, { method: 'PATCH', body }), 'شبکه ذخیره شد.')
      : await run('net', () => api<{ results: AdminCurrency[] }>(`/admin/currencies/${netCurrency.value!.id}/networks`, { method: 'POST', body }), 'شبکه اضافه شد.')
  if (res) {
    currencies.value = res
    netOpen.value = false
  }
}
async function deleteNet(n: AdminNetwork) {
  if (!confirm(`شبکه ${n.code} حذف شود؟`)) return
  const res = await run(`nd:${n.id}`, () => api<{ results: AdminCurrency[] }>(`/admin/networks/${n.id}`, { method: 'DELETE' }), 'حذف شد.')
  if (res) currencies.value = res
}
</script>

<template>
  <div>
    <AdminHeader title="تنظیمات و نرخ‌ها" subtitle="کارمزد، مهلت پرداخت و نرخ ارزهای دیجیتال" />

    <div class="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <form v-if="settings" class="card h-fit space-y-4 p-5" @submit.prevent="saveSettings">
        <h2 class="font-bold">تنظیمات فروشگاه</h2>
        <UiAlert v-if="settings.paymentProvider === 'sandbox'" tone="warning" title="درگاه آزمایشی فعال است">پرداخت واقعی انجام نمی‌شود. در سرور، <code class="ltr font-mono">PAYMENT_PROVIDER=plisio</code> را تنظیم کنید.</UiAlert>
        <UiAlert v-else tone="success">درگاه پرداخت: Plisio</UiAlert>
        <UiCheckbox v-model="sf.ordersEnabled">ثبت سفارش فعال است</UiCheckbox>
        <UiInput v-model="sf.feePercent" label="کارمزد خدمات (درصد)" ltr inputmode="decimal" :error="errors.serviceFeeRate" hint="روی جمع سبد خرید اعمال و به هزار تومان گرد می‌شود." />
        <UiInput v-model="sf.invoiceTtlMinutes" label="مهلت پرداخت فاکتور (دقیقه)" ltr inputmode="numeric" :error="errors.invoiceTtlMinutes" />
        <UiInput v-model="sf.lowStockThreshold" label="هشدار کمبود موجودی کد (تعداد)" ltr inputmode="numeric" :error="errors.lowStockThreshold" />
        <UiInput v-model="sf.supportEmail" label="ایمیل اعلان تیکت جدید" ltr type="email" :error="errors.supportEmail" />
        <UiButton type="submit" block :loading="busy === 'settings'">ذخیره</UiButton>
      </form>

      <section class="card min-w-0 overflow-hidden">
        <div class="flex items-center justify-between border-b border-line px-5 py-3">
          <div>
            <h2 class="font-bold">ارزهای پرداخت</h2>
            <p class="text-xs text-muted">نرخ = تومان برای هر واحد ارز. مبلغ فاکتور با نرخ لحظه صدور محاسبه و قفل می‌شود.</p>
          </div>
          <UiButton size="sm" variant="accent" @click="openCur(null)"><Plus class="size-4" aria-hidden="true" /> ارز</UiButton>
        </div>
        <ul class="divide-y divide-line">
          <li v-for="c in currencies?.results" :key="c.id" class="p-5" :class="c.isActive ? '' : 'opacity-60'">
            <div class="flex flex-wrap items-end gap-3">
              <div class="min-w-32">
                <p class="ltr font-bold">{{ c.code }} <span class="font-normal text-muted">{{ c.name }}</span></p>
                <p class="text-xs text-muted">به‌روزرسانی نرخ: {{ formatDateTime(c.rateUpdatedAt) }}</p>
              </div>
              <form class="flex flex-1 items-end gap-2" @submit.prevent="saveRate(c)">
                <UiInput v-model="rateDraft[c.id]" :label="`نرخ ${c.code} (تومان)`" ltr inputmode="numeric" class="max-w-56 flex-1" />
                <UiButton type="submit" size="sm" variant="secondary" class="!h-11" :loading="busy === `rate:${c.id}`" :disabled="rateDraft[c.id] === String(c.rateToman)">ثبت نرخ</UiButton>
              </form>
              <div class="flex gap-1">
                <UiButton size="sm" variant="ghost" :aria-label="`ویرایش ${c.code}`" @click="openCur(c)"><Pencil class="size-4" aria-hidden="true" /></UiButton>
                <UiButton size="sm" variant="ghost" class="text-red-600" :aria-label="`حذف ${c.code}`" @click="deleteCur(c)"><Trash2 class="size-4" aria-hidden="true" /></UiButton>
              </div>
            </div>
            <ul class="mt-3 space-y-1.5">
              <li v-for="n in c.networks" :key="n.id" class="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[var(--radius-control)] bg-canvas px-3 py-2 text-sm" :class="n.isActive ? '' : 'opacity-60'">
                <span class="ltr font-semibold">{{ n.code }}</span>
                <span class="text-muted">{{ n.name }}</span>
                <span class="text-xs text-muted">حداقل <span class="ltr">{{ n.minAmount }}</span> — {{ faNumber(n.confirmationsRequired) }} تأیید</span>
                <UiBadge v-if="n.gatewayCode" tone="neutral"><span class="ltr">{{ n.gatewayCode }}</span></UiBadge>
                <UiBadge v-else tone="danger">شناسه درگاه ندارد</UiBadge>
                <span class="ms-auto flex gap-1">
                  <UiButton size="sm" variant="ghost" :aria-label="`ویرایش شبکه ${n.code}`" @click="openNet(c, n)"><Pencil class="size-4" aria-hidden="true" /></UiButton>
                  <UiButton size="sm" variant="ghost" class="text-red-600" :aria-label="`حذف شبکه ${n.code}`" @click="deleteNet(n)"><Trash2 class="size-4" aria-hidden="true" /></UiButton>
                </span>
              </li>
            </ul>
            <UiButton size="sm" variant="link" class="mt-2" @click="openNet(c, null)">+ افزودن شبکه</UiButton>
          </li>
        </ul>
      </section>
    </div>

    <AdminModal v-model="curOpen" :title="editingCur ? `ویرایش ${editingCur.code}` : 'ارز جدید'">
      <form class="space-y-4" @submit.prevent="saveCur">
        <div class="grid grid-cols-2 gap-4">
          <UiInput v-model="cf.code" label="کد" ltr placeholder="USDT" :error="errors.code" />
          <UiInput v-model="cf.name" label="نام" ltr placeholder="Tether" :error="errors.name" />
          <UiInput v-model="cf.rateToman" label="نرخ (تومان)" ltr inputmode="numeric" :error="errors.rateToman" />
          <UiInput v-model="cf.decimals" label="تعداد اعشار مبلغ" ltr inputmode="numeric" :error="errors.decimals" />
          <UiInput v-model="cf.sortOrder" label="ترتیب" ltr inputmode="numeric" :error="errors.sortOrder" />
        </div>
        <UiCheckbox v-model="cf.isActive">فعال</UiCheckbox>
        <div class="flex justify-end gap-2">
          <UiButton variant="secondary" @click="curOpen = false">انصراف</UiButton>
          <UiButton type="submit" variant="accent" :loading="busy === 'cur'">ذخیره</UiButton>
        </div>
      </form>
    </AdminModal>

    <AdminModal v-model="netOpen" :title="editingNet ? `ویرایش شبکه ${editingNet.code}` : `شبکه جدید برای ${netCurrency?.code ?? ''}`">
      <form class="space-y-4" @submit.prevent="saveNet">
        <div class="grid grid-cols-2 gap-4">
          <UiInput v-model="nf.code" label="کد شبکه" ltr placeholder="TRC20" :error="errors.code" />
          <UiInput v-model="nf.name" label="نام نمایشی" ltr placeholder="Tron (TRC20)" :error="errors.name" />
          <UiInput v-model="nf.minAmount" label="حداقل مبلغ" ltr inputmode="decimal" :error="errors.minAmount" />
          <UiInput v-model="nf.confirmationsRequired" label="تأییدهای لازم" ltr inputmode="numeric" :error="errors.confirmationsRequired" />
          <UiInput v-model="nf.gatewayCode" label="شناسه در Plisio" ltr placeholder="USDT_TRX" :error="errors.gatewayCode" class="col-span-2" hint="مثلاً USDT_TRX، USDT_BSC، TRX، BTC، TON — بدون آن پرداخت با Plisio ممکن نیست." />
          <UiInput v-model="nf.explorerTxUrl" label="الگوی لینک تراکنش" ltr placeholder="https://tronscan.org/#/transaction/{tx}" :error="errors.explorerTxUrl" class="col-span-2" />
        </div>
        <UiInput v-model="nf.networkFeeNote" label="توضیح کارمزد شبکه (برای مشتری)" :error="errors.networkFeeNote" />
        <UiCheckbox v-model="nf.isActive">فعال</UiCheckbox>
        <div class="flex justify-end gap-2">
          <UiButton variant="secondary" @click="netOpen = false">انصراف</UiButton>
          <UiButton type="submit" variant="accent" :loading="busy === 'net'">ذخیره</UiButton>
        </div>
      </form>
    </AdminModal>
  </div>
</template>