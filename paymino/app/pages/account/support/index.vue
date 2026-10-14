<script setup lang="ts">
import { MessageCircle } from 'lucide-vue-next'
import type { OrderListItem, SupportTicket } from '#shared/types'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'پشتیبانی', robots: 'noindex' })

const route = useRoute()
const api = useApi()
const toast = useToast()

const { data: tickets, status, error, refresh } = await useAsyncData('tickets', () => api<{ count: number; results: SupportTicket[] }>('/support/tickets'))
const { data: orders } = await useAsyncData('tickets:orders', () => api<{ results: OrderListItem[] }>('/orders'), { lazy: true })

const form = reactive({
  subject: '',
  orderNumber: typeof route.query.order === 'string' ? route.query.order : '',
  body: '',
})
const errors = ref<Record<string, string>>({})
const formError = ref<string | null>(null)
const sending = ref(false)
const orderOptions = computed(() => (orders.value?.results ?? []).map((o) => ({ value: o.number, label: `${o.number} — ${o.firstItemName}` })))

async function submit() {
  errors.value = {}
  formError.value = null
  sending.value = true
  try {
    const t = await api<SupportTicket>('/support/tickets', { method: 'POST', body: { ...form } })
    toast.show(`درخواست ${t.number} ثبت شد.`)
    form.subject = form.body = form.orderNumber = ''
    await refresh()
    await navigateTo(`/account/support/${t.id}`)
  } catch (err) {
    const e = normalizeApiError(err)
    errors.value = e.fieldErrors
    if (!Object.keys(e.fieldErrors).length) formError.value = e.message
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <AccountShell title="پشتیبانی" subtitle="درخواست جدید ثبت کنید یا پاسخ‌ها را ببینید">
    <div class="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <section class="card p-5 sm:p-6" aria-labelledby="new-title">
        <h2 id="new-title" class="mb-5 font-bold">درخواست جدید</h2>
        <form class="space-y-4" novalidate @submit.prevent="submit">
          <UiInput v-model="form.subject" label="موضوع" :error="errors.subject" :maxlength="120" required />
          <UiSelect v-model="form.orderNumber" label="سفارش مرتبط (اختیاری)" placeholder="بدون سفارش" :options="orderOptions" :error="errors.orderNumber" />
          <UiTextarea v-model="form.body" label="توضیحات" :error="errors.body" :maxlength="3000" hint="جزئیات مشکل را بنویسید. کد گیفت کارت یا رمز عبور خود را ارسال نکنید." required />
          <UiAlert v-if="formError" tone="danger">{{ formError }}</UiAlert>
          <UiButton type="submit" :loading="sending">ثبت درخواست</UiButton>
        </form>
      </section>

      <section class="card overflow-hidden" aria-labelledby="list-title">
        <h2 id="list-title" class="border-b border-line px-5 py-4 font-bold">درخواست‌های شما</h2>
        <div v-if="status === 'pending' && !tickets" class="space-y-3 p-5" aria-busy="true">
          <div v-for="i in 3" :key="i" class="skeleton h-12" />
        </div>
        <UiErrorState v-else-if="error" :message="normalizeApiError(error).message" @retry="refresh()" />
        <UiEmptyState v-else-if="!tickets?.results.length" :icon="MessageCircle" title="درخواستی ثبت نکرده‌اید" description="درخواست‌های پشتیبانی شما اینجا نمایش داده می‌شوند." />
        <ul v-else class="divide-y divide-line">
          <li v-for="t in tickets.results" :key="t.id" class="relative px-5 py-4 hover:bg-navy-50/40">
            <div class="flex items-center justify-between gap-3">
              <NuxtLink :to="`/account/support/${t.id}`" class="font-semibold after:absolute after:inset-0">{{ t.subject }}</NuxtLink>
              <UiBadge :tone="TICKET_STATUS[t.status].tone">{{ TICKET_STATUS[t.status].label }}</UiBadge>
            </div>
            <p class="mt-1 text-sm text-muted">
              <bdi class="ltr">{{ t.number }}</bdi>
              <template v-if="t.orderNumber"> · سفارش <bdi class="ltr">{{ t.orderNumber }}</bdi></template>
              · {{ formatDate(t.updatedAt) }}
            </p>
          </li>
        </ul>
      </section>
    </div>
  </AccountShell>
</template>
