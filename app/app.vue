<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
const appUrl = runtimeConfig.public.appUrl || 'https://loadtest.dev'

useSeoMeta({
  title: 'loadtest.dev — k6 Load Testing Platform',
  ogTitle: 'loadtest.dev — k6 Load Testing Platform',
  description: 'Professional load testing powered by k6. Test your APIs and websites with up to 10,000 virtual users.',
  ogDescription: 'Professional load testing powered by k6. Test your APIs and websites with up to 10,000 virtual users.',
  ogImage: `${appUrl}/og-image.png`,
  twitterCard: 'summary_large_image',
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: appUrl + useRoute().path,
    },
  ],
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
