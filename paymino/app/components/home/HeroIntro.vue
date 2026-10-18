<script setup lang="ts">
// First slide of HomeHeroSlider: what Paymino sells and how the price is shown.
import { ArrowLeft } from 'lucide-vue-next'

const sampleLines = [
  { label: 'گیفت کارت استیم', variant: '$20', value: 2_226_000 },
  { label: 'کارمزد خدمات', variant: '', value: 45_000 },
]

const facts = [
  { icon: 'check', text: 'مبلغ نهایی پیش از پرداخت' },
  { icon: 'lock', text: 'پرداخت با تتر و ارز دیجیتال' },
  { icon: 'rocket', text: 'تحویل کد در پنل کاربری' },
]
</script>

<template>
  <section class="relative h-full overflow-hidden bg-navy-900">
    <!-- Extra bottom padding leaves room for the slider controls -->
    <div class="container-page relative grid items-center gap-12 pt-12 pb-10 sm:pt-16 sm:pb-28 lg:grid-cols-[1.2fr_1fr] lg:gap-8 lg:py-20 lg:pb-28">
      <div>
        <h1 class="text-[27px] leading-[1.5] font-black tracking-[-0.01em] text-white sm:text-5xl sm:leading-[1.4] xl:text-[56px]">
          گیفت کارت و اشتراک جهانی،
          <span class="block">با قیمت روشن به تومان</span>
        </h1>
        <p class="mt-5 max-w-xl text-base leading-8 text-navy-100 sm:text-lg sm:leading-9">
          استیم، اپل، پلی‌استیشن، تریدینگ‌ویو و سرویس‌های هوش مصنوعی. مبلغ نهایی را پیش از پرداخت ببینید و سفارش را مرحله به مرحله دنبال کنید.
        </p>
        <div class="mt-8 flex flex-wrap items-center gap-3">
          <UiButton to="/shop" variant="accent" size="lg">
            مشاهده محصولات
            <ArrowLeft class="size-5" aria-hidden="true" />
          </UiButton>
          <NuxtLink to="#how-it-works" class="rounded-[var(--radius-control)] px-4 py-3 font-semibold text-white hover:bg-white/10">
            روند خرید چطور است؟
          </NuxtLink>
        </div>
        <ul class="mt-10 grid gap-3 sm:grid-cols-3 sm:gap-4">
          <li v-for="f in facts" :key="f.icon" class="flex items-center gap-3 text-[15px] leading-6 text-navy-100">
            <UiIcon3d :name="f.icon" eager class="size-10 shrink-0" />
            {{ f.text }}
          </li>
        </ul>
      </div>

      <!-- Illustrative order: a Steam card behind its price breakdown, clearly labeled as an example -->
      <div class="relative mx-auto w-full max-w-[26rem] pt-16 pe-8 sm:pt-20 lg:me-0" aria-label="نمونه نمایش قیمت">
        <div class="absolute top-0 end-0 w-[78%] [perspective:50em]" aria-hidden="true">
          <div
              class="hero-card ltr flex aspect-[1.586] flex-col justify-between rounded-2xl bg-[#66c0f4] p-5 text-[#1b2838] shadow-[0_30px_50px_-20px_rgb(0_0_0/0.6)]"
          >
            <div>
              <p class="text-2xl leading-none font-extrabold tracking-[-0.02em]">Steam</p>
              <p class="mt-1.5 text-sm font-semibold text-[#1b2838]/70">Gift Card</p>
            </div>
            <p class="text-end text-5xl leading-none font-black text-[#1b2838]">$20</p>
          </div>
        </div>

        <div class="relative rounded-2xl bg-white p-5 shadow-[0_30px_60px_-24px_rgb(0_0_0/0.55)]">
          <div class="flex items-center justify-between">
            <p class="font-bold">خلاصه سفارش</p>
            <UiBadge tone="neutral">نمونه</UiBadge>
          </div>
          <dl class="mt-4 space-y-3 text-sm">
            <div v-for="l in sampleLines" :key="l.label" class="flex justify-between gap-4">
              <dt class="text-muted">{{ l.label }} <bdi v-if="l.variant" class="ltr">{{ l.variant }}</bdi></dt>
              <dd class="tabular font-medium">{{ formatToman(l.value) }}</dd>
            </div>
            <div class="flex items-baseline justify-between gap-4 rounded-xl bg-canvas px-3 py-3">
              <dt class="font-bold">مبلغ نهایی</dt>
              <dd class="tabular text-lg font-black">{{ formatToman(2_271_000) }}</dd>
            </div>
          </dl>
          <div class="mt-3 px-1 text-xs leading-6 text-muted">
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

        <UiIcon3d name="coin" eager class="hero-float absolute top-2 start-24 w-16 drop-shadow-[0_18px_18px_rgb(0_0_0/0.35)] sm:start-28 sm:w-20" />
        <UiIcon3d name="gift" eager class="hero-float hero-float--late absolute -top-4 start-0 w-20 drop-shadow-[0_18px_18px_rgb(0_0_0/0.35)] sm:w-24" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-card {
  transform: rotateX(14deg) rotateY(18deg) rotateZ(6deg);
}
.hero-float {
  animation: hero-float 6s ease-in-out infinite;
}
.hero-float--late {
  animation-delay: -3s;
}
@keyframes hero-float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(-4deg);
  }
}
</style>
