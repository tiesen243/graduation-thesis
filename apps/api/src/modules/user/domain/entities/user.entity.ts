import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import { BaseEntity } from '@/shared/domain/base.entity'
import { EmailSchema } from '@/shared/schema'

export const UserId = BaseEntity.fields.id.pipe(
  Schema.brand('user/domain/UserId')
)
export type UserId = typeof UserId.Type

export const userRoles = ['user', 'admin'] as const
export const UserRole = Schema.Literals(userRoles).pipe(
  Schema.brand('user/domain/UserRole'),
  Schema.withConstructorDefault(Effect.succeed('user' as const))
)
export type UserRole = typeof UserRole.Type

export class User extends BaseEntity.extend<User>('user/domain/User')({
  id: UserId,
  username: Schema.String.check(
    Schema.isPattern(/^[a-z0-9_]+$/u),
    Schema.isMinLength(4),
    Schema.isMaxLength(20)
  ),
  email: EmailSchema,
  image: Schema.NullOr(
    Schema.String.check(
      Schema.isPattern(
        // oxlint-disable-next-line prefer-named-capture-group
        /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-]*)*(\?.*)?(#.*)?$/u
      )
    )
  ).pipe(Schema.withConstructorDefault(Effect.succeed(null))),
  role: UserRole,
  deletedAt: Schema.NullOr(Schema.Date).pipe(
    Schema.withConstructorDefault(Effect.succeed(null))
  ),
}) {}
