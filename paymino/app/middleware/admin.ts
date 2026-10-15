// Admin panel: staff only. Guests go to login; signed-in customers get a 404 (the panel's existence isn't advertised).
export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  if (!auth.isLoggedIn) return navigateTo({ path: '/auth/login', query: { redirect: to.fullPath } })
  if (!auth.user?.isStaff) return abortNavigation(createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true }))
})