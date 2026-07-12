import * as Schema from 'effect/Schema'

import { BaseEntity } from '@/shared/domain/base.entity'

export class User extends BaseEntity.extend<User>('modules/user/domain/User')({
  username: Schema.String.pipe(Schema.minLength(4), Schema.maxLength(20)),
  email: Schema.String.pipe(Schema.pattern(/^\S+@\S+\.\S+$/u)),
  image: Schema.NullOr(Schema.String).pipe(
    Schema.propertySignature,
    Schema.withConstructorDefault(() => null)
  ),
  deletedAt: Schema.NullOr(Schema.DateFromSelf).pipe(
    Schema.propertySignature,
    Schema.withConstructorDefault(() => null)
  ),
}) {}
