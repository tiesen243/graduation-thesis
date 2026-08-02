import type * as Effect from 'effect/Effect'

import * as Context from 'effect/Context'
import * as Schema from 'effect/Schema'

import type { AccessToken } from '@/modules/auth/application/types'
import type {
  UserId,
  UserRole,
} from '@/modules/user/domain/entities/user.entity'

import { ApiResponseSchema } from '@/shared/schema'

export class JwtError extends Schema.TaggedErrorClass<JwtError>()(
  'auth/application/JwtError',
  ApiResponseSchema(),
  { httpApiStatus: 401 }
) {}

// oxlint-disable-next-line eslint/max-classes-per-file
export class Jwt extends Context.Service<
  Jwt,
  {
    readonly sign: (
      payloadClaims: Jwt.Payload,
      options?: Jwt.Options
    ) => Effect.Effect<AccessToken, JwtError>

    readonly verify: (
      token: AccessToken
    ) => Effect.Effect<Jwt.Payload & Jwt.Header, JwtError>
  }
>()('auth/application/Jwt') {}

export namespace Jwt {
  export interface Payload {
    userId: UserId
    role: UserRole
    [key: string]: unknown
  }

  export type Algorithm = 'HS256' | 'HS384' | 'HS512'

  export interface Options {
    headers?: Record<string, unknown>
    expiresIn?: number
    issuer?: string
    subject?: string
    audiences?: string | string[]
    notBefore?: Date
    includeIssuedTimestamp?: boolean
    jwtId?: string
  }

  export interface Header {
    exp: number
    aud?: string | string[]
    iat?: number
    iss?: string
    jti?: string
    nbf?: number
    sub?: string
    [key: string]: unknown
  }
}
