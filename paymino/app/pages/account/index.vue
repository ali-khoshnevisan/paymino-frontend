<script setup lang="ts">
import { LifeBuoy, Package, ShoppingBag } from 'lucide-vue-next'
import type { OrderListItem } from '#shared/types'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'پیشخوان', robots: 'noindex' })

const auth = useAuthStore()
const api = useApi()
const { data, status, error, refresh } = await useAsyncData('account:orders:all', () => api<{ count: number; results: OrderListItem[] }>('/orders'))

const active = computed(() => (data.value?.results ?? []).filter((o) => !['completed', 'cancelled', 'refunded', 'failed'].includes(o.status)))
const completedCount = computed(() => (data.value?.results ?? []).filter((o) => o.status === 'completed').length)
const awaitingPay = computed(() => (data.value?.results ?? []).filter((o) => o.status === 'pending_payment').length)
</script>

<template>
  <AccountShell :title="`سلام، ${auth.user?.fullName.split(' ')[0] ?? ''}`" subtitle="خلاصه وضعیت سفارش‌ها و حساب شما">
    <UiAlert v-if="auth.user && !auth.user.emailVerified" tone="warning" title="ایمیل شما هنوز تأیید نشده است" class="mb-6">
      برای دریافت اطلاع‌رسانی سفارش‌ها، ایمیل خود را تأیید کنید.
      <NuxtLink to="/auth/verify" class="ms-1 font-semibold underline">تأیید ایمیل</NuxtLink>
    </UiAlert>

    <div class="mb-6 grid gap-3 sm:grid-cols-3">
      <div class="card p-5">
        <p class="text-sm text-muted">سفارش‌های جاری</p>
        <p class="tabular mt-1 text-2xl font-extrabold">{{ status === 'pending' && !data ? '—' : faNumber(active.length) }}</p>
      </div>
      <div class="card p-5">
        <p class="text-sm text-muted">در انتظار پرداخت</p>
        <p class="tabular mt-1 text-2xl font-extrabold" :class="awaitingPay ? 'text-amber-700' : ''">{{ status === 'pending' && !data ? '—' : faNumber(awaitingPay) }}</p>
      </div>
      <div class="card p-5">
        <p class="text-sm text-muted">سفارش‌های تکمیل‌شده</p>
        <p class="tabular mt-1 text-2xl font-extrabold">{{ status === 'pending' && !data ? '—' : faNumber(completedCount) }}</p>
      </div>
    </div>

    <section class="card overflow-hidden" aria-labelledby="recent-title">
      <div class="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 id="recent-title" class="font-bold">آخرین سفارش‌ها</h2>
        <NuxtLink to="/account/orders" class="text-sm font-semibold text-accent-700 hover:underline">همه سفارش‌ها</NuxtLink>
      </div>
      <div v-if="status === 'pending' && !data" class="space-y-3 p-5" aria-busy="true">
        <div v-for="i in 3" :key="i" class="skeleton h-12" />
      </div>
      <UiErrorState v-else-if="error" :message="normalizeApiError(error).message" @retry="refresh()" />
      <UiEmptyState v-else-if="!data?.results.length" :icon="ShoppingBag" title="هنوز سفارشی ثبت نکرده‌اید" description="پس از ثبت اولین سفارش، وضعیت آن را اینجا می‌بینید.">
        <UiButton to="/shop" variant="accent">مشاهده محصولات</UiButton>
      </UiEmptyState>
      <ul v-else class="divide-y divide-line">
        <OrderRow v-for="o in data.results.slice(0, 5)" :key="o.id" :order="o" />
      </ul>
    </section>

    <div class="mt-6 grid gap-3 sm:grid-cols-2">
      <NuxtLink to="/account/orders" class="card flex items-center gap-3 p-4 hover:border-navy-200">
        <Package class="size-5 text-navy-500" aria-hidden="true" />
        <span class="font-medium">پیگیری سفارش‌ها و دریافت کدها</span>
      </NuxtLink>
      <NuxtLink to="/account/support" class="card flex items-center gap-3 p-4 hover:border-navy-200">
        <LifeBuoy class="size-5 text-navy-500" aria-hidden="true" />
        <span class="font-medium">درخواست پشتیبانی</span>
      </NuxtLink>
    </div>
  </AccountShell>
</template>
