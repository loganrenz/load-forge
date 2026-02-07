export default defineEventHandler((event) => {
  const runtimeConfig = useRuntimeConfig()
  const appUrl = runtimeConfig.public.appUrl.includes('localhost') ? 'https://loadtest.dev' : runtimeConfig.public.appUrl
  const today = new Date().toISOString().split('T')[0]

  // Static pages
  const staticPages = [
    { path: '', changefreq: 'weekly', priority: '1.0' },
    { path: '/pricing', changefreq: 'monthly', priority: '0.9' },
    { path: '/tools', changefreq: 'weekly', priority: '0.9' },
    { path: '/docs', changefreq: 'weekly', priority: '0.8' },
    { path: '/docs/getting-started', changefreq: 'monthly', priority: '0.8' },
    { path: '/docs/writing-tests', changefreq: 'monthly', priority: '0.8' },
    { path: '/docs/understanding-results', changefreq: 'monthly', priority: '0.8' },
    { path: '/signup', changefreq: 'monthly', priority: '0.7' },
    { path: '/login', changefreq: 'monthly', priority: '0.5' },
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
    path: `/tools/${slug}`,
    changefreq: 'monthly' as const,
    priority: '0.8',
  }))

  const allPages = [...staticPages, ...toolPages]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allPages.map(page => `
  <url>
    <loc>${appUrl}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('').trim()}
</urlset>`

  setHeader(event, 'Content-Type', 'application/xml')
  return sitemap
})
