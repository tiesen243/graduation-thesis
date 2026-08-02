import * as Schema from 'effect/Schema'
import * as HttpApiEndpoint from 'effect/unstable/httpapi/HttpApiEndpoint'
import * as HttpApiGroup from 'effect/unstable/httpapi/HttpApiGroup'

import { LoginDto } from '@/modules/auth/application/dto/login.dto'
import { RegisterDto } from '@/modules/auth/application/dto/register.dto'
import { WhoamiDto } from '@/modules/auth/application/dto/whoami.dto'
import { JwtError } from '@/modules/auth/application/security/jwt'
import { PasswordError } from '@/modules/auth/application/security/password'
import {
  Conflict,
  InvalidCredentials,
  Unauthorized,
} from '@/modules/auth/domain/entities/auth.error'
import { AuthMiddleware } from '@/modules/auth/presentation/http/auth.middleware'
import { ApiResponseSchema } from '@/shared/schema'

export class LoginSuccess extends Schema.TaggedClass<LoginSuccess>()(
  'auth/presentation/LoginSuccess',
  ApiResponseSchema(LoginDto.Output)
) {}

export class RegisterSuccess extends Schema.TaggedClass<RegisterSuccess>()(
  'auth/presentation/RegisterSuccess',
  ApiResponseSchema(RegisterDto.Output)
) {}

export class WhoamiSuccess extends Schema.TaggedClass<WhoamiSuccess>()(
  'auth/presentation/WhoamiSuccess',
  ApiResponseSchema(WhoamiDto.Output)
) {}

export class AuthGroup extends HttpApiGroup.make('auth')
  .add(
    HttpApiEndpoint.post('login', '/login', {
      payload: LoginDto.Input,
      success: LoginSuccess,
      error: [InvalidCredentials, JwtError, PasswordError, Unauthorized],
    })
  )

  .add(
    HttpApiEndpoint.post('register', '/register', {
      payload: RegisterDto.Input,
      success: RegisterSuccess,
      error: [Conflict, InvalidCredentials, PasswordError],
    })
  )

  .add(
    HttpApiEndpoint.get('whoami', '/whoami', {
      success: WhoamiSuccess,
      error: Unauthorized,
    }).middleware(AuthMiddleware)
  )

  .prefix('/api/auth') {}
