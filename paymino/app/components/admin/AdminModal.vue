<script setup lang="ts">
import { X } from 'lucide-vue-next'
const props = withDefaults(defineProps<{ title: string; wide?: boolean }>(), { wide: false })
const open = defineModel<boolean>({ default: false })
const id = useId()

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}
watch(open, (v) => {
  if (!import.meta.client) return
  document.documentElement.style.overflow = v ? 'hidden' : ''
  if (v) document.addEventListener('keydown', onKey)
  else document.removeEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  if (import.meta.client) {
    document.removeEventListener('keydown', onKey)
    document.documentElement.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[100] flex items-end justify-center bg-navy-950/40 p-0 sm:items-center sm:p-4" @click.self="open = false">
      <div
        role="dialog"
        aria-modal="true"
        :aria-labelledby="id"
        class="card max-h-[92dvh] w-full overflow-y-auto rounded-b-none p-5 sm:rounded-b-[var(--radius-card)]"
        :class="props.wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'"
      >
        <div class="mb-4 flex items-center justify-between gap-3">
          <h2 :id="id" class="text-lg font-bold">{{ title }}</h2>
          <button type="button" class="flex size-9 items-center justify-center rounded-lg text-navy-500 hover:bg-navy-50" aria-label="بستن" @click="open = false">
            <X class="size-5" aria-hidden="true" />
          </button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>
