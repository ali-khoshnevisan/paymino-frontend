<script setup lang="ts">
import { Eye, ListChecks, ReceiptText, ShieldCheck, ShoppingBag, Wallet, Headset } from 'lucide-vue-next'
import type { CatalogFacets, Paginated, ProductListItem } from '#shared/types'

useSeoMeta({
  title: 'خرید گیفت کارت و پرداخت سرویس‌های دیجیتال',
  description: 'گیفت کارت استیم، اپل و پلی‌استیشن، اشتراک تریدینگ‌ویو و سرویس‌های هوش مصنوعی با قیمت شفاف به تومان و پرداخت با ارز دیجیتال.',
})

const api = useApi()
const { data: categories, status: catStatus } = useCategories()
const { data: popular, status: popStatus, error: popError, refresh: refreshPopular } = await useAsyncData('home:popular', () =>
    api<Paginated<ProductListItem> & { facets: CatalogFacets }>('/catalog/products', { query: { ordering: 'popular', pageSize: 8 } }),
)

const steps = [
  { icon: ShoppingBag, title: 'انتخاب محصول', text: 'گیفت کارت یا سرویس موردنظر را با منطقه و مبلغ مناسب انتخاب کنید.' },
  { icon: ReceiptText, title: 'بررسی قیمت نهایی', text: 'قیمت محصول، کارمزد و مبلغ نهایی به تومان پیش از پرداخت نمایش داده می‌شود.' },
  { icon: Wallet, title: 'پرداخت با ارز دیجیتال', text: 'ارز و شبکه را انتخاب کنید و مبلغ دقیق را به آدرس فاکتور ارسال کنید.' },
  { icon: ListChecks, title: 'پیگیری و تحویل', text: 'وضعیت پرداخت و سفارش را در پنل ببینید و کد یا نتیجه را همان‌جا دریافت کنید.' },
]

const benefits = [
  { icon: Eye, title: 'قیمت شفاف', text: 'قیمت محصول، کارمزد خدمات و نرخ تبدیل ارز جداگانه و پیش از پرداخت نمایش داده می‌شود.' },
  { icon: ShieldCheck, title: 'پرداخت تأییدشده در سرور', text: 'وضعیت پرداخت فقط پس از تأیید تراکنش توسط درگاه و بررسی مبلغ و شبکه تغییر می‌کند.' },
  { icon: Headset, title: 'پشتیبانی در دسترس', text: 'برای هر سفارش می‌توانید از داخل پنل درخواست پشتیبانی ثبت و پیگیری کنید.' },
]
</script>

<template>
  <div>
    <!-- Hero slider (slide 1 = original hero) -->
    <HomeHeroSlider />

    <!-- Categories -->
    <section class="container-page pt-14" aria-labelledby="cat-title">
      <div class="mb-6">
        <h2 id="cat-title" class="section-title">دسته‌بندی خدمات</h2>
        <p class="section-subtitle">سرویس موردنظر خود را انتخاب کنید</p>
      </div>
      <div v-if="catStatus === 'pending' && !categories.length" class="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div v-for="i in 5" :key="i" class="skeleton h-40" />
      </div>
      <div v-else class="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <CatalogCategoryCard v-for="c in categories" :key="c.slug" :category="c" />
      </div>
    </section>

    <!-- Popular -->
    <section class="container-page pt-16" aria-labelledby="pop-title">
      <div class="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 id="pop-title" class="section-title">محصولات پرطرفدار</h2>
          <p class="section-subtitle">گیفت کارت‌ها و اشتراک‌هایی که بیشتر سفارش داده می‌شوند</p>
        </div>
        <NuxtLink to="/shop" class="shrink-0 text-sm font-semibold text-accent-700 hover:underline">همه محصولات</NuxtLink>
      </div>
      <div v-if="popStatus === 'pending' && !popular" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CatalogProductCardSkeleton v-for="i in 4" :key="i" />
      </div>
      <div v-else-if="popError" class="card">
        <UiErrorState :message="normalizeApiError(popError).message" @retry="refreshPopular()" />
      </div>
      <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CatalogProductCard v-for="p in popular?.results" :key="p.id" :product="p" />
      </div>
    </section>

    <!-- How it works -->
    <section id="how-it-works" class="container-page scroll-mt-28 pt-20" aria-labelledby="how-title">
      <div class="mb-8 text-center">
        <h2 id="how-title" class="section-title">خرید از پی‌مینو در چهار مرحله</h2>
        <p class="section-subtitle">از انتخاب محصول تا دریافت، همه‌چیز در یک مسیر روشن</p>
      </div>
      <ol class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <li v-for="(s, i) in steps" :key="s.title" class="card relative p-6">
          <span class="tabular absolute top-5 end-5 text-sm font-bold text-navy-200">{{ faNumber(i + 1) }}</span>
          <div class="flex size-11 items-center justify-center rounded-xl bg-navy-900 text-white">
            <component :is="s.icon" class="size-5" aria-hidden="true" />
          </div>
          <h3 class="mt-4 font-bold">{{ s.title }}</h3>
          <p class="mt-1.5 text-sm leading-7 text-muted">{{ s.text }}</p>
        </li>
      </ol>
    </section>

    <!-- Benefits -->
    <section class="container-page pt-16" aria-labelledby="ben-title">
      <h2 id="ben-title" class="sr-only">مزایای پی‌مینو</h2>
      <div class="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line md:grid-cols-3">
        <div v-for="b in benefits" :key="b.title" class="flex gap-4 bg-white p-6">
          <component :is="b.icon" class="mt-1 size-6 shrink-0 text-accent-600" aria-hidden="true" />
          <div>
            <h3 class="font-bold">{{ b.title }}</h3>
            <p class="mt-1 text-sm leading-7 text-muted">{{ b.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="container-page pt-20" aria-labelledby="faq-title">
      <div class="grid gap-8 lg:grid-cols-[1fr_2fr]">
        <div>
          <h2 id="faq-title" class="section-title">سؤالات متداول</h2>
          <p class="section-subtitle">پاسخ پرتکرارترین پرسش‌ها درباره خرید و پرداخت</p>
          <NuxtLink to="/faq" class="mt-4 inline-block text-sm font-semibold text-accent-700 hover:underline">همه سؤالات</NuxtLink>
        </div>
        <HomeFaqList :items="FAQ.slice(0, 5)" />
      </div>
    </section>

    <!-- Support -->
    <section class="container-page pt-16" aria-label="پشتیبانی">
      <HomeSupportBlock />
    </section>
  </div>
</template>