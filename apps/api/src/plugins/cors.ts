import { Elysia } from 'elysia'

import { env } from '@/shared/lib/env'

export const cors = new Elysia({
  name: 'plugins/cors',
})

  .headers({
    'access-control-allow-credentials': 'true',
  })

  .request(({ set, request }) => {
    const origin = request.headers.get('Origin')

    if (env.CORS_ORIGIN === '*') {
      set.headers['access-control-allow-origin'] = '*'
      set.headers.vary = '*'
    } else if (origin && env.CORS_ORIGIN.split(',').includes(origin)) {
      set.headers['access-control-allow-origin'] = origin
      set.headers.vary = 'Origin'
    }

    set.headers['access-control-allow-methods'] =
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    set.headers['access-control-allow-headers'] =
      'Content-Type, Authorization, X-Requested-With'
    set.headers['access-control-allow-credentials'] = 'true'

    if (request.method === 'OPTIONS') return new Response(null, { status: 204 })
  })
