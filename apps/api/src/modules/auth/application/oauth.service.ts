import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import type { TokensSchema } from '@/modules/auth/application/types'
import type { Http } from '@/shared/http'

import { AuthService } from '@/modules/auth/application/auth.service'
import { Account } from '@/modules/auth/domain/entities/account.entity'
import { AccountRepository } from '@/modules/auth/domain/repositories/account.repository'
import { UserService } from '@/modules/user/application/user.service'
import { runTransaction } from '@/shared/lib/utils'

export class OAuthService extends Context.Tag(
  'modules/auth/application/OAuthService'
)<
  OAuthService,
  {
    readonly login: (
      input: OAuthService.Account & { provider: string }
    ) => Effect.Effect<TokensSchema, Http, unknown>
  }
>() {
  public static live = Layer.succeed(this, {
    login: ({ provider, id, email, name, image }) =>
      Effect.gen(function* loginGen() {
        const authService = yield* AuthService
        const userService = yield* UserService

        const accountRepo = yield* AccountRepository

        let [account] = yield* accountRepo.find(
          [{ provider, providerAccountId: id }],
          {},
          { limit: 1 }
        )

        return yield* runTransaction(
          Effect.gen(function* loginTransaction() {
            let user = yield* userService.findByIidentifier({ email })
            if (!user)
              user = yield* userService.create({ email, username: name, image })

            if (!account) {
              account = Account.make({
                provider,
                providerAccountId: id,
                userId: user.id,
              })
              yield* accountRepo.save(account)
            }

            return yield* authService.createSession({
              userId: user.id,
              role: user.role,
            })
          })
        )
      }),
  })
}

export namespace OAuthService {
  export interface Account {
    id: string
    name: string
    email: string
    image: string | null
  }

  export interface Token {
    access_token: string
    token_type: string
    expires_in: number
  }
}
