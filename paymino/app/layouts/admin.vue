<script setup lang="ts">
import { ExternalLink, FolderTree, LayoutDashboard, LifeBuoy, LogOut, Menu, Package, Settings, ShoppingCart, Users, X } from 'lucide-vue-next'

const auth = useAuthStore()
const route = useRoute()
const open = ref(false)

const links = [
  { to: '/admin', label: 'پیشخوان', icon: LayoutDashboard, exact: true },
  { to: '/admin/orders', label: 'سفارش‌ها', icon: ShoppingCart },
  { to: '/admin/products', label: 'محصولات', icon: Package },
  { to: '/admin/categories', label: 'دسته‌ها و برندها', icon: FolderTree },
  { to: '/admin/users', label: 'کاربران', icon: Users },
  { to: '/admin/tickets', label: 'پشتیبانی', icon: LifeBuoy },
  { to: '/admin/settings', label: 'تنظیمات و نرخ‌ها', icon: Settings },
]
const isActive = (l: (typeof links)[number]) => (l.exact ? route.path === l.to : route.path.startsWith(l.to))

watch(() => route.fullPath, () => (open.value = false))

async function logout() {
  await auth.logout()
  await navigateTo('/')
}
</script>

<template>
  <div class="min-h-dvh bg-canvas">
    <header class="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-white px-4 lg:hidden">
      <button type="button" class="-ms-2 flex size-10 items-center justify-center rounded-lg hover:bg-navy-50" aria-label="منوی مدیریت" @click="open = true">
        <Menu class="size-5" aria-hidden="true" />
      </button>
      <span class="font-bold">مدیریت پی‌مینو</span>
    </header>

    <div v-if="open" class="fixed inset-0 z-40 bg-navy-950/40 lg:hidden" aria-hidden="true" @click="open = false" />

    <aside
        class="fixed inset-y-0 start-0 z-50 flex w-64 flex-col bg-navy-950 text-navy-100 transition-transform lg:translate-x-0"
        :class="open ? 'translate-x-0' : 'translate-x-full'"
        aria-label="منوی مدیریت"
    >
      <div class="flex h-16 items-center justify-between px-5">
        <NuxtLink to="/admin" class="flex items-center gap-2 text-white">
          <BrandLogo inverted />
        </NuxtLink>
        <button type="button" class="flex size-9 items-center justify-center rounded-lg hover:bg-white/10 lg:hidden" aria-label="بستن منو" @click="open = false">
          <X class="size-5" aria-hidden="true" />
        </button>
      </div>
      <p class="px-5 pb-3 text-xs font-semibold tracking-wide text-navy-300">پنل مدیریت</p>
      <nav class="flex-1 space-y-0.5 overflow-y-auto px-3">
        <NuxtLink
            v-for="l in links"
            :key="l.to"
            :to="l.to"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
            :class="isActive(l) ? 'bg-white/10 text-white' : 'text-navy-200 hover:bg-white/5 hover:text-white'"
            :aria-current="isActive(l) ? 'page' : undefined"
        >
          <component :is="l.icon" class="size-[18px]" aria-hidden="true" />
          {{ l.label }}
        </NuxtLink>
      </nav>
      <div class="border-t border-white/10 p-3">
        <div class="px-3 py-2">
          <p class="truncate text-sm font-semibold text-white">{{ auth.user?.fullName }}</p>
          <p class="ltr truncate text-xs text-navy-300">{{ auth.user?.email }}</p>
        </div>
        <NuxtLink to="/" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-navy-200 hover:bg-white/5 hover:text-white">
          <ExternalLink class="size-4" aria-hidden="true" /> مشاهده فروشگاه
        </NuxtLink>
        <button type="button" class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-white/5" @click="logout">
          <LogOut class="size-4" aria-hidden="true" /> خروج
        </button>
      </div>
    </aside>

    <main id="main" class="min-w-0 lg:ps-64" tabindex="-1">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <slot />
      </div>
    </main>
    <UiToaster />
  </div>
</template>