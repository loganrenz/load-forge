<script setup lang="ts">
useSeoMeta({
  title: 'Transparent Pricing for Global Load Testing — loadtest.dev',
  ogTitle: 'Transparent Pricing for Global Load Testing — loadtest.dev',
  description: 'Choose the right plan for your load testing needs. From free tier for individuals to high-scale business plans with 2,000+ virtual users.',
  ogDescription: 'Choose the right plan for your load testing needs. From free tier for individuals to high-scale business plans with 2,000+ virtual users.',
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify([
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          'name': 'loadtest.dev Load Testing Plans',
          'description': 'Choose from Free, Pro, or Business load testing plans.',
          'brand': {
            '@type': 'Brand',
            'name': 'loadtest.dev'
          },
          'offers': [
            {
              '@type': 'Offer',
              'name': 'Free Plan',
              'price': '0',
              'priceCurrency': 'USD',
              'availability': 'https://schema.org/InStock'
            },
            {
              '@type': 'Offer',
              'name': 'Pro Plan',
              'price': '29',
              'priceCurrency': 'USD',
              'availability': 'https://schema.org/InStock'
            },
            {
              '@type': 'Offer',
              'name': 'Business Plan',
              'price': '99',
              'priceCurrency': 'USD',
              'availability': 'https://schema.org/InStock'
            }
          ]
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          'mainEntity': [
            {
              '@type': 'Question',
              'name': 'Can I change plans anytime?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes! Upgrade or downgrade anytime. Changes take effect immediately.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Do you offer a free trial?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'The Free tier is available forever with no credit card required.'
              }
            }
          ]
        }
      ])
    }
  ]
})
definePageMeta({
  layout: false,
})

const { data: authData } = await useFetch('/api/auth/me')
const isLoggedIn = computed(() => !!authData.value?.user)
const currentTier = computed(() => authData.value?.user?.subscription?.tier || 'free')
const loading = ref<string | null>(null)
const error = ref('')

const config = useRuntimeConfig()
const tiers = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started with load testing',
    features: [
      '50 Virtual Users',
      '1 minute max test duration',
      '1 concurrent test',
      '7 day test history',
    ],
    limitations: [
      'No API access',
      'No scheduled tests',
    ],
    cta: 'Get Started',
    priceId: null as string | null,
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For growing teams that need more power',
    features: [
      '500 Virtual Users',
      '10 minute max test duration',
      '3 concurrent tests',
      '30 day test history',
      'Full API access',
      'Scheduled tests',
    ],
    limitations: [],
    cta: 'Start Pro',
    priceId: config.public.stripePriceIdPro,
    highlight: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: '$99',
    period: '/month',
    description: 'For serious load testing at scale',
    features: [
      '2,000 Virtual Users',
      '30 minute max test duration',
      '10 concurrent tests',
      '90 day test history',
      'Full API access',
      'Scheduled tests',
      'Priority support',
      'Team collaboration',
    ],
    limitations: [],
    cta: 'Start Business',
    priceId: config.public.stripePriceIdBusiness,
    highlight: false,
  },
]

async function subscribe(tier: typeof tiers[0]) {
  if (tier.id === 'free') {
    if (isLoggedIn.value) {
      return navigateTo('/dashboard')
    }
    return navigateTo('/signup')
  }

  if (!isLoggedIn.value) {
    return navigateTo('/signup')
  }

  if (currentTier.value === tier.id) return

  loading.value = tier.id
  error.value = ''

  try {
    const { url } = await $fetch<{ url: string }>('/api/billing/checkout', {
      method: 'POST',
      body: { priceId: tier.priceId },
    })
    if (url) {
      window.location.href = url
    }
  }
  catch (e: any) {
    error.value = e?.data?.message || 'Failed to start checkout'
  }
  finally {
    loading.value = null
  }
}
</script>

