<script setup lang="ts">
const cart = useCartStore()
onMounted(() => cart.hydrate())
</script>

<template>
  <NuxtLoadingIndicator color="#12998a" :height="2" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
