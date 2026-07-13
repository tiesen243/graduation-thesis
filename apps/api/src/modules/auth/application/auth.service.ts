import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { Session } from '@/modules/auth/domain/entities/session.entity'
import { SessionRepository } from '@/modules/auth/domain/repositories/session.repository'
import {
  constantTimeEqual,
  decodeHex,
  encodeHex,
  generateSecureString,
  hashSecret,
} from '@/modules/auth/lib/crypto'
import { JWT } from '@/modules/auth/lib/jwt'
import { Password } from '@/modules/auth/lib/password'
import { Http } from '@/shared/http'
import { env } from '@/shared/lib/env'

export class AuthService extends Context.Tag(
  'modules/auth/application/AuthService'
)<
  AuthService,
  {
    readonly password: Password

    readonly createSession: (userId: string) => Effect.Effect<
      {
        accessToken: string
        refreshToken: string
        expiresAt: Date
      },
      Http,
      SessionRepository
    >

    readonly verifyRefreshToken: (
      token: string
    ) => Effect.Effect<Session, Http, SessionRepository>

    readonly verifyAccessToken: (
      token: string
    ) => Effect.Effect<{ userId: string }, Http>
  }
>() {
  private static jwt = new JWT<{ sub: string }>(env.AUTH_SECRET)

  private static config = {
    tokenExpiresIn: 60 * 60 * 24 * 7, // 7 days
    tokenExpiresThreshold: 60 * 60 * 24, // 1 day
    accessTokenExpiresIn: 60 * 15, // 15 minutes
  }

  public static live = Layer.succeed(this, {
    password: new Password(),

    createSession: (userId: string) =>
      Effect.gen(this, function* createSessionGen() {
        const sessionRepo = yield* SessionRepository

        const id = generateSecureString()
        const secret = generateSecureString()
        const hashedSecret = yield* hashSecret(secret)

        const refreshToken = `${id}.${secret}`
        const expiresAt = new Date(
          Date.now() + this.config.tokenExpiresIn * 1000
        )

        const token = encodeHex(hashedSecret)
        yield* sessionRepo.save(Session.make({ id, token, expiresAt, userId }))

        const accessToken = yield* this.jwt.sign(
          { sub: userId },
          { expiresIn: this.config.accessTokenExpiresIn }
        )

        return { accessToken, refreshToken, expiresAt }
      }),

    verifyRefreshToken: (token: string) =>
      Effect.gen(this, function* verifyRefreshTokenGen() {
        const sessionRepo = yield* SessionRepository

        const [id, secret] = token.split('.')
        if (!id || !secret)
          return yield* Effect.fail(Http.unauthorized('Invalid token format'))

        let session = yield* sessionRepo.findWithUser(id)
        if (!session || !session.user)
          return yield* Effect.fail(Http.unauthorized('Invalid token'))

        const hashedSecret = yield* hashSecret(secret)
        const isValid = constantTimeEqual(
          hashedSecret,
          decodeHex(session.token)
        )

        const now = Date.now()
        const expiresTime = new Date(session.expiresAt).getTime()

        if (!isValid || now >= expiresTime) {
          yield* sessionRepo.delete(session)
          return yield* Effect.fail(Http.unauthorized('Invalid token'))
        }

        if (now >= expiresTime - this.config.tokenExpiresThreshold * 1000) {
          const newExpiresAt = new Date(now + this.config.tokenExpiresIn * 1000)
          session = session.clone({ expiresAt: newExpiresAt })
          yield* sessionRepo.save(session)
        }

        return session
      }),

    verifyAccessToken: (token: string) =>
      Effect.gen(this, function* verifyAccessTokenGen() {
        const { sub: userId } = yield* this.jwt.verify(token)
        return { userId }
      }),
  })
}
