<script setup lang="ts">
import { Eye, ImagePlus, KeyRound, Pencil, Plus, Trash2 } from 'lucide-vue-next'
import type { AdminCategory, AdminList, AdminProduct, AdminProvider, AdminVariant } from '#shared/types/admin'
import type { ProductType, RequiredField } from '#shared/types'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const api = useApi()
const toast = useToast()
const isNew = computed(() => route.params.id === 'new')
const { busy, errors, run } = useAdminAction()

const [{ data: cats }, { data: provs }] = await Promise.all([
  useAsyncData('admin:categories', () => api<AdminList<AdminCategory>>('/admin/categories')),
  useAsyncData('admin:providers', () => api<AdminList<AdminProvider>>('/admin/providers')),
])
const { data: product, error, refresh } = await useAsyncData(
  `admin:product:${route.params.id}`,
  () => (isNew.value ? Promise.resolve(null) : api<AdminProduct>(`/admin/products/${route.params.id}`)),
)
useSeoMeta({ title: () => (isNew.value ? 'محصول جدید' : `${product.value?.name ?? 'محصول'} — مدیریت`), robots: 'noindex, nofollow' })

/* --------------------------------- form --------------------------------- */
type FormState = Omit<
  AdminProduct,
  | 'id' | 'categoryName' | 'providerName' | 'imageUrl' | 'createdAt' | 'updatedAt' | 'variants' | 'categoryId' | 'providerId'
  | 'maxQuantityPerItem' | 'popularity' | 'discountPercent' | 'discountStartsAt' | 'discountEndsAt' | 'discountActive'
> & {
  categoryId: string
  providerId: string
  maxQuantityPerItem: string
  popularity: string
  discountPercent: string
  discountStartsAt: string // <input type="datetime-local"> value, in the admin's local time
  discountEndsAt: string
}

// ISO (UTC) ⇄ datetime-local input value (local time, minute precision)
function toLocalInput(iso: string | null | undefined) {
  if (!iso) return ''
  const d = new Date(iso)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}
function fromLocalInput(v: string) {
  return v ? new Date(v).toISOString() : null
}
function toForm(p: AdminProduct | null | undefined): FormState {
  return {
    slug: p?.slug ?? '',
    name: p?.name ?? '',
    brandName: p?.brandName ?? '',
    categoryId: p ? String(p.categoryId) : '',
    providerId: p ? String(p.providerId) : '',
    type: p?.type ?? 'gift_card',
    shortDescription: p?.shortDescription ?? '',
    description: p?.description ?? '',
    regions: [...(p?.regions ?? [])],
    restrictions: [...(p?.restrictions ?? [])],
    redemptionNotes: [...(p?.redemptionNotes ?? [])],
    deliveryMethod: p?.deliveryMethod ?? 'ارسال کد دیجیتال در پنل کاربری',
    fulfillmentEstimate: p?.fulfillmentEstimate ?? '',
    refundPolicy: p?.refundPolicy ?? '',
    requiredFields: (p?.requiredFields ?? []).map((f) => ({ ...f })),
    maxQuantityPerItem: String(p?.maxQuantityPerItem ?? 5),
    popularity: String(p?.popularity ?? 0),
    discountPercent: String(p?.discountPercent ?? 0),
    discountStartsAt: toLocalInput(p?.discountStartsAt),
    discountEndsAt: toLocalInput(p?.discountEndsAt),
    article: p?.article ?? '',
    faqs: (p?.faqs ?? []).map((f) => ({ ...f })),
    seoTitle: p?.seoTitle ?? '',
    seoDescription: p?.seoDescription ?? '',
    isActive: p?.isActive ?? false,
  }
}
const form = reactive<FormState>(toForm(product.value))
watch(product, (p) => Object.assign(form, toForm(p)))

