/** Seconds remaining until `target` (ISO string), ticking every second on the client. */
export function useCountdown(target: Ref<string | null | undefined>) {
  const now = ref(Date.now())
  let timer: ReturnType<typeof setInterval> | undefined

  onMounted(() => {
    timer = setInterval(() => (now.value = Date.now()), 1000)
  })
  onBeforeUnmount(() => clearInterval(timer))

  const seconds = computed(() => {
    if (!target.value) return 0
    return Math.max(0, Math.floor((new Date(target.value).getTime() - now.value) / 1000))
  })
  const label = computed(() => {
    const m = Math.floor(seconds.value / 60)
    const s = seconds.value % 60
    return faDigits(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
  })
  return { seconds, label }
}
