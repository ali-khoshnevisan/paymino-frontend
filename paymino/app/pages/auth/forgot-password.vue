<script setup lang="ts">
import { MailCheck } from 'lucide-vue-next'

definePageMeta({ layout: 'auth' })
useSeoMeta({ title: 'بازیابی رمز عبور', robots: 'noindex' })

const api = useApi()
const email = ref('')
const error = ref('')
const loading = ref(false)
const sent = ref(false)

async function submit() {
  error.value = ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
    error.value = 'ایمیل معتبر وارد کنید.'
    return
  }
  loading.value = true
  try {
    await api('/auth/password-reset', { method: 'POST', body: { email: email.value.trim().toLowerCase() } })
    sent.value = true
  } catch (err) {
    const e = normalizeApiError(err)
    error.value = e.fieldErrors.email ?? e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="card p-6 sm:p-8">
    <template v-if="sent">
      <div class="mb-4 flex size-12 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
        <MailCheck class="size-6" aria-hidden="true" />
      </div>
      <h1 class="text-2xl font-extrabold">ایمیل خود را بررسی کنید</h1>
      <p class="mt-2 text-[15px] leading-8 text-muted">
        اگر حسابی با <bdi class="ltr font-semibold text-navy-800">{{ email }}</bdi> وجود داشته باشد، لینک بازیابی رمز عبور برای آن ارسال می‌شود. لینک ۳۰ دقیقه اعتبار دارد.
      </p>
      <UiButton to="/auth/login" variant="secondary" block class="mt-6">بازگشت به ورود</UiButton>
    </template>
    <template v-else>
      <h1 class="text-2xl font-extrabold">بازیابی رمز عبور</h1>
      <p class="mt-1 text-sm text-muted">ایمیل حساب خود را وارد کنید تا لینک بازیابی برایتان ارسال شود.</p>
      <form class="mt-6 space-y-4" novalidate @submit.prevent="submit">
        <UiInput v-model="email" type="email" label="ایمیل" autocomplete="email" inputmode="email" ltr :error="error" required />
        <UiButton type="submit" size="lg" block :loading="loading">ارسال لینک بازیابی</UiButton>
      </form>
      <p class="mt-6 text-center text-sm">
        <NuxtLink to="/auth/login" class="font-semibold text-accent-700 hover:underline">بازگشت به ورود</NuxtLink>
      </p>
    </template>
  </div>
</template>
