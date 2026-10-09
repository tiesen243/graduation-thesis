import { Forbidden } from '@rozumari/contract/auth/schemas/auth.error'
import * as Effect from 'effect/Effect'
import * as HttpClient from 'effect/http/HttpClient'
import * as HttpClientRequest from 'effect/http/HttpClientRequest'
import * as HttpClientResponse from 'effect/http/HttpClientResponse'
import * as Schema from 'effect/Schema'

import { env } from '@/shared/env'

const TurnstileResponseSchema = Schema.Struct({
  success: Schema.Boolean,
})

export const verifyTurnstileToken = Effect.fn(function* verifyTurnstileToken(
  token: string
) {
  const httpClient = yield* HttpClient.HttpClient

  const formData = new FormData()
  formData.append('secret', env.TURNSTILE_KEY)
  formData.append('response', token)

  const response = yield* HttpClientRequest.post(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify'
  ).pipe(
    HttpClientRequest.bodyFormData(formData),
    httpClient.execute,
    Effect.flatMap(HttpClientResponse.filterStatusOk),
    Effect.flatMap(HttpClientResponse.schemaBodyJson(TurnstileResponseSchema)),
    Effect.catch((error) =>
      Effect.fail(
        new Forbidden({
          message: error.message || 'Turnstile verification failed',
        })
      )
    )
  )

  if (!response.success)
    return yield* Effect.fail(
      new Forbidden({ message: 'Turnstile verification failed' })
    )
})
