<script setup lang="ts">
import { LogOut, Menu, Package, Search, ShoppingBag, UserRound, X, LifeBuoy, LayoutDashboard, ShieldCheck } from 'lucide-vue-next'

const auth = useAuthStore()
const cart = useCartStore()
const route = useRoute()
const { data: categories } = useCategories()

const mobileMenu = ref(false)
const mobileSearch = ref(false)
const accountMenu = ref(false)
const accountRef = ref<HTMLElement>()
const bump = ref(false)

watch(
  () => route.fullPath,
  () => {
    mobileMenu.value = false
    mobileSearch.value = false
    accountMenu.value = false
  },
)

watch(
  () => cart.lastAddedAt,
  () => {
    bump.value = true
    setTimeout(() => (bump.value = false), 400)
  },
)

function onDocClick(e: MouseEvent) {
  if (accountMenu.value && accountRef.value && !accountRef.value.contains(e.target as Node)) accountMenu.value = false
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    accountMenu.value = false
    mobileMenu.value = false
  }
}
onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKey)
})

watch(mobileMenu, (open) => {
  if (import.meta.client) document.documentElement.style.overflow = open ? 'hidden' : ''
})

async function logout() {
  await auth.logout()
  useToast().show('از حساب کاربری خارج شدید.', { tone: 'info' })
  await navigateTo('/')
}

