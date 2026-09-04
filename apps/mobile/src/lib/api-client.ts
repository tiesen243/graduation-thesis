// oxlint-disable eslint/no-underscore-dangle

import { Api } from '@rozumari/contract'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Function from 'effect/Function'
import * as HttpClient from 'effect/unstable/http/HttpClient'
import * as HttpClientRequest from 'effect/unstable/http/HttpClientRequest'
import * as HttpApiClient from 'effect/unstable/httpapi/HttpApiClient'

import { getTokens, setTokens } from '@/lib/secure-store'
import { getBaseUrl } from '@/lib/utils'

export class ApiClient extends Context.Service<
  ApiClient,
  HttpApiClient.ForApi<typeof Api>
>()('ApiClient', {
  make: HttpApiClient.make(Api, {
    transformClient: (client) =>
      client.pipe(
        HttpClient.mapRequest(
          Function.flow(
            HttpClientRequest.prependUrl(getBaseUrl()),
            HttpClientRequest.setHeader('x-requested-with', 'mobile'),
            HttpClientRequest.acceptJson
          )
        ),
        HttpClient.transformResponse(
          Effect.fn(function* transformResponse(effect) {
            let response = yield* effect

            if (response.status === 401) {
              const { refreshToken } = yield* Effect.promise(getTokens)

              const res = yield* Effect.promise((signal) =>
                fetch(`${getBaseUrl()}/api/auth/refresh`, {
                  headers: { Authorization: `Bearer ${refreshToken}` },
                  method: 'POST',
                  signal,
                })
              )

              if (res.ok) {
                const json = yield* Effect.promise<{
                  data: { accessToken: string; refreshToken: string }
                }>(() => res.json())

                yield* Effect.promise(() =>
                  setTokens(json.data.accessToken, json.data.refreshToken)
                )

                response = yield* effect
              }
            }

            return response
          })
        )
      ),
  }),
}) {}
