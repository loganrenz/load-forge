<script setup lang="ts">
useSeoMeta({
  title: 'Understanding Load Test Results — loadtest.dev',
  ogTitle: 'Understanding Load Test Results — loadtest.dev',
  description: 'How to interpret load test results: response times, throughput, error rates, percentiles, and when your application needs to scale.',
  ogDescription: 'How to interpret load test results: response times, throughput, error rates, percentiles, and when your application needs to scale.',
})

useHead({
  link: [{ rel: 'canonical', href: 'https://loadtest.dev/docs/understanding-results' }],
})

const metrics = [
  {
    name: 'Response Time (http_req_duration)',
    icon: 'i-heroicons-clock',
    description: 'How long it takes for your server to respond. Look at the median (p50) for typical performance and p95/p99 for tail latency.',
    good: 'p95 under 500ms for APIs, under 2s for web pages',
    bad: 'p95 over 1s for APIs or rapidly increasing over time',
  },
  {
    name: 'Throughput (http_reqs)',
    icon: 'i-heroicons-arrow-trending-up',
    description: 'Requests per second your server handles. Should scale linearly with VUs until your server hits its limit.',
    good: 'Throughput increases as VUs increase',
    bad: 'Throughput plateaus or drops as VUs increase — server is saturated',
  },
  {
    name: 'Error Rate (http_req_failed)',
    icon: 'i-heroicons-exclamation-triangle',
    description: 'Percentage of requests that return HTTP error codes (4xx/5xx) or connection failures.',
    good: 'Under 0.1% for production-ready systems',
    bad: 'Over 1% — investigate the error distribution and fix root causes',
  },
  {
    name: 'Check Pass Rate (checks)',
    icon: 'i-heroicons-check-badge',
    description: 'How many of your custom checks passed. Checks validate response bodies, headers, and status codes.',
    good: 'Over 99% pass rate',
    bad: 'Under 95% — your API is returning unexpected responses under load',
  },
  {
    name: 'Data Transfer (data_received / data_sent)',
    icon: 'i-heroicons-arrows-right-left',
    description: 'Total bytes transferred during the test. Useful for estimating bandwidth costs and detecting payload bloat.',
    good: 'Consistent with expected response sizes',
    bad: 'Much larger than expected — check for verbose logging or debug responses',
  },
  {
    name: 'Virtual Users (vus)',
    icon: 'i-heroicons-users',
    description: 'Number of concurrent virtual users at any point during the test. Maps to your stages configuration.',
    good: 'Smoothly ramping according to your stages',
    bad: 'VUs not reaching target — k6 can\'t spawn fast enough or hitting connection limits',
  },
]