const firstName = computed(() => auth.user?.fullName.split(' ')[0] ?? '')
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
    <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-white">
      رفتن به محتوای اصلی
    </a>

    <div class="container-page flex h-16 items-center gap-3 lg:h-[72px] lg:gap-6">
      <button
        type="button"
        class="-ms-2 flex size-10 items-center justify-center rounded-lg text-navy-800 hover:bg-navy-50 lg:hidden"
        aria-label="منوی اصلی"
        :aria-expanded="mobileMenu"
        aria-controls="mobile-menu"
        @click="mobileMenu = true"
      >
        <Menu class="size-6" aria-hidden="true" />
      </button>

      <NuxtLink to="/" class="shrink-0" aria-label="پی‌مینو — صفحه اصلی">
        <BrandLogo />
      </NuxtLink>

      <div class="mx-auto hidden w-full max-w-xl lg:block">
        <LayoutSearchBox />
      </div>

      <div class="ms-auto flex items-center gap-1 lg:ms-0 lg:gap-2">
        <button
          type="button"
          class="flex size-10 items-center justify-center rounded-lg text-navy-800 hover:bg-navy-50 lg:hidden"
          aria-label="جست‌وجو"
          :aria-expanded="mobileSearch"
          @click="mobileSearch = !mobileSearch"
        >
          <Search class="size-5" aria-hidden="true" />
        </button>

        <!-- Account -->
        <div v-if="auth.isLoggedIn" ref="accountRef" class="relative">
          <button
            type="button"
            class="flex h-10 items-center gap-2 rounded-lg px-2 text-sm font-medium text-navy-800 hover:bg-navy-50 sm:px-3"
            :aria-expanded="accountMenu"
            aria-haspopup="menu"
            @click.stop="accountMenu = !accountMenu"
          >
            <UserRound class="size-5" aria-hidden="true" />
            <span class="hidden max-w-28 truncate sm:inline">{{ firstName }}</span>
          </button>
          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            leave-active-class="transition duration-100 ease-in"
            leave-to-class="opacity-0"
          >
            <div v-if="accountMenu" role="menu" class="card absolute end-0 top-12 w-56 overflow-hidden p-1.5 shadow-[var(--shadow-raised)]">
              <div class="border-b border-line px-3 py-2.5">
                <p class="truncate text-sm font-semibold">{{ auth.user?.fullName }}</p>
                <p class="ltr truncate text-xs text-muted">{{ auth.user?.email }}</p>
              </div>
              <NuxtLink role="menuitem" to="/account" class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-navy-50">
                <LayoutDashboard class="size-4 text-navy-500" aria-hidden="true" /> پیشخوان
              </NuxtLink>
              <NuxtLink role="menuitem" to="/account/orders" class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-navy-50">
                <Package class="size-4 text-navy-500" aria-hidden="true" /> سفارش‌های من
              </NuxtLink>
              <NuxtLink role="menuitem" to="/account/support" class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-navy-50">
                <LifeBuoy class="size-4 text-navy-500" aria-hidden="true" /> پشتیبانی
              </NuxtLink>
              <NuxtLink v-if="auth.user?.isStaff" role="menuitem" to="/admin" class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-accent-700 hover:bg-accent-50">
                <ShieldCheck class="size-4" aria-hidden="true" /> پنل مدیریت
              </NuxtLink>
              <button role="menuitem" type="button" class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-700 hover:bg-red-50" @click="logout">
                <LogOut class="size-4" aria-hidden="true" /> خروج
              </button>
            </div>
          </Transition>
        </div>
        <NuxtLink
          v-else
          :to="{ path: '/auth/login', query: route.path.startsWith('/auth') ? {} : { redirect: route.fullPath } }"
          class="flex h-10 items-center gap-2 rounded-lg px-2 text-sm font-medium text-navy-800 hover:bg-navy-50 sm:px-3"
        >
          <UserRound class="size-5" aria-hidden="true" />
          <span class="hidden sm:inline">ورود / ثبت‌نام</span>
        </NuxtLink>

        <!-- Cart -->
        <NuxtLink
          to="/cart"
          class="relative flex h-10 items-center gap-2 rounded-lg px-2 text-sm font-medium text-navy-800 hover:bg-navy-50 sm:px-3"
          :aria-label="`سبد خرید، ${faNumber(cart.count)} مورد`"
        >
          <ShoppingBag class="size-5" aria-hidden="true" />
          <span class="hidden sm:inline">سبد خرید</span>
          <ClientOnly>
            <span
              v-if="cart.count > 0"
              class="tabular absolute -top-0.5 start-6 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-600 px-1 text-[11px] font-bold text-white ring-2 ring-white transition-transform sm:static sm:ring-0"
              :class="bump ? 'scale-125' : 'scale-100'"
              aria-hidden="true"
            >
              {{ faNumber(cart.count) }}
            </span>
          </ClientOnly>
        </NuxtLink>
      </div>
    </div>

    <!-- Mobile search -->
    <div v-if="mobileSearch" class="container-page pb-3 lg:hidden">
      <LayoutSearchBox autofocus @submitted="mobileSearch = false" />
    </div>

    <!-- Desktop category nav -->
    <nav aria-label="دسته‌بندی محصولات" class="hidden border-t border-line lg:block">
      <ul class="container-page flex h-12 items-center gap-1 text-sm">
        <li>
          <NuxtLink to="/shop" class="rounded-lg px-3 py-2 font-medium text-navy-700 hover:bg-navy-50 hover:text-navy-900" active-class="!text-accent-700">
            همه محصولات
          </NuxtLink>
        </li>
        <li v-for="c in categories" :key="c.slug">
          <NuxtLink :to="`/c/${c.slug}`" class="rounded-lg px-3 py-2 font-medium text-navy-700 hover:bg-navy-50 hover:text-navy-900" active-class="!text-accent-700">
            {{ c.name }}
          </NuxtLink>
        </li>
        <li class="ms-auto">
          <NuxtLink to="/faq" class="rounded-lg px-3 py-2 text-muted hover:text-navy-900">سؤالات متداول</NuxtLink>
        </li>
        <li>
          <NuxtLink to="/support" class="rounded-lg px-3 py-2 text-muted hover:text-navy-900">پشتیبانی</NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- Mobile drawer -->
    <Teleport to="body">
      <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" leave-active-class="transition-opacity duration-150" leave-to-class="opacity-0">
        <div v-if="mobileMenu" class="fixed inset-0 z-50 bg-navy-950/40 lg:hidden" aria-hidden="true" @click="mobileMenu = false" />
      </Transition>
      <Transition
        enter-active-class="transition-transform duration-200 ease-out"
        enter-from-class="translate-x-full"
        leave-active-class="transition-transform duration-150 ease-in"
        leave-to-class="translate-x-full"
      >
        <aside
          v-if="mobileMenu"
          id="mobile-menu"
          class="fixed inset-y-0 start-0 z-50 flex w-[86%] max-w-sm flex-col bg-white shadow-xl lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="منوی اصلی"
        >
          <div class="flex h-16 items-center justify-between border-b border-line px-4">
            <BrandLogo />
            <button type="button" class="flex size-10 items-center justify-center rounded-lg hover:bg-navy-50" aria-label="بستن منو" @click="mobileMenu = false">
              <X class="size-6" aria-hidden="true" />
            </button>
          </div>
          <nav class="flex-1 overflow-y-auto p-3" aria-label="منوی موبایل">
            <p class="px-3 pt-2 pb-1 text-xs font-semibold text-muted">دسته‌بندی‌ها</p>
            <NuxtLink to="/shop" class="flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium hover:bg-navy-50">همه محصولات</NuxtLink>
            <NuxtLink v-for="c in categories" :key="c.slug" :to="`/c/${c.slug}`" class="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-navy-50">
              <CatalogCategoryIcon :icon="c.icon" size="sm" />
              <span class="font-medium">{{ c.name }}</span>
            </NuxtLink>
            <p class="mt-4 px-3 pt-2 pb-1 text-xs font-semibold text-muted">راهنما</p>
            <NuxtLink to="/faq" class="block rounded-lg px-3 py-2.5 hover:bg-navy-50">سؤالات متداول</NuxtLink>
            <NuxtLink to="/support" class="block rounded-lg px-3 py-2.5 hover:bg-navy-50">پشتیبانی</NuxtLink>
            <NuxtLink to="/refund-policy" class="block rounded-lg px-3 py-2.5 hover:bg-navy-50">قوانین بازپرداخت</NuxtLink>
          </nav>
          <div class="border-t border-line p-4">
            <UiButton v-if="!auth.isLoggedIn" to="/auth/login" block>ورود / ثبت‌نام</UiButton>
            <UiButton v-else to="/account" variant="secondary" block>پیشخوان حساب کاربری</UiButton>
          </div>
        </aside>
      </Transition>
    </Teleport>
  </header>
</template>
