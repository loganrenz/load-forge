export default defineEventHandler((event) => {
  const runtimeConfig = useRuntimeConfig()
  const appUrl = runtimeConfig.public.appUrl || 'https://loadtest.dev'

  const robots = `User-agent: *
Allow: /

Sitemap: ${appUrl}/sitemap.xml
`

  setHeader(event, 'Content-Type', 'text/plain')
  return robots
})
