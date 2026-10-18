<script setup lang="ts">
import { ArrowLeft, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-vue-next'

/**
 * Homepage hero slider. Slide 1 is the original hero (HomeHeroIntro); the rest are image banners
 * (public/banners, made from the designs in public/brands/*-banner.png) that carry their own text,
 * with one real button placed under that text.
 * Crossfade (no horizontal track), so RTL needs no special math and height never jumps:
 * all slides share one grid cell and the tallest (slide 1) sets the height.
 */
interface Promo {
  key: string
  image: string // full-size banner (2011×782)
  imageSmall: string // 1000px wide, for phones
  alt: string // the text printed on the banner
  label: string // for the slide picker
  cta: string
  to: string
  background: string // banner edge colour, fills the slide around the image on phones
  buttonClass: string
}

// Banner geometry: every banner is 2011×782 and its text block starts ~8.5% from the left,
// with room for the button under the subtitle at ~64% of the height.
const BANNER_RATIO = 2011 / 782

const promos: Promo[] = [
  {
    key: 'chatgpt',
    image: '/banners/chatgpt.webp',
    imageSmall: '/banners/chatgpt-1000.webp',
    alt: 'شارژ اکانت ChatGPT — دسترسی به تمام امکانات و اشتراک‌های ChatGPT Plus و Pro',
    label: 'شارژ اکانت ChatGPT',
    cta: 'خرید اشتراک',
    to: '/p/chatgpt-plus',
    background: '#062a31',
    buttonClass: 'bg-[#10a37f] text-white hover:bg-[#0e8f70] focus-visible:outline-white',
  },
  {
    key: 'tradingview',
    image: '/banners/tradingview.webp',
    imageSmall: '/banners/tradingview-1000.webp',
    alt: 'شارژ اکانت TradingView — دسترسی به تمام امکانات و ابزارهای تحلیل تریدینگ‌ویو',
    label: 'شارژ اکانت TradingView',
    cta: 'خرید اشتراک',
    to: '/p/tradingview-subscription',
    background: '#081a3a',
    buttonClass: 'bg-[#2962ff] text-white hover:bg-[#1e53e5] focus-visible:outline-white',
  },
  {
    key: 'claude',
    image: '/banners/claude.webp',
    imageSmall: '/banners/claude-1000.webp',
    alt: 'شارژ اکانت Claude — دسترسی به تمام امکانات هوش مصنوعی کلاود',
    label: 'شارژ اکانت Claude',
    cta: 'مشاهده خدمات',
    to: '/c/ai',
    background: '#000000',
    buttonClass: 'bg-[#2a140c] text-white hover:bg-[#3d1d10] focus-visible:outline-white',
  },
]

const total = promos.length + 1
const labels = ['معرفی پی‌مینو', ...promos.map((p) => p.label)]
const AUTOPLAY_MS = 7000

const current = ref(0)
const hovering = ref(false)
const focusWithin = ref(false)
const stopped = ref(false) // user took control → no more auto rotation
const userPaused = ref(false)
const reducedMotion = ref(false)

const autoplayActive = computed(() => !reducedMotion.value && !stopped.value && !userPaused.value)
// Phones show slide 1 alone and the banners as a swipeable row under it (a banner in a slide as tall as slide 1 would be a thin strip)
const isPhone = ref(false)
const running = computed(() => autoplayActive.value && !hovering.value && !focusWithin.value && !isPhone.value)

function go(i: number, byUser = true) {
  if (isPhone.value) return
  current.value = (i + total) % total
  if (byUser) stopped.value = true
}
const next = (byUser = true) => go(current.value + 1, byUser)
const prev = () => go(current.value - 1)

let timer: ReturnType<typeof setTimeout> | undefined
function schedule() {
  clearTimeout(timer)
  if (!import.meta.client || !running.value) return
  timer = setTimeout(() => {
    if (document.visibilityState === 'visible') next(false)
    else schedule()
  }, AUTOPLAY_MS)
}
watch([current], schedule)

function togglePause() {
  if (autoplayActive.value) userPaused.value = true
  else {
    userPaused.value = false
    stopped.value = false
  }
}

// Keyboard (RTL: left arrow moves forward)
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    next()
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    prev()
  }
}

// Touch swipe (RTL: swiping right reveals the next slide)
let startX = 0
let startY = 0
const tracking = ref(false)
function onPointerDown(e: PointerEvent) {
  if (e.pointerType === 'mouse') return
  tracking.value = true
  startX = e.clientX
  startY = e.clientY
}
function onPointerUp(e: PointerEvent) {
  if (!tracking.value) return
  tracking.value = false
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) {
    if (dx > 0) next()
    else prev()
  }
}

