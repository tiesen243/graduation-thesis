import { Api } from '@rozumari/contract'
import { LoginDto } from '@rozumari/contract/auth/dto/login.dto'
import { LogoutDto } from '@rozumari/contract/auth/dto/logout.dto'
import { RefreshTokenDto } from '@rozumari/contract/auth/dto/refresh-token.dto'
import { RegisterDto } from '@rozumari/contract/auth/dto/register.dto'
import { WhoAmIDto } from '@rozumari/contract/auth/dto/whoami.dto'
import * as Effect from 'effect/Effect'
import * as HttpEffect from 'effect/unstable/http/HttpEffect'
import * as HttpServerResponse from 'effect/unstable/http/HttpServerResponse'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'

import { LoginUseCase } from '@/modules/auth/application/use-case/login.use-case'
import { LogoutUseCase } from '@/modules/auth/application/use-case/logout.use-case'
import { RefreshTokenUseCase } from '@/modules/auth/application/use-case/refresh-token.use-case'
import { RegisterUseCase } from '@/modules/auth/application/use-case/register.use-case'
import { WhoAmIUseCase } from '@/modules/auth/application/use-case/whoami.use-case'
import { COOKIE_KEYS, COOKIE_OPTIONS } from '@/modules/auth/constants'

export const authController = HttpApiBuilder.group(Api, 'auth', (handlers) =>
  handlers

    .handle('register', ({ payload }) =>
      RegisterUseCase.use((s) => s.execute(payload)).pipe(
        Effect.map(() => RegisterDto.make())
      )
    )

    .handle('login', ({ payload }) =>
      LoginUseCase.use((s) => s.execute(payload)).pipe(
        Effect.tap((data) =>
          HttpEffect.appendPreResponseHandler((_req, res) =>
            HttpServerResponse.setCookies(res, [
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
            ]).pipe(Effect.orDie)
          )
        ),

        Effect.map((data) => LoginDto.make({ data }))
      )
    )

    .handle('logout', ({ headers }) =>
      LogoutUseCase.use((s) => s.execute(headers)).pipe(
        Effect.tap(() =>
          HttpEffect.appendPreResponseHandler((_req, res) =>
            HttpServerResponse.setCookies(res, [
              [COOKIE_KEYS.REFRESH_TOKEN, '', { ...COOKIE_OPTIONS, maxAge: 0 }],
              [COOKIE_KEYS.ACCESS_TOKEN, '', { ...COOKIE_OPTIONS, maxAge: 0 }],
            ]).pipe(Effect.orDie)
          )
        ),
        Effect.map(() => LogoutDto.make())
      )
    )

    .handle('whoami', () =>
      WhoAmIUseCase.use((s) => s.execute()).pipe(
        Effect.map((data) => WhoAmIDto.make({ data }))
      )
    )

    .handle('refresh', ({ headers }) =>
      RefreshTokenUseCase.use((s) => s.execute(headers)).pipe(
        Effect.tap((data) =>
          HttpEffect.appendPreResponseHandler((_req, res) =>
            HttpServerResponse.setCookies(res, [
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
            ]).pipe(Effect.orDie)
          )
        ),
        Effect.map((data) => RefreshTokenDto.make({ data }))
      )
    )
)
