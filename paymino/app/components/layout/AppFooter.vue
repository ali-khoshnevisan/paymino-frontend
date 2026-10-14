<script setup lang="ts">
import { Mail, Send, Clock } from 'lucide-vue-next'
const { data: categories } = useCategories()
const config = useAppConfig()
const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(new Date())
</script>

<template>
  <footer class="mt-20 bg-navy-950 text-navy-200">
    <div class="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <BrandLogo inverted />
        <p class="mt-4 max-w-xs text-sm leading-7 text-navy-300">{{ config.site.tagline }}، با قیمت شفاف به تومان و پیگیری کامل سفارش.</p>
      </div>

      <nav aria-label="دسته‌بندی‌ها">
        <h2 class="text-sm font-bold text-white">خدمات</h2>
        <ul class="mt-4 space-y-2.5 text-sm">
          <li v-for="c in categories" :key="c.slug">
            <NuxtLink :to="`/c/${c.slug}`" class="hover:text-white">{{ c.name }}</NuxtLink>
          </li>
        </ul>
      </nav>

      <nav aria-label="راهنما و قوانین">
        <h2 class="text-sm font-bold text-white">راهنما و قوانین</h2>
        <ul class="mt-4 space-y-2.5 text-sm">
          <li><NuxtLink to="/faq" class="hover:text-white">سؤالات متداول</NuxtLink></li>
          <li><NuxtLink to="/terms" class="hover:text-white">قوانین و شرایط</NuxtLink></li>
          <li><NuxtLink to="/refund-policy" class="hover:text-white">لغو و بازپرداخت</NuxtLink></li>
          <li><NuxtLink to="/privacy" class="hover:text-white">حریم خصوصی</NuxtLink></li>
        </ul>
      </nav>

      <div>
        <h2 class="text-sm font-bold text-white">پشتیبانی</h2>
        <ul class="mt-4 space-y-3 text-sm">
          <li class="flex items-center gap-2.5">
            <Mail class="size-4 text-accent-300" aria-hidden="true" />
            <a :href="`mailto:${config.support.email}`" class="ltr hover:text-white">{{ config.support.email }}</a>
          </li>
          <li class="flex items-center gap-2.5">
            <Send class="size-4 text-accent-300" aria-hidden="true" />
            <a :href="`https://t.me/${config.support.telegram}`" target="_blank" rel="noopener" class="ltr hover:text-white">@{{ config.support.telegram }}</a>
          </li>
          <li class="flex items-center gap-2.5">
            <Clock class="size-4 text-accent-300" aria-hidden="true" />
            <span>{{ config.support.hours }}</span>
          </li>
        </ul>
      </div>
    </div>
    <div class="border-t border-white/10">
      <div class="container-page flex flex-col gap-2 py-5 text-xs text-navy-400 sm:flex-row sm:items-center sm:justify-between">
        <p>© {{ year }} پی‌مینو. همه حقوق محفوظ است.</p>
        <p>نام‌ها و نشان‌های تجاری متعلق به صاحبان آن‌هاست.</p>
      </div>
    </div>
  </footer>
</template>
