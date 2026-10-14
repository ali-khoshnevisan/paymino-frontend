<script setup lang="ts">
import type { AdminTicket } from '#shared/types/admin'
import type { TicketStatus } from '#shared/types'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const api = useApi()
const id = String(route.params.id)
const { busy, errors, run } = useAdminAction()
const { data: ticket, error, refresh } = await useAsyncData(`admin:ticket:${id}`, () => api<AdminTicket>(`/admin/tickets/${id}`))
useSeoMeta({ title: () => `${ticket.value?.number ?? 'تیکت'} — مدیریت`, robots: 'noindex, nofollow' })

const reply = ref('')
async function send(close: boolean) {
  const res = await run(close ? 'close' : 'reply', () => api<AdminTicket>(`/admin/tickets/${id}/reply`, { method: 'POST', body: { body: reply.value, close } }), 'پاسخ ارسال شد.')
  if (res) {
    ticket.value = res
    reply.value = ''
  }
}
async function setStatus(status: TicketStatus) {
  const res = await run('status', () => api<AdminTicket>(`/admin/tickets/${id}`, { method: 'PATCH', body: { status } }), 'وضعیت تغییر کرد.')
  if (res) ticket.value = res
}
</script>

<template>
  <div>
    <UiErrorState v-if="error" :message="normalizeApiError(error).message" @retry="refresh()" />
    <template v-else-if="ticket">
      <AdminHeader :title="ticket.subject" :subtitle="`${ticket.number} — ${formatDateTime(ticket.createdAt)}`" back="/admin/tickets">
        <UiBadge :tone="TICKET_STATUS[ticket.status].tone">{{ TICKET_STATUS[ticket.status].label }}</UiBadge>
        <UiButton v-if="ticket.status !== 'closed'" size="sm" variant="secondary" :loading="busy === 'status'" @click="setStatus('closed')">بستن</UiButton>
        <UiButton v-else size="sm" variant="secondary" :loading="busy === 'status'" @click="setStatus('open')">بازکردن دوباره</UiButton>
      </AdminHeader>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div class="min-w-0 space-y-4">
          <ol class="space-y-3">
            <li v-for="m in ticket.messages" :key="m.id" class="flex" :class="m.from === 'support' ? 'justify-end' : ''">
              <div class="max-w-[85%] rounded-[var(--radius-card)] border p-4" :class="m.from === 'support' ? 'border-accent-200 bg-accent-50' : 'border-line bg-white'">
                <p class="mb-1 text-xs font-semibold text-muted">{{ m.from === 'support' ? `پشتیبانی${m.author ? ` (${m.author})` : ''}` : ticket.user.fullName }} — {{ formatDateTime(m.at) }}</p>
                <p class="text-sm leading-7 whitespace-pre-line">{{ m.body }}</p>
              </div>
            </li>
          </ol>
          <form class="card space-y-3 p-5" @submit.prevent="send(false)">
            <UiTextarea v-model="reply" label="پاسخ به کاربر" :rows="5" :error="errors.body" hint="کاربر با ایمیل باخبر می‌شود." />
            <div class="flex flex-wrap justify-end gap-2">
              <UiButton variant="secondary" :loading="busy === 'close'" :disabled="reply.trim().length < 2" @click="send(true)">ارسال و بستن</UiButton>
              <UiButton type="submit" variant="accent" :loading="busy === 'reply'" :disabled="reply.trim().length < 2">ارسال پاسخ</UiButton>
            </div>
          </form>
        </div>
        <aside class="card h-fit space-y-2 p-5 text-sm">
          <h2 class="font-bold">کاربر</h2>
          <NuxtLink :to="`/admin/users/${ticket.user.id}`" class="block font-semibold hover:underline">{{ ticket.user.fullName }}</NuxtLink>
          <p class="ltr text-muted">{{ ticket.user.email }}</p>
          <template v-if="ticket.orderId">
            <h2 class="pt-3 font-bold">سفارش مرتبط</h2>
            <NuxtLink :to="`/admin/orders/${ticket.orderId}`" class="ltr font-mono text-accent-700 hover:underline">{{ ticket.orderNumber }}</NuxtLink>
          </template>
        </aside>
      </div>
    </template>
  </div>
</template>
