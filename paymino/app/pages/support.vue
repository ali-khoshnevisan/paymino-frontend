<script setup lang="ts">
import { Clock, Mail, Send, ShieldAlert } from 'lucide-vue-next'
useSeoMeta({ title: 'پشتیبانی', description: 'راه‌های ارتباط با پشتیبانی پی‌مینو' })
const config = useAppConfig()
const auth = useAuthStore()
</script>

<template>
  <div class="container-page max-w-3xl py-10">
    <UiBreadcrumbs :items="[{ label: 'پشتیبانی' }]" />
    <h1 class="mt-4 text-2xl font-extrabold sm:text-3xl">پشتیبانی</h1>
    <p class="section-subtitle">برای پیگیری سریع‌تر، درخواست را از پنل کاربری و با شماره سفارش ثبت کنید.</p>

    <div class="mt-8 grid gap-4 sm:grid-cols-3">
      <a :href="`mailto:${config.support.email}`" class="card flex flex-col gap-2 p-5 hover:border-navy-200">
        <Mail class="size-5 text-accent-600" aria-hidden="true" />
        <span class="text-sm text-muted">ایمیل</span>
        <span class="ltr text-sm font-semibold break-anywhere">{{ config.support.email }}</span>
      </a>
      <a :href="`https://t.me/${config.support.telegram}`" target="_blank" rel="noopener" class="card flex flex-col gap-2 p-5 hover:border-navy-200">
        <Send class="size-5 text-accent-600" aria-hidden="true" />
        <span class="text-sm text-muted">تلگرام</span>
        <span class="ltr text-sm font-semibold">@{{ config.support.telegram }}</span>
      </a>
      <div class="card flex flex-col gap-2 p-5">
        <Clock class="size-5 text-accent-600" aria-hidden="true" />
        <span class="text-sm text-muted">ساعات پاسخ‌گویی</span>
        <span class="text-sm font-semibold">{{ config.support.hours }}</span>
      </div>
    </div>

    <div class="card mt-6 p-6">
      <h2 class="font-bold">ثبت درخواست پشتیبانی</h2>
      <p class="mt-1 text-sm leading-7 text-muted">درخواست‌های ثبت‌شده در پنل به سفارش شما متصل می‌شوند و پاسخ‌ها همان‌جا نمایش داده می‌شود.</p>
      <UiButton :to="auth.isLoggedIn ? '/account/support' : { path: '/auth/login', query: { redirect: '/account/support' } }" class="mt-4">
        {{ auth.isLoggedIn ? 'رفتن به بخش پشتیبانی' : 'ورود و ثبت درخواست' }}
      </UiButton>
    </div>

    <UiAlert tone="warning" class="mt-6">
      <span class="inline-flex items-center gap-1.5 font-semibold"><ShieldAlert class="size-4" aria-hidden="true" />هشدار امنیتی:</span>
      پشتیبانی پی‌مینو هرگز رمز عبور، کد گیفت کارت یا کلید خصوصی کیف پول شما را درخواست نمی‌کند.
    </UiAlert>
  </div>
</template>
