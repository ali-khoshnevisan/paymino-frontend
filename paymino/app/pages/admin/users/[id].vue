<script setup lang="ts">
import type { AdminList, AdminOrderRow, AdminTicketRow, AdminUser } from '#shared/types/admin'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const api = useApi()
const auth = useAuthStore()
const id = String(route.params.id)
const { busy, errors, run } = useAdminAction()

const { data: user, error, refresh } = await useAsyncData(`admin:user:${id}`, () => api<AdminUser>(`/admin/users/${id}`))
const { data: orders } = await useAsyncData(`admin:user:${id}:orders`, () => api<AdminList<AdminOrderRow>>('/admin/orders', { query: { user: id, pageSize: 50 } }))
const { data: tickets } = await useAsyncData(`admin:user:${id}:tickets`, () => api<AdminList<AdminTicketRow>>('/admin/tickets', { query: { user: id, pageSize: 50 } }))
useSeoMeta({ title: () => `${user.value?.fullName ?? 'کاربر'} — مدیریت`, robots: 'noindex, nofollow' })

const form = reactive({ fullName: '', email: '', phone: '', emailVerified: false, adminNote: '' })
watch(
  user,
  (u) => u && Object.assign(form, { fullName: u.fullName, email: u.email, phone: u.phone ?? '', emailVerified: u.emailVerified, adminNote: u.adminNote }),
  { immediate: true },
)
const isMe = computed(() => auth.user?.id === id)

async function save() {
  const res = await run('save', () => api<AdminUser>(`/admin/users/${id}`, { method: 'PATCH', body: { ...form, phone: toAsciiDigits(form.phone) } }), 'ذخیره شد.')
  if (res) user.value = res
}
async function patch(key: string, body: Record<string, unknown>, msg: string, confirmText?: string) {
  if (confirmText && !confirm(confirmText)) return
  const res = await run(key, () => api<AdminUser>(`/admin/users/${id}`, { method: 'PATCH', body }), msg)
  if (res) user.value = res
}

const newPassword = ref('')
async function setPassword() {
  const ok = await run('pw', () => api<unknown>(`/admin/users/${id}/password`, { method: 'POST', body: { password: newPassword.value } }), 'رمز عبور تغییر کرد و نشست‌های کاربر بسته شد.')
  if (ok) newPassword.value = ''
}
</script>

