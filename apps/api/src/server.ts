import { Bootstrap } from '@/bootstrap'
import { GoogleProvider } from '@/modules/auth/infrastructure/oauth/providers/google.provider'
import { cors } from '@/plugins/cors'
import { errorHandle } from '@/plugins/error-handle'
import { logger } from '@/plugins/logger'
import { Http } from '@/shared/http'
import { env } from '@/shared/lib/env'

import * as pkgJson from '../package.json' with { type: 'json' }

export const server = Bootstrap.create({
  persistenceDriver: 'drizzle',
  providers: [new GoogleProvider(env.AUTH_GOOGLE_ID, env.AUTH_GOOGLE_SECRET)],
  plugins: [cors, errorHandle, logger],

  elysia: {
    precompile: true,

    cookie: {
      path: '/',
      httpOnly: true,
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: env.NODE_ENV === 'production',
      partitioned: env.NODE_ENV === 'production',
      secrets: env.AUTH_SECRET,
    },

    serve: {
      development: env.NODE_ENV !== 'production' && {
        hmr: true,
        console: true,
      },
    },
  },
})

  .get(
    '/',
    () =>
      new Http({
        data: {
          name: pkgJson.name,
          version: pkgJson.version,
          environment: env.NODE_ENV,

          memory: {
            used:
              Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) /
              100,
            total:
              Math.round(
                (process.memoryUsage().heapTotal / 1024 / 1024) * 100
              ) / 100,
            unit: 'MB',
          },

          cpu: process.cpuUsage(),

          uptime: process.uptime(),
        },
      })
  )

export type Server = typeof server
export default {
  fetch: server.fetch,
}
