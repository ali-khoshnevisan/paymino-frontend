<script setup lang="ts">
// "Continue with Google". A plain link: the API runs the whole OAuth flow (redirect to Google, back to the API,
// session cookie) and then returns the visitor to `redirect`. Hidden when the server has no Google credentials.
const props = withDefaults(defineProps<{ redirect?: string; label?: string; termsNote?: boolean }>(), {
  redirect: '/account',
  label: 'ادامه با حساب گوگل',
  termsNote: false,
})

const api = useApi()
const { data } = await useAsyncData('auth:providers', () => api<{ google: boolean }>('/auth/providers'), {
  default: () => ({ google: false }),
})

const apiBase = String(useRuntimeConfig().public.apiBase ?? '').replace(/\/$/, '')
const href = computed(() => `${apiBase}/auth/google/start?${new URLSearchParams({ next: safeRedirect(props.redirect) })}`)
</script>

<template>
  <div v-if="data?.google">
    <a
        :href="href"
        class="flex h-12 w-full items-center justify-center gap-3 rounded-[var(--radius-control)] border border-line bg-white font-semibold text-navy-900 transition-colors hover:border-navy-200 hover:bg-navy-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 active:bg-navy-100"
    >
      <!-- Google "G" mark, as the sign-in branding guidelines require -->
      <svg class="size-5 shrink-0" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
        <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
      </svg>
      {{ label }}
    </a>
    <p v-if="termsNote" class="mt-2 text-center text-xs leading-6 text-muted">
      با ادامه،
      <NuxtLink to="/terms" target="_blank" class="font-semibold text-accent-700 underline">قوانین</NuxtLink> و
      <NuxtLink to="/privacy" target="_blank" class="font-semibold text-accent-700 underline">حریم خصوصی</NuxtLink> پی‌مینو را می‌پذیرید.
    </p>
    <div class="my-5 flex items-center gap-3 text-xs text-muted" aria-hidden="true">
      <span class="h-px flex-1 bg-line" />
      یا
      <span class="h-px flex-1 bg-line" />
    </div>
  </div>
</template>
