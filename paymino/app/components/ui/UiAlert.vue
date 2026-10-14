<script setup lang="ts">
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-vue-next'

const props = withDefaults(defineProps<{ tone?: 'info' | 'warning' | 'success' | 'danger'; title?: string; live?: boolean }>(), {
  tone: 'info',
  live: false,
})

const styles = computed(
  () =>
    ({
      info: { box: 'border-sky-200 bg-sky-50/70 text-sky-900', icon: Info, iconClass: 'text-sky-600' },
      warning: { box: 'border-amber-200 bg-amber-50/70 text-amber-900', icon: TriangleAlert, iconClass: 'text-amber-600' },
      success: { box: 'border-emerald-200 bg-emerald-50/70 text-emerald-900', icon: CircleCheck, iconClass: 'text-emerald-600' },
      danger: { box: 'border-red-200 bg-red-50/70 text-red-900', icon: CircleAlert, iconClass: 'text-red-600' },
    })[props.tone],
)
</script>

<template>
  <div
    class="flex gap-3 rounded-[var(--radius-control)] border p-3.5 text-sm leading-7"
    :class="styles.box"
    :role="tone === 'danger' ? 'alert' : live ? 'status' : undefined"
  >
    <component :is="styles.icon" class="mt-1 size-5 shrink-0" :class="styles.iconClass" aria-hidden="true" />
    <div class="min-w-0 flex-1">
      <p v-if="title" class="font-semibold">{{ title }}</p>
      <div><slot /></div>
    </div>
  </div>
</template>
