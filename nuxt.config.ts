import pkg from './package.json'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@nuxt/fonts',
    'nuxt-gtag',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots'
  ],

  site: {
    url: 'https://loadtest-dev.pages.dev',
    name: 'loadtest.dev — k6 Load Testing Platform'
  },

  sitemap: {
    sources: ['/api/sitemap-urls'],
    excludeUrls: ['/admin/**', '/dashboard', '/settings', '/runs/**', '/scripts/**', '/login']
  },

  robots: {
    disallow: ['/admin/', '/dashboard', '/settings', '/runs/', '/scripts/', '/api/']
  },

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
      appUrl: process.env.APP_URL || 'https://loadtest-dev.pages.dev',
      // App name for partitioning in a single PostHog project (set APP_NAME in Doppler)
      appName: process.env.APP_NAME || pkg.name || ''
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
        { property: 'og:image', content: 'https://loadtest-dev.pages.dev/og-image.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'loadtest.dev — k6 Load Testing Platform' },
        { name: 'twitter:description', content: 'Professional load testing powered by k6. Start free with 200 virtual users — no credit card required.' },
        { name: 'twitter:image', content: 'https://loadtest-dev.pages.dev/og-image.png' },
        { name: 'google-site-verification', content: '' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'canonical', href: 'https://loadtest-dev.pages.dev' },
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
