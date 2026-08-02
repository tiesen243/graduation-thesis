import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import { createId } from '@/shared/lib/create-id'

export const ApiResponseSchema = <TData, TError>(
  dataSchema: Schema.Schema<TData> = Schema.Any,
  errorSchema: Schema.Schema<TError> = Schema.Any
) =>
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
    error: Schema.NullOr(errorSchema).pipe(
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

export const IdSchema = Schema.String.pipe(
  Schema.withConstructorDefault(Effect.sync(createId))
).check(Schema.isPattern(/^[0-9a-z]+$/u))

export const EmailSchema = Schema.String.check(
  Schema.isPattern(
    // oxlint-disable-next-line prefer-named-capture-group
    /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/u
  ),
  Schema.isMinLength(5),
  Schema.isMaxLength(255)
)

export const PasswordSchema = Schema.String.check(
  Schema.isPattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/u)
)
