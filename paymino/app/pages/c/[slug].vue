<script setup lang="ts">
const route = useRoute()
const slug = computed(() => String(route.params.slug))
const { data: categories } = await useCategories()
const category = computed(() => categories.value.find((c) => c.slug === slug.value))

if (categories.value.length && !category.value) {
  throw createError({ statusCode: 404, statusMessage: 'دسته‌بندی یافت نشد', fatal: true })
}

useSeoMeta({
  title: () => category.value?.name ?? 'دسته‌بندی',
  description: () => category.value?.description ?? '',
})
</script>

<template>
  <div class="container-page py-8">
    <UiBreadcrumbs :items="[{ label: 'محصولات', to: '/shop' }, { label: category?.name ?? '…' }]" />
    <div class="mt-4 mb-6 flex items-center gap-4">
      <CatalogCategoryIcon v-if="category" :icon="category.icon" size="lg" />
      <div>
        <h1 class="text-2xl font-extrabold">{{ category?.name }}</h1>
        <p class="section-subtitle">{{ category?.description }}</p>
      </div>
    </div>
    <CatalogView :key="slug" :category="slug" />
  </div>
</template>
