<script setup lang="ts">
import type { Component } from 'vue'

/**
 * 3D app tile on a glowing podium, drawn in CSS so it stays sharp at any size.
 * The tile face shows the official logo from `logo` (add the file yourself — see public/brands/README.txt);
 * until it exists, `fallbackIcon` is shown instead. All sizes are in `em`, so the parent's font-size scales it.
 */
const props = defineProps<{
  logo: string
  logoAlt: string
  fallbackIcon: Component
  tileFrom: string
  tileTo: string
  tileEdge: string
  glow: string
  podiumTop: string
  podiumSide: string
  ring: string
}>()

const loaded = ref(false)
const failed = ref(false)
const img = ref<HTMLImageElement>()
onMounted(() => {
  if (img.value?.complete) {
    if (img.value.naturalWidth > 0) loaded.value = true
    else failed.value = true
  }
})

// Stacked hard shadows extrude the tile into a solid block
const extrude = computed(() =>
    Array.from({ length: 14 }, (_, i) => `${(i + 1) * 0.06}em ${(i + 1) * 0.09}em 0 ${props.tileEdge}`).join(', '),
)
</script>

<template>
  <div class="relative h-[26em] w-[30em] select-none" aria-hidden="true">
    <!-- glow + orbit lines -->
    <div class="absolute top-[34%] left-1/2 size-[22em] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[3.2em]" :style="{ background: glow }" />
    <div class="absolute top-[40%] left-1/2 h-[24em] w-[34em] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border opacity-25" :style="{ borderColor: ring }" />
    <div class="absolute top-[40%] left-1/2 h-[30em] w-[42em] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border opacity-15" :style="{ borderColor: ring }" />

    <!-- podium -->
    <div class="absolute bottom-[1.5em] left-1/2 w-[22em] -translate-x-1/2">
      <div class="absolute top-[3em] left-1/2 h-[6em] w-[30em] -translate-x-1/2 rounded-[50%] opacity-40 blur-[1.4em]" :style="{ background: glow }" />
      <!-- side of the cylinder -->
      <div class="relative h-[5.2em] w-full rounded-b-[50%_2.6em]" :style="{ background: `linear-gradient(to bottom, ${podiumSide}, rgba(0,0,0,.35))` }">
        <!-- top face -->
        <div
            class="absolute -top-[2.6em] left-0 h-[5.2em] w-full rounded-[50%]"
            :style="{ background: `radial-gradient(ellipse at 50% 35%, ${podiumTop}, ${podiumSide})`, boxShadow: `0 0 0 0.12em ${ring}, 0 0 1.4em 0.2em ${ring}` }"
        />
      </div>
    </div>

    <!-- tile -->
    <div class="absolute top-[15%] left-1/2 -translate-x-1/2 [perspective:60em]">
      <div
          class="relative flex size-[13.5em] items-center justify-center rounded-[3.4em] [transform:rotateX(14deg)_rotateY(-24deg)_rotateZ(-6deg)] [transform-style:preserve-3d]"
          :style="{
          background: `linear-gradient(145deg, ${tileFrom}, ${tileTo})`,
          boxShadow: `inset 0 0.12em 0 rgba(255,255,255,.45), inset 0 -0.8em 1.6em rgba(0,0,0,.18), ${extrude}, 1.2em 2.6em 3em -0.6em rgba(0,0,0,.55)`,
        }"
      >
        <!-- gloss -->
        <div class="pointer-events-none absolute inset-0 rounded-[3.4em] bg-[radial-gradient(120%_80%_at_20%_0%,rgba(255,255,255,.38),transparent_55%)]" />
        <img
            v-show="loaded"
            ref="img"
            :src="logo"
            :alt="logoAlt"
            class="relative z-10 max-h-[55%] max-w-[60%] object-contain drop-shadow-[0_0.2em_0.3em_rgba(0,0,0,.25)]"
            draggable="false"
            @load="loaded = true"
            @error="failed = true"
        />
        <component :is="fallbackIcon" v-if="!loaded" class="relative z-10 size-[45%] text-white/95 drop-shadow-[0_0.2em_0.3em_rgba(0,0,0,.25)]" :stroke-width="1.4" />
      </div>
    </div>
  </div>
</template>