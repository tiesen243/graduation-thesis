import type { SessionId } from '@rozumari/contract/auth/schemas/session.schema'
import type {
  AccessToken,
  RefreshToken,
} from '@rozumari/contract/auth/schemas/token.schema'
import type {
  UserId,
  UserRole,
} from '@rozumari/contract/user/schemas/user.schema'

import { Unauthorized } from '@rozumari/contract/auth/schemas/auth.error'
import * as DateTime from 'effect/DateTime'
import * as Effect from 'effect/Effect'
import * as Encoding from 'effect/Encoding'
import * as Layer from 'effect/Layer'

import { AuthService } from '@/modules/auth/application/ports/auth.service'
import { SessionRepository } from '@/modules/auth/application/ports/session.repository'
import { TOKEN_EXPIRATION } from '@/modules/auth/domain/constants'
import { SessionUserAggregate } from '@/modules/auth/domain/entities/session-user.aggregate'
import { Session } from '@/modules/auth/domain/entities/session.entity'
import {
  constantTimeEqual,
  generateSecureString,
  hashSecret,
} from '@/modules/auth/domain/utils/crypto'
import { Jwt } from '@/shared/application/services/jwt.service'

export const AuthServiceLayer = Layer.effect(
  AuthService,
  Effect.gen(function* make() {
    const sessionRepository = yield* SessionRepository
    const jwt = yield* Jwt

    const createAccessToken = Effect.fn(
      function* createAccessToken(userId, userRole) {
        const token = yield* jwt.sign(
          { userId, userRole },
          { expiresIn: TOKEN_EXPIRATION.accessToken }
        )

        return token as AccessToken
      }
    )

    return {
      createAccessToken,

      verifyAccessToken: Effect.fn(function* verifyAccessToken(token) {
        const { userId, userRole } = yield* jwt
          .verify(token)
          .pipe(
            Effect.catchTag('shared/application/services/JwtError', () =>
              Effect.fail(new Unauthorized({ message: 'Invalid access token' }))
            )
          )

        return { userId, userRole } as { userId: UserId; userRole: UserRole }
      }),

      createRefreshToken: Effect.fn(
        function* createRefreshToken(userId, userRole) {
          const id = yield* generateSecureString
          const secret = yield* generateSecureString
          const hashedSecret = yield* hashSecret(secret)

          const refreshToken = `${id}.${secret}` as RefreshToken

          const now = yield* DateTime.now
          const expiresAt = DateTime.add(now, {
            seconds: TOKEN_EXPIRATION.refreshToken,
          })

          const session = Session.make({
            id: id as SessionId,
            token: Encoding.encodeHex(hashedSecret),
            expiresAt: DateTime.toDate(expiresAt),
            userId,
          })
          yield* sessionRepository.save(session)

          const accessToken = yield* createAccessToken(userId, userRole)

          return {
            accessToken,
            refreshToken,
            expiresAt: DateTime.toDate(expiresAt),
          }
        }
      ),

      verifyRefreshToken: Effect.fn(function* verifyRefreshToken(refreshToken) {
        const [id, secret] = refreshToken.split('.')
        if (!id || !secret)
          return yield* Effect.fail(
            new Unauthorized({ message: 'Invalid refresh token' })
          )

        const agg = yield* sessionRepository.findWithUser(id as SessionId)
        if (agg === null)
          return yield* Effect.fail(
            new Unauthorized({ message: 'Invalid refresh token' })
          )
        let { session } = agg

        const hashedSecret = yield* hashSecret(secret).pipe(Effect.orDie)
        const storedSecret = Encoding.decodeHex(session.token)
        if (storedSecret._tag === 'Failure')
          return yield* Effect.fail(
            new Unauthorized({ message: 'Invalid refresh token' })
          )

        const isValid = constantTimeEqual(hashedSecret, storedSecret.success)

        const now = yield* DateTime.now
        const expiresTime = DateTime.makeUnsafe(session.expiresAt)

        if (!isValid || DateTime.isGreaterThanOrEqualTo(now, expiresTime)) {
          yield* sessionRepository.delete(session)
          return yield* Effect.fail(
            new Unauthorized({ message: 'Invalid refresh token' })
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
  })
)
