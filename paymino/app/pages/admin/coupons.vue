<script setup lang="ts">
import { Pencil, Plus, Trash2 } from 'lucide-vue-next'
import type { AdminCoupon, AdminList, CouponKind } from '#shared/types/admin'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'کدهای تخفیف — مدیریت', robots: 'noindex, nofollow' })

const api = useApi()
const { busy, errors, run } = useAdminAction()
const { data, refresh } = await useAsyncData('admin:coupons', () => api<AdminList<AdminCoupon>>('/admin/coupons'))

const kinds: Array<{ value: CouponKind; label: string }> = [
  { value: 'percent', label: 'درصدی' },
  { value: 'fixed', label: 'مبلغ ثابت (تومان)' },
]

// ISO (UTC) ⇄ datetime-local input value (local time, minute precision)
function toLocalInput(iso: string | null | undefined) {
  if (!iso) return ''
  const d = new Date(iso)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}
const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : null)
const num = (v: string) => toAsciiDigits(v).replace(/[,٬\s]/g, '')

function status(c: AdminCoupon): { tone: 'success' | 'warning' | 'neutral' | 'danger'; text: string } {
  const now = new Date()
  if (!c.isActive) return { tone: 'neutral', text: 'غیرفعال' }
  if (c.endsAt && new Date(c.endsAt) <= now) return { tone: 'neutral', text: 'منقضی' }
  if (c.startsAt && new Date(c.startsAt) > now) return { tone: 'warning', text: 'زمان‌بندی‌شده' }
  if (c.usageLimit !== null && c.usedCount >= c.usageLimit) return { tone: 'danger', text: 'تمام‌شده' }
  return { tone: 'success', text: 'فعال' }
}
function valueText(c: AdminCoupon) {
  if (c.kind === 'fixed') return formatToman(c.value)
  return `${faNumber(c.value)}٪${c.maxDiscountToman ? ` تا سقف ${formatToman(c.maxDiscountToman)}` : ''}`
}

/* form */
const open = ref(false)
const editing = ref<AdminCoupon | null>(null)
const f = reactive({
  code: '', kind: 'percent' as CouponKind, value: '', maxDiscountToman: '', minOrderToman: '',
  startsAt: '', endsAt: '', usageLimit: '', perUserLimit: '1', isActive: true, note: '',
})
function openForm(c: AdminCoupon | null) {
  editing.value = c
  Object.assign(f, {
    code: c?.code ?? '',
    kind: c?.kind ?? 'percent',
    value: c ? String(c.value) : '',
    maxDiscountToman: c?.maxDiscountToman != null ? String(c.maxDiscountToman) : '',
    minOrderToman: c?.minOrderToman ? String(c.minOrderToman) : '',
    startsAt: toLocalInput(c?.startsAt),
    endsAt: toLocalInput(c?.endsAt),
    usageLimit: c?.usageLimit != null ? String(c.usageLimit) : '',
    perUserLimit: c ? (c.perUserLimit != null ? String(c.perUserLimit) : '') : '1',
    isActive: c?.isActive ?? true,
    note: c?.note ?? '',
  })
  errors.value = {}
  open.value = true
}
async function save() {
  const body = {
    code: f.code,
    kind: f.kind,
    value: num(f.value),
    maxDiscountToman: f.kind === 'percent' ? num(f.maxDiscountToman) || null : null,
    minOrderToman: num(f.minOrderToman) || '0',
    startsAt: fromLocalInput(f.startsAt),
    endsAt: fromLocalInput(f.endsAt),
    usageLimit: num(f.usageLimit) || null,
    perUserLimit: num(f.perUserLimit) || null,
    isActive: f.isActive,
    note: f.note,
  }
  const ok = editing.value
    ? await run('save', () => api<unknown>(`/admin/coupons/${editing.value!.id}`, { method: 'PATCH', body }), 'کد تخفیف ذخیره شد.')
    : await run('save', () => api<unknown>('/admin/coupons', { method: 'POST', body }), 'کد تخفیف ساخته شد.')
  if (ok) {
    open.value = false
    await refresh()
  }
}
async function remove(c: AdminCoupon) {
  if (!confirm(`کد «${c.code}» حذف شود؟`)) return
  if ((await run(`d:${c.id}`, () => api<unknown>(`/admin/coupons/${c.id}`, { method: 'DELETE' }), 'حذف شد.')) !== null) await refresh()
}
async function toggle(c: AdminCoupon) {
  if (await run(`t:${c.id}`, () => api<unknown>(`/admin/coupons/${c.id}`, { method: 'PATCH', body: { isActive: !c.isActive } }))) await refresh()
}

const valueHint = computed(() => {
  const n = Number(num(f.value))
  if (!Number.isFinite(n) || n <= 0) return f.kind === 'percent' ? 'از ۱ تا ۱۰۰' : 'مبلغ به تومان'
  return f.kind === 'percent' ? `${faNumber(n)}٪ از مبلغ اقلام` : formatToman(n)
})
</script>

