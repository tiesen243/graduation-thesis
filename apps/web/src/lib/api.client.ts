import { Api, AuthMiddleware } from '@rozumari/api'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
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
interface IApiClient extends HttpApiClient.ForApi<typeof Api> {}

export const AuthMiddlewareClient = HttpApiMiddleware.layerClient(
  AuthMiddleware,
  Effect.fn(function* AuthorizationClient({ next, request }) {
    return yield* next(HttpClientRequest.bearerToken(request, 'dummy-token'))
  })
)

export class ApiClient extends Context.Service<ApiClient, IApiClient>()(
  'ApiClient'
) {
  private static FetchHttpClient = FetchHttpClient.layer.pipe(
    Layer.provide(
      Layer.succeed(FetchHttpClient.RequestInit, { credentials: 'include' })
    )
  )

  public static live = Layer.effect(
    ApiClient,
    HttpApiClient.make(Api, {
      transformClient: (client) =>
        client.pipe(
          HttpClient.mapRequest(
            Function.flow(
              HttpClientRequest.prependUrl(env.PUBLIC_API_URL),
              HttpClientRequest.setHeader('x-requested-with', 'web'),
              HttpClientRequest.acceptJson
            )
          ),

          HttpClient.retryTransient({
            schedule: Schedule.exponential('1 second'),
            times: 3,
            while(error) {
              if (
                // oxlint-disable-next-line eslint/no-underscore-dangle
                error.reason._tag === 'StatusCodeError' &&
                error.reason.response.status === 401
              )
                fetch(`${env.PUBLIC_API_URL}/api/auth/refresh-token`, {
                  method: 'POST',
                  credentials: 'include',
                })

              return true
            },
          })
        ),
    })
  ).pipe(
    Layer.provide(AuthMiddlewareClient),
    Layer.provide(this.FetchHttpClient)
  )
}
