// oxlint-disable unicorn/max-nested-calls

import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

export const Http = <T>(dataSchema: Schema.Schema<T>) =>
  Schema.Struct({
    status: Schema.Number.pipe(
      Schema.withConstructorDefault(Effect.succeed(200))
    ),
    message: Schema.String.pipe(
      Schema.withConstructorDefault(Effect.succeed('OK'))
    ),
    data: Schema.NullOr(dataSchema).pipe(
      Schema.withConstructorDefault(Effect.succeed(null))
    ),
    error: Schema.NullOr(Schema.Unknown).pipe(
      Schema.withConstructorDefault(Effect.succeed(null))
    ),
    timestamp: Schema.Date.pipe(
      Schema.withConstructorDefault(Effect.sync(() => new Date()))
    ),
  })

export const makeHttp = <T>(
  payload: Partial<ReturnType<typeof Http<T>>['Type']>
) => ({
  status: payload.status ?? 200,
  message: payload.message ?? 'OK',
  data: payload.data ?? null,
  error: payload.error ?? null,
  timestamp: payload.timestamp ?? new Date(),
})
