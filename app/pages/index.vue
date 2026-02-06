<script setup lang="ts">
// Clean landing page — light theme 2026
const { data: user } = await useFetch('/api/auth/me')

useSeoMeta({
  title: 'Load Testing for Professional Teams — loadtest.dev',
  ogTitle: 'Load Testing for Professional Teams — loadtest.dev',
  description: 'Scale your web applications with ease. Run k6 load tests globally with up to 10,000 virtual users. Real-time metrics, JS scripting, and enterprise features.',
  ogDescription: 'Scale your web applications with ease. Run k6 load tests globally with up to 10,000 virtual users. Real-time metrics, JS scripting, and enterprise features.',
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': 'loadtest.dev',
        'operatingSystem': 'Web',
        'applicationCategory': 'DeveloperApplication',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': '4.9',
          'ratingCount': '124'
        }
      })
    }
  ]
})

const features = [
  {
    icon: 'i-heroicons-bolt',
    title: 'Lightning Fast',
    description: 'Run tests with up to 10,000 virtual users powered by k6',
  },
  {
    icon: 'i-heroicons-chart-bar',
    title: 'Real-time Metrics',
    description: 'Watch your performance metrics stream live as tests run',
  },
  {
    icon: 'i-heroicons-globe-alt',
    title: 'Global Load Zones',
    description: 'Test from multiple regions around the world',
  },
  {
    icon: 'i-heroicons-code-bracket',
    title: 'JavaScript Scripting',
    description: 'Write powerful tests with k6\'s JavaScript API',
  },
  {
    icon: 'i-heroicons-shield-check',
    title: 'Enterprise Ready',
    description: 'API access, webhooks, and team collaboration',
  },
  {
    icon: 'i-heroicons-credit-card',
    title: 'Free Tier',
    description: 'Get started with 50 VUs — no credit card required',
  },
]

const pricingTiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: ['50 Virtual Users', '1 minute tests', '1 concurrent test', '7 day history'],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For growing teams',
    features: ['500 Virtual Users', '10 minute tests', '3 concurrent tests', '30 day history', 'API Access', 'Scheduled tests'],
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Business',
    price: '$99',
    period: '/month',
    description: 'For serious load testing',
    features: ['2,000 Virtual Users', '30 minute tests', '10 concurrent tests', '90 day history', 'Priority support', 'Team collaboration'],
    cta: 'Start Business Trial',
    popular: false,
  },
]
</script>

<template>
  <div class="min-h-screen bg-white text-slate-900">
    <!-- Navigation -->
    <nav class="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
      <div class="container mx-auto px-6 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <UIcon name="i-heroicons-bolt" class="w-5 h-5 text-white" />
          </div>
          <span class="font-bold text-lg text-slate-900">loadtest.dev</span>
        </NuxtLink>
        
        <div class="flex items-center gap-4">
          <NuxtLink to="/pricing" class="text-slate-500 hover:text-slate-900 transition text-sm font-medium">
            Pricing
          </NuxtLink>
          <NuxtLink to="/docs" class="text-slate-500 hover:text-slate-900 transition text-sm font-medium">
            Docs
          </NuxtLink>
          <template v-if="user?.user">
            <NuxtLink to="/dashboard">
              <UButton color="primary" variant="soft" size="sm">Dashboard</UButton>
            </NuxtLink>
          </template>
          <template v-else>
            <NuxtLink to="/login">
              <UButton variant="ghost" color="neutral" size="sm">Log in</UButton>
            </NuxtLink>
            <NuxtLink to="/signup">
              <UButton color="primary" size="sm" class="btn-primary">Get Started</UButton>
            </NuxtLink>
          </template>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative pt-28 pb-16 overflow-hidden">
      <div class="absolute inset-0 gradient-mesh-light" />
      
      <div class="container mx-auto px-6 relative">
        <div class="max-w-3xl mx-auto text-center">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium mb-8">
            <UIcon name="i-heroicons-sparkles" class="w-4 h-4" />
            Powered by k6 open-source engine
          </div>
          
          <h1 class="text-5xl md:text-6xl font-bold mb-5 tracking-tight text-slate-900">
            Load Testing<br />
            <span class="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Made Simple</span>
          </h1>
          
          <p class="text-lg text-slate-500 mb-10 max-w-xl mx-auto leading-relaxed">
            Professional load testing in minutes. Write tests in JavaScript, run them globally, 
            and get real-time performance insights.
          </p>
          
          <div class="flex items-center justify-center gap-3">
            <NuxtLink to="/signup">
              <UButton size="lg" color="primary" class="btn-primary">
                Start for Free
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 ml-1.5" />
              </UButton>
            </NuxtLink>
            <NuxtLink to="/docs">
              <UButton size="lg" variant="outline" color="neutral">
                Documentation
              </UButton>
            </NuxtLink>
          </div>
        </div>

        <!-- Code preview -->
        <div class="mt-16 max-w-2xl mx-auto">
          <div class="rounded-xl bg-slate-950 overflow-hidden shadow-2xl shadow-slate-900/10 ring-1 ring-slate-900/5">
            <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/80">
              <div class="w-3 h-3 rounded-full bg-red-400" />
              <div class="w-3 h-3 rounded-full bg-amber-400" />
              <div class="w-3 h-3 rounded-full bg-green-400" />
              <span class="ml-3 text-xs text-slate-500 font-mono">test.js</span>
            </div>
            <pre class="p-5 text-sm overflow-x-auto"><code class="text-slate-300"><span class="text-violet-400">import</span> http <span class="text-violet-400">from</span> <span class="text-emerald-400">'k6/http'</span>;
