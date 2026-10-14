<script setup lang="ts">
import { Headset, Mail, Send } from 'lucide-vue-next'
const config = useAppConfig()
const auth = useAuthStore()
</script>

<template>
  <div class="card flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center">
    <div class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent-50 text-accent-700">
      <Headset class="size-7" aria-hidden="true" />
    </div>
    <div class="flex-1">
      <h2 class="text-xl font-bold">سؤالی درباره سفارش دارید؟</h2>
      <p class="mt-1 text-[15px] leading-7 text-muted">
        تیم پشتیبانی {{ config.support.hours }} پاسخ‌گوست. برای پیگیری سریع‌تر، شماره سفارش را همراه درخواست ارسال کنید.
      </p>
      <div class="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <a :href="`mailto:${config.support.email}`" class="inline-flex items-center gap-2 text-navy-700 hover:text-accent-700">
          <Mail class="size-4" aria-hidden="true" /><span class="ltr">{{ config.support.email }}</span>
        </a>
        <a :href="`https://t.me/${config.support.telegram}`" target="_blank" rel="noopener" class="inline-flex items-center gap-2 text-navy-700 hover:text-accent-700">
          <Send class="size-4" aria-hidden="true" /><span class="ltr">@{{ config.support.telegram }}</span>
        </a>
      </div>
    </div>
    <UiButton :to="auth.isLoggedIn ? '/account/support' : '/support'" variant="primary">ثبت درخواست پشتیبانی</UiButton>
  </div>
</template>
