import prisma from '~~/lib/prisma'

const SITE_URL = process.env.SITE_URL || 'https://travel-fi.com'

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '<')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')

  const [wifi, esim] = await Promise.all([
    prisma.wifiPoint.findMany({ select: { id: true, updatedAt: true } }),
    prisma.esimTariff.findMany({ select: { id: true, updatedAt: true } })
  ])

  const urls: string[] = []

  // Static routes
  urls.push(`${SITE_URL}/`)
  urls.push(`${SITE_URL}/wifi`)
  urls.push(`${SITE_URL}/esim`)
  urls.push(`${SITE_URL}/dashboard`)

  // Dynamic routes
  for (const w of wifi) urls.push(`${SITE_URL}/wifi/${w.id}`)
  for (const e of esim) urls.push(`${SITE_URL}/esim/${e.id}`)

  const entries = urls
    .map((loc) => `    <url><loc>${xmlEscape(loc)}</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>`) 
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`

  return xml
})


