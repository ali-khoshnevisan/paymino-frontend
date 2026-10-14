<script setup lang="ts">
// Original homepage hero — first slide of HomeHeroSlider. Content unchanged.
import { ArrowLeft } from 'lucide-vue-next'

const sampleLines = [
  { label: 'گیفت کارت استیم', variant: '$20', value: 2_226_000 },
  { label: 'کارمزد خدمات', variant: '', value: 45_000 },
]
</script>

<template>
  <section class="relative h-full overflow-hidden bg-navy-900">
    <div class="pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden="true" style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 22px 22px" />
    <!-- Extra bottom padding leaves room for the slider controls -->
    <div class="container-page relative grid items-center gap-10 pt-14 pb-24 sm:pt-20 lg:grid-cols-[1.15fr_1fr] lg:py-24">
      <div>
        <p class="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-accent-200">
          <span class="size-1.5 rounded-full bg-accent-400" aria-hidden="true" />
          پرداخت سرویس‌های دیجیتال بین‌المللی
        </p>
        <h1 class="text-3xl leading-[1.5] font-extrabold text-white sm:text-4xl lg:text-[44px]">
          گیفت کارت و اشتراک بین‌المللی،
          <span class="text-accent-300">با قیمت روشن به تومان</span>
        </h1>
        <p class="mt-5 max-w-xl text-base leading-8 text-navy-200 sm:text-lg">
          استیم، اپل، پلی‌استیشن، تریدینگ‌ویو و سرویس‌های هوش مصنوعی. مبلغ نهایی را پیش از پرداخت ببینید و وضعیت سفارش را مرحله به مرحله دنبال کنید.
        </p>
        <div class="mt-8 flex flex-wrap items-center gap-3">
          <UiButton to="/shop" variant="accent" size="lg">
            مشاهده محصولات
            <ArrowLeft class="size-5" aria-hidden="true" />
          </UiButton>
          <NuxtLink to="#how-it-works" class="px-3 py-2 text-sm font-medium text-navy-200 underline-offset-4 hover:text-white hover:underline">
            روند خرید چطور است؟
          </NuxtLink>
        </div>
      </div>

      <!-- Illustrative invoice: explains the pricing model, clearly labeled as an example -->
      <div class="mx-auto w-full max-w-sm lg:me-0" aria-label="نمونه نمایش قیمت">
        <div class="rounded-2xl bg-white p-5 shadow-2xl shadow-navy-950/40">
          <div class="flex items-center justify-between">
            <p class="text-sm font-bold">خلاصه سفارش</p>
            <UiBadge tone="neutral">نمونه</UiBadge>
          </div>
          <dl class="mt-4 space-y-3 text-sm">
            <div v-for="l in sampleLines" :key="l.label" class="flex justify-between gap-4">
              <dt class="text-muted">{{ l.label }} <bdi v-if="l.variant" class="ltr">{{ l.variant }}</bdi></dt>
              <dd class="tabular font-medium">{{ formatToman(l.value) }}</dd>
            </div>
            <div class="flex justify-between gap-4 border-t border-dashed border-line pt-3">
              <dt class="font-bold">مبلغ نهایی</dt>
              <dd class="tabular font-extrabold">{{ formatToman(2_271_000) }}</dd>
            </div>
          </dl>
          <div class="mt-4 rounded-xl bg-canvas p-3 text-xs leading-6 text-muted">
            <div class="flex justify-between">
              <span>معادل پرداخت</span>
              <span class="ltr font-semibold text-navy-800">21.53 USDT · TRC20</span>
            </div>
            <div class="flex justify-between">
              <span>نرخ تبدیل</span>
              <span class="tabular">{{ formatToman(105_500) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>