const percentiles = [
  { name: 'p50 (median)', description: 'Half of requests are faster than this. Your "typical" response time.' },
  { name: 'p90', description: '90% of requests are faster. A good SLA target for most APIs.' },
  { name: 'p95', description: '95% of requests are faster. The industry standard for API performance SLAs.' },
  { name: 'p99', description: '99% of requests are faster. Only 1 in 100 users experiences worse latency. Critical for high-traffic apps.' },
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
          <NuxtLink to="/tools" class="text-slate-500 hover:text-slate-900 transition text-sm font-medium">Tools</NuxtLink>
          <NuxtLink to="/pricing" class="text-slate-500 hover:text-slate-900 transition text-sm font-medium">Pricing</NuxtLink>
          <NuxtLink to="/docs" class="text-indigo-600 font-medium text-sm">Docs</NuxtLink>
          <NuxtLink to="/signup">
            <UButton color="primary" size="sm">Get Started Free</UButton>
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Breadcrumbs -->
    <div class="pt-20 pb-2">
      <div class="container mx-auto px-6">
        <nav class="flex items-center gap-1.5 text-sm text-slate-400">
          <NuxtLink to="/" class="hover:text-slate-600 transition">Home</NuxtLink>
          <span>/</span>
          <NuxtLink to="/docs" class="hover:text-slate-600 transition">Docs</NuxtLink>
          <span>/</span>
          <span class="text-slate-600">Understanding Results</span>
        </nav>
      </div>
    </div>

    <!-- Content -->
    <article class="pt-8 pb-20">
      <div class="container mx-auto px-6">
        <div class="max-w-3xl mx-auto">
          <h1 class="text-4xl font-bold mb-4 tracking-tight text-slate-900">
            Understanding Results
          </h1>
          <p class="text-lg text-slate-500 mb-12 leading-relaxed">
            Learn how to read load test metrics and make data-driven decisions about your infrastructure.
          </p>

          <!-- Key Metrics -->
          <h2 class="text-2xl font-bold mb-6 text-slate-900">Key Metrics</h2>
          <div class="space-y-6 mb-16">
            <div v-for="metric in metrics" :key="metric.name" class="p-6 rounded-xl border border-slate-200 bg-white">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <UIcon :name="metric.icon" class="w-5 h-5 text-indigo-600" />
                </div>
                <h3 class="font-semibold text-slate-900">{{ metric.name }}</h3>
              </div>
              <p class="text-slate-600 text-sm leading-relaxed mb-4">{{ metric.description }}</p>
              <div class="grid grid-cols-2 gap-3">
                <div class="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                  <span class="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Good</span>
                  <p class="text-sm text-emerald-800 mt-1">{{ metric.good }}</p>
                </div>
                <div class="p-3 rounded-lg bg-red-50 border border-red-100">
                  <span class="text-xs font-semibold text-red-700 uppercase tracking-wider">Investigate</span>
                  <p class="text-sm text-red-800 mt-1">{{ metric.bad }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Percentiles -->
          <h2 class="text-2xl font-bold mb-4 text-slate-900">Understanding Percentiles</h2>
          <p class="text-slate-600 mb-6 leading-relaxed">
            Averages lie. If your average response time is 200ms but your p99 is 5 seconds, 1 in 100 users is having a terrible experience. Always use percentiles.
          </p>
          <div class="overflow-hidden rounded-xl border border-slate-200">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200">
                  <th class="text-left px-5 py-3 font-semibold text-slate-700">Percentile</th>
                  <th class="text-left px-5 py-3 font-semibold text-slate-700">What it means</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in percentiles" :key="p.name" class="border-b border-slate-100 last:border-0">
                  <td class="px-5 py-3 font-medium text-slate-900 whitespace-nowrap">{{ p.name }}</td>
                  <td class="px-5 py-3 text-slate-600">{{ p.description }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Red Flags -->
          <div class="mt-14">
            <h2 class="text-2xl font-bold mb-4 text-slate-900">Red Flags to Watch For</h2>
            <ul class="space-y-3">
              <li class="flex items-start gap-3">
                <span class="text-red-500 mt-0.5">⚠️</span>
                <span class="text-slate-600"><strong class="text-slate-900">Response time increases with VUs</strong> — Your server is saturated. Scale horizontally or optimize bottlenecks.</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="text-red-500 mt-0.5">⚠️</span>
                <span class="text-slate-600"><strong class="text-slate-900">Throughput plateaus while VUs increase</strong> — You've hit a concurrency limit. Check database connections, thread pools, or rate limits.</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="text-red-500 mt-0.5">⚠️</span>
                <span class="text-slate-600"><strong class="text-slate-900">Error rate spikes suddenly</strong> — Likely a resource exhaustion issue. Check memory, CPU, or connection pool limits.</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="text-red-500 mt-0.5">⚠️</span>
                <span class="text-slate-600"><strong class="text-slate-900">Large gap between p50 and p99</strong> — Inconsistent performance. Look for garbage collection pauses, cold caches, or noisy neighbors.</span>
              </li>
            </ul>
          </div>

          <!-- Next steps -->
          <div class="mt-14 p-6 rounded-xl bg-indigo-50 border border-indigo-100">
            <h3 class="text-lg font-semibold text-slate-900 mb-3">Next steps</h3>
            <div class="space-y-2">
              <NuxtLink to="/tools/capacity-planning" class="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
                Capacity planning guide
              </NuxtLink>
              <NuxtLink to="/tools/performance-testing-checklist" class="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
                Performance testing checklist
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </article>

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
          <p class="text-slate-400 text-sm">© 2026 loadtest.dev</p>
        </div>
      </div>
    </footer>
  </div>
</template>
