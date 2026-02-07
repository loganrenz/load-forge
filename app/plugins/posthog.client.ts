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
