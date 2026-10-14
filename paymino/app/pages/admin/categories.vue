<script setup lang="ts">
import { Pencil, Plus, Trash2 } from 'lucide-vue-next'
import type { AdminCategory, AdminList, AdminProvider, CategoryIconKey } from '#shared/types/admin'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'دسته‌ها و برندها — مدیریت', robots: 'noindex, nofollow' })

const api = useApi()
const { busy, errors, run } = useAdminAction()
const { data: cats, refresh: refreshCats } = await useAsyncData('admin:categories', () => api<AdminList<AdminCategory>>('/admin/categories'))
const { data: provs, refresh: refreshProvs } = await useAsyncData('admin:providers', () => api<AdminList<AdminProvider>>('/admin/providers'))

const icons: Array<{ value: CategoryIconKey; label: string }> = [
  { value: 'steam', label: 'Steam' },
  { value: 'apple', label: 'Apple' },
  { value: 'playstation', label: 'PlayStation' },
  { value: 'tradingview', label: 'TradingView' },
  { value: 'ai', label: 'هوش مصنوعی' },
]
const catName = (id: number) => cats.value?.results.find((c) => c.id === id)?.name ?? '—'

/* categories */
const catOpen = ref(false)
const editingCat = ref<AdminCategory | null>(null)
const cf = reactive({ slug: '', name: '', description: '', icon: 'ai' as string, sortOrder: '0', isActive: true })
function openCat(c: AdminCategory | null) {
  editingCat.value = c
  Object.assign(cf, { slug: c?.slug ?? '', name: c?.name ?? '', description: c?.description ?? '', icon: c?.icon ?? 'ai', sortOrder: String(c?.sortOrder ?? cats.value?.count ?? 0), isActive: c?.isActive ?? true })
  errors.value = {}
  catOpen.value = true
}
async function saveCat() {
  const body = { ...cf, sortOrder: toAsciiDigits(cf.sortOrder) }
  const ok = editingCat.value
    ? await run('cat', () => api<unknown>(`/admin/categories/${editingCat.value!.id}`, { method: 'PATCH', body }), 'دسته‌بندی ذخیره شد.')
    : await run('cat', () => api<unknown>('/admin/categories', { method: 'POST', body }), 'دسته‌بندی ساخته شد.')
  if (ok) {
    catOpen.value = false
    await refreshCats()
  }
}
async function deleteCat(c: AdminCategory) {
  if (!confirm(`دسته «${c.name}» حذف شود؟`)) return
  if ((await run(`cd:${c.id}`, () => api<unknown>(`/admin/categories/${c.id}`, { method: 'DELETE' }), 'حذف شد.')) !== null) await refreshCats()
}

/* providers */
const provOpen = ref(false)
const editingProv = ref<AdminProvider | null>(null)
const pf = reactive({ slug: '', name: '', categoryId: '' })
function openProv(p: AdminProvider | null) {
  editingProv.value = p
  Object.assign(pf, { slug: p?.slug ?? '', name: p?.name ?? '', categoryId: p ? String(p.categoryId) : '' })
  errors.value = {}
  provOpen.value = true
}
async function saveProv() {
  const body = { ...pf, categoryId: Number(pf.categoryId) || null }
  const ok = editingProv.value
    ? await run('prov', () => api<unknown>(`/admin/providers/${editingProv.value!.id}`, { method: 'PATCH', body }), 'برند ذخیره شد.')
    : await run('prov', () => api<unknown>('/admin/providers', { method: 'POST', body }), 'برند ساخته شد.')
  if (ok) {
    provOpen.value = false
    await refreshProvs()
  }
}
async function deleteProv(p: AdminProvider) {
  if (!confirm(`برند «${p.name}» حذف شود؟`)) return
  if ((await run(`pd:${p.id}`, () => api<unknown>(`/admin/providers/${p.id}`, { method: 'DELETE' }), 'حذف شد.')) !== null) await refreshProvs()
}
</script>

