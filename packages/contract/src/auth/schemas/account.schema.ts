import * as Schema from 'effect/Schema'

import { UserId } from '@/user/schemas/user.schema'

export const AccountProvider = Schema.String.pipe(
  Schema.brand('auth/domain/AccountProvider')
)
export type AccountProvider = typeof AccountProvider.Type

export const AccountProviderId = Schema.String.pipe(
  Schema.brand('auth/domain/AccountProviderId')
)
export type AccountProviderId = typeof AccountProviderId.Type

export const AccountSchema = Schema.Struct({
  provider: AccountProvider,

  providerId: AccountProviderId,

  password: Schema.NullOr(Schema.String.check(Schema.isMaxLength(255))),

  userId: UserId,
})
export type AccountSchema = typeof AccountSchema.Type
