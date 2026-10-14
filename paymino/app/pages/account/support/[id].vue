<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import type { SupportTicket } from '#shared/types'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const api = useApi()
const id = String(route.params.id)
const { data: ticket, status, error, refresh } = await useAsyncData(`ticket:${id}`, () => api<SupportTicket>(`/support/tickets/${id}`))
if (error.value && normalizeApiError(error.value).status === 404) {
  throw createError({ statusCode: 404, statusMessage: 'درخواست یافت نشد', fatal: true })
}
useSeoMeta({ title: () => ticket.value?.subject ?? 'درخواست پشتیبانی', robots: 'noindex' })

const reply = ref('')
const replyError = ref('')
const sending = ref(false)
async function send() {
  replyError.value = ''
  sending.value = true
  try {
    ticket.value = await api<SupportTicket>(`/support/tickets/${id}/messages`, { method: 'POST', body: { body: reply.value } })
    reply.value = ''
  } catch (err) {
    const e = normalizeApiError(err)
    replyError.value = e.fieldErrors.body ?? e.message
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <AccountShell :title="ticket?.subject ?? 'درخواست پشتیبانی'">
    <template #actions>
      <UiButton to="/account/support" variant="ghost" size="sm"><ArrowRight class="size-4" aria-hidden="true" />همه درخواست‌ها</UiButton>
    </template>

    <div v-if="error" class="card">
      <UiErrorState :message="normalizeApiError(error).message" :retrying="status === 'pending'" @retry="refresh()" />
    </div>
    <div v-else-if="ticket" class="space-y-4">
      <div class="flex flex-wrap items-center gap-2 text-sm text-muted">
        <UiBadge :tone="TICKET_STATUS[ticket.status].tone">{{ TICKET_STATUS[ticket.status].label }}</UiBadge>
        <bdi class="ltr">{{ ticket.number }}</bdi>
        <template v-if="ticket.orderNumber">
          · سفارش <bdi class="ltr font-medium text-navy-800">{{ ticket.orderNumber }}</bdi>
        </template>
      </div>

      <ol class="space-y-3">
        <li
          v-for="(m, i) in ticket.messages"
          :key="i"
          class="max-w-2xl rounded-[var(--radius-card)] p-4"
          :class="m.from === 'user' ? 'card' : 'ms-auto border border-accent-100 bg-accent-50'"
        >
          <p class="mb-1 text-xs font-semibold" :class="m.from === 'user' ? 'text-navy-500' : 'text-accent-800'">
            {{ m.from === 'user' ? 'شما' : 'پشتیبانی پی‌مینو' }} · <time :datetime="m.at">{{ formatDateTime(m.at) }}</time>
          </p>
          <p class="text-[15px] leading-8 whitespace-pre-line">{{ m.body }}</p>
        </li>
      </ol>

      <form v-if="ticket.status !== 'closed'" class="card space-y-3 p-5" novalidate @submit.prevent="send">
        <UiTextarea v-model="reply" label="پاسخ شما" :rows="4" :error="replyError" :maxlength="3000" />
        <UiButton type="submit" :loading="sending" :disabled="reply.trim().length < 2">ارسال پیام</UiButton>
      </form>
      <UiAlert v-else tone="info">این درخواست بسته شده است. برای موضوع جدید، درخواست تازه ثبت کنید.</UiAlert>
    </div>
  </AccountShell>
</template>
