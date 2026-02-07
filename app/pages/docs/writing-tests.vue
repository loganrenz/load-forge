<script setup lang="ts">
useSeoMeta({
  title: 'Writing k6 Test Scripts — loadtest.dev',
  ogTitle: 'Writing k6 Test Scripts — loadtest.dev',
  description: 'Master k6 test scripting: HTTP methods, checks, thresholds, stages, custom metrics, and advanced patterns for load testing.',
  ogDescription: 'Master k6 test scripting: HTTP methods, checks, thresholds, stages, custom metrics, and advanced patterns for load testing.',
})

useHead({
  link: [{ rel: 'canonical', href: 'https://loadtest.dev/docs/writing-tests' }],
})

const sections = [
  {
    id: 'basics',
    title: 'The Basics',
    description: 'Every k6 test has two parts: options that configure the test, and a default function that runs once per virtual user iteration.',
    code: `import http from 'k6/http';

// Options configure the test
export const options = {
  vus: 10,        // 10 virtual users
  duration: '30s', // run for 30 seconds
};

// This runs once per VU iteration
export default function () {
  http.get('https://api.example.com/health');
}`,
  },
  {
    id: 'checks',
    title: 'Checks — Assert Responses',
    description: 'Checks validate that responses meet your expectations. They don\'t stop the test on failure — they track the pass/fail rate so you can set thresholds.',
    code: `import http from 'k6/http';
import { check } from 'k6';

export default function () {
  const res = http.get('https://api.example.com/users');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'body has users': (r) => JSON.parse(r.body).length > 0,
    'response < 300ms': (r) => r.timings.duration < 300,
  });
}`,
  },
  {
    id: 'thresholds',
    title: 'Thresholds — Pass/Fail Criteria',
    description: 'Thresholds define SLAs. If any threshold is breached, the test fails — perfect for CI/CD integration.',
    code: `export const options = {
  vus: 50,
  duration: '5m',
  thresholds: {
    // 95% of requests must complete under 500ms
    http_req_duration: ['p(95)<500'],
    // Error rate must be below 1%
    http_req_failed: ['rate<0.01'],
    // 99% of checks must pass
    checks: ['rate>0.99'],
  },
};`,
  },
  {
    id: 'stages',
    title: 'Stages — Ramp VUs Over Time',
    description: 'Stages let you gradually increase and decrease load, simulating realistic traffic patterns like ramp-ups and ramp-downs.',
    code: `export const options = {
  stages: [
    { duration: '1m', target: 20 },   // Warm up to 20 VUs
    { duration: '3m', target: 100 },   // Ramp to 100 VUs
    { duration: '2m', target: 100 },   // Hold at 100 VUs
    { duration: '1m', target: 0 },     // Ramp down to 0
  ],
};`,
  },
  {
    id: 'post-requests',
    title: 'POST Requests with JSON',
    description: 'Send POST, PUT, PATCH, and DELETE requests with custom headers and JSON payloads.',
    code: `import http from 'k6/http';
import { check } from 'k6';

export default function () {
  const payload = JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post('https://api.example.com/users', payload, params);
  
  check(res, {
    'created': (r) => r.status === 201,
  });
}`,
  },
  {
    id: 'groups',
    title: 'Groups — Organize Sequences',
    description: 'Groups let you organize a sequence of requests that represent a user flow, like "browse → add to cart → checkout".',
    code: `import http from 'k6/http';
import { group, check, sleep } from 'k6';

export default function () {
  group('Browse products', () => {
    const res = http.get('https://shop.example.com/products');
    check(res, { 'listed': (r) => r.status === 200 });
  });

  group('View product', () => {
    const res = http.get('https://shop.example.com/products/1');
    check(res, { 'loaded': (r) => r.status === 200 });
  });

  group('Add to cart', () => {
    const res = http.post('https://shop.example.com/cart', 
      JSON.stringify({ productId: 1, qty: 1 }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    check(res, { 'added': (r) => r.status === 200 });
  });

  sleep(1);
}`,
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
          <span class="text-slate-600">Writing Tests</span>
        </nav>
      </div>
    </div>

    <!-- Content -->
    <article class="pt-8 pb-20">
      <div class="container mx-auto px-6">
        <div class="max-w-3xl mx-auto">
          <h1 class="text-4xl font-bold mb-4 tracking-tight text-slate-900">
            Writing Test Scripts
          </h1>
          <p class="text-lg text-slate-500 mb-12 leading-relaxed">
            k6 tests are written in JavaScript. Here's everything you need to write effective load tests.
          </p>

          <!-- Table of Contents -->
          <div class="mb-12 p-5 rounded-xl bg-slate-50 border border-slate-200">
            <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">On this page</h2>
            <ul class="space-y-1.5">
              <li v-for="section in sections" :key="section.id">
                <a :href="`#${section.id}`" class="text-sm text-indigo-600 hover:text-indigo-700">{{ section.title }}</a>
              </li>
            </ul>
          </div>

          <!-- Sections -->
          <div class="space-y-16">
            <section v-for="section in sections" :key="section.id" :id="section.id">
              <h2 class="text-2xl font-bold mb-3 text-slate-900">{{ section.title }}</h2>
              <p class="text-slate-600 leading-relaxed mb-6">{{ section.description }}</p>
              <div class="rounded-xl bg-slate-950 overflow-hidden ring-1 ring-slate-900/5">
                <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/80">
                  <div class="w-3 h-3 rounded-full bg-red-400" />
                  <div class="w-3 h-3 rounded-full bg-amber-400" />
                  <div class="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <pre class="p-5 text-sm overflow-x-auto"><code class="text-slate-300">{{ section.code }}</code></pre>
              </div>
            </section>
          </div>

          <!-- Next steps -->
          <div class="mt-14 p-6 rounded-xl bg-indigo-50 border border-indigo-100">
            <h3 class="text-lg font-semibold text-slate-900 mb-3">Next steps</h3>
            <div class="space-y-2">
              <NuxtLink to="/docs/understanding-results" class="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
                Understanding your results
              </NuxtLink>
              <NuxtLink to="/tools/api-load-testing" class="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
                API load testing guide
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
