import * as Schema from 'effect/Schema'

import type { User } from '@/modules/user/domain/entities/user.entity'

import { UserId } from '@/modules/user/domain/entities/user.entity'
import { BaseEntity } from '@/shared/domain/base.entity'

const SessionId = BaseEntity.fields.id.pipe(
  Schema.brand('auth/domain/SessionId')
)
export type SessionId = typeof SessionId.Type

export const SessionToken = Schema.String.pipe(
  Schema.brand('auth/domain/SessionToken')
)
export type SessionToken = typeof SessionToken.Type

export class Session extends BaseEntity.extend<Session>('auth/domain/Account')({
  id: SessionId,
  token: SessionToken,
  expiresAt: Schema.Date,
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
