import { Api } from '@rozumari/api'
import * as Context from 'effect/Context'
import * as Function from 'effect/Function'
import * as Layer from 'effect/Layer'
import * as Schedule from 'effect/Schedule'
import * as FetchHttpClient from 'effect/unstable/http/FetchHttpClient'
import * as HttpClient from 'effect/unstable/http/HttpClient'
import * as HttpClientRequest from 'effect/unstable/http/HttpClientRequest'
import * as HttpApiClient from 'effect/unstable/httpapi/HttpApiClient'

export class ApiClient extends Context.Service<
  ApiClient,
  HttpApiClient.ForApi<typeof Api>
>()('ApiClient') {
  public static live = Layer.effect(
    this,
    HttpApiClient.make(Api, {
      transformClient: (client) =>
        client.pipe(
          HttpClient.mapRequest(
            Function.flow(
              HttpClientRequest.prependUrl('http://localhost:3000'),
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
