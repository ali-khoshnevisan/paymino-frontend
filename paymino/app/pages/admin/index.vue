<script setup lang="ts">
import { Banknote, LifeBuoy, PackageX, ShoppingCart, TriangleAlert, Users } from 'lucide-vue-next'
import type { AdminDashboard } from '#shared/types/admin'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'پیشخوان مدیریت', robots: 'noindex, nofollow' })

const api = useApi()
const { data, status, error, refresh } = await useAsyncData('admin:dashboard', () => api<AdminDashboard>('/admin/dashboard'))

const maxRevenue = computed(() => Math.max(1, ...(data.value?.series.map((d) => d.revenueToman) ?? [1])))
const dayFmt = new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric' })
</script>

<template>
  <div>
    <AdminHeader title="پیشخوان" subtitle="نمای کلی فروش و کارهای در انتظار">
      <UiButton variant="secondary" size="sm" :loading="status === 'pending'" @click="refresh()">به‌روزرسانی</UiButton>
    </AdminHeader>

    <UiErrorState v-if="error" :message="normalizeApiError(error).message" @retry="refresh()" />
    <div v-else-if="!data" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="i in 8" :key="i" class="skeleton h-28" />
    </div>
    <template v-else>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStat label="فروش امروز" :value="formatToman(data.revenue.today)" :hint="`۷ روز: ${formatToman(data.revenue.last7Days)}`" :icon="Banknote" />
        <AdminStat label="فروش ۳۰ روز" :value="formatToman(data.revenue.last30Days)" :hint="`${faNumber(data.orders.last30Days)} سفارش`" :icon="Banknote" />
        <AdminStat
          label="سفارش‌های نیازمند اقدام"
          :value="faNumber(data.needsAction.count)"
          :icon="data.needsAction.count ? TriangleAlert : ShoppingCart"
          :tone="data.needsAction.count ? 'warning' : 'default'"
          to="/admin/orders?status=action"
        />
        <AdminStat label="تیکت‌های باز" :value="faNumber(data.openTickets)" :icon="LifeBuoy" :tone="data.openTickets ? 'warning' : 'default'" to="/admin/tickets?status=open" />
      </div>

      <section class="card mt-6 p-5" aria-labelledby="chart-title">
        <div class="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="chart-title" class="font-bold">فروش ۳۰ روز گذشته</h2>
          <p class="text-xs text-muted">سفارش‌های پرداخت‌شده — مبالغ به تومان</p>
        </div>
        <div class="flex h-40 items-end gap-[3px]" role="img" :aria-label="`نمودار فروش روزانه؛ مجموع ${formatToman(data.revenue.last30Days)}`">
          <div v-for="d in data.series" :key="d.date" class="group relative flex h-full flex-1 items-end">
            <div
              class="w-full rounded-t-[3px] transition-colors"
              :class="d.revenueToman ? 'bg-accent-500 group-hover:bg-accent-700' : 'bg-navy-100'"
              :style="{ height: `${Math.max(2, (d.revenueToman / maxRevenue) * 100)}%` }"
            />
            <div class="pointer-events-none absolute bottom-full start-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded-lg bg-navy-900 px-2.5 py-1.5 text-xs whitespace-nowrap text-white group-hover:block rtl:translate-x-1/2">
              {{ dayFmt.format(new Date(d.date)) }} — {{ formatToman(d.revenueToman) }} · {{ faNumber(d.orders) }} سفارش
            </div>
          </div>
        </div>
        <div class="mt-2 flex justify-between text-xs text-muted">
          <span>{{ dayFmt.format(new Date(data.series[0]!.date)) }}</span>
          <span>امروز</span>
        </div>
      </section>

      <div class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section class="card overflow-hidden" aria-labelledby="action-title">
          <div class="flex items-center justify-between border-b border-line px-5 py-3">
            <h2 id="action-title" class="font-bold">سفارش‌های نیازمند اقدام</h2>
            <NuxtLink to="/admin/orders?status=action" class="text-sm font-semibold text-accent-700 hover:underline">همه</NuxtLink>
          </div>
          <UiEmptyState v-if="!data.needsAction.results.length" title="کاری در انتظار نیست" description="سفارش پرداخت‌شده‌ای در صف انجام نیست." />
          <ul v-else class="divide-y divide-line">
            <li v-for="o in data.needsAction.results" :key="o.id">
              <NuxtLink :to="`/admin/orders/${o.id}`" class="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 hover:bg-navy-50/60">
                <span class="ltr font-mono text-sm font-semibold">{{ o.number }}</span>
                <span class="min-w-0 flex-1 truncate text-sm">{{ o.firstItemName }} <span class="text-muted">— {{ o.user.fullName }}</span></span>
                <UiBadge v-if="o.needsReview" tone="danger">بررسی</UiBadge>
                <OrderStatusBadge kind="order" :status="o.status" />
                <span class="text-xs text-muted">{{ formatDateTime(o.createdAt) }}</span>
              </NuxtLink>
            </li>
          </ul>
        </section>

        <div class="space-y-6">
          <section class="card overflow-hidden" aria-labelledby="stock-title">
            <div class="flex items-center gap-2 border-b border-line px-5 py-3">
              <PackageX class="size-4 text-amber-600" aria-hidden="true" />
              <h2 id="stock-title" class="font-bold">کمبود موجودی کد</h2>
            </div>
            <p v-if="!data.lowStock.length" class="px-5 py-6 text-sm text-muted">موجودی همه گزینه‌ها کافی است.</p>
            <ul v-else class="divide-y divide-line">
              <li v-for="v in data.lowStock" :key="v.variantId">
                <NuxtLink :to="`/admin/products/${v.productId}#variants`" class="flex items-center justify-between gap-3 px-5 py-2.5 text-sm hover:bg-navy-50/60">
                  <span class="min-w-0 truncate">{{ v.productName }} — <span class="ltr">{{ v.label }}</span></span>
                  <UiBadge :tone="v.stock === 0 ? 'danger' : 'warning'">{{ faNumber(v.stock) }}</UiBadge>
                </NuxtLink>
              </li>
            </ul>
          </section>

          <section class="card p-5">
            <div class="flex items-center gap-2">
              <Users class="size-4 text-navy-400" aria-hidden="true" />
              <h2 class="font-bold">کاربران</h2>
            </div>
            <p class="tabular mt-2 text-2xl font-extrabold">{{ faNumber(data.users.total) }}</p>
            <p class="text-xs text-muted">{{ faNumber(data.users.newLast30Days) }} عضو جدید در ۳۰ روز اخیر</p>
          </section>
        </div>
      </div>
    </template>
  </div>
</template>
