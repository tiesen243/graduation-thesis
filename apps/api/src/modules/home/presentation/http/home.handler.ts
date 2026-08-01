import * as Effect from 'effect/Effect'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'

import { Api } from '@/api'
import { HealthUseCase } from '@/modules/home/application/use-case/health.use-case'
import { makeHttp } from '@/shared/http'

export const HomeHandler = HttpApiBuilder.group(Api, 'home', (handlers) =>
  handlers
    .handle('index', () =>
      Effect.succeed(makeHttp({ message: 'Welcome to the API' }))
    )

    .handle(
      'health',
      Effect.fn(function* healthHandler() {
        const output = yield* HealthUseCase.use((s) => s.execute())

        return makeHttp({
          message: 'API is healthy',
          data: output,
        })
      })
    )
)
