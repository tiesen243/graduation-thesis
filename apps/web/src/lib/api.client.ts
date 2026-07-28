import { Api } from '@rozumari/api'
import * as Context from 'effect/Context'
import * as Function from 'effect/Function'
import * as Layer from 'effect/Layer'
import * as Schedule from 'effect/Schedule'
import * as FetchHttpClient from 'effect/unstable/http/FetchHttpClient'
import * as HttpClient from 'effect/unstable/http/HttpClient'
import * as HttpClientRequest from 'effect/unstable/http/HttpClientRequest'
import * as HttpApiClient from 'effect/unstable/httpapi/HttpApiClient'

import { env } from '@/lib/env'

// oxlint-disable-next-line typescript/no-empty-interface typescript/no-empty-object-type
interface IApiClient extends HttpApiClient.ForApi<typeof Api> {}

export class ApiClient extends Context.Service<ApiClient, IApiClient>()(
  'ApiClient'
) {
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
            schedule: Schedule.exponential(1000),
            times: 3,
          })
        ),
    })
  ).pipe(Layer.provide(FetchHttpClient.layer))
}
