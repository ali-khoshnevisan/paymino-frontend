<script setup lang="ts">
import { MailCheck } from 'lucide-vue-next'
import type { User } from '#shared/types'

definePageMeta({ layout: 'auth', middleware: 'auth' })
useSeoMeta({ title: 'تأیید ایمیل', robots: 'noindex' })

const auth = useAuthStore()
const route = useRoute()
const api = useApi()
const isDev = import.meta.dev
const next = computed(() => safeRedirect(route.query.redirect))

const code = ref('')
const error = ref('')
const loading = ref(false)
const resending = ref(false)
const resent = ref(false)

if (auth.user?.emailVerified) await navigateTo(next.value, { replace: true })

async function verify() {
  error.value = ''
  const clean = toAsciiDigits(code.value).replace(/\D/g, '')
  if (clean.length !== 6) {
    error.value = 'کد ۶ رقمی را وارد کنید.'
    return
  }
  loading.value = true
  try {
    const res = await api<{ user: User }>('/auth/verify-email', { method: 'POST', body: { code: clean } })
    auth.setUser(res.user)
    useToast().show('ایمیل شما تأیید شد.')
    await navigateTo(next.value, { replace: true })
  } catch (err) {
    const e = normalizeApiError(err)
    error.value = e.fieldErrors.code ?? e.message
  } finally {
    loading.value = false
  }
}

async function resend() {
  resending.value = true
  resent.value = false
  try {
    await api('/auth/resend-verification', { method: 'POST' })
    resent.value = true
  } catch (err) {
    error.value = normalizeApiError(err).message
  } finally {
    resending.value = false
  }
}
</script>

<template>
  <div class="card p-6 sm:p-8">
    <div class="mb-4 flex size-12 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
      <MailCheck class="size-6" aria-hidden="true" />
    </div>
    <h1 class="text-2xl font-extrabold">تأیید ایمیل</h1>
    <p class="mt-1 text-sm leading-7 text-muted">
      کد ۶ رقمی به <bdi class="ltr font-semibold text-navy-800">{{ auth.user?.email }}</bdi> ارسال شد.
    </p>

    <form class="mt-6 space-y-4" novalidate @submit.prevent="verify">
      <UiInput v-model="code" label="کد تأیید" inputmode="numeric" autocomplete="one-time-code" :maxlength="6" ltr :error="error" required />
      <UiAlert v-if="resent" tone="success" live>کد جدید ارسال شد.</UiAlert>
      <UiButton type="submit" size="lg" block :loading="loading">تأیید</UiButton>
    </form>

    <div class="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
      <button type="button" class="font-semibold text-accent-700 hover:underline disabled:opacity-50" :disabled="resending" @click="resend">ارسال دوباره کد</button>
      <NuxtLink :to="next" class="text-muted hover:text-navy-900">بعداً تأیید می‌کنم</NuxtLink>
    </div>

    <p v-if="isDev" class="mt-6 rounded-lg bg-violet-50 p-3 text-xs leading-6 text-violet-900">
      حالت توسعه: کد تأیید در کنسول سرور (ترمینال <span class="ltr font-mono">npm run dev</span>) چاپ می‌شود.
    </p>
  </div>
</template>
