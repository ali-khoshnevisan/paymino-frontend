<script setup lang="ts">
import { Search, ShoppingCart } from 'lucide-vue-next'
import type { AdminList, AdminOrderRow } from '#shared/types/admin'
import type { OrderStatus } from '#shared/types'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'سفارش‌ها — مدیریت', robots: 'noindex, nofollow' })

const route = useRoute()
const router = useRouter()
const api = useApi()
const PAGE_SIZE = 25

const statusOptions = [
  { value: 'action', label: 'نیازمند اقدام' },
  ...(Object.keys(ORDER_STATUS) as OrderStatus[]).map((s) => ({ value: s, label: ORDER_STATUS[s].label })),
]

const search = ref(String(route.query.q ?? ''))
const q = useDebounced(search)
const statusFilter = ref(String(route.query.status ?? ''))
const reviewOnly = ref(route.query.review === '1')
const page = ref(Number(route.query.page ?? 1) || 1)

watch([q, statusFilter, reviewOnly], () => (page.value = 1))
watch([q, statusFilter, reviewOnly, page], () => {
  router.replace({
    query: {
      ...(q.value ? { q: q.value } : {}),
      ...(statusFilter.value ? { status: statusFilter.value } : {}),
      ...(reviewOnly.value ? { review: '1' } : {}),
      ...(page.value > 1 ? { page: String(page.value) } : {}),
    },
  })
})

const { data, status, error, refresh } = await useAsyncData(
  'admin:orders',
  () =>
    api<AdminList<AdminOrderRow>>('/admin/orders', {
      query: { q: q.value || undefined, status: statusFilter.value || undefined, needsReview: reviewOnly.value ? '1' : undefined, page: page.value, pageSize: PAGE_SIZE },
    }),
  { watch: [q, statusFilter, reviewOnly, page] },
)
</script>

<template>
  <div>
    <AdminHeader title="سفارش‌ها" subtitle="جست‌وجو، پیگیری و انجام سفارش‌ها" />

    <div class="card overflow-hidden">
      <div class="flex flex-wrap items-end gap-3 border-b border-line p-4">
        <div class="relative min-w-56 flex-1">
          <Search class="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-navy-300" aria-hidden="true" />
          <input
            v-model="search"
            type="search"
            placeholder="شماره سفارش، ایمیل، نام، موبایل یا هش تراکنش…"
            aria-label="جست‌وجوی سفارش"
            class="h-9 w-full rounded-[var(--radius-control)] border border-line bg-white ps-9 pe-3 text-sm focus:border-accent-500 focus:outline-none"
          />
        </div>
        <UiSelect v-model="statusFilter" label="وضعیت" hide-label size="sm" placeholder="همه وضعیت‌ها" :options="statusOptions" class="w-48" />
        <label class="flex h-9 items-center gap-2 text-sm">
          <input v-model="reviewOnly" type="checkbox" class="size-4 accent-accent-600" />
          فقط نیازمند بررسی
        </label>
      </div>

      <UiErrorState v-if="error" :message="normalizeApiError(error).message" @retry="refresh()" />
      <div v-else-if="!data" class="space-y-2 p-4"><div v-for="i in 6" :key="i" class="skeleton h-12" /></div>
      <UiEmptyState v-else-if="!data.results.length" :icon="ShoppingCart" title="سفارشی یافت نشد" description="فیلترها را تغییر دهید." />
      <div v-else class="overflow-x-auto" :class="status === 'pending' ? 'opacity-60' : ''">
        <table class="w-full min-w-[760px] text-sm">
          <thead class="bg-navy-50/60 text-xs text-muted">
            <tr>
              <th class="px-4 py-2.5 text-start font-semibold">سفارش</th>
              <th class="px-4 py-2.5 text-start font-semibold">مشتری</th>
              <th class="px-4 py-2.5 text-start font-semibold">اقلام</th>
              <th class="px-4 py-2.5 text-start font-semibold">مبلغ</th>
              <th class="px-4 py-2.5 text-start font-semibold">وضعیت</th>
              <th class="px-4 py-2.5 text-start font-semibold">پرداخت</th>
              <th class="px-4 py-2.5 text-start font-semibold">تاریخ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr v-for="o in data.results" :key="o.id" class="cursor-pointer hover:bg-navy-50/50" @click="navigateTo(`/admin/orders/${o.id}`)">
              <td class="px-4 py-3">
                <NuxtLink :to="`/admin/orders/${o.id}`" class="ltr font-mono font-semibold hover:underline" @click.stop>{{ o.number }}</NuxtLink>
                <UiBadge v-if="o.needsReview" tone="danger" class="ms-2">بررسی</UiBadge>
              </td>
              <td class="max-w-48 px-4 py-3">
                <p class="truncate">{{ o.user.fullName }}</p>
                <p class="ltr truncate text-xs text-muted">{{ o.user.email }}</p>
              </td>
              <td class="max-w-56 px-4 py-3">
                <p class="truncate">{{ o.firstItemName }}</p>
                <p class="text-xs text-muted">{{ faNumber(o.itemCount) }} عدد</p>
              </td>
              <td class="tabular px-4 py-3 whitespace-nowrap">{{ formatToman(o.totalToman) }}</td>
              <td class="px-4 py-3"><OrderStatusBadge kind="order" :status="o.status" /></td>
              <td class="px-4 py-3"><OrderStatusBadge v-if="o.paymentStatus" kind="payment" :status="o.paymentStatus" /></td>
              <td class="px-4 py-3 text-xs whitespace-nowrap text-muted">{{ formatDateTime(o.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <AdminPagination v-if="data" v-model="page" :count="data.count" :page-size="PAGE_SIZE" />
    </div>
  </div>
</template>
