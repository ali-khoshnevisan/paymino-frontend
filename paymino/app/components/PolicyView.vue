<script setup lang="ts">
import type { PolicyPage } from '~/utils/content'
const props = defineProps<{ page: PolicyPage }>()
useSeoMeta({ title: props.page.title, description: props.page.description })
</script>

<template>
  <div class="container-page max-w-3xl py-10">
    <UiBreadcrumbs :items="[{ label: page.title }]" />
    <h1 class="mt-4 text-2xl font-extrabold sm:text-3xl">{{ page.title }}</h1>
    <p class="section-subtitle">{{ page.description }}</p>
    <article class="prose-fa card mt-8 p-6 sm:p-8">
      <section v-for="s in page.sections" :key="s.heading">
        <h2>{{ s.heading }}</h2>
        <p v-for="(p, i) in s.paragraphs" :key="i">{{ p }}</p>
        <ul v-if="s.bullets">
          <li v-for="(b, i) in s.bullets" :key="i">{{ b }}</li>
        </ul>
      </section>
    </article>
  </div>
</template>
