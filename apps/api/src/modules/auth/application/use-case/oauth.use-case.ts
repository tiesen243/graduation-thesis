import type { AccountProvider } from '@rozumari/contract/auth/schemas/account.schema'
import type {
  Unauthorized,
  ProviderError,
} from '@rozumari/contract/auth/schemas/auth.error'
import type { Token } from '@rozumari/contract/auth/schemas/token.schema'
import type { UserNotFound } from '@rozumari/contract/user/schemas/user.error'
import type {
  UserId,
  UserRole,
} from '@rozumari/contract/user/schemas/user.schema'
import type { HttpClient } from 'effect/http/HttpClient'

import { UserAlreadyDeleted } from '@rozumari/contract/user/schemas/user.error'
import * as Context from 'effect/Context'
import { Crypto } from 'effect/Crypto'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { AccountRepository } from '@/modules/auth/application/ports/account.repository'
import { AuthService } from '@/modules/auth/application/ports/auth.service'
import { OAuthService } from '@/modules/auth/application/ports/oauth.service'
import { Account } from '@/modules/auth/domain/entities/account.entity'
import { UserService } from '@/modules/user/application/ports/user.service'
import { ResendService } from '@/shared/application/services/resend.service'
import { withTransaction } from '@/shared/utils'

export class OAuthUseCase extends Context.Service<
  OAuthUseCase,
  {
    authorize: (
      provider: AccountProvider,
      state: string,
      code: string
    ) => Effect.Effect<URL, ProviderError, OAuthService | Crypto>

    callback: (
      provider: AccountProvider,
      code: string,
      storedCode: string
    ) => Effect.Effect<
      Token,
      ProviderError | UserNotFound | UserAlreadyDeleted,
      OAuthService | Crypto | HttpClient
    >

    exchange: (
      token: Token['refreshToken']
    ) => Effect.Effect<Token, Unauthorized, Crypto>
  }
>()('auth/application/OAuthUseCase', {
  make: Effect.gen(function* make() {
    const accountRepository = yield* AccountRepository

    const authService = yield* AuthService
    const userService = yield* UserService
    const resendService = yield* Effect.option(ResendService)

    return {
      authorize: Effect.fn(function* authorize(_provider, state, code) {
        const provider = yield* OAuthService.forProvider(_provider)
        return yield* provider.createAuthorizationUrl(state, code)
      }),

      callback: Effect.fn(function* callback(_provider, code, storedCode) {
        const crypto = yield* Crypto

        const provider = yield* OAuthService.forProvider(_provider)

        const { id, email, image } = yield* provider
          .fetchUserData(code, storedCode)
          .pipe(Effect.orDie)

        const [[account], user] = yield* Effect.all([
          accountRepository.findMany({
            where: {
              provider: { eq: _provider },
              providerId: { eq: id },
            },
            limit: 1,
          }),
          userService.findByIdentifier({ email }),
        ])

        const { isNewUser, ...result } = yield* Effect.gen(function* tx() {
          let _isNewUser = false,
            userId: UserId,
            userRole: UserRole

          if (account && user) {
            if (!user.isActive)
              return yield* Effect.fail(
                new UserAlreadyDeleted({ error: { id: user.id } })
              )

            ;({ userId } = account)
            userRole = user?.role ?? 'user'

            if ((!user.image || user.image.includes('gravatar.com')) && image)
              yield* userService.update(user.id, { image })
          } else {
            if (user) {
              if (!user.isActive)
                return yield* Effect.fail(
                  new UserAlreadyDeleted({ error: { id: user.id } })
                )

              userId = user.id
              userRole = user.role

              if ((!user.image || user.image.includes('gravatar.com')) && image)
                yield* userService.update(user.id, { image })
            } else {
              const [username = ''] = (yield* crypto.randomUUIDv7.pipe(
                Effect.orDie
              )).split('-')

              const newUser = yield* userService.create({
                username: username ?? '',
                email,
                image,
              })

              userId = newUser.id
              userRole = newUser.role
              _isNewUser = true
            }

            const newAccount = Account.make({
              provider: _provider,
              providerId: id,
              userId,
            })
            yield* accountRepository.save(newAccount)
          }

          const _result = yield* authService.createRefreshToken(
            userId,
            userRole
          )

          return { ..._result, isNewUser: _isNewUser }
        }).pipe(withTransaction)

        if (isNewUser && resendService._tag === 'Some')
          yield* resendService.value.sendEmail({
            to: [email],
            subject: 'Welcome to Rozumari!',
            html: `<p>Welcome to Rozumari! Your account has been created successfully.</p>`,
          })

        return result
      }),

      exchange: Effect.fn(function* exchange(token) {
        const { session, user } = yield* authService.verifyRefreshToken(token)

        const accessToken = yield* authService.createAccessToken(
          user.id,
          user.role
        )

        return {
          accessToken,
          refreshToken: token,
          expiresAt: session.expiresAt,
        }
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
