<script setup lang="ts">
definePageMeta({ layout: 'auth' })
useSeoMeta({ title: 'تعیین رمز عبور جدید', robots: 'noindex' })

const route = useRoute()
const api = useApi()
const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))

const password = ref('')
const confirmPw = ref('')
const errors = ref<Record<string, string>>({})
const formError = ref<string | null>(null)
const loading = ref(false)
const done = ref(false)

async function submit() {
  errors.value = {}
  formError.value = null
  if (password.value !== confirmPw.value) {
    errors.value = { confirm: 'تکرار رمز عبور یکسان نیست.' }
    return
  }
  loading.value = true
  try {
    await api('/auth/password-reset-confirm', { method: 'POST', body: { token: token.value, password: password.value } })
    done.value = true
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
    <template v-if="!token">
      <h1 class="text-2xl font-extrabold">لینک نامعتبر</h1>
      <p class="mt-2 text-sm text-muted">لینک بازیابی کامل نیست. دوباره درخواست بازیابی رمز عبور بدهید.</p>
      <UiButton to="/auth/forgot-password" variant="secondary" block class="mt-6">درخواست لینک جدید</UiButton>
    </template>
    <template v-else-if="done">
      <h1 class="text-2xl font-extrabold">رمز عبور تغییر کرد</h1>
      <p class="mt-2 text-sm text-muted">اکنون می‌توانید با رمز عبور جدید وارد شوید.</p>
      <UiButton to="/auth/login" block class="mt-6">ورود</UiButton>
    </template>
    <template v-else>
      <h1 class="text-2xl font-extrabold">تعیین رمز عبور جدید</h1>
      <form class="mt-6 space-y-4" novalidate @submit.prevent="submit">
        <UiInput v-model="password" type="password" label="رمز عبور جدید" autocomplete="new-password" hint="حداقل ۸ کاراکتر، شامل حرف و عدد" :error="errors.password" required />
        <UiInput v-model="confirmPw" type="password" label="تکرار رمز عبور" autocomplete="new-password" :error="errors.confirm" required />
        <UiAlert v-if="formError" tone="danger">
          {{ formError }}
          <NuxtLink to="/auth/forgot-password" class="ms-1 font-semibold underline">درخواست لینک جدید</NuxtLink>
        </UiAlert>
        <UiButton type="submit" size="lg" block :loading="loading">ذخیره رمز عبور</UiButton>
      </form>
    </template>
  </div>
</template>
