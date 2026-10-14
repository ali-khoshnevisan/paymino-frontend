<script setup lang="ts">
import { CircleAlert, RefreshCw } from 'lucide-vue-next'
withDefaults(defineProps<{ title?: string; message?: string; retrying?: boolean }>(), {
  title: 'بارگذاری انجام نشد',
  message: 'مشکلی در دریافت اطلاعات پیش آمد. لطفاً دوباره تلاش کنید.',
  retrying: false,
})
defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="flex flex-col items-center px-6 py-12 text-center" role="alert">
    <div class="mb-4 flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
      <CircleAlert class="size-7" aria-hidden="true" />
    </div>
    <h2 class="text-lg font-bold">{{ title }}</h2>
    <p class="mt-1.5 max-w-md text-sm leading-7 text-muted">{{ message }}</p>
    <UiButton variant="secondary" class="mt-5" :loading="retrying" @click="$emit('retry')">
      <RefreshCw v-if="!retrying" class="size-4" aria-hidden="true" />
      تلاش دوباره
    </UiButton>
  </div>
</template>