const typeOptions = (Object.keys(PRODUCT_TYPE) as ProductType[]).map((t) => ({ value: t, label: PRODUCT_TYPE[t] }))
const categoryOptions = computed(() => (cats.value?.results ?? []).map((c) => ({ value: String(c.id), label: c.name })))
const providerOptions = computed(() =>
  (provs.value?.results ?? []).filter((p) => !form.categoryId || String(p.categoryId) === form.categoryId).map((p) => ({ value: String(p.id), label: p.name })),
)
watch(
  () => form.type,
  (t) => {
    if (!isNew.value) return
    form.maxQuantityPerItem = t === 'gift_card' ? '5' : '1'
    form.deliveryMethod = t === 'gift_card' ? 'ارسال کد دیجیتال در پنل کاربری' : 'فعال‌سازی روی حساب شما'
  },
)
const slugTouched = ref(!isNew.value)
watch(
  () => form.brandName,
  (b) => {
    if (!slugTouched.value) form.slug = b.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120)
  },
)

function addField() {
  form.requiredFields.push({ key: '', label: '', type: 'text', required: true })
}
function removeField(i: number) {
  form.requiredFields.splice(i, 1)
}

function addFaq() {
  form.faqs.push({ question: '', answer: '' })
}
function removeFaq(i: number) {
  form.faqs.splice(i, 1)
}
// What a search result would show when the SEO fields are left empty
const seoTitlePreview = computed(() => form.seoTitle || form.name || 'عنوان محصول')
const seoDescriptionPreview = computed(() => form.seoDescription || form.shortDescription || 'توضیح کوتاه محصول')

async function save() {
  const body = {
    ...form,
    categoryId: Number(form.categoryId) || null,
    providerId: Number(form.providerId) || null,
    maxQuantityPerItem: toAsciiDigits(form.maxQuantityPerItem),
    popularity: toAsciiDigits(form.popularity),
    discountPercent: toAsciiDigits(form.discountPercent) || '0',
    discountStartsAt: fromLocalInput(form.discountStartsAt),
    discountEndsAt: fromLocalInput(form.discountEndsAt),
  }
  if (isNew.value) {
    const res = await run('save', () => api<AdminProduct>('/admin/products', { method: 'POST', body }), 'محصول ساخته شد. اکنون گزینه‌ها و قیمت‌ها را اضافه کنید.')
    if (res) await navigateTo(`/admin/products/${res.id}`, { replace: true })
  } else {
    const res = await run('save', () => api<AdminProduct>(`/admin/products/${product.value!.id}`, { method: 'PATCH', body }), 'تغییرات ذخیره شد.')
    if (res) product.value = res
  }
}

async function remove() {
  if (!product.value || !confirm('این محصول حذف شود؟ اگر سفارش یا کد دارد، به‌جای حذف آن را غیرفعال کنید.')) return
  const ok = await run('delete', () => api<unknown>(`/admin/products/${product.value!.id}`, { method: 'DELETE' }), 'محصول حذف شد.')
  if (ok !== null) await navigateTo('/admin/products')
}

/* --------------------------------- image --------------------------------- */
const fileInput = ref<HTMLInputElement>()
async function upload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !product.value) return
  const fd = new FormData()
  fd.append('image', file)
  const res = await run('image', () => api<AdminProduct>(`/admin/products/${product.value!.id}/image`, { method: 'POST', body: fd }), 'تصویر بارگذاری شد.')
  if (res) product.value = res
  if (fileInput.value) fileInput.value.value = ''
}
async function removeImage() {
  const res = await run('image', () => api<AdminProduct>(`/admin/products/${product.value!.id}/image`, { method: 'DELETE' }))
  if (res) product.value = res
}

/* -------------------------------- variants -------------------------------- */
const variantOpen = ref(false)
const editingVariant = ref<AdminVariant | null>(null)
const vf = reactive({ label: '', priceToman: '', faceValue: '', faceCurrency: '', region: '', durationMonths: '', stockMode: 'manual', isActive: true, sortOrder: '0' })

function openVariant(v: AdminVariant | null) {
  editingVariant.value = v
  Object.assign(vf, {
    label: v?.label ?? '',
    priceToman: v ? String(v.priceToman) : '',
    faceValue: v?.faceValue != null ? String(v.faceValue) : '',
    faceCurrency: v?.faceCurrency ?? (form.type === 'gift_card' ? 'USD' : ''),
    region: v?.region ?? form.regions[0] ?? '',
    durationMonths: v?.durationMonths != null ? String(v.durationMonths) : '',
    stockMode: v?.stockMode ?? (form.type === 'gift_card' ? 'codes' : 'manual'),
    isActive: v?.isActive ?? true,
    sortOrder: String(v?.sortOrder ?? product.value?.variants.length ?? 0),
  })
  errors.value = {}
  variantOpen.value = true
}

