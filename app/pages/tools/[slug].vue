<script setup lang="ts">
import { tools, getToolBySlug, getRelatedTools } from '~/data/tools'

const route = useRoute()
const slug = route.params.slug as string
const tool = getToolBySlug(slug)

if (!tool) {
  throw createError({ statusCode: 404, statusMessage: 'Tool not found' })
}

const relatedTools = getRelatedTools(tool.relatedTools)

useSeoMeta({
  title: tool.metaTitle,
  ogTitle: tool.metaTitle,
  description: tool.metaDescription,
  ogDescription: tool.metaDescription,
})

useHead({
  link: [
    { rel: 'canonical', href: `https://loadtest.dev/tools/${tool.slug}` },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': tool.faqs.map(faq => ({
          '@type': 'Question',
          'name': faq.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.answer,
          },
        })),
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': `loadtest.dev — ${tool.title}`,
        'applicationCategory': 'DeveloperApplication',
        'operatingSystem': 'Web',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD',
        },
      }),
    },
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
          <NuxtLink to="/tools" class="text-slate-500 hover:text-slate-900 transition text-sm font-medium">
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

    <!-- Breadcrumbs -->
    <div class="pt-20 pb-2">
      <div class="container mx-auto px-6">
        <nav class="flex items-center gap-1.5 text-sm text-slate-400">
          <NuxtLink to="/" class="hover:text-slate-600 transition">Home</NuxtLink>
          <span>/</span>
          <NuxtLink to="/tools" class="hover:text-slate-600 transition">Tools</NuxtLink>
          <span>/</span>
          <span class="text-slate-600">{{ tool.title }}</span>
        </nav>
      </div>
    </div>

    <!-- Hero -->
    <section class="pt-8 pb-16">
      <div class="container mx-auto px-6">
        <div class="max-w-3xl">
          <h1 class="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-slate-900">
            {{ tool.headline }}
          </h1>
          <p class="text-xl text-slate-500 leading-relaxed mb-6">
            {{ tool.subheadline }}
          </p>
          <p class="text-base text-slate-600 leading-relaxed mb-8 max-w-2xl">
            {{ tool.description }}
          </p>
          <div class="flex items-center gap-3">
            <NuxtLink to="/signup">
              <UButton size="lg" color="primary">
                Start Free — 200 VUs
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 ml-1" />
              </UButton>
            </NuxtLink>
            <NuxtLink to="/pricing">
              <UButton size="lg" variant="outline" color="neutral">View Pricing</UButton>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Features + Code Example -->
    <section class="py-16 bg-slate-50/50 border-y border-slate-100">
      <div class="container mx-auto px-6">
        <div class="grid lg:grid-cols-2 gap-12 items-start">
          <!-- Features List -->
          <div>
            <h2 class="text-2xl font-bold mb-6 text-slate-900">What you get</h2>
            <ul class="space-y-4">
              <li v-for="feature in tool.features" :key="feature" class="flex items-start gap-3">
                <div class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                  <UIcon name="i-heroicons-check" class="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <span class="text-slate-700">{{ feature }}</span>
              </li>
            </ul>
          </div>

          <!-- Code Example -->
          <div>
            <div class="rounded-xl bg-slate-950 overflow-hidden shadow-2xl shadow-slate-900/10 ring-1 ring-slate-900/5">
              <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/80">
                <div class="w-3 h-3 rounded-full bg-red-400" />
                <div class="w-3 h-3 rounded-full bg-amber-400" />
                <div class="w-3 h-3 rounded-full bg-green-400" />
                <span class="ml-3 text-xs text-slate-500 font-mono">{{ tool.codeExample.filename }}</span>
              </div>
              <pre class="p-5 text-sm overflow-x-auto"><code class="text-slate-300">{{ tool.codeExample.code }}</code></pre>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="py-16">
      <div class="container mx-auto px-6">
        <div class="max-w-3xl mx-auto">
          <h2 class="text-2xl font-bold mb-8 text-slate-900">Frequently Asked Questions</h2>
          <div class="space-y-6">
            <div v-for="faq in tool.faqs" :key="faq.question" class="border-b border-slate-100 pb-6 last:border-0">
              <h3 class="text-lg font-semibold text-slate-900 mb-2">{{ faq.question }}</h3>
              <p class="text-slate-600 leading-relaxed">{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Related Tools -->
    <section v-if="relatedTools.length" class="py-16 bg-slate-50/50 border-t border-slate-100">
      <div class="container mx-auto px-6">
        <h2 class="text-2xl font-bold mb-8 text-slate-900">Related Tools</h2>
        <div class="grid md:grid-cols-3 gap-6">
          <NuxtLink
            v-for="related in relatedTools"
            :key="related.slug"
            :to="`/tools/${related.slug}`"
            class="group p-6 rounded-xl bg-white border border-slate-200 hover:border-indigo-200 transition-all duration-200 hover:shadow-md"
          >
            <h3 class="text-base font-semibold mb-2 text-slate-900 group-hover:text-indigo-600 transition">
              {{ related.title }}
            </h3>
            <p class="text-slate-500 text-sm leading-relaxed">{{ related.metaDescription }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-16 border-t border-slate-100">
      <div class="container mx-auto px-6">
        <div class="max-w-2xl mx-auto text-center">
          <h2 class="text-3xl font-bold mb-3 text-slate-900">
            Ready to start {{ tool.title.toLowerCase() }}?
          </h2>
          <p class="text-slate-500 text-lg mb-8">
            Sign up free — no credit card required. Get 200 VUs and 5 minute tests instantly.
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
