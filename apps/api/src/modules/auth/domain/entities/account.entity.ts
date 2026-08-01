import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import type { User } from '@/modules/user/domain/entities/user.entity'

import { UserId } from '@/modules/user/domain/entities/user.entity'
import { BaseEntity } from '@/shared/domain/base.entity'
import { PasswordSchema } from '@/shared/schema'

export const AccountProvider = Schema.String.pipe(
  Schema.brand('auth/domain/AccountProvider')
)
export type AccountProvider = typeof AccountProvider.Type

export const AccountProviderAccountId = Schema.String.pipe(
  Schema.brand('auth/domain/AccountProviderAccountId')
)
export type AccountProviderAccountId = typeof AccountProviderAccountId.Type

export class Account extends BaseEntity.extend<Account>('auth/domain/Account')({
  provider: AccountProvider,
  providerAccountId: AccountProviderAccountId,
  password: Schema.NullOr(PasswordSchema).pipe(
    Schema.withConstructorDefault(Effect.succeed(null))
  ),
  userId: UserId,
}) {
  #user: User | null = null

  public get user(): User {
    if (!this.#user) throw new Error('User is not set')
    return this.#user
  }

  public set user(user: User) {
    this.#user = user
  }
}
