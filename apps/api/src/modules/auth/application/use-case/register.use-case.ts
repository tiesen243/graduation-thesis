import type { RegisterDto } from '@rozumari/contract/auth/dto/register.dto'
import type { Digest } from 'effect/crypto/Digest'
import type * as HttpClient from 'effect/http/HttpClient'

import { RegisterEmail } from '@emails/register'
import { WelcomeEmail } from '@emails/welcome'
import {
  AccountProvider,
  AccountProviderId,
} from '@rozumari/contract/auth/schemas/account.schema'
import { Forbidden } from '@rozumari/contract/auth/schemas/auth.error'
import { UserAlreadyExists } from '@rozumari/contract/user/schemas/user.error'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as HttpServerResponse from 'effect/http/HttpServerResponse'
import * as Layer from 'effect/Layer'

import { AccountRepository } from '@/modules/auth/application/ports/account.repository'
import { PasswordService } from '@/modules/auth/application/ports/password.service'
import { Account } from '@/modules/auth/domain/entities/account.entity'
import { UserService } from '@/modules/user/application/ports/user.service'
import { Jwt } from '@/shared/application/services/jwt.service'
import { ResendService } from '@/shared/application/services/resend.service'
import { env } from '@/shared/env'
import { verifyTurnstileToken } from '@/shared/turnstile'
import { getBaseUrl, getGravatarUrl, withTransaction } from '@/shared/utils'

export class RegisterUseCase extends Context.Service<
  RegisterUseCase,
  {
    execute: (
      input: RegisterDto.Input
    ) => Effect.Effect<
      RegisterDto.Output,
      UserAlreadyExists | Forbidden,
      Digest | HttpClient.HttpClient
    >

    verify: (
      input: RegisterDto.Verify
    ) => Effect.Effect<HttpServerResponse.HttpServerResponse, Forbidden>
  }
>()('auth/application/RegisterUseCase', {
  make: Effect.gen(function* make() {
    const accountRepository = yield* AccountRepository

    const passwordService = yield* PasswordService
    const userService = yield* UserService
    const jwtService = yield* Jwt
    const resendService = yield* Effect.option(ResendService)

    return {
      execute: Effect.fn(function* execute(input) {
        const {
          username,
          email,
          password: plainPassword,
          challengeToken,
        } = input
        yield* verifyTurnstileToken(challengeToken)

        const _user = yield* userService.findByIdentifier({ username, email })
        if (_user)
          return yield* Effect.fail(
            new UserAlreadyExists({ error: { username, email } })
          )

        const hashedPassword = yield* passwordService.hash(plainPassword)

        const image = yield* getGravatarUrl(email)

        yield* Effect.gen(function* executeTx() {
          const user = yield* userService.create({
            username,
            email,
            emailVerifiedAt: null,
            image,
          })

          const account = Account.make({
            provider: AccountProvider.make('credentials'),
            providerId: AccountProviderId.make(user.id),
            password: hashedPassword,
            userId: user.id,
          })
          yield* accountRepository.save(account)
        }).pipe(withTransaction)

        if (resendService._tag === 'Some') {
          const token = yield* jwtService.sign(
            { email },
            { expiresIn: 15 * 60 }
          )

          yield* resendService.value.sendEmail({
            to: [email],
            subject: 'Verify your email address',
            html: RegisterEmail({
              username,
              verificationLink: `${getBaseUrl()}/api/auth/verify-email?token=${token}`,
            }),
          })
        }

        return null
      }),

      verify: Effect.fn(function* verify(input) {
        const { token } = input

        const payload = yield* jwtService
          .verify(token)
          .pipe(
            Effect.catchTag('shared/application/services/JwtError', () =>
              Effect.fail(
                new Forbidden({ message: 'Invalid token or expired' })
              )
            )
          )
        const email = payload.email as string

        const user = yield* userService.findByIdentifier({ email })
        if (!user)
          return yield* Effect.fail(
            new Forbidden({ message: 'User not found' })
          )

        if (user.emailVerifiedAt)
          return yield* Effect.fail(
            new Forbidden({ message: 'Email already verified' })
          )

        yield* userService
          .update(user.id, { emailVerifiedAt: new Date() })
          .pipe(Effect.orDie)

        if (resendService._tag === 'Some')
          yield* resendService.value.sendEmail({
            to: [email],
            subject: 'Welcome to Rozumari!',
            html: WelcomeEmail({
              username: user.username,
              appLink: `${env.CORS_ORIGIN[0]}/login`,
            }),
          })

        return HttpServerResponse.html(/* HTML */ `
          <html>
            <head>
              <title>Email Verified</title>
            </head>
            <body
              style="
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100vh;
                font-family: Arial, sans-serif;
              "
            >
              <h1>Email Verified</h1>
              <p>
                Your email has been successfully verified. You can now log in to
                your account.
              </p>
            </body>
          </html>
        `)
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
