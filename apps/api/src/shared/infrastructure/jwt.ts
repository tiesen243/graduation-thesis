// oxlint-disable unicorn/throw-new-error max-classes-per-file

import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Encoding from 'effect/Encoding'
import * as Layer from 'effect/Layer'
import * as Schema from 'effect/Schema'

import { env } from '@/shared/env'

class InvalidToken extends Schema.TaggedError<InvalidToken>()(
  'shared/infrastructure/jwt/InvalidToken',
  { message: Schema.String },
  { httpApiStatus: 401 }
) {}

class TokenExpired extends Schema.TaggedError<TokenExpired>()(
  'shared/infrastructure/jwt/TokenExpired',
  {},
  { httpApiStatus: 401 }
) {}

export class JwtError extends Schema.TaggedError<JwtError>()(
  'shared/infrastructure/jwt/JwtError',
  {
    reason: Schema.Union([InvalidToken, TokenExpired]),
  }
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
>()('shared/infrastructure/jwt/Jwt', {
  // oxlint-disable-next-line require-yield
  make: Effect.gen(function* make() {
    const ALGORITHM: Jwt.Algorithm = 'HS256'

    const textEncoder = new TextEncoder()
    const textDecoder = new TextDecoder()

    const signData = Effect.fn(function* signData(
      data: Uint8Array<ArrayBuffer>
    ) {
      const algMap = {
        HS256: { name: 'SHA-256' },
        HS384: { name: 'SHA-384' },
        HS512: { name: 'SHA-512' },
      } as const

      const key = yield* Effect.promise(() =>
        crypto.subtle.importKey(
          'raw',
          textEncoder.encode(env.AUTH_SECRET),
          { name: 'HMAC', hash: algMap[ALGORITHM] },
          false,
          ['sign']
        )
      )

      return yield* Effect.promise(() => crypto.subtle.sign('HMAC', key, data))
    })

    return {
      sign: Effect.fn(function* sign(payloadClaims, options = {}) {
        const header = { alg: ALGORITHM, typ: 'JWT', ...options.headers }

        const payload = { ...payloadClaims }
        if (!payload.exp)
          payload.exp =
            Math.floor(Date.now() / 1000) + (options.expiresIn ?? 3600)
        if (options.audiences) payload.aud = options.audiences
        if (options.subject) payload.sub = options.subject
        if (options.audiences) payload.aud = options.audiences
        if (options.subject) payload.sub = options.subject
        if (options.issuer) payload.iss = options.issuer
        if (options.jwtId) payload.jti = options.jwtId
        if (options.notBefore)
          payload.nbf = Math.floor(options.notBefore.getTime() / 1000)
        if (options.includeIssuedTimestamp)
          payload.iat = Math.floor(Date.now() / 1000)

        const headerPart = Encoding.encodeBase64Url(
          textEncoder.encode(JSON.stringify(header))
        )
        const payloadPart = Encoding.encodeBase64Url(
          textEncoder.encode(JSON.stringify(payload))
        )

        const data = textEncoder.encode(`${headerPart}.${payloadPart}`)
        const signature = yield* signData(data)
        const signaturePart = Encoding.encodeBase64Url(
          new Uint8Array(signature)
        )

        return `${headerPart}.${payloadPart}.${signaturePart}`
      }),

      verify: Effect.fn(function* verify(token) {
        const [headerPart, payloadPart, signaturePart] = token.split('.')
        if (!headerPart || !payloadPart || !signaturePart)
          return yield* Effect.fail(
            new JwtError({
              reason: new InvalidToken({ message: 'Invalid token format' }),
            })
          )

        const data = textEncoder.encode(`${headerPart}.${payloadPart}`)
        const expectedSignature = yield* signData(data)

        const expectedSignaturePart = Encoding.encodeBase64Url(
          new Uint8Array(expectedSignature)
        )
        if (expectedSignaturePart !== signaturePart)
          return yield* Effect.fail(
            new JwtError({
              reason: new InvalidToken({ message: 'Invalid token signature' }),
            })
          )

        const decodedPayload = Encoding.decodeBase64Url(payloadPart)
        const decodedHeader = Encoding.decodeBase64Url(headerPart)
        if (
          decodedPayload._tag === 'Failure' ||
          decodedHeader._tag === 'Failure'
        )
          return yield* Effect.fail(
            new JwtError({
              reason: new InvalidToken({ message: 'Invalid token encoding' }),
            })
          )

        const payloadJson = textDecoder.decode(decodedPayload.success)
        const headerJson = textDecoder.decode(decodedHeader.success)

        const payload = JSON.parse(payloadJson) as Jwt.Header
        const header = JSON.parse(headerJson) as Jwt.Header

        const currentTime = Math.floor(Date.now() / 1000)

        if (payload.exp && currentTime >= payload.exp)
          return yield* Effect.fail(
            new JwtError({
              reason: new TokenExpired(),
            })
          )

        if (payload.nbf && currentTime < payload.nbf)
          return yield* Effect.fail(
            new JwtError({
              reason: new InvalidToken({ message: 'Token not yet valid' }),
            })
          )

        return { ...payload, ...header }
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}

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
