import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

export const ApiResponseSchema = <T>(dataSchema: Schema.Schema<T>) =>
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

export namespace PaginationSchema {
  export const Input = Schema.Struct({
    page: Schema.Number.pipe(Schema.withDecodingDefault(Effect.succeed(1))),
    limit: Schema.Number.pipe(Schema.withDecodingDefault(Effect.succeed(10))),
  })
  export type Input = typeof Input.Type

  export const Output = Schema.Struct({
    page: Schema.Number,
    pageSize: Schema.Number,
    total: Schema.Number,
    totalPages: Schema.Number,
  })
}