async function saveVariant() {
  const body = { ...vf, priceToman: toAsciiDigits(vf.priceToman).replace(/[,٬\s]/g, ''), faceValue: toAsciiDigits(vf.faceValue), durationMonths: toAsciiDigits(vf.durationMonths), sortOrder: toAsciiDigits(vf.sortOrder) }
  const ok = editingVariant.value
    ? await run('variant', () => api<unknown>(`/admin/variants/${editingVariant.value!.id}`, { method: 'PATCH', body }), 'گزینه ذخیره شد.')
    : await run('variant', () => api<unknown>(`/admin/products/${product.value!.id}/variants`, { method: 'POST', body }), 'گزینه اضافه شد.')
  if (ok) {
    variantOpen.value = false
    await refresh()
  }
}

async function toggleVariant(v: AdminVariant) {
  if (await run(`vt:${v.id}`, () => api<unknown>(`/admin/variants/${v.id}`, { method: 'PATCH', body: { isActive: !v.isActive } }))) await refresh()
}

async function deleteVariant(v: AdminVariant) {
  if (!confirm(`گزینه «${v.label}» حذف شود؟`)) return
  if ((await run(`vd:${v.id}`, () => api<unknown>(`/admin/variants/${v.id}`, { method: 'DELETE' }), 'گزینه حذف شد.')) !== null) await refresh()
}

/* ---------------------------------- codes ---------------------------------- */
const codesVariant = ref<AdminVariant | null>(null)
const codesOpen = ref(false)
function openCodes(v: AdminVariant) {
  codesVariant.value = v
  codesOpen.value = true
}
watch(codesOpen, (open) => {
  if (!open) refresh()
})
/* -------------------------------- discount -------------------------------- */
// Percent as typed (for previews); NaN-safe
const discountPreview = computed(() => {
  const n = Number(toAsciiDigits(form.discountPercent))
  return Number.isInteger(n) && n > 0 && n <= 90 ? n : 0
})
const discountStatus = computed<{ tone: 'success' | 'warning' | 'neutral'; text: string }>(() => {
  const p = product.value
  if (!p || !p.discountPercent) return { tone: 'neutral', text: 'بدون تخفیف' }
  if (p.discountActive) return { tone: 'success', text: `${faNumber(p.discountPercent)}٪ تخفیف فعال است` }
  if (p.discountStartsAt && new Date(p.discountStartsAt) > new Date()) return { tone: 'warning', text: `از ${formatDateTime(p.discountStartsAt)} شروع می‌شود` }
  return { tone: 'neutral', text: 'دوره تخفیف تمام شده است' }
})
function clearDiscount() {
  Object.assign(form, { discountPercent: '0', discountStartsAt: '', discountEndsAt: '' })
}

const priceHint = computed(() => {
  const n = Number(toAsciiDigits(vf.priceToman).replace(/[,٬\s]/g, ''))
  return Number.isFinite(n) && n > 0 ? formatToman(n) : 'قیمت فروش به تومان، پیش از تخفیف'
})
</script>

