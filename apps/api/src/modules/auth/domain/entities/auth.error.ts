import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import { ApiResponseSchema } from '@/shared/schema'

export class InvalidCredentials extends Schema.TaggedErrorClass<InvalidCredentials>()(
  'account/domain/InvalidCredentialsError',
  ApiResponseSchema(Schema.Null).pipe(
    Schema.fieldsAssign({
      status: Schema.Number.pipe(
        Schema.withConstructorDefault(Effect.succeed(401))
      ),
      message: Schema.String.pipe(
        Schema.withConstructorDefault(Effect.succeed('Invalid credentials'))
      ),
    })
  ),
  { httpApiStatus: 401 }
) {}

export class Unauthorized extends Schema.TaggedErrorClass<Unauthorized>()(
  'account/domain/UnauthorizedError',
  ApiResponseSchema(Schema.Null).pipe(
    Schema.fieldsAssign({
      status: Schema.Number.pipe(
        Schema.withConstructorDefault(Effect.succeed(401))
      ),
    })
  ),
  { httpApiStatus: 401 }
) {}

export class Conflict extends Schema.TaggedErrorClass<Conflict>()(
  'account/domain/ConflictError',
  ApiResponseSchema(Schema.Null).pipe(
    Schema.fieldsAssign({
      status: Schema.Number.pipe(
        Schema.withConstructorDefault(Effect.succeed(409))
      ),
    })
  ),
  { httpApiStatus: 409 }
) {}
