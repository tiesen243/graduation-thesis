import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as HttpClient from 'effect/unstable/http/HttpClient'
import * as HttpClientRequest from 'effect/unstable/http/HttpClientRequest'

import { ResendService } from '@/shared/application/services/resend.service'
import { env } from '@/shared/env'

export const resendLayer = Layer.effect(
  ResendService,
  Effect.gen(function* make() {
    const httpClient = yield* HttpClient.HttpClient

    return {
      sendEmail: Effect.fn(function* sendEmail(options) {
        const request = yield* HttpClientRequest.post(
          'https://api.resend.com/emails'
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
  })
)
