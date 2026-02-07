export default defineEventHandler((event) => {
  const runtimeConfig = useRuntimeConfig()
  const appUrl = runtimeConfig.public.appUrl || 'https://loadtest.dev'

  const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /dashboard
Disallow: /settings
Disallow: /runs/
Disallow: /scripts/
Disallow: /api/

Sitemap: ${appUrl}/sitemap.xml
`

  setHeader(event, 'Content-Type', 'text/plain')
  return robots
})
