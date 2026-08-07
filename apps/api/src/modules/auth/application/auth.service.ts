import type { JwtPayload } from '@rozumari/contract/auth/middleware'
import type { TokenExpired } from '@rozumari/contract/auth/schemas/auth.error'
import type { Token } from '@rozumari/contract/auth/schemas/token.schema'
import type {
  UserId,
  UserRole,
} from '@rozumari/contract/user/schemas/user.schema'

import { InvalidToken } from '@rozumari/contract/auth/schemas/auth.error'
import { SessionId } from '@rozumari/contract/auth/schemas/session.schema'
import {
  AccessToken,
  RefreshToken,
} from '@rozumari/contract/auth/schemas/token.schema'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import type { SessionUserAggregate } from '@/modules/auth/domain/entities/session-user.aggregate'

import { Jwt } from '@/modules/auth/application/security/jwt'
import { TOKEN_EXPIRATION } from '@/modules/auth/constants'
import { Session } from '@/modules/auth/domain/entities/session.entity'
import { SessionRepository } from '@/modules/auth/domain/repositories/session.repository'
import {
  constantTimeEqual,
  hashSecret,
} from '@/modules/auth/infrastructure/security/crypto'
import {
  decodeHex,
  encodeHex,
} from '@/modules/auth/infrastructure/security/crypto/encoding'
import { generateSecureString } from '@/modules/auth/infrastructure/security/crypto/random'

export class AuthService extends Context.Service<
  AuthService,
  {
    readonly createAccessToken: (
      userId: UserId,
      userRole: UserRole
    ) => Effect.Effect<AccessToken>

    readonly verifyAccessToken: (
      token: AccessToken
    ) => Effect.Effect<JwtPayload, InvalidToken | TokenExpired>

    readonly createRefreshToken: (
      userId: UserId,
      userRole: UserRole
    ) => Effect.Effect<Token>

    readonly verifyRefreshToken: (token: RefreshToken) => Effect.Effect<
      Pick<SessionUserAggregate['session'], 'token' | 'expiresAt'> & {
        user: SessionUserAggregate['user']
      },
      InvalidToken
    >
  }
>()('auth/application/AuthService', {
  make: Effect.gen(function* make() {
    const sessionRepository = yield* SessionRepository

    const jwt = yield* Jwt

    const createAccessToken = Effect.fn(
      function* createAccessToken(userId, userRole) {
        return yield* jwt.sign(
          { userId, userRole },
          { expiresIn: TOKEN_EXPIRATION.accessToken }
        )
      }
    )

    return {
      createAccessToken,

      verifyAccessToken: Effect.fn(function* verifyAccessToken(token) {
        const { userId, userRole } = yield* jwt.verify(token)
        return { userId, userRole }
      }),

      createRefreshToken: Effect.fn(
        function* createRefreshToken(userId, userRole) {
          const id = generateSecureString()
          const secret = generateSecureString()
          const hashedSecret = yield* hashSecret(secret)

          const refreshToken = `${id}.${secret}`
          const expiresAt = new Date(
            Date.now() + TOKEN_EXPIRATION.refreshToken * 1000
          )

          const session = Session.make({
            id: SessionId.make(id),
            token: RefreshToken.make(encodeHex(hashedSecret)),
            expiresAt,
            userId,
          })
          yield* sessionRepository.save(session)

          const accessToken = yield* createAccessToken(userId, userRole)

          return {
            accessToken: AccessToken.make(accessToken),
            refreshToken: RefreshToken.make(refreshToken),
            expiresAt,
          }
        }
      ),

      verifyRefreshToken: Effect.fn(function* verifyRefreshToken(refreshToken) {
        const [id, secret] = refreshToken.split('.')
        if (!id || !secret)
          return yield* Effect.fail(
            new InvalidToken({ message: 'Invalid refresh token' })
          )

        const agg = yield* sessionRepository.findWithUser(SessionId.make(id))
        if (agg === null)
          return yield* Effect.fail(
            new InvalidToken({ message: 'Invalid refresh token' })
          )
        let { session } = agg

        const hashedSecret = yield* hashSecret(secret)
        const isValid = constantTimeEqual(
          hashedSecret,
          decodeHex(session.token)
        )

        const now = Date.now()
        const expiresTime = new Date(session.expiresAt).getTime()

        if (!isValid || now >= expiresTime) {
          yield* sessionRepository.delete(session)
          return yield* Effect.fail(
            new InvalidToken({ message: 'Invalid refresh token' })
          )
        }

        if (now >= expiresTime - TOKEN_EXPIRATION.threshold * 1000) {
          session = session.renew(
            new Date(now + TOKEN_EXPIRATION.refreshToken * 1000)
          )
          yield* sessionRepository.save(session)
        }

        const { expiresAt } = session
        return { token: refreshToken, user: agg.user, expiresAt }
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
