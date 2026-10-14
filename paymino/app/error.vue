<script setup lang="ts">
import type { NuxtError } from '#app'
const props = defineProps<{ error: NuxtError }>()
const is404 = computed(() => props.error.statusCode === 404)
useSeoMeta({ title: is404.value ? 'صفحه یافت نشد' : 'خطا' })
const handle = () => clearError({ redirect: '/' })
</script>

<template>
  <NuxtLayout>
    <div class="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p class="tabular text-6xl font-extrabold text-navy-100">{{ faNumber(error.statusCode || 500) }}</p>
      <h1 class="mt-4 text-2xl font-extrabold">{{ is404 ? 'صفحه‌ای که دنبالش هستید پیدا نشد' : 'مشکلی پیش آمد' }}</h1>
      <p class="mt-2 max-w-md text-[15px] leading-8 text-muted">
        {{ is404 ? (error.statusMessage && /[؀-ۿ]/.test(error.statusMessage) ? error.statusMessage : 'ممکن است آدرس اشتباه باشد یا این صفحه حذف شده باشد.') : 'لطفاً چند لحظه بعد دوباره تلاش کنید.' }}
      </p>
      <div class="mt-6 flex gap-3">
        <UiButton @click="handle">بازگشت به صفحه اصلی</UiButton>
        <UiButton to="/shop" variant="secondary" @click="clearError()">مشاهده محصولات</UiButton>
      </div>
    </div>
  </NuxtLayout>
</template>
