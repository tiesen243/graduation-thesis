import * as Schema from 'effect/Schema'

import { BaseEntity } from '@/shared/domain/base.entity'

export class Account extends BaseEntity.extend<Account>(
  'modules/auth/domain/Account'
)({
  provider: Schema.String,
  providerAccountId: Schema.String,
  password: Schema.NullOr(Schema.String).pipe(
    Schema.propertySignature,
    Schema.withConstructorDefault(() => null)
  ),

  userId: Schema.String,
}) {}
