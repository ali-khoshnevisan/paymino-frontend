<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'
// Edit a list of short strings (regions, restrictions, notes)
defineProps<{ label: string; placeholder?: string; hint?: string }>()
const model = defineModel<string[]>({ default: () => [] })
const draft = ref('')

function add() {
  const v = draft.value.trim()
  if (v) model.value = [...model.value, v]
  draft.value = ''
}
function remove(i: number) {
  model.value = model.value.filter((_, idx) => idx !== i)
}
function update(i: number, v: string) {
  model.value = model.value.map((x, idx) => (idx === i ? v : x))
}
</script>

<template>
  <fieldset>
    <legend class="field-label">{{ label }}</legend>
    <ul v-if="model.length" class="mb-2 space-y-1.5">
      <li v-for="(item, i) in model" :key="i" class="flex items-center gap-2">
        <input
          :value="item"
          class="h-10 min-w-0 flex-1 rounded-[var(--radius-control)] border border-line bg-white px-3 text-sm focus:border-accent-500 focus:outline-none"
          :aria-label="`${label} ${i + 1}`"
          @input="update(i, ($event.target as HTMLInputElement).value)"
        />
        <button type="button" class="flex size-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50" :aria-label="`حذف مورد ${i + 1}`" @click="remove(i)">
          <Trash2 class="size-4" aria-hidden="true" />
        </button>
      </li>
    </ul>
    <div class="flex gap-2">
      <input
        v-model="draft"
        :placeholder="placeholder ?? 'مورد جدید…'"
        class="h-10 min-w-0 flex-1 rounded-[var(--radius-control)] border border-dashed border-line bg-white px-3 text-sm focus:border-accent-500 focus:outline-none"
        :aria-label="`افزودن به ${label}`"
        @keydown.enter.prevent="add"
      />
      <UiButton size="sm" variant="secondary" class="!h-10" @click="add"><Plus class="size-4" aria-hidden="true" /> افزودن</UiButton>
    </div>
    <p v-if="hint" class="mt-1.5 text-xs text-muted">{{ hint }}</p>
  </fieldset>
</template>
