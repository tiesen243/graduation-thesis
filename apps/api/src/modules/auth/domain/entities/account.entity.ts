import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import type { User } from '@/modules/user/domain/entities/user.entity'
import type { EntityOverrides } from '@/shared/lib/utils'

import { UserId } from '@/modules/user/domain/entities/user.entity'
import { createClone } from '@/shared/lib/utils'
import { PasswordSchema } from '@/shared/schema'

export const AccountProvider = Schema.String.pipe(
  Schema.brand('auth/domain/AccountProvider')
)
export type AccountProvider = typeof AccountProvider.Type

export const AccountProviderAccountId = Schema.String.pipe(
  Schema.brand('auth/domain/AccountProviderAccountId')
)
export type AccountProviderAccountId = typeof AccountProviderAccountId.Type

export class Account extends Schema.TaggedClass<Account>()(
  'auth/domain/Account',
  {
    provider: AccountProvider,
    providerAccountId: AccountProviderAccountId,
    password: Schema.NullOr(PasswordSchema).pipe(
      Schema.withConstructorDefault(Effect.succeed(null))
    ),

    userId: UserId,
  }
) {
  #user: User | null = null

  public get user(): User {
    if (!this.#user) throw new Error('User is not set')
    return this.#user
  }

  public set user(user: User) {
    this.#user = user
  }

  public clone(overrides?: EntityOverrides<this>): this {
    return createClone(this, overrides)
  }

  public toJSON(): Omit<this, 'clone' | 'toJSON' | '_tag'> {
    return structuredClone(this)
  }
}
