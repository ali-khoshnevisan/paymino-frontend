<script setup lang="ts">
import { Search, Users } from 'lucide-vue-next'
import type { AdminList, AdminUserRow } from '#shared/types/admin'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'کاربران — مدیریت', robots: 'noindex, nofollow' })

const api = useApi()
const PAGE_SIZE = 25
const search = ref('')
const q = useDebounced(search)
const filter = ref('')
const page = ref(1)
watch([q, filter], () => (page.value = 1))

const { data, status, error, refresh } = await useAsyncData(
  'admin:users',
  () =>
    api<AdminList<AdminUserRow>>('/admin/users', {
      query: {
        q: q.value || undefined,
        staff: filter.value === 'staff' ? '1' : undefined,
        active: filter.value === 'inactive' ? '0' : undefined,
        page: page.value,
        pageSize: PAGE_SIZE,
      },
    }),
  { watch: [q, filter, page] },
)
</script>

<template>
  <div>
    <AdminHeader title="کاربران" subtitle="حساب‌ها، سفارش‌ها و دسترسی‌ها" />
    <div class="card overflow-hidden">
      <div class="flex flex-wrap items-end gap-3 border-b border-line p-4">
        <div class="relative min-w-56 flex-1">
          <Search class="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-navy-300" aria-hidden="true" />
          <input v-model="search" type="search" placeholder="نام، ایمیل یا موبایل…" aria-label="جست‌وجوی کاربر"
            class="h-9 w-full rounded-[var(--radius-control)] border border-line bg-white ps-9 pe-3 text-sm focus:border-accent-500 focus:outline-none" />
        </div>
        <UiSelect v-model="filter" label="فیلتر" hide-label size="sm" placeholder="همه کاربران" :options="[{ value: 'staff', label: 'مدیران' }, { value: 'inactive', label: 'غیرفعال' }]" class="w-40" />
      </div>
      <UiErrorState v-if="error" :message="normalizeApiError(error).message" @retry="refresh()" />
      <div v-else-if="!data" class="space-y-2 p-4"><div v-for="i in 6" :key="i" class="skeleton h-12" /></div>
      <UiEmptyState v-else-if="!data.results.length" :icon="Users" title="کاربری یافت نشد" />
      <div v-else class="overflow-x-auto" :class="status === 'pending' ? 'opacity-60' : ''">
        <table class="w-full min-w-[720px] text-sm">
          <thead class="bg-navy-50/60 text-xs text-muted">
            <tr>
              <th class="px-4 py-2.5 text-start font-semibold">کاربر</th>
              <th class="px-4 py-2.5 text-start font-semibold">موبایل</th>
              <th class="px-4 py-2.5 text-start font-semibold">سفارش‌ها</th>
              <th class="px-4 py-2.5 text-start font-semibold">خرید تکمیل‌شده</th>
              <th class="px-4 py-2.5 text-start font-semibold">عضویت</th>
              <th class="px-4 py-2.5 text-start font-semibold">وضعیت</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr v-for="u in data.results" :key="u.id" class="cursor-pointer hover:bg-navy-50/50" @click="navigateTo(`/admin/users/${u.id}`)">
              <td class="max-w-64 px-4 py-3">
                <NuxtLink :to="`/admin/users/${u.id}`" class="font-semibold hover:underline" @click.stop>{{ u.fullName }}</NuxtLink>
                <p class="ltr truncate text-xs text-muted">{{ u.email }}</p>
              </td>
              <td class="ltr px-4 py-3 text-start">{{ u.phone ?? '—' }}</td>
              <td class="tabular px-4 py-3">{{ faNumber(u.orderCount ?? 0) }}</td>
              <td class="tabular px-4 py-3 whitespace-nowrap">{{ formatToman(u.totalSpentToman) }}</td>
              <td class="px-4 py-3 text-xs whitespace-nowrap text-muted">{{ formatDate(u.createdAt) }}</td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1">
                  <UiBadge v-if="u.isStaff" tone="accent">مدیر</UiBadge>
                  <UiBadge v-if="!u.isActive" tone="danger">غیرفعال</UiBadge>
                  <UiBadge v-else-if="!u.emailVerified" tone="warning">ایمیل تأییدنشده</UiBadge>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <AdminPagination v-if="data" v-model="page" :count="data.count" :page-size="PAGE_SIZE" />
    </div>
  </div>
</template>
