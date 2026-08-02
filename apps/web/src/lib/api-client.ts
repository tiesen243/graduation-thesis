import { Api, AuthMiddleware } from '@rozumari/api'
import * as Context from 'effect/Context'
import * as Function from 'effect/Function'
import * as Layer from 'effect/Layer'
import * as Schedule from 'effect/Schedule'
import * as FetchHttpClient from 'effect/unstable/http/FetchHttpClient'
import * as HttpClient from 'effect/unstable/http/HttpClient'
import * as HttpClientRequest from 'effect/unstable/http/HttpClientRequest'
import * as HttpApiClient from 'effect/unstable/httpapi/HttpApiClient'
import * as HttpApiMiddleware from 'effect/unstable/httpapi/HttpApiMiddleware'

import { env } from '@/lib/env'

// oxlint-disable-next-line import/namespace typescript/no-empty-interface typescript/no-empty-object-type
export interface IApiClient extends HttpApiClient.ForApi<typeof Api> {}

export const AuthMiddlewareClient = HttpApiMiddleware.layerClient(
  AuthMiddleware,
  ({ next, request }) => next(request)
)

export class ApiClient extends Context.Service<ApiClient, IApiClient>()(
  'ApiClient',
  {
    make: HttpApiClient.make(Api, {
      transformClient: (client) =>
        client.pipe(
          HttpClient.mapRequest(
            Function.flow(
              HttpClientRequest.prependUrl(env.VITE_API_URL),
              HttpClientRequest.setHeader('x-requested-with', 'web'),
              HttpClientRequest.acceptJson
            )
          ),

          HttpClient.retryTransient({
            schedule: Schedule.exponential('1 second'),
            times: 3,
          })
        ),
    }),
  }
) {}

export const ApiClientLayer = Layer.effect(ApiClient, ApiClient.make).pipe(
  Layer.provide(AuthMiddlewareClient),
  Layer.provide(
    FetchHttpClient.layer.pipe(
      Layer.provide(
        Layer.succeed(FetchHttpClient.RequestInit, { credentials: 'include' })
      )
    )
  )
)
