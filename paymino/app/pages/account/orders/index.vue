<script setup lang="ts">
import { Package } from 'lucide-vue-next'
import type { OrderListItem } from '#shared/types'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'سفارش‌های من', robots: 'noindex' })

const route = useRoute()
const api = useApi()
const tabs = [
  { key: 'all', label: 'همه' },
  { key: 'active', label: 'جاری' },
  { key: 'completed', label: 'پایان‌یافته' },
]
const tab = computed(() => (tabs.some((t) => t.key === route.query.tab) ? String(route.query.tab) : 'all'))

const { data, status, error, refresh } = await useAsyncData(
  () => `account:orders:${tab.value}`,
  () => api<{ count: number; results: OrderListItem[] }>('/orders', { query: { status: tab.value } }),
  { watch: [tab] },
)
</script>

<template>
  <AccountShell title="سفارش‌های من" subtitle="وضعیت پرداخت و انجام هر سفارش را دنبال کنید">
    <div class="card overflow-hidden">
      <div class="flex gap-1 border-b border-line px-3 pt-3" role="tablist" aria-label="فیلتر سفارش‌ها">
        <NuxtLink
          v-for="t in tabs"
          :key="t.key"
          :to="{ query: t.key === 'all' ? {} : { tab: t.key } }"
          role="tab"
          :aria-selected="tab === t.key"
          class="-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold"
          :class="tab === t.key ? 'border-accent-600 text-navy-900' : 'border-transparent text-muted hover:text-navy-800'"
        >
          {{ t.label }}
        </NuxtLink>
      </div>

      <div v-if="status === 'pending' && !data" class="space-y-3 p-5" aria-busy="true">
        <div v-for="i in 4" :key="i" class="skeleton h-14" />
      </div>
      <UiErrorState v-else-if="error" :message="normalizeApiError(error).message" :retrying="status === 'pending'" @retry="refresh()" />
      <UiEmptyState
        v-else-if="!data?.results.length"
        :icon="Package"
        :title="tab === 'all' ? 'هنوز سفارشی ثبت نکرده‌اید' : 'سفارشی در این بخش نیست'"
        description="سفارش‌های شما پس از ثبت در این صفحه نمایش داده می‌شوند."
      >
        <UiButton v-if="tab === 'all'" to="/shop" variant="accent">مشاهده محصولات</UiButton>
      </UiEmptyState>
      <ul v-else class="divide-y divide-line" :class="status === 'pending' ? 'opacity-60' : ''">
        <OrderRow v-for="o in data.results" :key="o.id" :order="o" />
      </ul>
    </div>
  </AccountShell>
</template>
