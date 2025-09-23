export default defineEventHandler(() => {
  const lines = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Sitemap: https://travel-fi.com/sitemap.xml'
  ]
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return lines.join('\n')
})


