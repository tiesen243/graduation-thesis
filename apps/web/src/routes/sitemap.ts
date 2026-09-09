// oxlint-disable no-restricted-properties
import type { RouteConfig } from '@react-router/dev/routes'

import routesConfig from '@/routes'

const url = (path: string): string =>
  new URL(
    path,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : `http://localhost:${process.env.PORT ?? 5173}`
  ).toString()

function extractPaths(routes: Awaited<RouteConfig>): string[] {
  const paths: string[] = []

  for (const route of routes) {
    if (route.index && !route.path) paths.push('/')

    if (route.path) {
      const isCatchAll = route.path.includes('*')
      const isDynamic = route.path.includes(':')
      if (!isCatchAll && !isDynamic) paths.push(route.path)
    }

    if (route.children && Array.isArray(route.children))
      paths.push(...extractPaths(route.children))
  }

  return [...new Set(paths)]
}

export const loader = () => {
  const staticPaths = extractPaths(routesConfig)

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPaths
  .map(
    (path) => `  <url>
    <loc>${url(path)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${path === '/' ? '1.0' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

  return new Response(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
