<script setup lang="ts">
import { LifeBuoy, Search } from 'lucide-vue-next'
import type { AdminList, AdminTicketRow } from '#shared/types/admin'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'پشتیبانی — مدیریت', robots: 'noindex, nofollow' })

const route = useRoute()
const api = useApi()
const PAGE_SIZE = 25
const search = ref('')
const q = useDebounced(search)
const statusFilter = ref(String(route.query.status ?? ''))
const page = ref(1)
watch([q, statusFilter], () => (page.value = 1))

const { data, status, error, refresh } = await useAsyncData(
  'admin:tickets',
  () => api<AdminList<AdminTicketRow>>('/admin/tickets', { query: { q: q.value || undefined, status: statusFilter.value || undefined, page: page.value, pageSize: PAGE_SIZE } }),
  { watch: [q, statusFilter, page] },
)
</script>

<template>
  <div>
    <AdminHeader title="پشتیبانی" subtitle="درخواست‌های کاربران" />
    <div class="card overflow-hidden">
      <div class="flex flex-wrap items-end gap-3 border-b border-line p-4">
        <div class="relative min-w-56 flex-1">
          <Search class="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-navy-300" aria-hidden="true" />
          <input v-model="search" type="search" placeholder="شماره، موضوع، ایمیل یا شماره سفارش…" aria-label="جست‌وجوی تیکت"
            class="h-9 w-full rounded-[var(--radius-control)] border border-line bg-white ps-9 pe-3 text-sm focus:border-accent-500 focus:outline-none" />
        </div>
        <UiSelect v-model="statusFilter" label="وضعیت" hide-label size="sm" placeholder="همه" :options="[{ value: 'open', label: 'باز' }, { value: 'answered', label: 'پاسخ داده شد' }, { value: 'closed', label: 'بسته' }]" class="w-40" />
      </div>
      <UiErrorState v-if="error" :message="normalizeApiError(error).message" @retry="refresh()" />
      <div v-else-if="!data" class="space-y-2 p-4"><div v-for="i in 5" :key="i" class="skeleton h-12" /></div>
      <UiEmptyState v-else-if="!data.results.length" :icon="LifeBuoy" title="درخواستی نیست" />
      <ul v-else class="divide-y divide-line" :class="status === 'pending' ? 'opacity-60' : ''">
        <li v-for="t in data.results" :key="t.id">
          <NuxtLink :to="`/admin/tickets/${t.id}`" class="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-sm hover:bg-navy-50/50">
            <span class="ltr font-mono text-muted">{{ t.number }}</span>
            <div class="min-w-0 flex-1">
              <p class="truncate font-semibold">{{ t.subject }}</p>
              <p class="truncate text-xs text-muted">{{ t.user.fullName }} — <span class="ltr">{{ t.user.email }}</span><template v-if="t.orderNumber"> — سفارش <span class="ltr">{{ t.orderNumber }}</span></template></p>
            </div>
            <UiBadge v-if="t.status === 'open' && t.lastMessageFrom === 'user'" tone="danger" dot>منتظر پاسخ</UiBadge>
            <UiBadge :tone="TICKET_STATUS[t.status].tone">{{ TICKET_STATUS[t.status].label }}</UiBadge>
            <span class="text-xs whitespace-nowrap text-muted">{{ formatDateTime(t.updatedAt) }}</span>
          </NuxtLink>
        </li>
      </ul>
      <AdminPagination v-if="data" v-model="page" :count="data.count" :page-size="PAGE_SIZE" />
    </div>
  </div>
</template>
