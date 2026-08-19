import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as FetchHttpClient from 'effect/unstable/http/FetchHttpClient'
import * as HttpClient from 'effect/unstable/http/HttpClient'
import * as HttpClientRequest from 'effect/unstable/http/HttpClientRequest'

import { env } from '@/shared/env'

export class ResendService extends Context.Service<
  ResendService,
  {
    readonly sendEmail: (
      options: ResendService.Options
    ) => Effect.Effect<boolean>
  }
>()('shared/infrastructure/third-party/resend/ResendService', {
  make: Effect.gen(function* make() {
    const httpClient = yield* HttpClient.HttpClient

    return {
      sendEmail: Effect.fn(function* sendEmail(options) {
        const request = yield* HttpClientRequest.post(
          `${env.RESEND_API_URL}/emails`
        ).pipe(
          HttpClientRequest.setHeader(
            'Authorization',
            `Bearer ${env.RESEND_API_KEY}`
          ),
          HttpClientRequest.acceptJson,
          HttpClientRequest.bodyJson({
            from: 'Rozumari <rozumari@tiesen.id.vn>',
            to: options.to,
            subject: options.subject,
            html: options.html,
          }),
          Effect.orDie
        )

        const response = yield* httpClient.execute(request).pipe(Effect.orDie)

        return yield* response.json.pipe(
          Effect.map(() => true),
          Effect.catch(() => Effect.succeed(false))
        )
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(
    ResendService,
    ResendService.make
  ).pipe(Layer.provide(FetchHttpClient.layer))
}

export namespace ResendService {
  export interface Options {
    to: string[]
    subject: string
    html: string
  }
}
