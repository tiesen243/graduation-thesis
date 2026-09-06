// oxlint-disable unicorn/throw-new-error max-classes-per-file

import type * as Effect from 'effect/Effect'

import * as Context from 'effect/Context'
import * as Schema from 'effect/Schema'

export class InvalidToken extends Schema.TaggedError<InvalidToken>()(
  'shared/application/services/InvalidToken',
  {}
) {}

export class TokenExpired extends Schema.TaggedError<TokenExpired>()(
  'shared/application/services/TokenExpired',
  {}
) {}

export class JwtError extends Schema.TaggedError<JwtError>()(
  'shared/application/services/JwtError',
  { reason: Schema.Union([InvalidToken, TokenExpired]) },
  { httpApiStatus: 401 }
) {}

export class Jwt extends Context.Service<
  Jwt,
  {
    readonly sign: (
      payloadClaims: Record<string, unknown>,
      options?: Jwt.Options
    ) => Effect.Effect<string>

    readonly verify: (token: string) => Effect.Effect<Jwt.Header, JwtError>
  }
>()('shared/infrastructure/jwt/Jwt', {}) {}

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
