export default defineEventHandler(() => {
  // Static pages
  const staticPages = [
    { loc: '/', changefreq: 'weekly', priority: 1.0 },
    { loc: '/pricing', changefreq: 'monthly', priority: 0.9 },
    { loc: '/tools', changefreq: 'weekly', priority: 0.9 },
    { loc: '/docs', changefreq: 'weekly', priority: 0.8 },
    { loc: '/docs/getting-started', changefreq: 'monthly', priority: 0.8 },
    { loc: '/docs/writing-tests', changefreq: 'monthly', priority: 0.8 },
    { loc: '/docs/understanding-results', changefreq: 'monthly', priority: 0.8 },
    { loc: '/signup', changefreq: 'monthly', priority: 0.7 },
    { loc: '/login', changefreq: 'monthly', priority: 0.5 },
  ]

  // Tool pages — keep in sync with data/tools.ts
  const toolSlugs = [
    'api-load-testing',
    'stress-test-website',
    'k6-cloud-alternative',
    'http-load-test',
    'rest-api-benchmark',
    'graphql-load-testing',
    'websocket-load-testing',
    'spike-test',
    'soak-test',
    'capacity-planning',
    'performance-testing-checklist',
    'grpc-load-testing',
  ]

  const toolPages = toolSlugs.map(slug => ({
    loc: `/tools/${slug}`,
    changefreq: 'monthly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...toolPages]
})
