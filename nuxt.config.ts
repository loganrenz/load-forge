// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@nuxt/fonts',
    'nuxt-gtag',
  ],

  gtag: {
    id: 'G-TWGT0E9ZXE',
  },


  ui: {
    colorMode: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Server-only keys
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    stripePriceIdPro: process.env.STRIPE_PRICE_ID_PRO || '',
    stripePriceIdBusiness: process.env.STRIPE_PRICE_ID_BUSINESS || '',

    // Apple Sign-In (server-only)
    appleTeamId: process.env.APPLE_TEAM_ID || '',
    appleClientId: process.env.APPLE_CLIENT_ID || '',
    appleKeyId: process.env.APPLE_KEY_ID || '',
    appleSecretKey: process.env.APPLE_SECRET_KEY || '',

    public: {
      posthogPublicKey: process.env.POSTHOG_PUBLIC_KEY || '',
      posthogHost: 'https://us.i.posthog.com',
      posthogDefaults: '2025-11-30',
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      stripePriceIdPro: process.env.STRIPE_PRICE_ID_PRO || '',
      stripePriceIdBusiness: process.env.STRIPE_PRICE_ID_BUSINESS || '',
      appUrl: process.env.APP_URL || 'http://localhost:3000',
    },
  },

  app: {
    head: {
      title: 'loadtest.dev — k6 Load Testing Platform',
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        { name: 'description', content: 'Professional load testing powered by k6. Start free with 200 virtual users — no credit card required.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'theme-color', content: '#4f46e5' },
        // OpenGraph
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'loadtest.dev' },
        { property: 'og:title', content: 'loadtest.dev — k6 Load Testing Platform' },
        { property: 'og:description', content: 'Professional load testing powered by k6. Start free with 200 virtual users — no credit card required.' },
        { property: 'og:image', content: 'https://loadtest.dev/og-image.png' },
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'loadtest.dev — k6 Load Testing Platform' },
        { name: 'twitter:description', content: 'Professional load testing powered by k6. Start free with 200 virtual users — no credit card required.' },
        { name: 'twitter:image', content: 'https://loadtest.dev/og-image.png' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'canonical', href: 'https://loadtest.dev' },
      ],
    },
  },

  nitro: {
    preset: 'cloudflare-pages',
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
  },

  future: {
    compatibilityVersion: 4,
  },
})
