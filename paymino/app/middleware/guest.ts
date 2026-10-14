// Login/register pages: already signed-in users go to their destination.
export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  if (auth.isLoggedIn) return navigateTo(safeRedirect(to.query.redirect))
})
