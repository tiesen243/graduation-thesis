// oxlint-disable unicorn/max-nested-calls

import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

export class Http extends Schema.TaggedClass<Http>()('Http', {
  status: Schema.Number.pipe(
    Schema.withConstructorDefault(Effect.succeed(200))
  ),
  message: Schema.String.pipe(
    Schema.withConstructorDefault(Effect.succeed('OK'))
  ),
  data: Schema.NullOr(Schema.Unknown).pipe(
    Schema.withConstructorDefault(Effect.succeed(null))
  ),
  error: Schema.NullOr(Schema.Unknown).pipe(
    Schema.withConstructorDefault(Effect.succeed(null))
  ),
  timestamp: Schema.Date.pipe(
    Schema.withConstructorDefault(Effect.sync(() => new Date()))
  ),
}) {}
