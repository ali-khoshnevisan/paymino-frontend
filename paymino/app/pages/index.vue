<script setup lang="ts">
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

// The category with the most products leads the grid as the large tile.
const sortedCategories = computed(() => [...categories.value].sort((a, b) => b.productCount - a.productCount))

const steps = [
  { icon: 'bag', title: 'انتخاب محصول', text: 'گیفت کارت یا سرویس موردنظر را با منطقه و مبلغ مناسب انتخاب کنید.' },
  { icon: 'receipt', title: 'بررسی قیمت نهایی', text: 'قیمت محصول، کارمزد و مبلغ نهایی به تومان پیش از پرداخت نمایش داده می‌شود.' },
  { icon: 'coin', title: 'پرداخت با ارز دیجیتال', text: 'ارز و شبکه را انتخاب کنید و مبلغ دقیق را به آدرس فاکتور ارسال کنید.' },
  { icon: 'package', title: 'پیگیری و تحویل', text: 'وضعیت پرداخت و سفارش را در پنل ببینید و کد یا نتیجه را همان‌جا دریافت کنید.' },
]

const benefits = [
  { icon: 'magnifier', title: 'قیمت شفاف', text: 'قیمت محصول، کارمزد خدمات و نرخ تبدیل ارز جداگانه و پیش از پرداخت نمایش داده می‌شود.' },
  { icon: 'shield', title: 'پرداخت تأییدشده در سرور', text: 'وضعیت پرداخت فقط پس از تأیید تراکنش توسط درگاه و بررسی مبلغ و شبکه تغییر می‌کند.' },
  { icon: 'headphone', title: 'پشتیبانی در دسترس', text: 'برای هر سفارش می‌توانید از داخل پنل درخواست پشتیبانی ثبت و پیگیری کنید.' },
]
</script>

<template>
  <div>
    <HomeHeroSlider />

    <!-- Categories -->
    <section class="container-page pt-16 sm:pt-24" aria-labelledby="cat-title">
      <div class="mb-8 flex items-end justify-between gap-4">
        <h2 id="cat-title" v-reveal class="text-2xl font-black sm:text-4xl">چه چیزی لازم دارید؟</h2>
        <NuxtLink to="/shop" class="shrink-0 font-bold text-accent-700 hover:underline">همه محصولات</NuxtLink>
      </div>
      <div v-if="catStatus === 'pending' && !categories.length" class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div class="skeleton col-span-2 h-56 rounded-[22px] lg:row-span-2 lg:h-auto" />
        <div v-for="i in 4" :key="i" class="skeleton h-40 rounded-[22px]" />
      </div>
      <div v-else class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <CatalogCategoryCard
            v-for="(c, i) in sortedCategories"
            :key="c.slug"
            :category="c"
            v-reveal="i * 70"
            :featured="i === 0"
            :class="i === 0 ? 'col-span-2 lg:row-span-2' : ''"
        />
      </div>
    </section>

    <!-- Popular -->
    <section class="container-page pt-20 sm:pt-28" aria-labelledby="pop-title">
      <div class="mb-8 flex items-end justify-between gap-4">
        <div v-reveal>
          <h2 id="pop-title" class="text-2xl font-black sm:text-4xl">پرفروش‌های این هفته</h2>
          <p class="mt-2 text-muted sm:text-lg">گیفت کارت‌ها و اشتراک‌هایی که بیشتر سفارش داده می‌شوند</p>
        </div>
        <NuxtLink to="/shop" class="shrink-0 font-bold text-accent-700 hover:underline">مشاهده همه</NuxtLink>
      </div>
      <div v-if="popStatus === 'pending' && !popular" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        <CatalogProductCardSkeleton v-for="i in 4" :key="i" />
      </div>
      <div v-else-if="popError" class="card">
        <UiErrorState :message="normalizeApiError(popError).message" @retry="refreshPopular()" />
      </div>
      <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        <CatalogProductCard v-for="(p, i) in popular?.results" :key="p.id" v-reveal="(i % 4) * 70" :product="p" />
      </div>
    </section>

    <!-- How it works -->
    <section id="how-it-works" class="container-page scroll-mt-28 pt-20 sm:pt-28" aria-labelledby="how-title">
      <div v-reveal class="rounded-[28px] bg-navy-900 px-5 py-10 text-white sm:px-10 sm:py-14 lg:px-14 lg:py-16">
        <h2 id="how-title" class="max-w-2xl text-2xl leading-snug font-black text-white sm:text-4xl sm:leading-snug">از انتخاب تا تحویل، در چهار قدم روشن</h2>
        <ol class="mt-10 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
          <li v-for="(s, i) in steps" :key="s.title" v-reveal="120 + i * 80" class="group">
            <UiIcon3d :name="s.icon" class="size-20 drop-shadow-[0_16px_16px_rgb(0_0_0/0.35)] transition-transform duration-500 group-hover:-translate-y-1.5 sm:size-24" />
            <h3 class="mt-5 text-lg font-extrabold text-white">{{ s.title }}</h3>
            <p class="mt-2 leading-8 text-navy-100">{{ s.text }}</p>
          </li>
        </ol>
      </div>
    </section>

    <!-- Benefits -->
    <section class="container-page pt-20 sm:pt-28" aria-labelledby="ben-title">
      <div class="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
        <div v-reveal class="lg:sticky lg:top-28 lg:self-start">
          <h2 id="ben-title" class="text-2xl leading-snug font-black sm:text-4xl sm:leading-snug">خرید دیجیتال، بدون حدس و گمان</h2>
          <p class="mt-4 max-w-md text-lg leading-9 text-navy-700">
            هر عددی که می‌پردازید پیش از پرداخت روی صفحه است، و هر مرحله از سفارش در پنل شما ثبت می‌شود.
          </p>
        </div>
        <ul class="grid gap-3">
          <li v-for="(b, i) in benefits" :key="b.title" v-reveal="i * 80" class="flex items-center gap-5 rounded-[22px] bg-white p-5 sm:gap-7 sm:p-7">
            <UiIcon3d :name="b.icon" class="size-20 shrink-0 sm:size-24" />
            <div>
              <h3 class="text-lg font-extrabold sm:text-xl">{{ b.title }}</h3>
              <p class="mt-1.5 leading-8 text-navy-700">{{ b.text }}</p>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- FAQ -->
    <section class="container-page pt-20 sm:pt-28" aria-labelledby="faq-title">
      <div class="grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
        <div v-reveal>
          <h2 id="faq-title" class="text-2xl font-black sm:text-4xl">سؤالات متداول</h2>
          <p class="mt-3 text-lg leading-9 text-navy-700">پاسخ پرتکرارترین پرسش‌ها درباره خرید و پرداخت</p>
          <NuxtLink to="/faq" class="mt-4 inline-block font-bold text-accent-700 hover:underline">همه سؤالات</NuxtLink>
        </div>
        <HomeFaqList v-reveal="80" :items="FAQ.slice(0, 5)" />
      </div>
    </section>

    <!-- Support -->
    <section class="container-page pt-20 pb-4 sm:pt-28" aria-label="پشتیبانی">
      <HomeSupportBlock v-reveal />
    </section>
  </div>
</template>