<template>
  <div>
    <UiErrorState v-if="error" :message="normalizeApiError(error).message" @retry="refresh()" />
    <template v-else-if="user">
      <AdminHeader :title="user.fullName" :subtitle="`عضویت: ${formatDate(user.createdAt)}${user.lastLogin ? ` — آخرین ورود: ${formatDateTime(user.lastLogin)}` : ''}`" back="/admin/users">
        <UiBadge v-if="user.isSuperuser" tone="accent">مدیر ارشد</UiBadge>
        <UiBadge v-else-if="user.isStaff" tone="accent">مدیر</UiBadge>
        <UiBadge v-if="!user.isActive" tone="danger">غیرفعال</UiBadge>
      </AdminHeader>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div class="min-w-0 space-y-6">
          <section class="card overflow-hidden">
            <div class="flex items-center justify-between border-b border-line px-5 py-3">
              <h2 class="font-bold">سفارش‌ها</h2>
              <span class="text-sm text-muted">{{ faNumber(user.orderCount ?? 0) }} سفارش — {{ formatToman(user.totalSpentToman) }} خرید تکمیل‌شده</span>
            </div>
            <p v-if="!orders?.results.length" class="px-5 py-6 text-sm text-muted">سفارشی ندارد.</p>
            <ul v-else class="divide-y divide-line">
              <li v-for="o in orders.results" :key="o.id">
                <NuxtLink :to="`/admin/orders/${o.id}`" class="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-sm hover:bg-navy-50/50">
                  <span class="ltr font-mono font-semibold">{{ o.number }}</span>
                  <span class="min-w-0 flex-1 truncate">{{ o.firstItemName }}</span>
                  <span class="tabular">{{ formatToman(o.totalToman) }}</span>
                  <OrderStatusBadge kind="order" :status="o.status" />
                  <span class="text-xs text-muted">{{ formatDate(o.createdAt) }}</span>
                </NuxtLink>
              </li>
            </ul>
          </section>

          <section class="card overflow-hidden">
            <h2 class="border-b border-line px-5 py-3 font-bold">تیکت‌ها</h2>
            <p v-if="!tickets?.results.length" class="px-5 py-6 text-sm text-muted">تیکتی ندارد.</p>
            <ul v-else class="divide-y divide-line">
              <li v-for="t in tickets.results" :key="t.id">
                <NuxtLink :to="`/admin/tickets/${t.id}`" class="flex items-center gap-4 px-5 py-3 text-sm hover:bg-navy-50/50">
                  <span class="ltr font-mono">{{ t.number }}</span>
                  <span class="min-w-0 flex-1 truncate">{{ t.subject }}</span>
                  <UiBadge :tone="TICKET_STATUS[t.status].tone">{{ TICKET_STATUS[t.status].label }}</UiBadge>
                </NuxtLink>
              </li>
            </ul>
          </section>
        </div>

        <div class="space-y-6">
          <form class="card space-y-4 p-5" @submit.prevent="save">
            <h2 class="font-bold">اطلاعات حساب</h2>
            <UiInput v-model="form.fullName" label="نام و نام خانوادگی" :error="errors.fullName" />
            <UiInput v-model="form.email" label="ایمیل" ltr :error="errors.email" />
            <UiInput v-model="form.phone" label="موبایل" ltr inputmode="tel" :error="errors.phone" />
            <UiCheckbox v-model="form.emailVerified">ایمیل تأیید شده است</UiCheckbox>
            <UiTextarea v-model="form.adminNote" label="یادداشت داخلی" :rows="3" />
            <UiButton type="submit" block :loading="busy === 'save'">ذخیره</UiButton>
          </form>

          <section class="card space-y-3 p-5">
            <h2 class="font-bold">دسترسی</h2>
            <UiButton
              v-if="!isMe"
              block
              :variant="user.isActive ? 'danger' : 'secondary'"
              :loading="busy === 'active'"
              @click="patch('active', { isActive: !user.isActive }, user.isActive ? 'حساب غیرفعال شد.' : 'حساب فعال شد.', user.isActive ? 'این حساب غیرفعال شود؟ کاربر دیگر نمی‌تواند وارد شود.' : undefined)"
            >
              {{ user.isActive ? 'غیرفعال کردن حساب' : 'فعال کردن حساب' }}
            </UiButton>
            <template v-if="auth.user && !isMe">
              <UiButton block variant="secondary" :loading="busy === 'staff'"
                @click="patch('staff', { isStaff: !user.isStaff }, 'دسترسی تغییر کرد.', user.isStaff ? 'دسترسی مدیریت این کاربر گرفته شود؟' : 'این کاربر به پنل مدیریت (شامل کدهای گیفت کارت) دسترسی پیدا کند؟')">
                {{ user.isStaff ? 'گرفتن دسترسی مدیریت' : 'دادن دسترسی مدیریت' }}
              </UiButton>
              <p v-if="errors.isStaff || errors.isActive" class="text-sm text-red-700" role="alert">{{ errors.isStaff || errors.isActive }}</p>
            </template>
            <p v-if="isMe" class="text-sm text-muted">این حساب خودتان است.</p>
          </section>

          <form class="card space-y-3 p-5" @submit.prevent="setPassword">
            <h2 class="font-bold">تعیین رمز عبور جدید</h2>
            <UiInput v-model="newPassword" label="رمز عبور جدید" type="password" autocomplete="new-password" :error="errors.password" hint="کاربر از همه دستگاه‌ها خارج می‌شود." />
            <UiButton type="submit" variant="secondary" block :loading="busy === 'pw'" :disabled="newPassword.length < 8">تغییر رمز عبور</UiButton>
          </form>
        </div>
      </div>
    </template>
  </div>
</template>
