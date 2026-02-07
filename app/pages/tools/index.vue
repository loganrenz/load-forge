<script setup lang="ts">
import { tools } from '~/data/tools'

useSeoMeta({
  title: 'Load Testing Tools & Guides — loadtest.dev',
  ogTitle: 'Load Testing Tools & Guides — loadtest.dev',
  description: 'Free tools and guides for API load testing, stress testing, spike testing, and performance benchmarking. Powered by k6.',
  ogDescription: 'Free tools and guides for API load testing, stress testing, spike testing, and performance benchmarking. Powered by k6.',
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://loadtest.dev/tools' },
  ],
})
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
          <NuxtLink to="/tools" class="text-indigo-600 font-medium text-sm">
            Tools
          </NuxtLink>
          <NuxtLink to="/pricing" class="text-slate-500 hover:text-slate-900 transition text-sm font-medium">
            Pricing
          </NuxtLink>
          <NuxtLink to="/docs" class="text-slate-500 hover:text-slate-900 transition text-sm font-medium">
            Docs
          </NuxtLink>
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
            Load Testing Tools & Guides
          </h1>
          <p class="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Everything you need to performance test your applications. Free tools, code examples, and best practices for every testing scenario.
          </p>
        </div>
      </div>
    </section>

    <!-- Tools Grid -->
    <section class="pb-20">
      <div class="container mx-auto px-6">
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <NuxtLink
            v-for="tool in tools"
            :key="tool.slug"
            :to="`/tools/${tool.slug}`"
            class="group p-6 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-200 transition-all duration-200 hover:shadow-md"
          >
            <h2 class="text-lg font-semibold mb-2 text-slate-900 group-hover:text-indigo-600 transition">
              {{ tool.title }}
            </h2>
            <p class="text-slate-500 text-sm leading-relaxed mb-4">
              {{ tool.metaDescription }}
            </p>
            <span class="text-indigo-600 text-sm font-medium group-hover:underline">
              Learn more →
            </span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-16 bg-slate-50/50 border-t border-slate-100">
      <div class="container mx-auto px-6">
        <div class="max-w-2xl mx-auto text-center">
          <h2 class="text-3xl font-bold mb-3 text-slate-900">Start testing for free</h2>
          <p class="text-slate-500 text-lg mb-8">
            200 VUs, 5 minute tests, full API access — no credit card required.
          </p>
          <NuxtLink to="/signup">
            <UButton size="lg" color="primary">
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
          <p class="text-slate-400 text-sm">© 2026 loadtest.dev</p>
        </div>
      </div>
    </footer>
  </div>
</template>
