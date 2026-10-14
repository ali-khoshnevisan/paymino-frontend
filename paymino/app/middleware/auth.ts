// Protect account pages: send guests to login and bring them back afterwards.
export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  if (!auth.isLoggedIn) {
    return navigateTo({ path: '/auth/login', query: { redirect: to.fullPath } })
  }
})
