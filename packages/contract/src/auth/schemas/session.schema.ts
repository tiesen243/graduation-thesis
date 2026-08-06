import * as Schema from 'effect/Schema'

import { RefreshToken } from '@/auth/schemas/token.schema'
import { Timestampz } from '@/schema'
import { UserId } from '@/user/schemas/user.schema'

export const SessionId = Schema.String.pipe(
  Schema.brand('auth/domain/SessionId')
)
export type SessionId = typeof SessionId.Type

export const SessionSchema = Schema.Struct({
  id: SessionId,

  token: RefreshToken,

  expiresAt: Schema.Date,

  userId: UserId,

  createdAt: Timestampz.fields.createdAt,
})
export type SessionSchema = typeof SessionSchema.Type