<template>
  <div>
    <AdminHeader title="کدهای تخفیف" subtitle="کدی که مشتری در مرحله پرداخت وارد می‌کند. تخفیف پس از تخفیف محصولات و پیش از کارمزد خدمات اعمال می‌شود.">
      <UiButton variant="accent" size="sm" @click="openForm(null)"><Plus class="size-4" aria-hidden="true" /> کد جدید</UiButton>
    </AdminHeader>

    <section class="card overflow-hidden">
      <UiEmptyState v-if="!data?.results.length" title="هنوز کد تخفیفی ساخته نشده" description="با «کد جدید» اولین کد را بسازید." />
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[760px] text-sm">
          <thead class="bg-navy-50/60 text-xs text-muted">
            <tr>
              <th class="px-4 py-2 text-start font-semibold">کد</th>
              <th class="px-4 py-2 text-start font-semibold">تخفیف</th>
              <th class="px-4 py-2 text-start font-semibold">استفاده</th>
              <th class="px-4 py-2 text-start font-semibold">مهلت</th>
              <th class="px-4 py-2 text-start font-semibold">وضعیت</th>
              <th class="px-4 py-2"><span class="sr-only">عملیات</span></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr v-for="c in data.results" :key="c.id" :class="c.isActive ? '' : 'opacity-60'">
              <td class="px-4 py-2.5">
                <p class="ltr text-start font-bold">{{ c.code }}</p>
                <p v-if="c.note" class="max-w-56 truncate text-xs text-muted">{{ c.note }}</p>
              </td>
              <td class="px-4 py-2.5">
                <p class="tabular font-semibold">{{ valueText(c) }}</p>
                <p v-if="c.minOrderToman" class="text-xs text-muted">حداقل سفارش {{ formatToman(c.minOrderToman) }}</p>
              </td>
              <td class="tabular px-4 py-2.5 whitespace-nowrap">
                {{ faNumber(c.usedCount) }}<template v-if="c.usageLimit !== null"> از {{ faNumber(c.usageLimit) }}</template>
                <p class="text-xs text-muted">{{ c.perUserLimit !== null ? `هر کاربر ${faNumber(c.perUserLimit)} بار` : 'بدون محدودیت کاربر' }}</p>
              </td>
              <td class="px-4 py-2.5 text-xs whitespace-nowrap text-muted">
                <p v-if="c.startsAt">از {{ formatDateTime(c.startsAt) }}</p>
                <p>{{ c.endsAt ? `تا ${formatDateTime(c.endsAt)}` : 'بدون پایان' }}</p>
              </td>
              <td class="px-4 py-2.5 whitespace-nowrap">
                <button type="button" class="rounded-full" :aria-label="c.isActive ? 'غیرفعال کردن' : 'فعال کردن'" @click="toggle(c)">
                  <UiBadge :tone="status(c).tone" dot>{{ status(c).text }}</UiBadge>
                </button>
              </td>
              <td class="px-4 py-2.5">
                <div class="flex justify-end gap-1">
                  <UiButton size="sm" variant="ghost" :aria-label="`ویرایش ${c.code}`" @click="openForm(c)"><Pencil class="size-4" aria-hidden="true" /></UiButton>
                  <UiButton v-if="!c.usedCount" size="sm" variant="ghost" class="text-red-600" :aria-label="`حذف ${c.code}`" :loading="busy === `d:${c.id}`" @click="remove(c)">
                    <Trash2 class="size-4" aria-hidden="true" />
                  </UiButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <AdminModal v-model="open" :title="editing ? 'ویرایش کد تخفیف' : 'کد تخفیف جدید'" wide>
      <form class="space-y-4" novalidate @submit.prevent="save">
        <div class="grid gap-4 sm:grid-cols-2">
          <UiInput v-model="f.code" label="کد" required ltr placeholder="WELCOME10" :maxlength="40" :error="errors.code" hint="حروف انگلیسی، عدد، - و _ ؛ بزرگ و کوچک یکی است." />
          <UiSelect v-model="f.kind" label="نوع تخفیف" :options="kinds" :error="errors.kind" />
          <UiInput v-model="f.value" :label="f.kind === 'percent' ? 'درصد' : 'مبلغ (تومان)'" required ltr inputmode="numeric" :error="errors.value" :hint="valueHint" />
          <UiInput v-if="f.kind === 'percent'" v-model="f.maxDiscountToman" label="سقف تخفیف (تومان، اختیاری)" ltr inputmode="numeric" :error="errors.maxDiscountToman" />
          <UiInput v-model="f.minOrderToman" label="حداقل مبلغ سفارش (تومان، اختیاری)" ltr inputmode="numeric" :error="errors.minOrderToman" />
          <UiInput v-model="f.usageLimit" label="سقف کل استفاده (اختیاری)" ltr inputmode="numeric" :error="errors.usageLimit" hint="خالی = نامحدود" />
          <UiInput v-model="f.perUserLimit" label="سقف استفاده هر کاربر" ltr inputmode="numeric" :error="errors.perUserLimit" hint="خالی = نامحدود" />
          <UiInput v-model="f.startsAt" type="datetime-local" label="شروع (اختیاری)" ltr :error="errors.startsAt" />
          <UiInput v-model="f.endsAt" type="datetime-local" label="پایان (اختیاری)" ltr :error="errors.endsAt" />
        </div>
        <UiInput v-model="f.note" label="یادداشت داخلی (اختیاری)" :maxlength="255" :error="errors.note" hint="فقط برای مدیران؛ مثلاً «کمپین نوروز»" />
        <UiCheckbox v-model="f.isActive">فعال</UiCheckbox>
        <p class="text-xs leading-6 text-muted">سفارش‌های لغوشده جزو استفاده‌ها حساب نمی‌شوند. مبلغ نهایی سفارش با این کد هیچ‌وقت صفر نمی‌شود.</p>
        <div class="flex justify-end gap-2">
          <UiButton variant="secondary" @click="open = false">انصراف</UiButton>
          <UiButton type="submit" variant="accent" :loading="busy === 'save'">ذخیره</UiButton>
        </div>
      </form>
    </AdminModal>
  </div>
</template>
