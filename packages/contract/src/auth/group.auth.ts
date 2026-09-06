import * as HttpApiEndpoint from 'effect/unstable/httpapi/HttpApiEndpoint'
import * as HttpApiGroup from 'effect/unstable/httpapi/HttpApiGroup'

import { ChangePasswordDto } from '@/auth/dto/change-password.dto'
import { ForgotPasswordDto } from '@/auth/dto/forgot-password.dto'
import { LoginDto } from '@/auth/dto/login.dto'
import { LogoutDto } from '@/auth/dto/logout.dto'
import { RefreshTokenDto } from '@/auth/dto/refresh-token.dto'
import { RegisterDto } from '@/auth/dto/register.dto'
import { ResetPasswordDto } from '@/auth/dto/reset-password.dto'
import { WhoAmIDto } from '@/auth/dto/whoami.dto'
import { AuthMiddleware } from '@/auth/middleware'
import { InvalidCredentials, Unauthorized } from '@/auth/schemas/auth.error'
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
    HttpApiEndpoint.post('logout', '/logout', {
      headers: LogoutDto.Input,
      success: LogoutDto,
      error: Unauthorized,
    })
  )

  .add(
    HttpApiEndpoint.post('refresh', '/refresh', {
      headers: RefreshTokenDto.Input,
      success: RefreshTokenDto,
      error: Unauthorized,
    })
  )

  .add(
    HttpApiEndpoint.get('whoami', '/whoami', {
      success: WhoAmIDto,
    }).middleware(AuthMiddleware)
  )

  .add(
    HttpApiEndpoint.post('change-password', '/change-password', {
      payload: ChangePasswordDto.Input,
      success: ChangePasswordDto,
      error: InvalidCredentials,
    }).middleware(AuthMiddleware)
  )

  .add(
    HttpApiEndpoint.post('forgot-password', '/forgot-password', {
      payload: ForgotPasswordDto.Input,
      success: ForgotPasswordDto,
    })
  )

  .add(
    HttpApiEndpoint.post('reset-password', '/forgot-password/reset', {
      headers: ResetPasswordDto.Headers,
      payload: ResetPasswordDto.Input,
      success: ResetPasswordDto,
    }).middleware(AuthMiddleware)
  )

  .prefix('/api/auth') {}
