<script setup lang="ts">
useSeoMeta({
  title: 'Documentation — loadtest.dev',
  ogTitle: 'Documentation — loadtest.dev',
  description: 'Learn how to use loadtest.dev to run k6 load tests. Getting started guides, scripting tutorials, and result analysis.',
  ogDescription: 'Learn how to use loadtest.dev to run k6 load tests. Getting started guides, scripting tutorials, and result analysis.',
})

useHead({
  link: [{ rel: 'canonical', href: 'https://loadtest.dev/docs' }],
})

const guides = [
  {
    title: 'Getting Started',
    description: 'Create your first load test in under 5 minutes. Sign up, write a script, and run your first test.',
    href: '/docs/getting-started',
    icon: 'i-heroicons-rocket-launch',
    time: '5 min read',
  },
  {
    title: 'Writing Test Scripts',
    description: 'Master k6 scripting — HTTP methods, checks, thresholds, stages, and advanced patterns.',
    href: '/docs/writing-tests',
    icon: 'i-heroicons-code-bracket',
    time: '10 min read',
  },
  {
    title: 'Understanding Results',
    description: 'Interpret response times, throughput, error rates, and percentile metrics. Know when to scale.',
    href: '/docs/understanding-results',
    icon: 'i-heroicons-chart-bar',
    time: '8 min read',
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

    <!-- Hero -->
    <section class="pt-28 pb-12">
      <div class="container mx-auto px-6">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-slate-900">
            Documentation
          </h1>
          <p class="text-lg text-slate-500 max-w-2xl mx-auto">
            Everything you need to run professional load tests with loadtest.dev.
          </p>
        </div>
      </div>
    </section>

    <!-- Guides Grid -->
    <section class="pb-20">
      <div class="container mx-auto px-6">
        <div class="max-w-3xl mx-auto space-y-4">
          <NuxtLink
            v-for="guide in guides"
            :key="guide.href"
            :to="guide.href"
            class="group flex items-start gap-5 p-6 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-200 transition-all duration-200 hover:shadow-md"
          >
            <div class="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition">
              <UIcon :name="guide.icon" class="w-6 h-6 text-indigo-600" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-1">
                <h2 class="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                  {{ guide.title }}
                </h2>
                <span class="text-xs text-slate-400 font-medium">{{ guide.time }}</span>
              </div>
              <p class="text-slate-500 text-sm leading-relaxed">{{ guide.description }}</p>
            </div>
            <UIcon name="i-heroicons-arrow-right" class="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition shrink-0 mt-1" />
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
          <p class="text-slate-400 text-sm">© 2026 loadtest.dev</p>
        </div>
      </div>
    </footer>
  </div>
</template>
