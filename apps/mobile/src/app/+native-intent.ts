import type { RoutePath } from 'expo-router'

const routes = {
  '/': '/',

  // Auth
  '/login': '/login',
  '/register': '/register',

  // Dashboard
  '/dashboard': '/home',

  // Pill Boxes
  '/dashboard/pill-boxes': '/pill-boxes',
  '/dashboard/pill-boxes/:id': '/pill-boxes/[id]',

  // Schedules
  '/dashboard/schedules': '/schedules',
  '/dashboard/schedules/create': '/schedules/create',
  '/dashboard/schedules/:id': '/schedules/[id]',
  '/dashboard/schedules/:id/edit': '/schedules/[id]/edit',

  // Notifications
  '/dashboard/notifications': '/notifications',
  '/dashboard/notifications/:id': '/notifications/[id]',

  // Profile
  '/dashboard/account': '/profile',
} as const satisfies Record<string, RoutePath>

export function redirectSystemPath({
  path,
}: Readonly<{ path: RoutePath; initial: boolean }>): RoutePath {
  try {
    let cleanPath: string = path
    if (path.includes('/--/')) {
      cleanPath = `/${path.split('/--/')[1]}`
    } else if (
      path.startsWith('http://') ||
      path.startsWith('https://') ||
      path.includes('://')
    ) {
      const url = new URL(path)
      cleanPath = url.pathname
    }

    if (cleanPath.length > 1 && cleanPath.endsWith('/'))
      cleanPath = cleanPath.slice(0, -1)

    if (cleanPath in routes) return routes[cleanPath as keyof typeof routes]

    for (const [webRoute, appRoute] of Object.entries(routes)) {
      if (!webRoute.includes(':')) continue

      const regexPattern = new RegExp(
        `^${webRoute.replaceAll(/:[a-zA-Z0-9_]+/gu, '([^/]+)')}$`,
        'u'
      )
      const match = cleanPath.match(regexPattern)

      if (match) {
        const paramNames = [
          ...webRoute.matchAll(/:(?<params>[a-zA-Z0-9_]+)/gu),
        ].map((m) => m[1])
        let resolvedAppRoute: string = appRoute

        for (let i = 0; i < paramNames.length; i += 1) {
          const name = paramNames[i]
          const value = match[i + 1]
          resolvedAppRoute = resolvedAppRoute.replace(`[${name}]`, value ?? '')
        }

        return resolvedAppRoute as RoutePath
      }
    }

    return (cleanPath as RoutePath) ?? '/'
  } catch {
    return '/'
  }
}
