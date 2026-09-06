// oxlint-disable eslint/no-underscore-dangle

import { Api } from '@rozumari/contract'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Function from 'effect/Function'
import * as HttpClient from 'effect/unstable/http/HttpClient'
import * as HttpClientRequest from 'effect/unstable/http/HttpClientRequest'
import * as HttpApiClient from 'effect/unstable/httpapi/HttpApiClient'

import { env } from '@/lib/env'
import { getApiUrl } from '@/lib/utils'

export class ApiClient extends Context.Service<
  ApiClient,
  HttpApiClient.ForApi<typeof Api>
>()('ApiClient', {
  make: HttpApiClient.make(Api, {
    transformClient: (client) =>
      client.pipe(
        HttpClient.mapRequest(
          Function.flow(
            HttpClientRequest.prependUrl(getApiUrl()),
            HttpClientRequest.setHeader('x-requested-with', 'web'),
            HttpClientRequest.setHeader(
              'x-vercel-protection-bypass',
              env.VERCEL_ENV === 'preview' && env.VITE_BYPASS_TOKEN
                ? env.VITE_BYPASS_TOKEN
                : ''
            ),
            HttpClientRequest.acceptJson
          )
        ),
        HttpClient.transformResponse(
          Effect.fn(function* transformResponse(effect) {
            let response = yield* effect

            if (response.status === 401) {
              const res = yield* Effect.promise((signal) =>
                fetch(`${getApiUrl()}/api/auth/refresh`, {
                  method: 'POST',
                  credentials: 'include',
                  signal,
                })
              )

              if (res.ok) response = yield* effect
            }

            return response
          })
        )
      ),
  }),
}) {}
