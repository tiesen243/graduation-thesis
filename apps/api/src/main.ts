import { Bootstrap } from '@/bootstrap'
import { cors } from '@/plugins/cors'
import { errorHandle } from '@/plugins/error-handle'
import { env } from '@/shared/lib/env'

export const server = Bootstrap.create({
  persistenceDriver: 'drizzle',
  plugins: [cors, errorHandle],

  elysia: {
    name: '@worspace/api',
    serve: {
      development: env.NODE_ENV !== 'production' && {
        hmr: true,
        console: true,
      },
    },

    precompile: true,

    cookie: {
      path: '/',
      httpOnly: true,
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: env.NODE_ENV === 'production',
      partitioned: env.NODE_ENV === 'production',
      secrets: env.AUTH_SECRET,
    },
  },
})

export default {
  fetch: server.fetch,
}
