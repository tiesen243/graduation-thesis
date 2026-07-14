import * as Effect from 'effect/Effect'
import { Elysia } from 'elysia'

import { LoginDto } from '@/modules/auth/application/dto/login.dto'
import { RegisterDto } from '@/modules/auth/application/dto/register.dto'
import { authSchema } from '@/modules/auth/application/types'
import { loginUseCase } from '@/modules/auth/application/use-case/login.use-case'
import { refreshTokenUseCase } from '@/modules/auth/application/use-case/refresh-token.use-case'
import { RegisterUseCase } from '@/modules/auth/application/use-case/register.dto'
import {
  AuthMiddleware,
  CurrentUser,
} from '@/modules/auth/presentation/auth.middleware'
import { UserService } from '@/modules/user/application/user.service'
import { Http } from '@/shared/http'

export const AuthController = new Elysia({
  name: 'modules/auth/presentation/AuthController',
  prefix: '/api/auth',
})
  .use(AuthMiddleware)

  .get('/whoami', { auth: true }, () =>
    Effect.gen(function* whoamiGen() {
      const userService = yield* UserService
      const { userId } = yield* CurrentUser

      const user = yield* userService.findByIidentifier({ id: userId })
      if (!user)
        return yield* Effect.fail(Http.unauthorized('Invalid access token'))

      return user
    })
  )

  .post('/register', { body: RegisterDto.input }, ({ body }) =>
    RegisterUseCase(body)
  )

  .post('/login', { ...authSchema, body: LoginDto.input }, ({ body, cookie }) =>
    loginUseCase(body).pipe(
      Effect.tap((session) => {
        cookie['auth.accessToken'].set({ value: session.accessToken })
        cookie['auth.refreshToken'].set({
          value: session.refreshToken,
          expires: session.expiresAt,
        })
      })
    )
  )

  .post('/refresh-token', ({ headers, cookie }) =>
    refreshTokenUseCase({
      token:
        headers.authorization?.replace('Bearer ', '') ??
        cookie['auth.refreshToken']?.value ??
        '',
    }).pipe(
      Effect.tap((session) => {
        cookie['auth.accessToken'].set({ value: session.accessToken })
        cookie['auth.refreshToken'].set({
          value: session.refreshToken,
          expires: session.expiresAt,
        })
      })
    )
  )
