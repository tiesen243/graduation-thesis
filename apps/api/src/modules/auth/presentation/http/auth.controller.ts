import { Api } from '@rozumari/contract'
import { LoginDto } from '@rozumari/contract/auth/dto/login.dto'
import { RefreshTokenDto } from '@rozumari/contract/auth/dto/refresh-token.dto'
import { RegisterDto } from '@rozumari/contract/auth/dto/register.dto'
import { WhoAmIDto } from '@rozumari/contract/auth/dto/whoami.dto'
import { COOKIE_KEYS } from '@rozumari/contract/auth/middleware'
import {
  AccessToken,
  RefreshToken,
} from '@rozumari/contract/auth/schemas/token.schema'
import * as Effect from 'effect/Effect'
import { HttpEffect, HttpServerResponse } from 'effect/unstable/http'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'

import { LoginUseCase } from '@/modules/auth/application/use-case/login.use-case'
import { RegisterUseCase } from '@/modules/auth/application/use-case/register.use-case'
import { WhoAmIUseCase } from '@/modules/auth/application/use-case/whoami.use-case'
import { COOKIE_OPTIONS } from '@/modules/auth/constants'

const token = {
  accessToken: AccessToken.make('accessToken'),
  refreshToken: RefreshToken.make('refreshToken'),
  expiresAt: new Date(),
}

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
            Effect.succeed(
              HttpServerResponse.setCookiesUnsafe(res, [
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
            )
          )
        ),

        Effect.map((data) => LoginDto.make({ data }))
      )
    )

    .handle('whoami', () =>
      WhoAmIUseCase.use((s) => s.execute()).pipe(
        Effect.map((data) => WhoAmIDto.make({ data }))
      )
    )

    .handle('refresh', () =>
      Effect.succeed(RefreshTokenDto.make({ data: token }))
    )
)
