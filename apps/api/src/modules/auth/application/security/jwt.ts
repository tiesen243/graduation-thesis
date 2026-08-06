import type { JwtPayload } from '@rozumari/contract/auth/middleware'
import type {
  InvalidToken,
  TokenExpired,
} from '@rozumari/contract/auth/schemas/auth.error'
import type { AccessToken } from '@rozumari/contract/auth/schemas/token.schema'
import type * as Effect from 'effect/Effect'

import * as Context from 'effect/Context'

export class Jwt extends Context.Service<
  Jwt,
  {
    readonly sign: (
      payloadClaims: JwtPayload & Record<string, unknown>,
      options?: Jwt.Options
    ) => Effect.Effect<AccessToken>

    readonly verify: (
      token: AccessToken
    ) => Effect.Effect<JwtPayload & Jwt.Header, InvalidToken | TokenExpired>
  }
>()('auth/application/Jwt') {}

export namespace Jwt {
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
