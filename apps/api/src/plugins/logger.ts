import { Elysia } from 'elysia'

export const logger = new Elysia({
  name: 'plugins/logger',
})

  .state('append', {
    start: 0,
  })

  .request(({ store }) => {
    store.start = performance.now()
  })

  .afterResponse(({ request, path, store, set: { status } }) => {
    const { method, headers } = request

    const duration = performance.now() - store.start

    console.log(`[${method}] ${path} ${status} - ${duration.toFixed(2)}ms`, {
      client: headers.get('x-requested-with') ?? 'unknown',
    })
  })

  .as('plugin')
