<script setup lang="ts">
import { ArrowLeft, ChevronLeft, ChevronRight, Gamepad2, MessageCircle, Pause, Play, Sparkles } from 'lucide-vue-next'
import type { Component } from 'vue'

/**
 * Homepage hero slider. Slide 1 is the original hero (HomeHeroIntro); the rest are promos
 * in a "3D app tile on a podium" style (HomePromoArt), with real HTML text.
 * Crossfade (no horizontal track), so RTL needs no special math and height never jumps:
 * all slides share one grid cell and the tallest sets the height.
 */
interface Promo {
  key: string
  brand: string // Latin brand name, shown large
  title: string // Persian heading
  text: string
  cta: string
  to: string
  background: string
  dark: boolean // true → dark text on a light background
  art: {
    logo: string // white/mono official logo for the tile face — see public/brands/README.txt
    fallbackIcon: Component
    tileFrom: string
    tileTo: string
    tileEdge: string
    glow: string
    podiumTop: string
    podiumSide: string
    ring: string
  }
}

const promos: Promo[] = [
  {
    key: 'claude',
    brand: 'Claude',
    title: 'شارژ اکانت',
    text: 'به قابلیت‌های پیشرفته هوش مصنوعی کلاد دسترسی داشته باش.',
    cta: 'مشاهده خدمات',
    to: '/c/ai',
    background: 'radial-gradient(70% 120% at 20% 40%, #f1a585 0%, transparent 60%), linear-gradient(110deg, #c9603d 0%, #de8160 45%, #e99a7a 100%)',
    dark: true,
    art: {
      logo: '/brands/claude-white.png',
      fallbackIcon: Sparkles,
      tileFrom: '#ee9c7b',
      tileTo: '#cf6542',
      tileEdge: '#a84a2c',
      glow: '#ffd2bf',
      podiumTop: '#f0a382',
      podiumSide: '#c25a37',
      ring: '#ffe3d6',
    },
  },
  {
    key: 'chatgpt',
    brand: 'ChatGPT',
    title: 'ارتقای اکانت',
    text: 'اشتراک و خدمات موردنیاز ChatGPT را از پی‌مینو تهیه کن.',
    cta: 'خرید اشتراک',
    to: '/p/chatgpt-plus',
    background: 'radial-gradient(70% 120% at 20% 40%, #1d8a70 0%, transparent 60%), linear-gradient(110deg, #052b24 0%, #0a4a3d 50%, #0d5a4a 100%)',
    dark: false,
    art: {
      logo: '/brands/openai-white.png',
      fallbackIcon: MessageCircle,
      tileFrom: '#2fc79c',
      tileTo: '#0f7a60',
      tileEdge: '#0a5544',
      glow: '#3ee0b0',
      podiumTop: '#147a63',
      podiumSide: '#073f33',
      ring: '#7ff5d2',
    },
  },
  {
    key: 'steam',
    brand: 'Steam',
    title: 'گیفت کارت',
    text: 'گیفت کارت استیم متناسب با ریجن اکانتت تهیه کن.',
    cta: 'مشاهده گیفت کارت‌ها',
    to: '/c/steam',
    background: 'radial-gradient(70% 120% at 20% 40%, #1f4f80 0%, transparent 60%), linear-gradient(110deg, #060c16 0%, #0d1d33 50%, #132a47 100%)',
    dark: false,
    art: {
      logo: '/brands/img.png',
      fallbackIcon: Gamepad2,
      tileFrom: '#2c5a8c',
      tileTo: '#112640',
      tileEdge: '#08162a',
      glow: '#4aa3e8',
      podiumTop: '#1d3d63',
      podiumSide: '#0a1a2e',
      ring: '#8fd0ff',
    },
  },
]

const total = promos.length + 1
const labels = ['معرفی پی‌مینو', ...promos.map((p) => `${p.title} ${p.brand}`)]
const AUTOPLAY_MS = 7000

const current = ref(0)
const hovering = ref(false)
const focusWithin = ref(false)
const stopped = ref(false) // user took control → no more auto rotation
const userPaused = ref(false)
const reducedMotion = ref(false)

const autoplayActive = computed(() => !reducedMotion.value && !stopped.value && !userPaused.value)
const running = computed(() => autoplayActive.value && !hovering.value && !focusWithin.value)

function go(i: number, byUser = true) {
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
watch([current, running], schedule)

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
  schedule()
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
          class="col-start-1 row-start-1 transition-opacity duration-700 ease-out"
          :class="current === i + 1 ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0'"
          role="group"
          aria-roledescription="slide"
          :aria-label="`${faNumber(i + 2)} از ${faNumber(total)}: ${p.title} ${p.brand}`"
          :aria-hidden="current !== i + 1"
          :inert="current !== i + 1"
      >
        <div class="relative h-full overflow-hidden" :style="{ background: p.background }">
          <!-- soft curves in the background -->
          <div class="pointer-events-none absolute inset-0 opacity-[0.12]" aria-hidden="true">
            <div class="absolute -end-[10%] -top-[60%] size-[70rem] rounded-full border-[1.5px]" :class="p.dark ? 'border-white' : 'border-white/70'" />
            <div class="absolute -end-[5%] -top-[40%] size-[55rem] rounded-full border" :class="p.dark ? 'border-white' : 'border-white/60'" />
          </div>

          <div class="container-page relative grid h-full items-center gap-2 pt-8 pb-24 lg:grid-cols-[1fr_1fr] lg:gap-10 lg:py-16">
            <!-- Copy (right side in RTL) -->
            <div class="order-2 lg:order-1">
              <h2 class="leading-tight font-extrabold" :class="p.dark ? 'text-[#2a140c]' : 'text-white'">
                <span class="block text-xl sm:text-2xl lg:text-3xl" :class="p.dark ? 'text-[#5a2814]' : 'text-white/85'">{{ p.title }}</span>
                <bdi class="ltr mt-1 block text-right text-[44px] tracking-tight sm:text-6xl lg:text-7xl">{{ p.brand }}</bdi>
              </h2>
              <p
                  class="mt-5 max-w-md border-s-[3px] ps-4 text-base leading-8 sm:text-lg"
                  :class="p.dark ? 'border-[#2a140c]/40 text-[#3d1d10]' : 'border-white/40 text-white/85'"
              >
                {{ p.text }}
              </p>
              <NuxtLink
                  :to="p.to"
                  class="mt-7 inline-flex h-12 items-center gap-2 rounded-[var(--radius-control)] px-6 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                  :class="p.dark ? 'bg-[#2a140c] text-white hover:bg-[#3d1d10] focus-visible:outline-[#2a140c]' : 'bg-white text-navy-900 hover:bg-white/90 focus-visible:outline-white'"
              >
                {{ p.cta }}
                <ArrowLeft class="size-5" aria-hidden="true" />
              </NuxtLink>
            </div>

            <!-- 3D tile (left side in RTL; on top on mobile) -->
            <div class="order-1 flex justify-center text-[9px] sm:text-[11px] lg:order-2 lg:text-[13px]">
              <HomePromoArt v-bind="p.art" :logo-alt="p.brand" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="pointer-events-none absolute inset-x-0 bottom-5 z-20 flex justify-center">
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