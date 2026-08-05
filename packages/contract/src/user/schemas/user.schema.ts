import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import { Cuid2, Email, Timestampz, Url, Username } from '@/schema'

export const UserId = Cuid2.pipe(Schema.brand('user/domain/UserId'))
export type UserId = typeof UserId.Type

export const userRoles = ['user', 'admin'] as const
export const UserRole = Schema.Literals(userRoles).pipe(
  Schema.brand('user/domain/UserRole')
)
export type UserRole = typeof UserRole.Type

export const UserSchema = Schema.Struct({
  id: UserId,

  username: Username,

  email: Email,

  role: UserRole.pipe(Schema.withConstructorDefault(Effect.succeed('user'))),

  image: Schema.NullOr(Url()).pipe(
    Schema.withConstructorDefault(Effect.succeed(null))
  ),

  deletedAt: Schema.NullOr(Schema.Date).pipe(
    Schema.withConstructorDefault(Effect.succeed(null))
  ),

  ...Timestampz.fields,
})
export type UserSchema = typeof UserSchema.Type
