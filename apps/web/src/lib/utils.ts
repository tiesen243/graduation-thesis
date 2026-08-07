import { createQueryClient } from '@rozumari/lib/create-query-client'
import { cache } from 'react'

import { env } from '@/lib/env'

export function getBaseUrl() {
  if (typeof window !== 'undefined') return window.location.origin
  if (env.VITE_VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${env.VITE_VERCEL_PROJECT_PRODUCTION_URL}`
  if (env.VITE_VERCEL_URL) return `https://${env.VITE_VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 5173}`
}

export const getQueryClient = cache(createQueryClient)
