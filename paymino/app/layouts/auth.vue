<script setup lang="ts">
import { ShieldCheck } from 'lucide-vue-next'
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-canvas">
    <header class="container-page flex h-16 items-center justify-between">
      <NuxtLink to="/" aria-label="پی‌مینو — صفحه اصلی"><BrandLogo /></NuxtLink>
      <NuxtLink to="/" class="text-sm text-muted hover:text-navy-900">بازگشت به فروشگاه</NuxtLink>
    </header>
    <main id="main" class="flex flex-1 items-start justify-center px-4 pt-6 pb-16 sm:pt-12">
      <div class="w-full max-w-md">
        <slot />
        <p class="mt-6 flex items-center justify-center gap-2 text-xs text-muted">
          <ShieldCheck class="size-4 text-accent-600" aria-hidden="true" />
          اطلاعات ورود شما به‌صورت امن منتقل و نگهداری می‌شود.
        </p>
      </div>
    </main>
    <UiToaster />
  </div>
</template>