onMounted(() => {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = mq.matches
  mq.addEventListener('change', (e) => (reducedMotion.value = e.matches))
  const phone = window.matchMedia('(max-width: 639px)')
  const setPhone = (matches: boolean) => {
    isPhone.value = matches
    if (matches) current.value = 0
    schedule()
  }
  setPhone(phone.matches)
  phone.addEventListener('change', (e) => setPhone(e.matches))
})
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <section
      class="relative touch-pan-y overflow-hidden bg-navy-900"
      aria-roledescription="carousel"
      aria-label="معرفی خدمات پی‌مینو"
      @mouseenter="hovering = true"
      @mouseleave="hovering = false"
      @focusin="focusWithin = true"
      @focusout="focusWithin = false"
      @keydown="onKeydown"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
      @pointercancel="tracking = false"
  >
    <div class="grid" :aria-live="running ? 'off' : 'polite'">
      <!-- Slide 1: original hero -->
      <div
          class="col-start-1 row-start-1 transition-opacity duration-700 ease-out"
          :class="current === 0 ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0'"
          role="group"
          aria-roledescription="slide"
          :aria-label="`${faNumber(1)} از ${faNumber(total)}`"
          :aria-hidden="current !== 0"
          :inert="current !== 0"
      >
        <HomeHeroIntro />
      </div>

      <!-- Promo slides -->
      <div
          v-for="(p, i) in promos"
          :key="p.key"
          class="col-start-1 row-start-1 hidden transition-opacity duration-700 ease-out sm:block"
          :class="current === i + 1 ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0'"
          role="group"
          aria-roledescription="slide"
          :aria-label="`${faNumber(i + 2)} از ${faNumber(total)}: ${p.label}`"
          :aria-hidden="current !== i + 1"
          :inert="current !== i + 1"
      >
        <!-- The slide is a size container: on sm+ the banner covers it (cropping a little at the edges),
             on phones the whole banner shows on its own edge colour -->
        <div class="relative h-full min-h-48 overflow-hidden [container-type:size]" :style="{ background: p.background }">
          <div class="banner absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" :style="{ '--ratio': BANNER_RATIO }">
            <picture>
              <source media="(max-width: 639px)" :srcset="p.imageSmall" />
              <img
                  :src="p.image"
                  :alt="p.alt"
                  width="2011"
                  height="782"
                  :loading="i === 0 ? 'eager' : 'lazy'"
                  decoding="async"
                  draggable="false"
                  class="block size-full select-none"
              />
            </picture>
            <NuxtLink
                :to="p.to"
                class="absolute top-[64%] left-[8.5%] inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 sm:h-11 sm:gap-2 sm:px-6 sm:text-base lg:h-12 lg:px-7"
                :class="p.buttonClass"
            >
              {{ p.cta }}
              <ArrowLeft class="size-4 sm:size-5" aria-hidden="true" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Phones: the banners as a swipeable row of cards under slide 1 -->
    <ul class="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-6 [scrollbar-width:none] sm:hidden [&::-webkit-scrollbar]:hidden" aria-label="پیشنهادهای ویژه">
      <li
          v-for="p in promos"
          :key="p.key"
          class="relative w-[88%] shrink-0 snap-center overflow-hidden rounded-2xl"
          :style="{ background: p.background, aspectRatio: BANNER_RATIO }"
      >
        <img :src="p.imageSmall" :alt="p.alt" width="1000" height="389" loading="lazy" decoding="async" draggable="false" class="block size-full select-none" />
        <NuxtLink
            :to="p.to"
            class="absolute top-[64%] left-[8.5%] inline-flex h-7 items-center gap-1 rounded-full px-3 text-[11px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            :class="p.buttonClass"
        >
          {{ p.cta }}
          <ArrowLeft class="size-3.5" aria-hidden="true" />
        </NuxtLink>
      </li>
    </ul>

    <!-- Controls -->
    <div class="pointer-events-none absolute inset-x-0 bottom-5 z-20 hidden justify-center sm:flex">
      <div class="pointer-events-auto flex items-center gap-1.5 rounded-full bg-black/30 p-1.5 ring-1 ring-white/15 backdrop-blur-md">
        <button
            type="button"
            class="flex size-9 items-center justify-center rounded-full text-white hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white"
            aria-label="اسلاید قبلی"
            @click="prev"
        >
          <ChevronRight class="size-5" aria-hidden="true" />
        </button>

        <div class="flex items-center gap-1.5 px-1" role="group" aria-label="انتخاب اسلاید">
          <button
              v-for="(label, i) in labels"
              :key="i"
              type="button"
              class="flex h-9 items-center justify-center focus-visible:outline-2 focus-visible:outline-white"
              :aria-label="`اسلاید ${faNumber(i + 1)}: ${label}`"
              :aria-current="current === i ? 'true' : undefined"
              @click="go(i)"
          >
            <span class="block h-2 rounded-full transition-all duration-300" :class="current === i ? 'w-6 bg-white' : 'w-2 bg-white/45 hover:bg-white/70'" />
          </button>
        </div>

        <button
            type="button"
            class="flex size-9 items-center justify-center rounded-full text-white hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white"
            aria-label="اسلاید بعدی"
            @click="next()"
        >
          <ChevronLeft class="size-5" aria-hidden="true" />
        </button>

        <ClientOnly>
          <button
              v-if="!reducedMotion"
              type="button"
              class="flex size-9 items-center justify-center rounded-full text-white/80 hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
              :aria-label="autoplayActive ? 'توقف نمایش خودکار' : 'ادامه نمایش خودکار'"
              :aria-pressed="!autoplayActive"
              @click="togglePause"
          >
            <Pause v-if="autoplayActive" class="size-4" aria-hidden="true" />
            <Play v-else class="size-4" aria-hidden="true" />
          </button>
        </ClientOnly>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Phones: the banner at full width. sm+: wide enough to cover the slide in both directions. */
.banner {
  width: 100cqw;
  aspect-ratio: var(--ratio);
}
@media (min-width: 40rem) {
  .banner {
    width: max(100cqw, 100cqh * var(--ratio));
  }
}
</style>
