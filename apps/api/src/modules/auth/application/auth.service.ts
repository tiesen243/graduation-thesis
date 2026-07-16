import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import type { TokensSchema } from '@/modules/auth/application/types'
import type { User } from '@/modules/user/domain/entities/user.entity'

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
    readonly createSession: (
      payload: AuthService.JWTPayload
    ) => Effect.Effect<TokensSchema, Http, SessionRepository>

    readonly verifyRefreshToken: (
      token: string
    ) => Effect.Effect<Session, Http, SessionRepository>
  }
>() {
  public static password = new Password({ secret: env.AUTH_SECRET })
  public static jwt = new JWT<AuthService.JWTPayload>(env.AUTH_SECRET)

  public static live = Layer.succeed(this, {
    createSession: ({ userId, role }: AuthService.JWTPayload) =>
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
          { userId, role },
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
  })

  private static config = {
    tokenExpiresIn: 60 * 60 * 24 * 7, // 7 days
    tokenExpiresThreshold: 60 * 60 * 24, // 1 day
    accessTokenExpiresIn: 60 * 15, // 15 minutes
  }
}

export namespace AuthService {
  export interface JWTPayload {
    userId: string
    role: User.Role
  }
}
