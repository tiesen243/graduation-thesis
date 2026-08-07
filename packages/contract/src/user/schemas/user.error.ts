import * as Schema from 'effect/Schema'

import { ApiResponse } from '@/schema'
import { UserId } from '@/user/schemas/user.schema'

export class UserQueryError extends Schema.TaggedError<UserQueryError>()(
  'user/domain/UserQueryError',
  ApiResponse({
    status: 400,
    message: 'Invalid user query',
    errorSchema: Schema.Struct({ query: Schema.String }),
  }),
  { httpApiStatus: 400 }
) {}

export class UserNotFound extends Schema.TaggedError<UserNotFound>()(
  'user/domain/UserNotFound',
  ApiResponse({
    status: 404,
    message: 'User not found',
    errorSchema: Schema.Struct({ id: UserId }),
  }),
  { httpApiStatus: 404 }
) {}

export class UserAlreadyExists extends Schema.TaggedError<UserAlreadyExists>()(
  'user/domain/UserAlreadyExists',
  ApiResponse({
    status: 409,
    message: 'User already exists',
    errorSchema: Schema.Struct({
      username: Schema.String,
      email: Schema.String,
    }),
  }),
  { httpApiStatus: 409 }
) {}

export class UserError extends Schema.TaggedError<UserError>()(
  'user/domain/UserError',
  {
    reason: Schema.Union([UserQueryError, UserNotFound, UserAlreadyExists]),
  }
) {}
