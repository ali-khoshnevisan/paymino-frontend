import { defineStore } from 'pinia'
import type { User } from '#shared/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const ready = ref(false)
  const isLoggedIn = computed(() => !!user.value)

  async function fetchUser() {
    const api = useApi()
    try {
      const res = await api<{ user: User }>('/auth/me')
      user.value = res.user
    } catch {
      user.value = null
    } finally {
      ready.value = true
    }
  }

  async function login(identifier: string, password: string) {
    const res = await useApi()<{ user: User }>('/auth/login', { method: 'POST', body: { identifier, password } })
    user.value = res.user
    return res.user
  }

  async function register(input: { fullName: string; email: string; phone?: string; password: string }) {
    const res = await useApi()<{ user: User }>('/auth/register', { method: 'POST', body: input })
    user.value = res.user
    return res.user
  }

  async function logout() {
    try {
      await useApi()('/auth/logout', { method: 'POST' })
    } finally {
      user.value = null
    }
  }

  function setUser(u: User) {
    user.value = u
  }

  return { user, ready, isLoggedIn, fetchUser, login, register, logout, setUser }
})
