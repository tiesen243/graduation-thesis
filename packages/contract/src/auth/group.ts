import * as HttpApiEndpoint from 'effect/unstable/httpapi/HttpApiEndpoint'
import * as HttpApiGroup from 'effect/unstable/httpapi/HttpApiGroup'

import { LoginDto } from '@/auth/dto/login.dto'
import { RefreshTokenDto } from '@/auth/dto/refresh-token.dto'
import { RegisterDto } from '@/auth/dto/register.dto'
import { WhoAmIDto } from '@/auth/dto/whoami.dto'
import { AuthMiddleware } from '@/auth/middleware'
import {
  InvalidCredentials,
  InvalidToken,
  ProviderError,
} from '@/auth/schemas/auth.error'
import { OAuthSchema } from '@/auth/schemas/oauth.schema'
import { UserAlreadyExists, UserNotFound } from '@/user/schemas/user.error'

export class AuthGroup extends HttpApiGroup.make('auth')

  .add(
    HttpApiEndpoint.post('register', '/register', {
      payload: RegisterDto.Input,
      success: RegisterDto,
      error: UserAlreadyExists,
    })
  )

  .add(
    HttpApiEndpoint.post('login', '/login', {
      payload: LoginDto.Input,
      success: LoginDto,
      error: [InvalidCredentials, UserNotFound],
    })
  )

  .add(
    HttpApiEndpoint.post('refresh', '/refresh', {
      success: RefreshTokenDto,
      headers: RefreshTokenDto.Input,
      error: InvalidToken,
    })
  )

  .add(
    HttpApiEndpoint.get('whoami', '/whoami', {
      success: WhoAmIDto,
    }).middleware(AuthMiddleware)
  )

  .prefix('/api/auth') {}

// oxlint-disable-next-line eslint/max-classes-per-file
export class OAuthGroup extends HttpApiGroup.make('oauth')

  .add(
    HttpApiEndpoint.get('authorize', '/:provider', {
      params: OAuthSchema.Params,
      query: OAuthSchema.Query,
      error: [ProviderError],
    })
  )

  .add(
    HttpApiEndpoint.get('callback', '/:provider/callback', {
      params: OAuthSchema.Params,
      query: OAuthSchema.Query,
      error: [ProviderError],
    })
  )

  .add(
    HttpApiEndpoint.post('exchange', '/oauth', {
      payload: OAuthSchema.Payload,
      success: OAuthSchema.Success,
      error: [ProviderError, InvalidToken],
    })
  )

  .prefix('/api/auth') {}
