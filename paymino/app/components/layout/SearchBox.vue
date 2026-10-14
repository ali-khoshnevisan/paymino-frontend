<script setup lang="ts">
import { Search } from 'lucide-vue-next'

const props = withDefaults(defineProps<{ autofocus?: boolean }>(), { autofocus: false })
const emit = defineEmits<{ submitted: [] }>()
const route = useRoute()
const q = ref(typeof route.query.q === 'string' ? route.query.q : '')
const input = ref<HTMLInputElement>()

watch(
  () => route.query.q,
  (v) => (q.value = typeof v === 'string' ? v : ''),
)

onMounted(() => {
  if (props.autofocus) input.value?.focus()
})

function submit() {
  const term = q.value.trim()
  navigateTo({ path: '/shop', query: term ? { q: term } : {} })
  emit('submitted')
}
</script>

<template>
  <form role="search" class="relative w-full" @submit.prevent="submit">
    <label for="site-search" class="sr-only">جست‌وجوی محصولات</label>
    <input
      id="site-search"
      ref="input"
      v-model="q"
      type="search"
      enterkeyhint="search"
      placeholder="جست‌وجو؛ مثلاً استیم، اپل یا تریدینگ‌ویو"
      class="h-11 w-full rounded-[var(--radius-control)] border border-line bg-canvas ps-11 pe-4 text-[15px] placeholder:text-navy-300 focus:border-accent-500 focus:bg-white focus:ring-3 focus:ring-accent-100 focus:outline-none"
    />
    <button type="submit" class="absolute inset-y-0 start-0 flex w-11 items-center justify-center text-navy-400 hover:text-navy-800" aria-label="جست‌وجو">
      <Search class="size-5" aria-hidden="true" />
    </button>
  </form>
</template>
