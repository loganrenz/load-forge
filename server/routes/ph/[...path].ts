export default defineEventHandler(async (event) => {
  const path = event.context.params?.path || ''
  const url = getRequestURL(event)
  const search = url.search || ''

  const hostname = path.startsWith('static/')
    ? 'us-assets.i.posthog.com'
    : 'us.i.posthog.com'

  const targetUrl = `https://${hostname}/${path}${search}`

  // Forward headers, excluding ones that shouldn't be proxied
  const headers = new Headers()
  const excludedHeaders = ['host', 'connection', 'content-length', 'transfer-encoding', 'accept-encoding']

  const requestHeaders = getRequestHeaders(event)
  for (const [key, value] of Object.entries(requestHeaders)) {
    if (value && !excludedHeaders.includes(key.toLowerCase())) {
      headers.set(key, value)
    }
  }

  headers.set('host', hostname)

  // Forward client IP for geolocation
  const clientIp = getHeader(event, 'x-forwarded-for') || getRequestIP(event)
  if (clientIp) {
    headers.set('x-forwarded-for', clientIp)
  }

  // Read body as binary to preserve gzip compression
  let body: BodyInit | undefined
  if (event.method !== 'GET' && event.method !== 'HEAD') {
    const rawBody = await readRawBody(event, false)
    if (rawBody) {
      body = typeof rawBody === 'string'
        ? rawBody
        : new Uint8Array(rawBody as unknown as ArrayBuffer)
    }
  }

  const response = await fetch(targetUrl, {
    method: event.method,
    headers,
    body,
  })

  // Copy response headers, excluding problematic ones
  for (const [key, value] of response.headers.entries()) {
    if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
      setResponseHeader(event, key, value)
    }
  }

  setResponseStatus(event, response.status)

  // Return binary response (using ArrayBuffer for Cloudflare Workers compatibility)
  const arrayBuffer = await response.arrayBuffer()
  return new Uint8Array(arrayBuffer)
})
