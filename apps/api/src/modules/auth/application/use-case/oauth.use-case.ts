import type { AccountProvider } from '@rozumari/contract/auth/schemas/account.schema'
import type { Unauthorized } from '@rozumari/contract/auth/schemas/auth.error'
import type { Token } from '@rozumari/contract/auth/schemas/token.schema'
import type { UserId } from '@rozumari/contract/user/schemas/user.schema'
import type { Crypto } from 'effect/Crypto'
import type { HttpClient } from 'effect/unstable/http/HttpClient'

import { ProviderError } from '@rozumari/contract/auth/schemas/auth.error'
import { UserRole } from '@rozumari/contract/user/schemas/user.schema'
import * as Context from 'effect/Context'
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
    ) => Effect.Effect<Token, ProviderError, OAuthService | Crypto | HttpClient>

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
        const provider = yield* OAuthService.forProvider(_provider)

        const { id, email } = yield* provider
          .fetchUserData(code, storedCode)
          .pipe(Effect.orDie)

        const { isNewUser, ...result } = yield* Effect.gen(function* tx() {
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

          let _isNewUser = false,
            userId: UserId,
            userRole: UserRole

          if (account) {
            ;({ userId } = account)
            userRole = user?.role ?? UserRole.make('user')
          } else {
            if (user) {
              if (user.deletedAt !== null)
                return yield* Effect.fail(
                  new ProviderError({ message: 'User account is deleted' })
                )

              userId = user.id
              userRole = user.role
            } else {
              const newUser = yield* userService.create({
                username: crypto.randomUUID().slice(0, 8),
                email,
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
