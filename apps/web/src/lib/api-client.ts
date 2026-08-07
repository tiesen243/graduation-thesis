// oxlint-disable eslint/no-underscore-dangle

import { Api } from '@rozumari/contract'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Function from 'effect/Function'
import * as HttpClient from 'effect/unstable/http/HttpClient'
import * as HttpClientRequest from 'effect/unstable/http/HttpClientRequest'
import * as HttpApiClient from 'effect/unstable/httpapi/HttpApiClient'

import { env } from '@/lib/env'

export class ApiClient extends Context.Service<
  ApiClient,
  HttpApiClient.ForApi<typeof Api>
>()('ApiClient', {
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
        HttpClient.transformResponse(
          Effect.fn(function* transformResponse(effect) {
            let response = yield* effect

            if (response.status === 401) {
              yield* Effect.promise((signal) =>
                fetch(`${env.VITE_API_URL}/api/auth/refresh`, {
                  method: 'POST',
                  credentials: 'include',
                  signal,
                })
              )

              response = yield* effect
            }

            return response
          })
        )
      ),
  }),
}) {}
