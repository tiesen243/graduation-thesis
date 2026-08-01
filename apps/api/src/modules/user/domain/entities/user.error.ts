import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import { ApiResponseSchema } from '@/shared/schema'

export class UserNotFound extends Schema.TaggedErrorClass<UserNotFound>()(
  'user/domain/UserNotFound',
  ApiResponseSchema(Schema.Null).pipe(
    Schema.fieldsAssign({
      status: Schema.Number.pipe(
        Schema.withConstructorDefault(Effect.succeed(404))
      ),
    })
  ),
  { httpApiStatus: 404 }
) {}

export class UserError extends Schema.TaggedErrorClass<UserError>()(
  'user/domain/UserError',
  {
    reason: Schema.Union([UserNotFound]),
  }
) {}
