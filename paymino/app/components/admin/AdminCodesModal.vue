<script setup lang="ts">
import { Ban, Eye, EyeOff } from 'lucide-vue-next'
import type { AdminGiftCode, AdminVariant, GiftCodeStatus } from '#shared/types/admin'

const props = defineProps<{ variant: AdminVariant }>()
const open = defineModel<boolean>({ default: false })
const api = useApi()
const { busy, errors, run } = useAdminAction()

const tab = ref<GiftCodeStatus>('available')
const reveal = ref(false)
const page = ref(1)
const PAGE_SIZE = 50
type CodesPage = { count: number; results: AdminGiftCode[]; summary: Record<GiftCodeStatus, number> }
const data = ref<CodesPage | null>(null)
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    data.value = await api<CodesPage>(`/admin/variants/${props.variant.id}/codes`, {
      query: { status: tab.value, page: page.value, pageSize: PAGE_SIZE, reveal: reveal.value ? '1' : undefined },
    })
  } catch (err) {
    useToast().show(normalizeApiError(err).message, { tone: 'danger' })
  } finally {
    loading.value = false
  }
}
watch([open, tab, page, reveal], () => open.value && load(), { immediate: true })
watch(tab, () => (page.value = 1))

const bulk = ref('')
const note = ref('')
const lineCount = computed(() => bulk.value.split('\n').filter((l) => l.trim()).length)

async function add() {
  const res = await run('add', () => api<{ added: number; duplicates: number }>(`/admin/variants/${props.variant.id}/codes`, { method: 'POST', body: { codes: bulk.value, note: note.value } }))
  if (res) {
    useToast().show(`${faNumber(res.added)} کد اضافه شد${res.duplicates ? ` — ${faNumber(res.duplicates)} کد تکراری نادیده گرفته شد` : ''}.`)
    bulk.value = ''
    note.value = ''
    tab.value = 'available'
    await load()
  }
}

async function voidCode(c: AdminGiftCode) {
  if (!confirm('این کد باطل شود؟ کد باطل‌شده به هیچ سفارشی تحویل نمی‌شود.')) return
  if (await run(`void:${c.id}`, () => api<unknown>(`/admin/codes/${c.id}/void`, { method: 'POST', body: {} }), 'کد باطل شد.')) await load()
}

const tabs: Array<{ key: GiftCodeStatus; label: string }> = [
  { key: 'available', label: 'موجود' },
  { key: 'delivered', label: 'تحویل‌شده' },
  { key: 'void', label: 'باطل' },
]
</script>

<template>
  <AdminModal v-model="open" :title="`کدهای \u2068${variant.label}\u2069`" wide>
    <form class="space-y-3" @submit.prevent="add">
      <UiTextarea v-model="bulk" label="افزودن کد (هر کد در یک خط)" :rows="5" :error="errors.codes" class="[&_textarea]:font-mono [&_textarea]:ltr" />
      <div class="flex flex-wrap items-end gap-3">
        <UiInput v-model="note" label="یادداشت (مثلاً منبع خرید / فاکتور)" class="min-w-56 flex-1" />
        <UiButton type="submit" variant="accent" :loading="busy === 'add'" :disabled="!lineCount">افزودن {{ lineCount ? faNumber(lineCount) : '' }} کد</UiButton>
      </div>
      <p class="text-xs text-muted">کدها در پنل مدیریت قابل مشاهده‌اند؛ دسترسی مدیریت را فقط به افراد مورد اعتماد بدهید.</p>
    </form>

    <div class="mt-6 flex items-center justify-between gap-2 border-b border-line">
      <div class="flex gap-1" role="tablist">
        <button
          v-for="t in tabs"
          :key="t.key"
          type="button"
          role="tab"
          :aria-selected="tab === t.key"
          class="-mb-px border-b-2 px-3 py-2 text-sm font-semibold"
          :class="tab === t.key ? 'border-accent-600' : 'border-transparent text-muted'"
          @click="tab = t.key"
        >
          {{ t.label }} <span class="text-xs text-muted">({{ faNumber(data?.summary[t.key] ?? 0) }})</span>
        </button>
      </div>
      <UiButton v-if="tab === 'delivered'" size="sm" variant="ghost" @click="reveal = !reveal">
        <component :is="reveal ? EyeOff : Eye" class="size-4" aria-hidden="true" /> {{ reveal ? 'پنهان' : 'نمایش کامل' }}
      </UiButton>
    </div>

    <div v-if="loading && !data" class="space-y-2 py-4"><div v-for="i in 4" :key="i" class="skeleton h-9" /></div>
    <p v-else-if="!data?.results.length" class="py-6 text-center text-sm text-muted">کدی در این بخش نیست.</p>
    <ul v-else class="divide-y divide-line" :class="loading ? 'opacity-60' : ''">
      <li v-for="c in data.results" :key="c.id" class="flex items-center gap-3 py-2 text-sm">
        <span class="ltr min-w-0 flex-1 truncate font-mono">{{ c.code }}</span>
        <NuxtLink v-if="c.orderId" :to="`/admin/orders/${c.orderId}`" class="ltr text-xs text-accent-700 hover:underline" @click="open = false">{{ c.orderNumber }}</NuxtLink>
        <span v-if="c.note" class="max-w-40 truncate text-xs text-muted">{{ c.note }}</span>
        <span class="text-xs whitespace-nowrap text-muted">{{ formatDate(c.deliveredAt ?? c.createdAt) }}</span>
        <UiButton v-if="c.status === 'available'" size="sm" variant="ghost" class="text-red-600" :loading="busy === `void:${c.id}`" :aria-label="`ابطال کد ${c.id}`" @click="voidCode(c)">
          <Ban class="size-4" aria-hidden="true" />
        </UiButton>
      </li>
    </ul>
    <AdminPagination v-if="data" v-model="page" :count="data.count" :page-size="PAGE_SIZE" />
  </AdminModal>
</template>
