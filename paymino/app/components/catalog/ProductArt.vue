<script setup lang="ts">
// Code-drawn product picture, used when a product has no uploaded photo.
// A gift card (or membership card for subscriptions) in the provider's colours, tilted in 3D,
// with the category's 3D icon floating beside it. Driven by product data, so new products get art too.
import type { Product } from '#shared/types'

const props = withDefaults(
    defineProps<{
      providerSlug: string
      categorySlug: string
      brandName: string
      type?: Product['type']
    }>(),
    { type: 'gift_card' },
)

interface Look {
  wordmark: string
  ground: string // field behind the card
  face: string // card face
  back: string // second card in the stack
  ink: string
  accent: string
  logo?: string // white logo on transparent background (public/brands)
}

const looks: Record<string, Look> = {
  steam: { wordmark: 'Steam', ground: '#c7d5e0', face: '#1b2838', back: '#2a475e', ink: '#ffffff', accent: '#66c0f4' },
  apple: { wordmark: 'Apple', ground: '#1d1d1f', face: '#f5f5f7', back: '#d2d2d7', ink: '#1d1d1f', accent: '#0071e3' },
  playstation: { wordmark: 'PlayStation', ground: '#d6e6fa', face: '#0070d1', back: '#003791', ink: '#ffffff', accent: '#ffffff' },
  tradingview: { wordmark: 'TradingView', ground: '#dbe4ff', face: '#131722', back: '#2a2e39', ink: '#ffffff', accent: '#2962ff' },
  openai: { wordmark: 'ChatGPT', ground: '#d3eee5', face: '#0d0d0d', back: '#10a37f', ink: '#ffffff', accent: '#10a37f', logo: '/brands/openai-white.png' },
  perplexity: { wordmark: 'Perplexity', ground: '#f3efe4', face: '#091717', back: '#20808d', ink: '#fbfaf4', accent: '#20808d' },
  midjourney: { wordmark: 'Midjourney', ground: '#e8e4dc', face: '#0b0b0f', back: '#55534e', ink: '#ffffff', accent: '#ffffff' },
}
const categoryLooks: Record<string, Look> = {
  ai: { wordmark: '', ground: '#f5e9df', face: '#1f2937', back: '#c2410c', ink: '#ffffff', accent: '#fb923c' },
}
const fallback: Look = { wordmark: '', ground: '#dfe6f1', face: '#0b1f3a', back: '#12998a', ink: '#ffffff', accent: '#66cbbf' }

const look = computed<Look>(() => {
  const base = looks[props.providerSlug] ?? categoryLooks[props.categorySlug] ?? fallback
  return base.wordmark ? base : { ...base, wordmark: props.brandName.split(/\s+/).slice(0, 2).join(' ') }
})

const icons: Record<string, string> = {
  steam: 'gamepad',
  apple: 'phone',
  playstation: 'joystick',
  tradingview: 'chart',
  ai: 'robot',
}
const icon = computed(() => `/icons3d/${icons[props.categorySlug] ?? 'gift'}.webp`)

// Gift cards show their currency; subscriptions show the plan name left over from the brand name.
const currency = computed(() => {
  const b = props.brandName
  if (/\b(EUR|EU)\b/.test(b)) return '€'
  if (/\b(GBP|UK)\b/.test(b)) return '£'
  if (/\b(USD|US)\b/.test(b)) return '$'
  return ''
})
const plan = computed(() => {
  const rest = props.brandName.replace(new RegExp(look.value.wordmark, 'i'), '').trim()
  return rest && rest.length <= 14 ? rest : ''
})
const isGift = computed(() => props.type === 'gift_card')
const faceLabel = computed(() => (isGift.value ? 'Gift Card' : plan.value || 'Subscription'))

const logoFailed = ref(false)
</script>

<template>
  <div
      class="relative isolate size-full overflow-hidden text-[4.4cqw]"
      :style="{ background: look.ground }"
      aria-hidden="true"
  >
    <!-- the card stack -->
    <div class="absolute inset-0 flex translate-x-[5%] items-center justify-center [perspective:60em]">
      <div class="pm-art-stack relative w-[58%] [transform-style:preserve-3d]">
        <!-- back card -->
        <div
            class="absolute inset-0 aspect-[1.586] translate-x-[9%] -translate-y-[12%] rotate-[8deg] rounded-[0.9em]"
            :style="{ background: look.back }"
        />
        <!-- front card -->
        <div
            class="relative flex aspect-[1.586] flex-col justify-between rounded-[0.9em] p-[0.9em] ltr"
            :style="{ background: look.face, color: look.ink, boxShadow: `inset 0 0.08em 0 rgb(255 255 255 / .22), 0 1.6em 2.4em -1em rgb(0 0 0 / .55)` }"
        >
          <div class="text-left">
            <div class="flex items-center gap-[0.4em]">
              <img
                  v-if="look.logo && !logoFailed"
                  :src="look.logo"
                  alt=""
                  class="size-[1.5em] object-contain"
                  draggable="false"
                  @error="logoFailed = true"
              />
              <span class="truncate text-[1.25em] leading-none font-extrabold tracking-[-0.02em]">{{ look.wordmark }}</span>
            </div>
            <span class="mt-[0.45em] block text-[0.9em] leading-tight font-semibold opacity-75">{{ faceLabel }}</span>
          </div>
          <div class="flex justify-end">
            <span v-if="isGift && currency" class="text-[2.6em] leading-[0.8] font-black" :style="{ color: look.accent }">{{ currency }}</span>
            <span v-else class="block h-[0.55em] w-[2.6em] rounded-full" :style="{ background: look.accent }" />
          </div>
        </div>
      </div>
    </div>

    <!-- floating 3D icon -->
    <img
        :src="icon"
        alt=""
        width="256"
        height="256"
        loading="lazy"
        decoding="async"
        draggable="false"
        class="pm-art-icon absolute bottom-[9%] left-[7%] w-[25%] drop-shadow-[0_0.9em_0.9em_rgb(0_0_0/0.28)]"
    />
  </div>
</template>

<style>
.pm-art-stack {
  transform: rotateX(16deg) rotateY(-14deg) rotateZ(-7deg);
  transition: transform 500ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.pm-art-icon {
  transition: transform 500ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.group:hover .pm-art-stack,
.group:focus-within .pm-art-stack {
  transform: rotateX(8deg) rotateY(-6deg) rotateZ(-3deg) translateY(-4%);
}
.group:hover .pm-art-icon,
.group:focus-within .pm-art-icon {
  transform: translateY(-10%) rotate(-6deg);
}
</style>
