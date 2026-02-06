export default defineEventHandler((event) => {
  const runtimeConfig = useRuntimeConfig()
  const appUrl = runtimeConfig.public.appUrl || 'https://loadtest.dev'
  
  const pages = [
    '',
    '/pricing',
    '/login',
    '/signup',
  ]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages.map(page => `
  <url>
    <loc>${appUrl}${page}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page === '' ? 'daily' : 'monthly'}</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('').trim()}
</urlset>`

  setHeader(event, 'Content-Type', 'application/xml')
  return sitemap
})
