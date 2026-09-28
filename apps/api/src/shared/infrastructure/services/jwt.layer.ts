import * as Effect from 'effect/Effect'
import * as Base64Url from 'effect/encoding/Base64Url'
import * as Layer from 'effect/Layer'

import {
  Jwt,
  JwtError,
  InvalidToken,
  TokenExpired,
} from '@/shared/application/services/jwt.service'
import { env } from '@/shared/env'

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

const signData = Effect.fn(function* signData(
  data: Uint8Array<ArrayBuffer>,
  alg: Jwt.Algorithm
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
      { name: 'HMAC', hash: algMap[alg] },
      false,
      ['sign']
    )
  )

  return yield* Effect.promise(() => crypto.subtle.sign('HMAC', key, data))
})

export const jwtLayer = (alg: Jwt.Algorithm = 'HS256') =>
  Layer.succeed(Jwt, {
    sign: Effect.fn(function* sign(payloadClaims, options = {}) {
      const header = { alg, typ: 'JWT', ...options.headers }

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

      const headerPart = Base64Url.encode(
        textEncoder.encode(JSON.stringify(header))
      )
      const payloadPart = Base64Url.encode(
        textEncoder.encode(JSON.stringify(payload))
      )

      const data = textEncoder.encode(`${headerPart}.${payloadPart}`)
      const signature = yield* signData(data, alg)
      const signaturePart = Base64Url.encode(new Uint8Array(signature))

      return `${headerPart}.${payloadPart}.${signaturePart}`
    }),

    verify: Effect.fn(function* verify(token) {
      const [headerPart, payloadPart, signaturePart] = token.split('.')
      if (!headerPart || !payloadPart || !signaturePart)
        return yield* Effect.fail(new JwtError({ reason: new InvalidToken() }))

      const data = textEncoder.encode(`${headerPart}.${payloadPart}`)
      const expectedSignature = yield* signData(data, alg)

      const expectedSignaturePart = Base64Url.encode(
        new Uint8Array(expectedSignature)
      )
      if (expectedSignaturePart !== signaturePart)
        return yield* Effect.fail(new JwtError({ reason: new InvalidToken() }))

      const decodedPayload = Base64Url.decode(payloadPart)
      const decodedHeader = Base64Url.decode(headerPart)
      if (decodedPayload._tag === 'Failure' || decodedHeader._tag === 'Failure')
        return yield* Effect.fail(new JwtError({ reason: new InvalidToken() }))

      const payloadJson = textDecoder.decode(decodedPayload.success)
      const headerJson = textDecoder.decode(decodedHeader.success)

      const payload = JSON.parse(payloadJson) as Jwt.Header
      const header = JSON.parse(headerJson) as Jwt.Header

      const currentTime = Math.floor(Date.now() / 1000)

      if (payload.exp && currentTime >= payload.exp)
        return yield* Effect.fail(new JwtError({ reason: new TokenExpired() }))

      if (payload.nbf && currentTime < payload.nbf)
        return yield* Effect.fail(new JwtError({ reason: new InvalidToken() }))

      return { ...payload, ...header }
    }),
  })
