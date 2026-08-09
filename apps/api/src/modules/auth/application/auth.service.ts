import type { JwtPayload } from '@rozumari/contract/auth/middleware'
import type { TokenExpired } from '@rozumari/contract/auth/schemas/auth.error'
import type { Token } from '@rozumari/contract/auth/schemas/token.schema'
import type {
  UserId,
  UserRole,
} from '@rozumari/contract/user/schemas/user.schema'
import type { Crypto } from 'effect/Crypto'

import { InvalidToken } from '@rozumari/contract/auth/schemas/auth.error'
import { SessionId } from '@rozumari/contract/auth/schemas/session.schema'
import {
  AccessToken,
  RefreshToken,
} from '@rozumari/contract/auth/schemas/token.schema'
import * as Context from 'effect/Context'
import * as DateTime from 'effect/DateTime'
import * as Effect from 'effect/Effect'
import * as Encoding from 'effect/Encoding'
import * as Layer from 'effect/Layer'

import { Jwt } from '@/modules/auth/application/security/jwt'
import { TOKEN_EXPIRATION } from '@/modules/auth/constants'
import { SessionUserAggregate } from '@/modules/auth/domain/entities/session-user.aggregate'
import { Session } from '@/modules/auth/domain/entities/session.entity'
import { SessionRepository } from '@/modules/auth/domain/repositories/session.repository'
import {
  constantTimeEqual,
  generateSecureString,
  hashSecret,
} from '@/modules/auth/infrastructure/security/crypto'

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
    ) => Effect.Effect<Token, never, Crypto>

    readonly verifyRefreshToken: (
      token: RefreshToken
    ) => Effect.Effect<SessionUserAggregate, InvalidToken, Crypto>
  }
>()('auth/application/AuthService', {
  make: Effect.gen(function* make() {
    const sessionRepository = yield* SessionRepository

    const jwt = yield* Jwt

    const now = yield* DateTime.nowInCurrentZone

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
          const id = yield* generateSecureString
          const secret = yield* generateSecureString
          const hashedSecret = yield* hashSecret(secret).pipe(Effect.orDie)

          const refreshToken = `${id}.${secret}`
          const expiresAt = DateTime.add(now, {
            seconds: TOKEN_EXPIRATION.refreshToken,
          })

          const session = Session.make({
            id: SessionId.make(id),
            token: RefreshToken.make(Encoding.encodeHex(hashedSecret)),
            expiresAt: DateTime.toDate(expiresAt),
            userId,
          })
          yield* sessionRepository.save(session)

          const accessToken = yield* createAccessToken(userId, userRole)

          return {
            accessToken: AccessToken.make(accessToken),
            refreshToken: RefreshToken.make(refreshToken),
            expiresAt: DateTime.toDate(expiresAt),
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

        const hashedSecret = yield* hashSecret(secret).pipe(Effect.orDie)
        const storedSecret = Encoding.decodeHex(session.token)
        if (storedSecret._tag === 'Failure')
          return yield* Effect.fail(
            new InvalidToken({ message: 'Invalid refresh token' })
          )

        const isValid = constantTimeEqual(hashedSecret, storedSecret.success)

        const expiresTime = DateTime.makeUnsafe(session.expiresAt)

        if (!isValid || DateTime.isGreaterThanOrEqualTo(now, expiresTime)) {
          yield* sessionRepository.delete(session)
          return yield* Effect.fail(
            new InvalidToken({ message: 'Invalid refresh token' })
          )
        }

        const renewThreshold = DateTime.subtract(expiresTime, {
          seconds: TOKEN_EXPIRATION.threshold,
        })

        if (DateTime.isGreaterThanOrEqualTo(now, renewThreshold)) {
          const extendedExpriesAt = DateTime.add(now, {
            seconds: TOKEN_EXPIRATION.refreshToken,
          })
          session = session.renew(DateTime.toDate(extendedExpriesAt))
          yield* sessionRepository.save(session)
        }

        return SessionUserAggregate.make({
          session,
          user: agg.user,
        })
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
