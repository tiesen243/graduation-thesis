import { Elysia, NotFound, ValidationError } from 'elysia'

import { Http } from '@/shared/http'

export const errorHandle = new Elysia({
  name: 'plugins/error-handle',
})

  .error(({ path, error }) => {
    if (!path.startsWith('/api')) return

    if (error instanceof ValidationError)
      return Http.badRequest('Validation Error', error.all)

    if (error instanceof NotFound)
      return Http.notFound('The requested resource was not found')

    return Http.internalServerError('Unknown error', error.message)
  })

  .as('plugin')