<template>
  <div>
    <AdminHeader title="دسته‌ها و برندها" subtitle="ساختار منوی فروشگاه و فیلترها" />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card overflow-hidden">
        <div class="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 class="font-bold">دسته‌بندی‌ها</h2>
          <UiButton size="sm" variant="accent" @click="openCat(null)"><Plus class="size-4" aria-hidden="true" /> دسته</UiButton>
        </div>
        <ul class="divide-y divide-line">
          <li v-for="c in cats?.results" :key="c.id" class="flex items-center gap-3 px-5 py-3" :class="c.isActive ? '' : 'opacity-60'">
            <CatalogCategoryIcon :icon="c.icon" size="sm" />
            <div class="min-w-0 flex-1">
              <p class="font-semibold">{{ c.name }} <UiBadge v-if="!c.isActive">غیرفعال</UiBadge></p>
              <p class="ltr truncate text-xs text-muted">/c/{{ c.slug }} · {{ faNumber(c.productCount ?? 0) }} محصول</p>
            </div>
            <UiButton size="sm" variant="ghost" :aria-label="`ویرایش ${c.name}`" @click="openCat(c)"><Pencil class="size-4" aria-hidden="true" /></UiButton>
            <UiButton size="sm" variant="ghost" class="text-red-600" :aria-label="`حذف ${c.name}`" :loading="busy === `cd:${c.id}`" @click="deleteCat(c)"><Trash2 class="size-4" aria-hidden="true" /></UiButton>
          </li>
        </ul>
      </section>

      <section class="card overflow-hidden">
        <div class="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 class="font-bold">برندها</h2>
          <UiButton size="sm" variant="accent" @click="openProv(null)"><Plus class="size-4" aria-hidden="true" /> برند</UiButton>
        </div>
        <ul class="divide-y divide-line">
          <li v-for="p in provs?.results" :key="p.id" class="flex items-center gap-3 px-5 py-3">
            <div class="min-w-0 flex-1">
              <p class="ltr font-semibold">{{ p.name }}</p>
              <p class="truncate text-xs text-muted">{{ catName(p.categoryId) }} · {{ faNumber(p.productCount ?? 0) }} محصول</p>
            </div>
            <UiButton size="sm" variant="ghost" :aria-label="`ویرایش ${p.name}`" @click="openProv(p)"><Pencil class="size-4" aria-hidden="true" /></UiButton>
            <UiButton size="sm" variant="ghost" class="text-red-600" :aria-label="`حذف ${p.name}`" :loading="busy === `pd:${p.id}`" @click="deleteProv(p)"><Trash2 class="size-4" aria-hidden="true" /></UiButton>
          </li>
        </ul>
      </section>
    </div>

    <AdminModal v-model="catOpen" :title="editingCat ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'">
      <form class="space-y-4" @submit.prevent="saveCat">
        <UiInput v-model="cf.name" label="نام" required :error="errors.name" />
        <UiInput v-model="cf.slug" label="نامک" required ltr :error="errors.slug" :hint="`/c/${cf.slug || '…'}`" />
        <UiInput v-model="cf.description" label="توضیح کوتاه" :error="errors.description" />
        <div class="grid grid-cols-2 gap-4">
          <UiSelect v-model="cf.icon" label="آیکون" :options="icons" :error="errors.icon" />
          <UiInput v-model="cf.sortOrder" label="ترتیب" ltr inputmode="numeric" :error="errors.sortOrder" />
        </div>
        <UiCheckbox v-model="cf.isActive">فعال (نمایش در منو)</UiCheckbox>
        <div class="flex justify-end gap-2">
          <UiButton variant="secondary" @click="catOpen = false">انصراف</UiButton>
          <UiButton type="submit" variant="accent" :loading="busy === 'cat'">ذخیره</UiButton>
        </div>
      </form>
    </AdminModal>

    <AdminModal v-model="provOpen" :title="editingProv ? 'ویرایش برند' : 'برند جدید'">
      <form class="space-y-4" @submit.prevent="saveProv">
        <UiInput v-model="pf.name" label="نام لاتین برند" required ltr :error="errors.name" />
        <UiInput v-model="pf.slug" label="نامک" required ltr :error="errors.slug" />
        <UiSelect v-model="pf.categoryId" label="دسته‌بندی" placeholder="انتخاب کنید" :options="(cats?.results ?? []).map((c) => ({ value: String(c.id), label: c.name }))" :error="errors.categoryId" />
        <div class="flex justify-end gap-2">
          <UiButton variant="secondary" @click="provOpen = false">انصراف</UiButton>
          <UiButton type="submit" variant="accent" :loading="busy === 'prov'">ذخیره</UiButton>
        </div>
      </form>
    </AdminModal>
  </div>
</template>
