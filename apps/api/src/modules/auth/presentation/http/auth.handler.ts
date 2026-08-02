import * as Effect from 'effect/Effect'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'

import { Api } from '@/api'
import { LoginUseCase } from '@/modules/auth/application/use-case/login.use-case'
import { RegisterUseCase } from '@/modules/auth/application/use-case/register.use-case'
import { Unauthorized } from '@/modules/auth/domain/entities/auth.error'
import {
  LoginSuccess,
  RegisterSuccess,
  WhoamiSuccess,
} from '@/modules/auth/presentation/api/auth.group'
import { CurrentUser } from '@/modules/auth/presentation/api/auth.middleware'
import { UserService } from '@/modules/user/application/user.service'

export const AuthHandler = HttpApiBuilder.group(Api, 'auth', (handlers) =>
  handlers
    .handle('login', ({ payload }) =>
      LoginUseCase.use((s) => s.execute(payload)).pipe(
        Effect.map((data) =>
          LoginSuccess.make({
            message: 'Login successful',
            data,
          })
        )
      )
    )

    .handle('register', ({ payload }) =>
      RegisterUseCase.use((s) => s.execute(payload)).pipe(
        Effect.map((data) =>
          RegisterSuccess.make({
            message: 'Registration successful',
            data,
          })
        )
      )
    )

    .handle(
      'whoami',
      Effect.fn(function* whoami() {
        const userService = yield* UserService

        const { userId } = yield* CurrentUser

        const user = yield* userService.findByIdentifier({ id: userId })
        if (!user)
          return yield* Effect.fail(
            new Unauthorized({ message: 'User not found' })
          )

        if (user.deletedAt !== null)
          return yield* Effect.fail(
            new Unauthorized({ message: 'User is deleted' })
          )

        return WhoamiSuccess.make({
          message: 'Get current user successful',
          data: user,
        })
      })
    )
)
