// v-reveal: the element rises into place the first time it scrolls into view.
// Content is never hidden without script: the hidden start state is only applied on the client,
// only to elements still below the fold, and never under prefers-reduced-motion.
// Usage: v-reveal or v-reveal="90" (delay in ms, for staggering siblings).
export default defineNuxtPlugin((nuxtApp) => {
  let observer: IntersectionObserver | undefined

  nuxtApp.vueApp.directive<HTMLElement, number | undefined>('reveal', {
    getSSRProps: () => ({}),
    mounted(el, binding) {
      if (typeof IntersectionObserver === 'undefined' || matchMedia('(prefers-reduced-motion: reduce)').matches) return
      if (el.getBoundingClientRect().top < innerHeight * 0.9) return // already on screen: leave it be
      observer ??= new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue
            const target = e.target as HTMLElement
            target.classList.add('is-in')
            observer!.unobserve(target)
            // Once in place, hand the element back to its own styles (cards keep their hover transitions)
            const done = (ev: TransitionEvent) => {
              if (ev.target !== target) return // a child's own transition bubbling up
              target.removeEventListener('transitionend', done)
              target.classList.remove('pm-reveal', 'is-in')
              target.style.transitionDelay = ''
            }
            target.addEventListener('transitionend', done)
          }
        },
        { rootMargin: '0px 0px -10% 0px' },
      )
      el.style.transitionDelay = `${binding.value ?? 0}ms`
      el.classList.add('pm-reveal')
      observer.observe(el)
    },
    unmounted(el) {
      observer?.unobserve(el)
    },
  })
})
