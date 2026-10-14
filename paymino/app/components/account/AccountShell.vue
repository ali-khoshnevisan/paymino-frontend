<script setup lang="ts">
import { LayoutDashboard, LifeBuoy, LogOut, Package, UserRound } from 'lucide-vue-next'
defineProps<{ title: string; subtitle?: string }>()
const auth = useAuthStore()
const links = [
  { to: '/account', label: 'پیشخوان', icon: LayoutDashboard, exact: true },
  { to: '/account/orders', label: 'سفارش‌ها', icon: Package },
  { to: '/account/support', label: 'پشتیبانی', icon: LifeBuoy },
  { to: '/account/profile', label: 'حساب کاربری', icon: UserRound },
]
const route = useRoute()
const isActive = (l: (typeof links)[number]) => (l.exact ? route.path === l.to : route.path.startsWith(l.to))

async function logout() {
  await auth.logout()
  await navigateTo('/')
}
</script>

<template>
  <div class="container-page py-8">
    <div class="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
      <aside aria-label="منوی حساب کاربری" class="min-w-0">
        <div class="card p-2 lg:sticky lg:top-36">
          <div class="hidden border-b border-line px-3 pt-2 pb-3 lg:block">
            <p class="truncate font-semibold">{{ auth.user?.fullName }}</p>
            <p class="ltr truncate text-xs text-muted">{{ auth.user?.email }}</p>
          </div>
          <nav class="flex gap-1 overflow-x-auto lg:mt-2 lg:flex-col">
            <NuxtLink
              v-for="l in links"
              :key="l.to"
              :to="l.to"
              class="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium"
              :class="isActive(l) ? 'bg-navy-900 text-white' : 'text-navy-700 hover:bg-navy-50'"
              :aria-current="isActive(l) ? 'page' : undefined"
            >
              <component :is="l.icon" class="size-4" aria-hidden="true" />
              {{ l.label }}
            </NuxtLink>
            <button type="button" class="hidden items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 lg:flex" @click="logout">
              <LogOut class="size-4" aria-hidden="true" /> خروج
            </button>
          </nav>
        </div>
      </aside>
      <div class="min-w-0">
        <div class="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 class="text-2xl font-extrabold">{{ title }}</h1>
            <p v-if="subtitle" class="section-subtitle">{{ subtitle }}</p>
          </div>
          <slot name="actions" />
        </div>
        <slot />
      </div>
    </div>
  </div>
</template>
