import { env } from '@/lib/env'

export function getApiUrl() {
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
