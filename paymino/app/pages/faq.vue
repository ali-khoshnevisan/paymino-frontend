<script setup lang="ts">
useSeoMeta({ title: 'سؤالات متداول', description: 'پاسخ پرسش‌های پرتکرار درباره خرید، پرداخت با ارز دیجیتال و تحویل سفارش در پی‌مینو' })
</script>

<template>
  <div class="container-page max-w-3xl py-10">
    <UiBreadcrumbs :items="[{ label: 'سؤالات متداول' }]" />
    <h1 class="mt-4 text-2xl font-extrabold sm:text-3xl">سؤالات متداول</h1>
    <p class="section-subtitle">پاسخ پرسش‌های پرتکرار درباره خرید، پرداخت و تحویل</p>
    <HomeFaqList :items="FAQ" class="mt-8" />
    <div class="mt-10"><HomeSupportBlock /></div>
  </div>
</template>
