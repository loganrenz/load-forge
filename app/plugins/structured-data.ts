/**
 * JSON-LD Structured Data — SoftwareApplication + WebSite schema for search engine rich results
 */
export default defineNuxtPlugin(() => {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'loadtest.dev — k6 Load Testing Platform',
            url: 'https://loadtest-dev.pages.dev',
            description: 'Professional load testing powered by k6. Start free with 200 virtual users — no credit card required.',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://loadtest-dev.pages.dev/?q={search_term_string}',
              'query-input': 'required name=search_term_string'
            }
          },
          {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'loadtest.dev',
            url: 'https://loadtest-dev.pages.dev',
            description: 'Professional load testing powered by k6. Start free with 200 virtual users — no credit card required.',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Web Browser',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              description: 'Free tier with 200 virtual users'
            }
          }
        ])
      }
    ]
  })
})
