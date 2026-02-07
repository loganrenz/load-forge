export const useAnalytics = () => {
  const { gtag } = useGtag()
  const { $posthog } = useNuxtApp()

  const track = (eventName: string, properties?: Record<string, any>) => {
    // Track with GTag (Google Analytics 4)
    gtag('event', eventName, properties)

    // Track with PostHog
    if ($posthog) {
      $posthog.capture(eventName, properties)
    }
  }

  const identify = (userId: string, properties?: Record<string, any>) => {
    // PostHog identification
    if ($posthog) {
      $posthog.identify(userId, properties)
    }
    
    // GA4 User ID
    gtag('config', 'G-TWGT0E9ZXE', {
      user_id: userId,
      ...properties
    })
  }

  return {
    track,
    identify
  }
}