<template>
  <div>
    <UiErrorState v-if="error" :message="normalizeApiError(error).message" @retry="refresh()" />
    <template v-else>
      <AdminHeader :title="isNew ? 'محصول جدید' : (product?.name ?? '')" :subtitle="isNew ? 'اطلاعات پایه را وارد کنید؛ پس از ذخیره، گزینه‌ها و قیمت‌ها را اضافه می‌کنید.' : undefined" back="/admin/products">
        <UiButton v-if="product?.isActive" :href="`/p/${product.slug}`" variant="secondary" size="sm"><Eye class="size-4" aria-hidden="true" /> مشاهده در فروشگاه</UiButton>
        <UiButton v-if="!isNew" variant="danger" size="sm" :loading="busy === 'delete'" @click="remove"><Trash2 class="size-4" aria-hidden="true" /> حذف</UiButton>
      </AdminHeader>

      <form class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]" novalidate @submit.prevent="save">
        <div class="min-w-0 space-y-6">
          <section class="card space-y-4 p-5">
            <h2 class="font-bold">اطلاعات اصلی</h2>
            <div class="grid gap-4 sm:grid-cols-2">
              <UiInput v-model="form.name" label="نام فارسی" required :error="errors.name" />
              <UiInput v-model="form.brandName" label="نام لاتین / برند" required ltr :error="errors.brandName" />
              <UiInput v-model="form.slug" label="نامک (آدرس صفحه)" required ltr :error="errors.slug" :hint="`/p/${form.slug || '…'}`" @input="slugTouched = true" />
              <UiSelect v-model="form.type" label="نوع محصول" :options="typeOptions" :error="errors.type" />
              <UiSelect v-model="form.categoryId" label="دسته‌بندی" placeholder="انتخاب کنید" :options="categoryOptions" :error="errors.categoryId" />
              <UiSelect v-model="form.providerId" label="برند" placeholder="انتخاب کنید" :options="providerOptions" :error="errors.providerId" />
            </div>
            <UiInput v-model="form.shortDescription" label="توضیح کوتاه (در کارت محصول)" required :maxlength="255" :error="errors.shortDescription" />
            <UiTextarea v-model="form.description" label="توضیحات کامل" :rows="5" :error="errors.description" />
          </section>

          <section class="card space-y-5 p-5">
            <h2 class="font-bold">شرایط و راهنما</h2>
            <AdminListEditor v-model="form.regions" label="مناطق قابل استفاده" placeholder="مثلاً: ایالات متحده" hint="برای فیلتر «منطقه» در فروشگاه هم استفاده می‌شود." />
            <AdminListEditor v-model="form.restrictions" label="محدودیت‌ها" />
            <AdminListEditor v-model="form.redemptionNotes" label="راهنمای استفاده / تحویل" />
            <div class="grid gap-4 sm:grid-cols-2">
              <UiInput v-model="form.deliveryMethod" label="روش تحویل" :error="errors.deliveryMethod" />
              <UiInput v-model="form.fulfillmentEstimate" label="زمان تقریبی انجام" hint="فقط اگر واقعاً قابل تعهد است؛ خالی بماند نمایش داده نمی‌شود." :error="errors.fulfillmentEstimate" />
            </div>
            <UiTextarea v-model="form.refundPolicy" label="قوانین بازپرداخت" :rows="3" :error="errors.refundPolicy" />
          </section>

          <section class="card p-5">
            <div class="mb-3 flex items-center justify-between">
              <div>
                <h2 class="font-bold">اطلاعات لازم از مشتری</h2>
                <p class="text-xs text-muted">مثلاً ایمیل حساب سرویس. هرگز رمز عبور درخواست نکنید.</p>
              </div>
              <UiButton size="sm" variant="secondary" @click="addField"><Plus class="size-4" aria-hidden="true" /> فیلد</UiButton>
            </div>
            <p v-if="errors.requiredFields" class="mb-2 text-sm text-red-700" role="alert">{{ errors.requiredFields }}</p>
            <p v-if="!form.requiredFields.length" class="text-sm text-muted">بدون فیلد (مناسب گیفت کارت).</p>
            <div v-for="(f, i) in form.requiredFields" :key="i" class="mb-3 grid gap-3 rounded-[var(--radius-control)] border border-line p-3 sm:grid-cols-[1fr_1.4fr_120px_auto]">
              <UiInput v-model="f.key" :label="`کلید ${faNumber(i + 1)}`" ltr placeholder="account_email" />
              <UiInput v-model="f.label" label="عنوان" />
              <UiSelect v-model="(f as RequiredField).type" label="نوع" :options="[{ value: 'text', label: 'متن' }, { value: 'email', label: 'ایمیل' }, { value: 'url', label: 'لینک' }]" />
              <div class="flex items-end">
                <UiButton variant="ghost" size="sm" class="!h-11 text-red-600" :aria-label="`حذف فیلد ${i + 1}`" @click="removeField(i)"><Trash2 class="size-4" aria-hidden="true" /></UiButton>
              </div>
              <UiInput v-model="f.placeholder" label="نمونه (placeholder)" class="sm:col-span-2" />
              <UiInput v-model="f.help" label="راهنما" class="sm:col-span-2" />
            </div>
          </section>

          <section class="card space-y-5 p-5">
            <div>
              <h2 class="font-bold">سئو و معرفی محصول</h2>
              <p class="text-xs text-muted">مقاله و سؤال‌ها در صفحه محصول نمایش داده می‌شوند و سؤال‌ها برای گوگل هم به‌صورت داده ساخت‌یافته (FAQ) منتشر می‌شوند.</p>
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <UiInput v-model="form.seoTitle" label="عنوان سئو (اختیاری)" :maxlength="70" :error="errors.seoTitle" :hint="`${faNumber(form.seoTitle.length)} از ۷۰ — خالی = نام فارسی`" />
              <UiInput v-model="form.seoDescription" label="توضیح متا (اختیاری)" :maxlength="170" :error="errors.seoDescription" :hint="`${faNumber(form.seoDescription.length)} از ۱۷۰ — خالی = توضیح کوتاه`" />
            </div>
            <div class="rounded-[var(--radius-control)] bg-canvas p-4" aria-label="پیش‌نمایش نتیجه جست‌وجو">
              <p class="truncate text-[17px] font-semibold text-[#1a0dab]">{{ seoTitlePreview }} | پی‌مینو</p>
              <p class="ltr truncate text-start text-xs text-emerald-800">paymino.ir/p/{{ form.slug || '…' }}</p>
              <p class="mt-1 line-clamp-2 text-sm text-navy-700">{{ seoDescriptionPreview }}</p>
            </div>
            <UiTextarea
                v-model="form.article"
                label="مقاله معرفی"
                :rows="12"
                :error="errors.article"
                hint="یک خط خالی = پاراگراف تازه · خط با «## » = زیرعنوان · خط با «- » = آیتم فهرست. خالی = توضیحات کامل نمایش داده می‌شود."
            />
            <div>
              <div class="mb-3 flex items-center justify-between">
                <h3 class="text-sm font-bold">سؤالات متداول این محصول</h3>
                <UiButton size="sm" variant="secondary" @click="addFaq"><Plus class="size-4" aria-hidden="true" /> سؤال</UiButton>
              </div>
              <p v-if="errors.faqs" class="mb-2 text-sm text-red-700" role="alert">{{ errors.faqs }}</p>
              <p v-if="!form.faqs.length" class="text-sm text-muted">بدون سؤال؛ صفحه از روی منطقه، روش تحویل و قوانین بازپرداخت چند سؤال می‌سازد.</p>
              <div v-for="(f, i) in form.faqs" :key="i" class="mb-3 grid gap-3 rounded-[var(--radius-control)] bg-canvas p-3 sm:grid-cols-[1fr_auto]">
                <UiInput v-model="f.question" :label="`سؤال ${faNumber(i + 1)}`" :maxlength="200" />
                <div class="flex items-end">
                  <UiButton variant="ghost" size="sm" class="!h-11 text-red-600" :aria-label="`حذف سؤال ${i + 1}`" @click="removeFaq(i)"><Trash2 class="size-4" aria-hidden="true" /></UiButton>
                </div>
                <UiTextarea v-model="f.answer" label="پاسخ" :rows="2" class="sm:col-span-2" />
              </div>
            </div>
          </section>

          <!-- Variants -->
          <section v-if="product" id="variants" class="card overflow-hidden">
            <div class="flex items-center justify-between border-b border-line px-5 py-3">
              <div>
                <h2 class="font-bold">گزینه‌ها و قیمت‌ها</h2>
                <p class="text-xs text-muted">«تحویل خودکار» یعنی کد از انبار کدها بلافاصله پس از تأیید پرداخت تحویل می‌شود.</p>
              </div>
              <UiButton size="sm" variant="accent" @click="openVariant(null)"><Plus class="size-4" aria-hidden="true" /> گزینه</UiButton>
            </div>
            <UiEmptyState v-if="!product.variants.length" title="هنوز گزینه‌ای ندارد" description="بدون گزینه فعال، محصول قابل خرید نیست." />
            <div v-else class="overflow-x-auto">
              <table class="w-full min-w-[640px] text-sm">
                <thead class="bg-navy-50/60 text-xs text-muted">
                  <tr>
                    <th class="px-4 py-2 text-start font-semibold">عنوان</th>
                    <th class="px-4 py-2 text-start font-semibold">قیمت</th>
                    <th class="px-4 py-2 text-start font-semibold">تحویل</th>
                    <th class="px-4 py-2 text-start font-semibold">موجودی</th>
                    <th class="px-4 py-2 text-start font-semibold">وضعیت</th>
                    <th class="px-4 py-2"><span class="sr-only">عملیات</span></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-line">
                  <tr v-for="v in product.variants" :key="v.id" :class="v.isActive ? '' : 'opacity-60'">
                    <td class="px-4 py-2.5">
                      <p class="ltr font-semibold">{{ v.label }}</p>
                      <p class="text-xs whitespace-nowrap text-muted">{{ v.region }}<template v-if="v.durationMonths"> — {{ durationLabel(v.durationMonths) }}</template></p>
                    </td>
                    <td class="tabular px-4 py-2.5 whitespace-nowrap">
                      <template v-if="discountPreview && discountedPrice(v.priceToman, discountPreview) < v.priceToman">
                        <p class="font-semibold text-accent-700">{{ formatToman(discountedPrice(v.priceToman, discountPreview)) }}</p>
                        <p class="text-xs text-muted line-through">{{ formatToman(v.priceToman) }}</p>
                      </template>
                      <template v-else>{{ formatToman(v.priceToman) }}</template>
                    </td>
                    <td class="px-4 py-2.5 whitespace-nowrap">{{ v.stockMode === 'codes' ? 'خودکار (کد)' : 'دستی' }}</td>
                    <td class="px-4 py-2.5 whitespace-nowrap">
                      <UiBadge v-if="v.stockMode === 'codes'" :tone="v.stock ? 'accent' : 'danger'">{{ faNumber(v.stock) }} کد</UiBadge>
                      <span v-else class="text-muted">—</span>
                    </td>
                    <td class="px-4 py-2.5 whitespace-nowrap">
                      <button type="button" class="rounded-full" :aria-label="v.isActive ? 'غیرفعال کردن' : 'فعال کردن'" @click="toggleVariant(v)">
                        <UiBadge :tone="v.available ? 'success' : v.isActive ? 'warning' : 'neutral'" dot>{{ v.available ? 'قابل خرید' : v.isActive ? 'ناموجود' : 'غیرفعال' }}</UiBadge>
                      </button>
                    </td>
                    <td class="px-4 py-2.5">
                      <div class="flex justify-end gap-1">
                        <UiButton v-if="v.stockMode === 'codes' || form.type === 'gift_card'" size="sm" variant="ghost" @click="openCodes(v)"><KeyRound class="size-4" aria-hidden="true" /> کدها</UiButton>
                        <UiButton size="sm" variant="ghost" :aria-label="`ویرایش ${v.label}`" @click="openVariant(v)"><Pencil class="size-4" aria-hidden="true" /></UiButton>
                        <UiButton size="sm" variant="ghost" class="text-red-600" :aria-label="`حذف ${v.label}`" :loading="busy === `vd:${v.id}`" @click="deleteVariant(v)"><Trash2 class="size-4" aria-hidden="true" /></UiButton>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <section class="card space-y-4 p-5 lg:sticky lg:top-6">
            <h2 class="font-bold">انتشار</h2>
            <UiCheckbox v-model="form.isActive">منتشرشده در فروشگاه</UiCheckbox>
            <UiInput v-model="form.maxQuantityPerItem" label="حداکثر تعداد در هر خرید" inputmode="numeric" ltr :error="errors.maxQuantityPerItem" hint="برای سرویس‌هایی که اطلاعات حساب می‌خواهند: ۱" />
            <UiInput v-model="form.popularity" label="اولویت نمایش (عدد بزرگ‌تر = بالاتر)" inputmode="numeric" ltr :error="errors.popularity" />
            <UiButton type="submit" variant="accent" block :loading="busy === 'save'">{{ isNew ? 'ساخت محصول' : 'ذخیره تغییرات' }}</UiButton>
          </section>

          <section class="card space-y-4 p-5">
            <div class="flex items-center justify-between gap-2">
              <h2 class="font-bold">تخفیف</h2>
              <UiBadge v-if="!isNew" :tone="discountStatus.tone" dot>{{ discountStatus.text }}</UiBadge>
            </div>
            <UiInput
                v-model="form.discountPercent"
                label="درصد تخفیف"
                inputmode="numeric"
                ltr
                :error="errors.discountPercent"
                hint="۰ تا ۹۰. روی همه گزینه‌های این محصول اعمال می‌شود؛ قیمت نهایی به ۱٬۰۰۰ تومان گرد می‌شود."
            />
            <UiInput v-model="form.discountStartsAt" type="datetime-local" label="شروع (اختیاری)" ltr :error="errors.discountStartsAt" hint="خالی = از همین حالا" />
            <UiInput v-model="form.discountEndsAt" type="datetime-local" label="پایان (اختیاری)" ltr :error="errors.discountEndsAt" hint="خالی = تا وقتی آن را بردارید" />
            <div class="flex items-center justify-between gap-2">
              <p class="text-xs text-muted">پس از تغییر، «ذخیره تغییرات» را بزنید.</p>
              <UiButton v-if="form.discountPercent !== '0' || form.discountStartsAt || form.discountEndsAt" size="sm" variant="ghost" class="text-red-600" @click="clearDiscount">حذف تخفیف</UiButton>
            </div>
          </section>

          <section v-if="product" class="card p-5">
            <h2 class="mb-3 font-bold">تصویر</h2>
            <div class="mb-3 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[var(--radius-control)] bg-navy-50">
              <img v-if="product.imageUrl" :src="product.imageUrl" alt="" class="size-full object-cover" />
              <ImagePlus v-else class="size-8 text-navy-300" aria-hidden="true" />
            </div>
            <input ref="fileInput" type="file" accept="image/png,image/jpeg,image/webp" class="sr-only" aria-label="انتخاب تصویر" @change="upload" />
            <div class="flex gap-2">
              <UiButton size="sm" variant="secondary" :loading="busy === 'image'" @click="fileInput?.click()">بارگذاری</UiButton>
              <UiButton v-if="product.imageUrl" size="sm" variant="ghost" class="text-red-600" @click="removeImage">حذف تصویر</UiButton>
            </div>
            <p class="mt-2 text-xs text-muted">PNG، JPG یا WEBP — حداکثر ۲ مگابایت.</p>
            <p v-if="errors.image" class="mt-1 text-sm text-red-700" role="alert">{{ errors.image }}</p>
          </section>
        </div>
      </form>

      <!-- Variant modal -->
      <AdminModal v-model="variantOpen" :title="editingVariant ? 'ویرایش گزینه' : 'گزینه جدید'">
        <form class="space-y-4" @submit.prevent="saveVariant">
          <div class="grid gap-4 sm:grid-cols-2">
            <UiInput v-model="vf.label" label="عنوان" required ltr placeholder="$20 یا Plus — ماهانه" :error="errors.label" />
            <UiInput v-model="vf.priceToman" label="قیمت (تومان)" required ltr inputmode="numeric" :error="errors.priceToman" :hint="priceHint" />
            <UiInput v-model="vf.faceValue" label="مبلغ اسمی" ltr inputmode="decimal" :error="errors.faceValue" />
            <UiInput v-model="vf.faceCurrency" label="ارز اسمی" ltr placeholder="USD" :maxlength="3" :error="errors.faceCurrency" />
            <UiInput v-model="vf.region" label="منطقه" :error="errors.region" />
            <UiInput v-model="vf.durationMonths" label="مدت اشتراک (ماه)" ltr inputmode="numeric" :error="errors.durationMonths" />
            <UiSelect v-model="vf.stockMode" label="روش تحویل" :options="[{ value: 'codes', label: 'خودکار از انبار کد' }, { value: 'manual', label: 'دستی توسط مدیر' }]" :error="errors.stockMode" />
            <UiInput v-model="vf.sortOrder" label="ترتیب" ltr inputmode="numeric" :error="errors.sortOrder" />
          </div>
          <UiCheckbox v-model="vf.isActive">فعال</UiCheckbox>
          <div class="flex justify-end gap-2">
            <UiButton variant="secondary" @click="variantOpen = false">انصراف</UiButton>
            <UiButton type="submit" variant="accent" :loading="busy === 'variant'">ذخیره</UiButton>
          </div>
        </form>
      </AdminModal>

      <AdminCodesModal v-if="codesVariant" v-model="codesOpen" :variant="codesVariant" />
    </template>
  </div>
</template>
