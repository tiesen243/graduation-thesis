import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import type { User } from '@/modules/user/domain/entities/user.entity'
import type { EntityOverrides } from '@/shared/lib/utils'

import { UserId } from '@/modules/user/domain/entities/user.entity'
import { createClone } from '@/shared/lib/utils'
import { IdSchema } from '@/shared/schema'

export const SessionId = IdSchema.pipe(Schema.brand('auth/domain/SessionId'))
export type SessionId = typeof SessionId.Type

export const SessionToken = Schema.String.pipe(
  Schema.brand('auth/domain/SessionToken')
)
export type SessionToken = typeof SessionToken.Type

export class Session extends Schema.TaggedClass<Session>()(
  'auth/domain/Account',
  {
    id: SessionId,
    token: SessionToken,
    expiresAt: Schema.Date,
    createdAt: Schema.Date.pipe(
      Schema.withConstructorDefault(Effect.sync(() => new Date()))
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
