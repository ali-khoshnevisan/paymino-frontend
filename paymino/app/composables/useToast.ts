export interface Toast {
  id: number
  message: string
  tone: 'success' | 'info' | 'danger'
  action?: { label: string; to: string }
}

let seq = 0

export function useToast() {
  const toasts = useState<Toast[]>('toasts', () => [])

  function show(message: string, opts: Partial<Omit<Toast, 'id' | 'message'>> & { duration?: number } = {}) {
    const id = ++seq
    toasts.value = [...toasts.value.slice(-2), { id, message, tone: opts.tone ?? 'success', action: opts.action }]
    if (import.meta.client) setTimeout(() => dismiss(id), opts.duration ?? 4000)
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { toasts, show, dismiss }
}
