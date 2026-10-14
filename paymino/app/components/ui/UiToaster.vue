<script setup lang="ts">
import { CircleAlert, CircleCheck, Info, X } from 'lucide-vue-next'
const { toasts, dismiss } = useToast()
const icons = { success: CircleCheck, info: Info, danger: CircleAlert }
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:start-6 sm:items-start"
    aria-live="polite"
    aria-atomic="false"
  >
    <TransitionGroup
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-for="t in toasts"
        :key="t.id"
        class="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl bg-navy-900 px-4 py-3 text-sm text-white shadow-[var(--shadow-raised)]"
        role="status"
      >
        <component
          :is="icons[t.tone]"
          class="size-5 shrink-0"
          :class="t.tone === 'danger' ? 'text-red-300' : 'text-accent-300'"
          aria-hidden="true"
        />
        <p class="min-w-0 flex-1">{{ t.message }}</p>
        <NuxtLink v-if="t.action" :to="t.action.to" class="font-semibold text-accent-200 hover:text-white" @click="dismiss(t.id)">
          {{ t.action.label }}
        </NuxtLink>
        <button type="button" class="text-navy-300 hover:text-white" aria-label="بستن" @click="dismiss(t.id)">
          <X class="size-4" aria-hidden="true" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
