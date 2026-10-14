// Resolve the session before route middleware runs, so SSR and the client agree on who is signed in.
export default defineNuxtPlugin({
  name: 'paymino-auth',
  dependsOn: ['pinia'],
  async setup() {
    const auth = useAuthStore()
    if (!auth.ready) await auth.fetchUser()
  },
})
