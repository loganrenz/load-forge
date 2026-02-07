<script setup lang="ts">
useSeoMeta({
  title: 'Getting Started with Load Testing — loadtest.dev',
  ogTitle: 'Getting Started with Load Testing — loadtest.dev',
  description: 'Create your first load test in under 5 minutes. Sign up, write a k6 script, and run your first performance test with loadtest.dev.',
  ogDescription: 'Create your first load test in under 5 minutes. Sign up, write a k6 script, and run your first performance test with loadtest.dev.',
})

useHead({
  link: [{ rel: 'canonical', href: 'https://loadtest.dev/docs/getting-started' }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        'name': 'How to Run Your First Load Test',
        'description': 'Step-by-step guide to creating and running a load test with loadtest.dev',
        'step': [
          { '@type': 'HowToStep', 'position': 1, 'name': 'Sign Up', 'text': 'Create a free account at loadtest.dev. No credit card required.' },
          { '@type': 'HowToStep', 'position': 2, 'name': 'Create a Test Script', 'text': 'Write a k6 test script or use one of our templates.' },
          { '@type': 'HowToStep', 'position': 3, 'name': 'Configure Options', 'text': 'Set the number of virtual users, duration, and target URL.' },
          { '@type': 'HowToStep', 'position': 4, 'name': 'Run Your Test', 'text': 'Click Run and watch real-time metrics stream in.' },
        ],
      }),
    },
  ],
})

const steps = [
  {
    number: '01',
    title: 'Create your account',
    description: 'Sign up with email or Apple ID. It takes 10 seconds and no credit card is required. You get 200 VUs and 5-minute tests immediately.',
  },
  {
    number: '02',
    title: 'Create a test script',
    description: 'Navigate to Scripts → New Script. Choose a template or write your own k6 JavaScript test. Paste the URL of the API or website you want to test.',
  },
  {
    number: '03',
    title: 'Configure your test',
    description: 'Set the number of virtual users (up to 200 on free), test duration (up to 5 minutes on free), and select a load zone.',
  },
  {
    number: '04',
    title: 'Run and analyze',
    description: 'Click Run and watch real-time metrics. Monitor response times, throughput, error rates, and check pass rates as the test executes.',
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
          <span class="text-slate-600">Getting Started</span>
        </nav>
      </div>
    </div>

    <!-- Content -->
    <article class="pt-8 pb-20">
      <div class="container mx-auto px-6">
        <div class="max-w-3xl mx-auto">
          <h1 class="text-4xl font-bold mb-4 tracking-tight text-slate-900">
            Getting Started
          </h1>
          <p class="text-lg text-slate-500 mb-12 leading-relaxed">
            Run your first load test in under 5 minutes. No experience required.
          </p>

          <!-- Steps -->
          <div class="space-y-10">
            <div v-for="step in steps" :key="step.number" class="flex gap-6">
              <div class="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <span class="text-indigo-600 font-bold text-sm">{{ step.number }}</span>
              </div>
              <div>
                <h2 class="text-xl font-semibold mb-2 text-slate-900">{{ step.title }}</h2>
                <p class="text-slate-600 leading-relaxed">{{ step.description }}</p>
              </div>
            </div>
          </div>

          <!-- Example Script -->
          <div class="mt-14">
            <h2 class="text-2xl font-bold mb-4 text-slate-900">Your first test script</h2>
            <p class="text-slate-600 mb-6 leading-relaxed">
              Paste this into the script editor to load test any URL. It simulates 50 users sending requests for 2 minutes:
            </p>
            <div class="rounded-xl bg-slate-950 overflow-hidden shadow-2xl shadow-slate-900/10 ring-1 ring-slate-900/5">
              <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/80">
                <div class="w-3 h-3 rounded-full bg-red-400" />
                <div class="w-3 h-3 rounded-full bg-amber-400" />
                <div class="w-3 h-3 rounded-full bg-green-400" />
                <span class="ml-3 text-xs text-slate-500 font-mono">my-first-test.js</span>
              </div>
              <pre class="p-5 text-sm overflow-x-auto"><code class="text-slate-300">import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '2m',
};

export default function () {
  const res = http.get('https://your-api.example.com');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration &lt; 500,
  });
  
  sleep(1);
}</code></pre>
            </div>
          </div>

          <!-- What to expect -->
          <div class="mt-14">
            <h2 class="text-2xl font-bold mb-4 text-slate-900">What to expect</h2>
            <p class="text-slate-600 mb-6 leading-relaxed">
              While your test runs, you'll see real-time streaming metrics:
            </p>
            <ul class="space-y-3">
              <li class="flex items-start gap-3">
                <UIcon name="i-heroicons-clock" class="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <span class="text-slate-600"><strong class="text-slate-900">Response time</strong> — Average, median, p95, and p99 latency in milliseconds</span>
              </li>
              <li class="flex items-start gap-3">
                <UIcon name="i-heroicons-arrow-trending-up" class="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <span class="text-slate-600"><strong class="text-slate-900">Throughput</strong> — Requests per second your server is handling</span>
              </li>
              <li class="flex items-start gap-3">
                <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <span class="text-slate-600"><strong class="text-slate-900">Error rate</strong> — Percentage of failed requests (HTTP 4xx/5xx)</span>
              </li>
              <li class="flex items-start gap-3">
                <UIcon name="i-heroicons-check-badge" class="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <span class="text-slate-600"><strong class="text-slate-900">Checks</strong> — Pass/fail rate for your custom assertions</span>
              </li>
            </ul>
          </div>

          <!-- Next steps -->
          <div class="mt-14 p-6 rounded-xl bg-indigo-50 border border-indigo-100">
            <h3 class="text-lg font-semibold text-slate-900 mb-3">Next steps</h3>
            <div class="space-y-2">
              <NuxtLink to="/docs/writing-tests" class="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
                Learn advanced test scripting
              </NuxtLink>
              <NuxtLink to="/docs/understanding-results" class="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
                Understanding your results
              </NuxtLink>
              <NuxtLink to="/tools" class="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
                Explore testing tools & guides
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
