import * as Schema from 'effect/Schema'

import { BaseEntity } from '@/shared/domain/base.entity'

enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export class User extends BaseEntity.extend<User>('modules/user/domain/User')({
  username: Schema.String.pipe(Schema.minLength(4), Schema.maxLength(20)),
  email: Schema.String.pipe(Schema.pattern(/^\S+@\S+\.\S+$/u)),
  role: Schema.Enums(UserRole).pipe(
    Schema.propertySignature,
    Schema.withConstructorDefault(() => UserRole.USER)
  ),
  image: Schema.NullOr(Schema.String).pipe(
    Schema.propertySignature,
    Schema.withConstructorDefault(() => null)
  ),
  deletedAt: Schema.NullOr(Schema.DateFromSelf).pipe(
    Schema.propertySignature,
    Schema.withConstructorDefault(() => null)
  ),
}) {}

export namespace User {
  export const roles = ['user', 'admin'] as const
  export type Role = (typeof roles)[number]
}