<template>
  <div class="min-h-screen bg-white text-slate-900">
    <!-- Navigation -->
    <nav class="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
      <div class="container mx-auto px-6 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <UIcon name="i-heroicons-bolt" class="w-4 h-4 text-white" />
          </div>
          <span class="text-lg font-bold tracking-tight">loadtest.dev</span>
        </NuxtLink>
        <div class="flex items-center gap-4">
          <NuxtLink v-if="isLoggedIn" to="/dashboard" class="text-slate-500 hover:text-slate-900 transition text-sm font-medium">
            Dashboard
          </NuxtLink>
          <template v-else>
            <NuxtLink to="/login" class="text-slate-500 hover:text-slate-900 transition text-sm font-medium">
              Log in
            </NuxtLink>
            <NuxtLink
              to="/signup"
              class="h-9 px-4 bg-slate-900 text-white text-sm font-medium rounded-lg flex items-center hover:bg-slate-800 transition"
            >
              Sign Up
            </NuxtLink>
          </template>
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <div class="pt-32 pb-16 text-center">
      <h1 class="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
        Simple, transparent pricing
      </h1>
      <p class="text-lg text-slate-500 max-w-lg mx-auto">
        Start free, scale when you need to. No hidden fees.
      </p>
    </div>

    <!-- Error banner -->
    <div v-if="error" class="max-w-3xl mx-auto px-6 mb-6">
      <div class="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
        {{ error }}
      </div>
    </div>

    <!-- Pricing Cards -->
    <div class="max-w-5xl mx-auto px-6 pb-20">
      <div class="grid md:grid-cols-3 gap-6">
        <div
          v-for="tier in tiers"
          :key="tier.id"
          class="relative bg-white rounded-2xl border p-7 flex flex-col"
          :class="tier.highlight
            ? 'border-indigo-500 shadow-lg shadow-indigo-100'
            : 'border-slate-200 shadow-sm'"
        >
          <!-- Popular badge -->
          <div
            v-if="tier.highlight"
            class="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-semibold px-3 py-1 rounded-full"
          >
            Most Popular
          </div>

          <!-- Current plan badge -->
          <div
            v-if="isLoggedIn && currentTier === tier.id"
            class="absolute top-4 right-4"
          >
            <UBadge color="success" variant="subtle" size="sm">Current Plan</UBadge>
          </div>

          <h3 class="text-lg font-bold text-slate-900 mb-1">{{ tier.name }}</h3>
          <p class="text-slate-500 text-sm mb-5">{{ tier.description }}</p>

          <div class="mb-6">
            <span class="text-4xl font-bold text-slate-900">{{ tier.price }}</span>
            <span class="text-slate-500 text-sm ml-1">{{ tier.period }}</span>
          </div>

          <!-- CTA Button -->
          <UButton
            :color="tier.highlight ? 'primary' : 'neutral'"
            :variant="tier.highlight ? 'solid' : 'outline'"
            size="lg"
            block
            class="mb-7"
            :class="tier.highlight ? 'btn-primary' : ''"
            :loading="loading === tier.id"
            :disabled="(isLoggedIn && currentTier === tier.id) || loading !== null"
            @click="subscribe(tier)"
          >
            {{ isLoggedIn && currentTier === tier.id ? 'Current Plan' : tier.cta }}
          </UButton>

          <!-- Features -->
          <div class="space-y-2.5 flex-1">
            <div v-for="feature in tier.features" :key="feature" class="flex items-start gap-2.5">
              <UIcon name="i-heroicons-check" class="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <span class="text-slate-700 text-sm">{{ feature }}</span>
            </div>
            <div v-for="limitation in tier.limitations" :key="limitation" class="flex items-start gap-2.5">
              <UIcon name="i-heroicons-x-mark" class="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />
              <span class="text-slate-400 text-sm">{{ limitation }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Enterprise CTA -->
      <div class="mt-12 text-center bg-slate-50 rounded-2xl border border-slate-200 p-8">
        <h3 class="text-xl font-bold text-slate-900 mb-2">Need enterprise scale?</h3>
        <p class="text-slate-500 text-sm mb-4 max-w-md mx-auto">
          Up to 10,000 VUs, 60 minute tests, unlimited concurrent runs, and dedicated support.
        </p>
        <UButton variant="outline" color="neutral" size="md">
          Contact Sales
        </UButton>
      </div>
    </div>

    <!-- FAQ Section -->
    <div class="border-t border-slate-100 bg-slate-50/50 py-20">
      <div class="max-w-2xl mx-auto px-6">
        <h2 class="text-2xl font-bold text-center text-slate-900 mb-10">Frequently asked questions</h2>
        <div class="space-y-6">
          <div>
            <h3 class="font-semibold text-slate-900 mb-1.5">Can I change plans anytime?</h3>
            <p class="text-slate-500 text-sm">Yes! Upgrade or downgrade anytime. Changes take effect immediately. Downgrades will be applied at the end of your billing cycle.</p>
          </div>
          <div>
            <h3 class="font-semibold text-slate-900 mb-1.5">What happens when I reach my VU limit?</h3>
            <p class="text-slate-500 text-sm">You'll receive a clear error message before running the test. You can either reduce VUs or upgrade your plan to increase the limit.</p>
          </div>
          <div>
            <h3 class="font-semibold text-slate-900 mb-1.5">Do you offer a free trial?</h3>
            <p class="text-slate-500 text-sm">The Free tier is available forever with no credit card required. Paid plans can be canceled at any time — you're never locked in.</p>
          </div>
          <div>
            <h3 class="font-semibold text-slate-900 mb-1.5">What payment methods do you accept?</h3>
            <p class="text-slate-500 text-sm">We accept all major credit and debit cards via Stripe. Enterprise plans can pay by invoice.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
