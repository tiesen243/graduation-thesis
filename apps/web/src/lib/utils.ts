import { env } from '@/lib/env'

export function getApiUrl() {
  console.log({
    VERCEL_ENV: env.VERCEL_ENV,
    VERCEL_BRANCH_URL: env.VERCEL_BRANCH_URL,
    VERCEL_URL: env.VERCEL_URL,
    VERCEL_PROJECT_PRODUCTION_URL: env.VERCEL_PROJECT_PRODUCTION_URL,

    VITE_VERCEL_ENV: env.VITE_VERCEL_ENV,
    VITE_VERCEL_BRANCH_URL: env.VITE_VERCEL_BRANCH_URL,
    VITE_VERCEL_URL: env.VITE_VERCEL_URL,
    VITE_VERCEL_PROJECT_PRODUCTION_URL: env.VITE_VERCEL_PROJECT_PRODUCTION_URL,
  })

  if (env.VITE_VERCEL_ENV === 'preview' && env.VITE_VERCEL_BRANCH_URL)
    return `https://${env.VITE_VERCEL_BRANCH_URL.replace('-git-', '-api-git-')}`
  if (env.VITE_API_URL) return env.VITE_API_URL
  return `http://localhost:3000`
}

export function getBaseUrl() {
  if (typeof window !== 'undefined') return window.location.origin
  if (env.VITE_VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${env.VITE_VERCEL_PROJECT_PRODUCTION_URL}`
  if (env.VITE_VERCEL_URL) return `https://${env.VITE_VERCEL_URL}`
  // oxlint-disable-next-line no-restricted-properties
  return `http://localhost:${process.env.PORT ?? 5173}`
}
