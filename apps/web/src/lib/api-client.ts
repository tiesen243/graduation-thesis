// oxlint-disable eslint/no-underscore-dangle

import type { HttpClientError } from 'effect/unstable/http/HttpClientError'
import type { HttpClientResponse } from 'effect/unstable/http/HttpClientResponse'

import { Api } from '@rozumari/api'
import * as Cause from 'effect/Cause'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Function from 'effect/Function'
import * as Schedule from 'effect/Schedule'
import * as HttpClient from 'effect/unstable/http/HttpClient'
import * as HttpClientRequest from 'effect/unstable/http/HttpClientRequest'
import * as HttpApiClient from 'effect/unstable/httpapi/HttpApiClient'

import { env } from '@/lib/env'

// oxlint-disable-next-line import/namespace typescript/no-empty-interface typescript/no-empty-object-type
export interface IApiClient extends HttpApiClient.ForApi<typeof Api> {}

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
            schedule: Schedule.exponential(100),
            times: 3,
            while: (error) =>
              error.reason._tag === 'StatusCodeError' &&
              error.reason.response.status === 401,
          })
        ),

      transformResponse: Effect.fn(function* transformResponse(effect) {
        const exit = yield* Effect.exit(
          effect as Effect.Effect<HttpClientResponse, HttpClientError, never>
        )
        if (exit._tag === 'Success') return exit.value

        const cause = Cause.findErrorOption(exit.cause)

        if (
          cause._tag === 'Some' &&
          cause.value._tag === 'HttpClientError' &&
          cause.value.reason._tag === 'StatusCodeError' &&
          cause.value.reason.response.status === 401
        )
          yield* Effect.promise((signal) =>
            fetch(`${env.VITE_API_URL}/api/auth/refresh-token`, {
              method: 'POST',
              credentials: 'include',
              signal,
            })
          )

        return yield* Effect.failCause(exit.cause)
      }),
    }),
  }
) {}
