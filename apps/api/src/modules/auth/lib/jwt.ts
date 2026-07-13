import * as Effect from 'effect/Effect'
import crypto from 'node:crypto'

import { decodeBase64Url, encodeBase64Url } from '@/modules/auth/lib/crypto'
import { Http } from '@/shared/http'

export class JWT<TValue extends Record<string, unknown>> {
  public constructor(
    private readonly secret = '',
    private readonly algorithm: JWT.Algorithm = 'HS256'
  ) {}

  public sign = (
    payloadClaims: TValue,
    options: JWT.Options = {}
  ): Effect.Effect<string> =>
    Effect.gen(this, function* signGen() {
      const header = {
        alg: this.algorithm,
        typ: 'JWT',
        ...options.headers,
      }

      const payload = { ...payloadClaims } as Record<string, unknown>

      if (!payload.exp)
        payload.exp =
          Math.floor(Date.now() / 1000) + (options.expiresIn ?? 3600)
      if (options.audiences) payload.aud = options.audiences
      if (options.subject) payload.sub = options.subject
      if (options.issuer) payload.iss = options.issuer
      if (options.jwtId) payload.jti = options.jwtId
      if (options.notBefore)
        payload.nbf = Math.floor(options.notBefore.getTime() / 1000)
      if (options.includeIssuedTimestamp)
        payload.iat = Math.floor(Date.now() / 1000)

      const textEncoder = new TextEncoder()
      const headerPart = encodeBase64Url(
        textEncoder.encode(JSON.stringify(header))
      )
      const payloadPart = encodeBase64Url(
        textEncoder.encode(JSON.stringify(payload))
      )

      const data = textEncoder.encode(`${headerPart}.${payloadPart}`)
      const signature = yield* this.signData(data)
      const signaturePart = encodeBase64Url(new Uint8Array(signature))

      return `${headerPart}.${payloadPart}.${signaturePart}`
    })

  public verify = (token: string): Effect.Effect<TValue & JWT.Header, Http> =>
    Effect.gen(this, function* verifyGen() {
      const [headerPart, payloadPart, signaturePart] = token.split('.')
      if (!headerPart || !payloadPart || !signaturePart)
        return yield* Effect.fail(Http.unauthorized('Invalid token format'))

      const textEncoder = new TextEncoder()
      const data = textEncoder.encode(`${headerPart}.${payloadPart}`)

      const expectedSignature = yield* this.signData(data)

      const expectedSignaturePart = encodeBase64Url(
        new Uint8Array(expectedSignature)
      )
      if (expectedSignaturePart !== signaturePart)
        return yield* Effect.fail(Http.unauthorized('Invalid token signature'))

      const payloadJson = new TextDecoder().decode(decodeBase64Url(payloadPart))
      const headerJson = new TextDecoder().decode(decodeBase64Url(headerPart))

      const payload = JSON.parse(payloadJson) as TValue & JWT.Header
      const header = JSON.parse(headerJson) as Record<string, unknown>

      const currentTime = Math.floor(Date.now() / 1000)
      if (payload.exp && currentTime >= payload.exp)
        return yield* Effect.fail(Http.unauthorized('Token has expired'))
      if (payload.nbf && currentTime < payload.nbf)
        return yield* Effect.fail(Http.unauthorized('Token not valid yet'))

      return { ...payload, ...header }
    })

  private signData = (data: Uint8Array): Effect.Effect<ArrayBuffer> =>
    Effect.gen(this, function* signDataGen() {
      const algMap = {
        HS256: { name: 'SHA-256' },
        HS384: { name: 'SHA-384' },
        HS512: { name: 'SHA-512' },
      } as const

      const key = yield* Effect.promise(() =>
        crypto.subtle.importKey(
          'raw',
          new TextEncoder().encode(this.secret),
          { name: 'HMAC', hash: algMap[this.algorithm] },
          false,
          ['sign']
        )
      )

      return yield* Effect.promise(() =>
        crypto.subtle.sign('HMAC', key, data as Uint8Array<ArrayBuffer>)
      )
    })
}

export namespace JWT {
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
