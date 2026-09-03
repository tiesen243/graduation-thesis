import { env } from '@/lib/env'

export function getApiUrl() {
  if (env.VERCEL_ENV === 'preview' && env.VERCEL_BRANCH_URL)
    return `https://${env.VERCEL_BRANCH_URL.replace('-git-', '-api-git-')}`
  if (env.VITE_API_URL) return env.VITE_API_URL
  return `http://localhost:3000`
}

export function getBaseUrl() {
  if (typeof window !== 'undefined') return window.location.origin
  if (env.VITE_VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${env.VITE_VERCEL_PROJECT_PRODUCTION_URL}`
  if (env.VITE_VERCEL_URL) return `https://${env.VITE_VERCEL_URL}`
  return `http://localhost:${env.PORT}`
}

export function formatDate(value: Date) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(value)
}

/**
 * Returns the start and end date of the current week (Monday to Sunday) in 'YYYY-MM-DD' format.
 * @param now - The current date. Defaults to the current date if not provided.
 * @returns An object containing the start and end dates of the current week.
 * */
export function getCurrentWeekRange(now = new Date()): {
  startDate: string
  endDate: string
} {
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay() + 1)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)

  return {
    startDate: startOfWeek.toISOString().split('T').at(0) ?? '',
    endDate: endOfWeek.toISOString().split('T').at(0) ?? '',
  }
}