<span class="text-violet-400">import</span> { check, sleep } <span class="text-violet-400">from</span> <span class="text-emerald-400">'k6'</span>;

<span class="text-violet-400">export const</span> options = {
  vus: <span class="text-amber-400">100</span>,
  duration: <span class="text-emerald-400">'30s'</span>,
};

<span class="text-violet-400">export default function</span> () {
  <span class="text-violet-400">const</span> res = http.get(<span class="text-emerald-400">'https://api.example.com'</span>);
  check(res, {
    <span class="text-emerald-400">'status is 200'</span>: (r) =&gt; r.status === <span class="text-amber-400">200</span>,
    <span class="text-emerald-400">'response &lt; 200ms'</span>: (r) =&gt; r.timings.duration &lt; <span class="text-amber-400">200</span>,
  });
  sleep(<span class="text-amber-400">1</span>);
}</code></pre>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 border-t border-slate-100">
      <div class="container mx-auto px-6">
        <div class="text-center mb-14">
          <h2 class="text-3xl font-bold mb-3 text-slate-900">
            Everything you need
          </h2>
          <p class="text-slate-500 text-lg">
            Professional-grade tools with an intuitive interface
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          <div 
            v-for="feature in features" 
            :key="feature.title"
            class="group p-6 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-200 transition-all duration-200 hover:shadow-md"
          >
            <div class="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition">
              <UIcon :name="feature.icon" class="w-5 h-5 text-indigo-600" />
            </div>
            <h3 class="text-base font-semibold mb-1.5 text-slate-900">{{ feature.title }}</h3>
            <p class="text-slate-500 text-sm leading-relaxed">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="py-20 bg-slate-50/50 border-t border-slate-100">
      <div class="container mx-auto px-6">
        <div class="text-center mb-14">
          <h2 class="text-3xl font-bold mb-3 text-slate-900">
            Simple pricing
          </h2>
          <p class="text-slate-500 text-lg">
            Start free, upgrade when you need more power
          </p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div 
            v-for="tier in pricingTiers" 
            :key="tier.name"
            :class="[
              'relative rounded-2xl p-7 border transition-all duration-200',
              tier.popular 
                ? 'bg-white border-indigo-200 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-100' 
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
            ]"
          >
            <div v-if="tier.popular" class="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span class="px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-semibold">
                Most Popular
              </span>
            </div>
            
            <h3 class="text-lg font-bold mb-1 text-slate-900">{{ tier.name }}</h3>
            <p class="text-slate-500 text-sm mb-4">{{ tier.description }}</p>
            
            <div class="mb-6">
              <span class="text-3xl font-bold text-slate-900">{{ tier.price }}</span>
              <span class="text-slate-400 text-sm">{{ tier.period }}</span>
            </div>
            
            <ul class="space-y-2.5 mb-7">
              <li v-for="feature in tier.features" :key="feature" class="flex items-center gap-2.5">
                <UIcon name="i-heroicons-check-circle" class="w-4.5 h-4.5 text-indigo-500 shrink-0" />
                <span class="text-slate-600 text-sm">{{ feature }}</span>
              </li>
            </ul>
            
            <NuxtLink to="/signup">
              <UButton 
                block 
                size="lg"
                :color="tier.popular ? 'primary' : 'neutral'"
                :variant="tier.popular ? 'solid' : 'outline'"
                :class="tier.popular ? 'btn-primary' : ''"
              >
                {{ tier.cta }}
              </UButton>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 border-t border-slate-100">
      <div class="container mx-auto px-6">
        <div class="max-w-2xl mx-auto text-center">
          <h2 class="text-3xl font-bold mb-3 text-slate-900">
            Ready to start?
          </h2>
          <p class="text-slate-500 text-lg mb-8">
            Join developers using loadtest.dev to ensure their apps perform under pressure.
          </p>
          <NuxtLink to="/signup">
            <UButton size="lg" color="primary" class="btn-primary">
              Get Started Free
              <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 ml-1.5" />
            </UButton>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-10 border-t border-slate-100">
      <div class="container mx-auto px-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <UIcon name="i-heroicons-bolt" class="w-4 h-4 text-white" />
            </div>
            <span class="font-semibold text-sm text-slate-900">loadtest.dev</span>
          </div>
          <p class="text-slate-400 text-sm">
            © 2026 loadtest.dev
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>
