import { posthog } from 'posthog-js'

export default defineNuxtPlugin(() => {
  const runtimeConfig = useRuntimeConfig()
  const posthogApiKey = runtimeConfig.public.posthogPublicKey
  const posthogHost = runtimeConfig.public.posthogHost

  if (!posthogApiKey || import.meta.server) return

  const posthogClient = posthog.init(posthogApiKey, {
    api_host: '/ph',
    ui_host: 'https://us.posthog.com',
    capture_pageview: false, // We'll handle this manually to ensure it works with Nuxt navigation
    capture_pageleave: true,
    loaded: (posthog) => {
      if (import.meta.dev) posthog.debug()

      // Opt out entirely on localhost — no events captured during local dev
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        posthog.opt_out_capturing()
        return
      }

      // Tag preview deploy traffic as internal for dashboard filtering
      if (window.location.hostname.endsWith('.pages.dev')) {
        posthog.register({ is_internal_user: true })
      }
    }
  })

  // Make posthog available as $posthog
  const router = useRouter()
  router.afterEach((to) => {
    nextTick(() => {
      posthog.capture('$pageview', {
        $current_url: window.location.origin + to.fullPath
      })
    })
  })

  return {
    provide: {
      posthog: posthogClient
    }
  }
})
