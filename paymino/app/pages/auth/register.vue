<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'guest' })
useSeoMeta({ title: 'ثبت‌نام', robots: 'noindex' })

const auth = useAuthStore()
const route = useRoute()

const form = reactive({ fullName: '', email: '', phone: '', password: '', confirm: '' })
const acceptTerms = ref(false)
const errors = ref<Record<string, string>>({})
const formError = ref<string | null>(null)
const loading = ref(false)

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate() {
  const e: Record<string, string> = {}
  const phone = toAsciiDigits(form.phone.trim())
  if (form.fullName.trim().length < 3) e.fullName = 'نام و نام خانوادگی را کامل وارد کنید.'
  if (!EMAIL.test(form.email.trim())) e.email = 'ایمیل معتبر وارد کنید.'
  if (phone && !/^09\d{9}$/.test(phone)) e.phone = 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.'
  if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) e.password = 'رمز عبور باید حداقل ۸ کاراکتر و شامل حرف و عدد باشد.'
  if (form.confirm !== form.password) e.confirm = 'تکرار رمز عبور یکسان نیست.'
  if (!acceptTerms.value) e.acceptTerms = 'پذیرش قوانین الزامی است.'
  errors.value = e
  return !Object.keys(e).length
}

async function submit() {
  formError.value = null
  if (!validate()) return
  loading.value = true
  try {
    await auth.register({
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: toAsciiDigits(form.phone.trim()) || undefined,
      password: form.password,
    })
    await navigateTo({ path: '/auth/verify', query: { redirect: safeRedirect(route.query.redirect) } }, { replace: true })
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
    <h1 class="text-2xl font-extrabold">ساخت حساب کاربری</h1>
    <p class="mt-1 text-sm text-muted">برای ثبت سفارش و پیگیری آن حساب بسازید.</p>

    <div class="mt-6">
      <AuthGoogleButton :redirect="safeRedirect(route.query.redirect)" label="ثبت‌نام با حساب گوگل" terms-note />
    </div>

    <form class="space-y-4" novalidate @submit.prevent="submit">
      <UiInput v-model="form.fullName" label="نام و نام خانوادگی" autocomplete="name" :error="errors.fullName" required />
      <UiInput v-model="form.email" type="email" label="ایمیل" autocomplete="email" inputmode="email" ltr :error="errors.email" required />
      <UiInput
        v-model="form.phone"
        type="tel"
        label="شماره موبایل (اختیاری)"
        autocomplete="tel"
        inputmode="tel"
        placeholder="09xxxxxxxxx"
        ltr
        :error="errors.phone"
      />
      <UiInput v-model="form.password" type="password" label="رمز عبور" autocomplete="new-password" hint="حداقل ۸ کاراکتر، شامل حرف و عدد" :error="errors.password" required />
      <UiInput v-model="form.confirm" type="password" label="تکرار رمز عبور" autocomplete="new-password" :error="errors.confirm" required />
      <UiCheckbox v-model="acceptTerms" :error="errors.acceptTerms">
        <NuxtLink to="/terms" target="_blank" class="font-semibold text-accent-700 underline">قوانین</NuxtLink> و
        <NuxtLink to="/privacy" target="_blank" class="font-semibold text-accent-700 underline">حریم خصوصی</NuxtLink> پی‌مینو را می‌پذیرم.
      </UiCheckbox>
      <UiAlert v-if="formError" tone="danger">{{ formError }}</UiAlert>
      <UiButton type="submit" size="lg" block :loading="loading">ثبت‌نام</UiButton>
    </form>

    <p class="mt-6 text-center text-sm text-muted">
      حساب دارید؟
      <NuxtLink :to="{ path: '/auth/login', query: route.query.redirect ? { redirect: route.query.redirect } : {} }" class="font-semibold text-accent-700 hover:underline">
        وارد شوید
      </NuxtLink>
    </p>
  </div>
</template>
