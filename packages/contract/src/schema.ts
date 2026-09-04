import * as DateTime from 'effect/DateTime'
import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

export const Cuid2 = Schema.String.check(
  Schema.isPattern(/^[0-9a-z]+$/u, { message: 'Invalid CUID2 format' })
)

export const Username = Schema.String.check(
  Schema.isMinLength(4, {
    message: 'Username must be at least 4 characters long',
  }),
  Schema.isMaxLength(20, {
    message: 'Username must be at most 20 characters long',
  }),
  Schema.isPattern(/^[a-z0-9_]+$/u, {
    message:
      'Username can only contain lowercase letters, numbers, and underscores',
  })
)

export const Email = Schema.String.check(
  Schema.isPattern(
    /^(?!\.)(?!.*\.\.)(?<local>[A-Za-z0-9_'+\-.]*)[A-Za-z0-9_+-]@(?<domain>[A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/u,
    { message: 'Invalid email format' }
  )
)

export const Password = Schema.String.check(
  Schema.isMinLength(8, {
    message: 'Password must be at least 8 characters long',
  }),
  Schema.isMaxLength(255, {
    message: 'Password must be at most 255 characters long',
  }),
  Schema.isPattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/u, {
    message: 'Password not strong enough',
  })
)

export const Url = ({
  protocol = /^https?:\/\//iu,
  hostname = /^(?<host>[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/iu,
}: { protocol?: RegExp; hostname?: RegExp } = {}) =>
  Schema.String.check(
    Schema.isPattern(
      new RegExp(
        `^(${protocol.source})(${hostname.source.replaceAll(/^\^|\$$/gu, '')})(/.*)?$`,
        'iu'
      ),
      { message: 'Invalid URL format' }
    )
  )

export const Timestampz = Schema.Struct({
  createdAt: Schema.Date.pipe(
    Schema.withConstructorDefault(DateTime.nowAsDate)
  ),
  updatedAt: Schema.Date.pipe(
    Schema.withConstructorDefault(DateTime.nowAsDate)
  ),
})

export const ApiResponse = <
  TData extends Schema.Constraint = Schema.withConstructorDefault<Schema.Null>,
  TError extends Schema.Constraint = Schema.withConstructorDefault<Schema.Null>,
>(
  options: Partial<{
    status: number
    message: string
    dataSchema: TData
    errorSchema: TError
  }> = {}
) =>
  Schema.Struct({
    status: Schema.Int.pipe(
      Schema.withConstructorDefault(Effect.succeed(options.status ?? 200))
    ),

    message: Schema.String.pipe(
      Schema.withConstructorDefault(Effect.succeed(options.message ?? 'OK'))
    ),

    data:
      options.dataSchema ??
      (Schema.Null.pipe(
        Schema.withConstructorDefault(Effect.succeed(null))
      ) as unknown as TData),

    error:
      options.errorSchema ??
      (Schema.Null.pipe(
        Schema.withConstructorDefault(Effect.succeed(null))
      ) as unknown as TError),

    timestamp: Schema.Date.pipe(
      Schema.withConstructorDefault(DateTime.nowAsDate)
    ),
  })

export namespace Pagination {
  export const Input = Schema.Struct({
    page: Schema.Int.check(
      Schema.isGreaterThanOrEqualTo(1, {
        message: 'Page must be greater than or equal to 1',
      })
    ).pipe(
      Schema.optionalKey,
      Schema.withConstructorDefault(Effect.succeed(1))
    ),

    limit: Schema.Int.check(
      Schema.isGreaterThanOrEqualTo(1, {
        message: 'Limit must be greater than or equal to 1',
      }),
      Schema.isLessThanOrEqualTo(100, {
        message: 'Limit must be less than or equal to 100',
      })
    ).pipe(
      Schema.optionalKey,
      Schema.withConstructorDefault(Effect.succeed(10))
    ),
  })
  export type Input = typeof Input.Type

  export const Output = Schema.Struct({
    page: Schema.Int,
    pageSize: Schema.Int,
    total: Schema.Int,
    totalPages: Schema.Int,
  })
  export type Output = typeof Output.Type
}
