import { Api } from '@rozumari/contract'
import { ChangePasswordDto } from '@rozumari/contract/auth/dto/change-password.dto'
import { ForgotPasswordDto } from '@rozumari/contract/auth/dto/forgot-password.dto'
import { LoginDto } from '@rozumari/contract/auth/dto/login.dto'
import { LogoutDto } from '@rozumari/contract/auth/dto/logout.dto'
import { RefreshTokenDto } from '@rozumari/contract/auth/dto/refresh-token.dto'
import { RegisterDto } from '@rozumari/contract/auth/dto/register.dto'
import { ResetPasswordDto } from '@rozumari/contract/auth/dto/reset-password.dto'
import { WhoAmIDto } from '@rozumari/contract/auth/dto/whoami.dto'
import * as Effect from 'effect/Effect'
import * as HttpServerResponse from 'effect/unstable/http/HttpServerResponse'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'

import { ChangePasswordUseCase } from '@/modules/auth/application/use-case/change-password.use-case'
import { ForgotPasswordUseCase } from '@/modules/auth/application/use-case/forgot-password.use-case'
import { LoginUseCase } from '@/modules/auth/application/use-case/login.use-case'
import { LogoutUseCase } from '@/modules/auth/application/use-case/logout.use-case'
import { RefreshTokenUseCase } from '@/modules/auth/application/use-case/refresh-token.use-case'
import { RegisterUseCase } from '@/modules/auth/application/use-case/register.use-case'
import { ResetPasswordUseCase } from '@/modules/auth/application/use-case/reset-password'
import { WhoAmIUseCase } from '@/modules/auth/application/use-case/whoami.use-case'
import { COOKIE_KEYS, COOKIE_OPTIONS } from '@/modules/auth/domain/constants'

export const authController = HttpApiBuilder.group(Api, 'auth', (handlers) =>
  handlers

    .handle('register', ({ payload }) =>
      RegisterUseCase.use((s) => s.execute(payload)).pipe(
        Effect.map(() => new RegisterDto())
      )
    )

    .handle('login', ({ payload }) =>
      LoginUseCase.use((s) => s.execute(payload)).pipe(
        Effect.flatMap((data) =>
          HttpServerResponse.json(new LoginDto({ data })).pipe(
            Effect.flatMap((response) =>
              HttpServerResponse.setCookies(response, [
                [
                  COOKIE_KEYS.REFRESH_TOKEN,
                  data.refreshToken,
                  { ...COOKIE_OPTIONS, expires: data.expiresAt },
                ],
                [
                  COOKIE_KEYS.ACCESS_TOKEN,
                  data.accessToken,
                  { ...COOKIE_OPTIONS, maxAge: '15 minutes' },
                ],
              ])
            ),
            Effect.orDie
          )
        )
      )
    )

    .handle('logout', ({ headers }) =>
      LogoutUseCase.use((s) => s.execute(headers)).pipe(
        Effect.flatMap(() =>
          HttpServerResponse.json(new LogoutDto()).pipe(
            Effect.flatMap((response) =>
              HttpServerResponse.setCookies(response, [
                [
                  COOKIE_KEYS.REFRESH_TOKEN,
                  '',
                  { ...COOKIE_OPTIONS, maxAge: 0 },
                ],
                [
                  COOKIE_KEYS.ACCESS_TOKEN,
                  '',
                  { ...COOKIE_OPTIONS, maxAge: 0 },
                ],
              ])
            ),
            Effect.orDie
          )
        )
      )
    )

    .handle('whoami', () =>
      WhoAmIUseCase.use((s) => s.execute()).pipe(
        Effect.map((data) => new WhoAmIDto({ data }))
      )
    )

    .handle('refresh', ({ headers }) =>
      RefreshTokenUseCase.use((s) => s.execute(headers)).pipe(
        Effect.flatMap((data) =>
          HttpServerResponse.json(new RefreshTokenDto({ data })).pipe(
            Effect.flatMap((response) =>
              HttpServerResponse.setCookies(response, [
                [
                  COOKIE_KEYS.REFRESH_TOKEN,
                  data.refreshToken,
                  { ...COOKIE_OPTIONS, expires: data.expiresAt },
                ],
                [
                  COOKIE_KEYS.ACCESS_TOKEN,
                  data.accessToken,
                  { ...COOKIE_OPTIONS, maxAge: '15 minutes' },
                ],
              ])
            ),
            Effect.orDie
          )
        )
      )
    )

    .handle('forgot-password', ({ payload }) =>
      ForgotPasswordUseCase.use((s) => s.execute(payload)).pipe(
        Effect.map(() => new ForgotPasswordDto())
      )
    )

    .handle('change-password', ({ payload }) =>
      ChangePasswordUseCase.use((s) => s.execute(payload)).pipe(
        Effect.map(() => new ChangePasswordDto())
      )
    )

    .handle('reset-password', ({ payload }) =>
      ResetPasswordUseCase.use((s) => s.execute(payload)).pipe(
        Effect.map(() => new ResetPasswordDto())
      )
    )
)
