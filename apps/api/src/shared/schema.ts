import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

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
