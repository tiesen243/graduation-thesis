import type { Unauthorized } from '@rozumari/contract/auth/schemas/auth.error'
import type {
  Token,
  AccessToken,
  RefreshToken,
} from '@rozumari/contract/auth/schemas/token.schema'
import type {
  UserId,
  UserRole,
} from '@rozumari/contract/user/schemas/user.schema'
import type { Crypto } from 'effect/Crypto'
import type * as Effect from 'effect/Effect'

import * as Context from 'effect/Context'

import type { SessionUserAggregate } from '@/modules/auth/domain/entities/session-user.aggregate'

export class AuthService extends Context.Service<
  AuthService,
  {
    readonly createAccessToken: (
      userId: UserId,
      userRole: UserRole
    ) => Effect.Effect<AccessToken>

    readonly verifyAccessToken: (
      token: AccessToken
    ) => Effect.Effect<{ userId: UserId; userRole: UserRole }, Unauthorized>

    readonly createRefreshToken: (
      userId: UserId,
      userRole: UserRole
    ) => Effect.Effect<Token, never, Crypto>

    readonly verifyRefreshToken: (
      token: RefreshToken
    ) => Effect.Effect<SessionUserAggregate, Unauthorized, Crypto>
  }
>()('auth/application/AuthService') {}
