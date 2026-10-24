<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'guest' })
useSeoMeta({ title: 'ورود', robots: 'noindex' })

const auth = useAuthStore()
const route = useRoute()

const form = reactive({ identifier: '', password: '' })
const errors = ref<Record<string, string>>({})
const formError = ref<string | null>(null)
const loading = ref(false)
const redirect = computed(() => safeRedirect(route.query.redirect))

// Coming back from a Google sign-in that did not finish (see accounts/google.py on the API)
const googleErrors: Record<string, string> = {
  google_cancelled: 'ورود با گوگل لغو شد.',
  google_expired: 'مهلت ورود با گوگل تمام شد. دوباره امتحان کنید.',
  google_email_unverified: 'ایمیل این حساب گوگل تأیید نشده است. حساب دیگری را امتحان کنید.',
  google_conflict: 'این ایمیل به حساب گوگل دیگری متصل است. با ایمیل و رمز عبور وارد شوید.',
  google_disabled: 'این حساب کاربری غیرفعال شده است. با پشتیبانی تماس بگیرید.',
  google_unavailable: 'ورود با گوگل در حال حاضر فعال نیست.',
  google_throttled: 'تعداد تلاش‌ها زیاد بود. چند دقیقه بعد دوباره امتحان کنید.',
  google_failed: 'ورود با گوگل انجام نشد. دوباره امتحان کنید.',
}
const googleError = computed(() => {
  const code = String(route.query.error ?? '')
  return code.startsWith('google_') ? (googleErrors[code] ?? googleErrors.google_failed) : null
})

function validate() {
  const e: Record<string, string> = {}
  if (!form.identifier.trim()) e.identifier = 'ایمیل یا شماره موبایل را وارد کنید.'
  if (!form.password) e.password = 'رمز عبور را وارد کنید.'
  errors.value = e
  return !Object.keys(e).length
}

async function submit() {
  formError.value = null
  if (!validate()) return
  loading.value = true
  try {
    await auth.login(toAsciiDigits(form.identifier.trim()), form.password)
    // Cart lives on the device, so it is preserved automatically.
    await navigateTo(redirect.value, { replace: true })
  } catch (err) {
    const e = normalizeApiError(err)
    errors.value = e.fieldErrors
    if (!Object.keys(e.fieldErrors).length) formError.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="card p-6 sm:p-8">
    <h1 class="text-2xl font-extrabold">ورود به پی‌مینو</h1>
    <p class="mt-1 text-sm text-muted">برای پیگیری سفارش‌ها وارد حساب خود شوید.</p>

    <UiAlert v-if="googleError" tone="danger" class="mt-6">{{ googleError }}</UiAlert>
    <div class="mt-6">
      <AuthGoogleButton :redirect="redirect" />
    </div>

    <form class="space-y-4" novalidate @submit.prevent="submit">
      <UiInput
        v-model="form.identifier"
        label="ایمیل یا شماره موبایل"
        autocomplete="username"
        inputmode="email"
        ltr
        :error="errors.identifier"
        required
      />
      <div>
        <UiInput v-model="form.password" type="password" label="رمز عبور" autocomplete="current-password" :error="errors.password" required />
        <div class="mt-2 text-end">
          <NuxtLink to="/auth/forgot-password" class="text-sm text-accent-700 hover:underline">رمز عبور را فراموش کرده‌اید؟</NuxtLink>
        </div>
      </div>
      <UiAlert v-if="formError" tone="danger">{{ formError }}</UiAlert>
      <UiButton type="submit" size="lg" block :loading="loading">ورود</UiButton>
    </form>

    <p class="mt-6 text-center text-sm text-muted">
      حساب کاربری ندارید؟
      <NuxtLink :to="{ path: '/auth/register', query: route.query.redirect ? { redirect: route.query.redirect } : {} }" class="font-semibold text-accent-700 hover:underline">
        ثبت‌نام کنید
      </NuxtLink>
    </p>

  </div>
</template>
