<script setup lang="ts">
const route = useRoute()
const q = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''))
useSeoMeta({ title: () => (q.value ? `جست‌وجو: ${q.value}` : 'همه محصولات') })
</script>

<template>
  <div class="container-page py-8">
    <UiBreadcrumbs :items="[{ label: 'همه محصولات' }]" />
    <div class="mt-4 mb-6">
      <h1 class="text-2xl font-extrabold">{{ q ? `نتایج جست‌وجو برای «${q}»` : 'همه محصولات' }}</h1>
      <p class="section-subtitle">گیفت کارت‌ها، اشتراک‌ها و سرویس‌های دیجیتال</p>
    </div>
    <CatalogView />
  </div>
</template>
