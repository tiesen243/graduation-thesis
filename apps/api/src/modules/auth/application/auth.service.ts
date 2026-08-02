import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import type { JwtError } from '@/modules/auth/application/security/jwt'
import type { Tokens } from '@/modules/auth/application/types'
import type {
  UserId,
  UserRole,
} from '@/modules/user/domain/entities/user.entity'

import { Jwt } from '@/modules/auth/application/security/jwt'
import { AccessToken, RefreshToken } from '@/modules/auth/application/types'
import { Unauthorized } from '@/modules/auth/domain/entities/auth.error'
import {
  Session,
  SessionId,
  SessionToken,
} from '@/modules/auth/domain/entities/session.entity'
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
import { UserService } from '@/modules/user/application/user.service'

export class AuthService extends Context.Service<
  AuthService,
  {
    readonly createAccessToken: (
      userId: UserId,
      role: UserRole
    ) => Effect.Effect<AccessToken, Unauthorized | JwtError>

    readonly verifyAccessToken: (
      token: AccessToken
    ) => Effect.Effect<Jwt.Payload, JwtError>

    readonly createRefreshToken: (
      userId: UserId
    ) => Effect.Effect<Tokens, Unauthorized | JwtError>

    readonly verifyRefreshToken: (
      token: RefreshToken
    ) => Effect.Effect<
      Pick<Session, 'token' | 'user' | 'expiresAt'>,
      Unauthorized | JwtError
    >
  }
>()('auth/application/AuthService', {
  make: Effect.gen(function* make() {
    const sessionRepository = yield* SessionRepository
    const userService = yield* UserService

    const jwt = yield* Jwt

    const createAccessToken = Effect.fn(function* createAccessToken(userId) {
      const user = yield* userService.findByIdentifier({ id: userId })
      if (!user)
        return yield* Effect.fail(
          new Unauthorized({ message: 'User not found' })
        )

      const payload: Jwt.Payload = { userId, role: user.role }
      return yield* jwt.sign(payload, {
        expiresIn: config.accessTokenExpiresIn,
      })
    })

    return {
      createAccessToken,

      verifyAccessToken: Effect.fn(function* verifyAccessToken(token) {
        const { userId, role } = yield* jwt.verify(token)
        return { userId, role }
      }),

      createRefreshToken: Effect.fn(function* createRefreshToken(userId) {
        const id = generateSecureString()
        const secret = generateSecureString()
        const hashedSecret = yield* hashSecret(secret)

        const refreshToken = `${id}.${secret}`
        const expiresAt = new Date(
          Date.now() + config.refreshTokenExpiresIn * 1000
        )

        const session = Session.make({
          id: SessionId.make(id),
          token: SessionToken.make(encodeHex(hashedSecret)),
          expiresAt,

          userId,
        })
        yield* sessionRepository.save(session)

        const accessToken = yield* createAccessToken(userId)

        return {
          accessToken: AccessToken.make(accessToken),
          refreshToken: RefreshToken.make(refreshToken),
          expiresAt,
        }
      }),

      verifyRefreshToken: Effect.fn(function* verifyRefreshToken(token) {
        const [id, secret] = token.split('.')
        if (!id || !secret)
          return yield* Effect.fail(
            new Unauthorized({ message: 'Invalid refresh token' })
          )

        const session = yield* sessionRepository.findWithUser(
          SessionId.make(id)
        )
        if (!session)
          return yield* Effect.fail(
            new Unauthorized({ message: 'Invalid refresh token' })
          )

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
            new Unauthorized({ message: 'Invalid refresh token' })
          )
        }

        if (now >= expiresTime - config.expiresThreshold * 1000) {
          const updatedSession = session.clone({
            expiresAt: new Date(now + config.refreshTokenExpiresIn * 1000),
          })
          yield* sessionRepository.save(updatedSession)
        }

        return {
          token: session.token,
          user: session.user,
          expiresAt: session.expiresAt,
        }
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}

const config = {
  accessTokenExpiresIn: 15 * 60, // 15 minutes
  refreshTokenExpiresIn: 7 * 24 * 60 * 60, // 7 days
  expiresThreshold: 24 * 60 * 60, // 1 day
}
