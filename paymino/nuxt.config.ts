import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },

  modules: ['@pinia/nuxt'],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  runtimeConfig: {
    // Server-only settings (never exposed to the browser).
    // When the Django backend is ready, the browser talks to it directly via apiBase.
    public: {
      // Default: the bundled mock API under /api. Point to Django later, e.g. https://api.paymino.ir/api
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'fa', dir: 'rtl' },
      titleTemplate: '%s | پی‌مینو',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#0B1F3A' },
        {
          name: 'description',
          content: 'پی‌مینو؛ خرید گیفت کارت، شارژ حساب و پرداخت سرویس‌های دیجیتال بین‌المللی با قیمت شفاف به تومان.',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        {
          rel: 'preload',
          href: '/fonts/Vazirmatn-Variable.woff2',
          as: 'font',
          type: 'font/woff2',
          crossorigin: '',
        },
      ],
    },
  },

  typescript: {
    strict: true,
  },
})
