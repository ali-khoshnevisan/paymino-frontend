<script setup lang="ts">
// 3D icon from public/icons3d (Microsoft Fluent Emoji 3D, MIT — see public/icons3d/LICENSE.txt).
// Decorative by default; pass `alt` when the icon carries meaning on its own.
withDefaults(defineProps<{ name: string; alt?: string; eager?: boolean }>(), { alt: '', eager: false })
</script>

<template>
  <img
      :src="`/icons3d/${name}.webp`"
      :alt="alt"
      :aria-hidden="alt ? undefined : 'true'"
      width="256"
      height="256"
      :loading="eager ? 'eager' : 'lazy'"
      decoding="async"
      draggable="false"
      class="pointer-events-none select-none"
  />
</template>
