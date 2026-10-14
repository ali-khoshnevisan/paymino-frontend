<script setup lang="ts">
import type { User } from '#shared/types'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'حساب کاربری', robots: 'noindex' })

const auth = useAuthStore()
const api = useApi()
const toast = useToast()

const profile = reactive({ fullName: auth.user?.fullName ?? '', phone: auth.user?.phone ?? '' })
const profileErrors = ref<Record<string, string>>({})
const profileSaving = ref(false)
const profileError = ref<string | null>(null)

async function saveProfile() {
  profileErrors.value = {}
  profileError.value = null
  profileSaving.value = true
  try {
    const res = await api<{ user: User }>('/auth/me', {
      method: 'PATCH',
      body: { fullName: profile.fullName.trim(), phone: toAsciiDigits(profile.phone.trim()) },
    })
    auth.setUser(res.user)
    toast.show('اطلاعات حساب ذخیره شد.')
  } catch (err) {
    const e = normalizeApiError(err)
    profileErrors.value = e.fieldErrors
    if (!Object.keys(e.fieldErrors).length) profileError.value = e.message
  } finally {
    profileSaving.value = false
  }
}

const pw = reactive({ currentPassword: '', newPassword: '', confirm: '' })
const pwErrors = ref<Record<string, string>>({})
const pwSaving = ref(false)
const pwError = ref<string | null>(null)

async function changePassword() {
  pwErrors.value = {}
  pwError.value = null
  if (pw.newPassword !== pw.confirm) {
    pwErrors.value = { confirm: 'تکرار رمز عبور با رمز جدید یکسان نیست.' }
    return
  }
  pwSaving.value = true
  try {
    await api('/auth/change-password', { method: 'POST', body: { currentPassword: pw.currentPassword, newPassword: pw.newPassword } })
    pw.currentPassword = pw.newPassword = pw.confirm = ''
    toast.show('رمز عبور تغییر کرد.')
  } catch (err) {
    const e = normalizeApiError(err)
    pwErrors.value = e.fieldErrors
    if (!Object.keys(e.fieldErrors).length) pwError.value = e.message
  } finally {
    pwSaving.value = false
  }
}
</script>

<template>
  <AccountShell title="حساب کاربری" subtitle="اطلاعات شخصی و امنیت حساب">
    <div class="space-y-6">
      <section class="card p-5 sm:p-6" aria-labelledby="pf-title">
        <h2 id="pf-title" class="mb-5 font-bold">اطلاعات شخصی</h2>
        <form class="grid gap-4 sm:grid-cols-2" novalidate @submit.prevent="saveProfile">
          <UiInput v-model="profile.fullName" label="نام و نام خانوادگی" autocomplete="name" :error="profileErrors.fullName" required />
          <UiInput v-model="profile.phone" label="شماره موبایل" type="tel" inputmode="tel" autocomplete="tel" placeholder="09xxxxxxxxx" ltr :error="profileErrors.phone" />
          <div class="sm:col-span-2">
            <p class="field-label">ایمیل</p>
            <div class="flex flex-wrap items-center gap-3">
              <span class="ltr text-[15px]">{{ auth.user?.email }}</span>
              <UiBadge v-if="auth.user?.emailVerified" tone="success" dot>تأییدشده</UiBadge>
              <template v-else>
                <UiBadge tone="warning" dot>تأییدنشده</UiBadge>
                <NuxtLink to="/auth/verify" class="text-sm font-semibold text-accent-700 hover:underline">تأیید ایمیل</NuxtLink>
              </template>
            </div>
          </div>
          <UiAlert v-if="profileError" tone="danger" class="sm:col-span-2">{{ profileError }}</UiAlert>
          <div class="sm:col-span-2">
            <UiButton type="submit" :loading="profileSaving">ذخیره تغییرات</UiButton>
          </div>
        </form>
      </section>

      <section class="card p-5 sm:p-6" aria-labelledby="pw-title">
        <h2 id="pw-title" class="mb-5 font-bold">تغییر رمز عبور</h2>
        <form class="grid max-w-md gap-4" novalidate @submit.prevent="changePassword">
          <UiInput v-model="pw.currentPassword" type="password" label="رمز عبور فعلی" autocomplete="current-password" :error="pwErrors.currentPassword" required />
          <UiInput v-model="pw.newPassword" type="password" label="رمز عبور جدید" autocomplete="new-password" hint="حداقل ۸ کاراکتر، شامل حرف و عدد" :error="pwErrors.newPassword" required />
          <UiInput v-model="pw.confirm" type="password" label="تکرار رمز عبور جدید" autocomplete="new-password" :error="pwErrors.confirm" required />
          <UiAlert v-if="pwError" tone="danger">{{ pwError }}</UiAlert>
          <div>
            <UiButton type="submit" variant="secondary" :loading="pwSaving">تغییر رمز عبور</UiButton>
          </div>
        </form>
      </section>
    </div>
  </AccountShell>
</template>
