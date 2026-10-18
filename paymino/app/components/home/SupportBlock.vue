<script setup lang="ts">
import { Mail, Send } from 'lucide-vue-next'
const config = useAppConfig()
const auth = useAuthStore()
</script>

<template>
  <div class="relative flex flex-col gap-6 overflow-hidden rounded-[28px] bg-accent-100 p-6 sm:p-10 md:flex-row md:items-center md:gap-10">
    <UiIcon3d name="headphone" class="size-24 shrink-0 drop-shadow-[0_16px_16px_rgb(11_31_58/0.2)] sm:size-32" />
    <div class="flex-1">
      <h2 class="text-2xl font-black sm:text-3xl">سؤالی درباره سفارش دارید؟</h2>
      <p class="mt-2 max-w-2xl text-base leading-8 text-navy-800">
        تیم پشتیبانی {{ config.support.hours }} پاسخ‌گوست. برای پیگیری سریع‌تر، شماره سفارش را همراه درخواست ارسال کنید.
      </p>
      <div class="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        <a :href="`mailto:${config.support.email}`" class="inline-flex items-center gap-2 font-medium text-navy-800 hover:text-accent-800">
          <Mail class="size-4" aria-hidden="true" /><span class="ltr">{{ config.support.email }}</span>
        </a>
        <a :href="`https://t.me/${config.support.telegram}`" target="_blank" rel="noopener" class="inline-flex items-center gap-2 font-medium text-navy-800 hover:text-accent-800">
          <Send class="size-4" aria-hidden="true" /><span class="ltr">@{{ config.support.telegram }}</span>
        </a>
      </div>
    </div>
    <UiButton :to="auth.isLoggedIn ? '/account/support' : '/support'" variant="primary" size="lg">ثبت درخواست پشتیبانی</UiButton>
  </div>
</template>
