import * as Schema from 'effect/Schema'

import type { User } from '@/modules/user/domain/entities/user.entity'

import { BaseEntity } from '@/shared/domain/base.entity'

export class Session extends BaseEntity.extend<Session>(
  'modules/auth/domain/Session'
)({
  token: Schema.String,
  expiresAt: Schema.DateFromSelf,

  userId: Schema.String,
}) {
  #user: User | null = null

  public get user(): User | null {
    if (!this.#user) throw new Error('User not loaded')
    return this.#user
  }

  public set user(user: User | null) {
    this.#user = user
  }
}
