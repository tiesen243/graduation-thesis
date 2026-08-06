import type { JwtPayload } from '@rozumari/contract/auth/middleware'

import {
  InvalidToken,
  TokenExpired,
} from '@rozumari/contract/auth/schemas/auth.error'
import { AccessToken } from '@rozumari/contract/auth/schemas/token.schema'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import crypto from 'node:crypto'

import { Jwt } from '@/modules/auth/application/security/jwt'
import {
  decodeBase64Url,
  encodeBase64Url,
} from '@/modules/auth/infrastructure/security/crypto/encoding'

export const JwtLayer = (secret: string, algorithm: Jwt.Algorithm = 'HS256') =>
  Layer.effect(
    Jwt,
    Effect.sync(() => {
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
            textEncoder.encode(secret),
            { name: 'HMAC', hash: algMap[algorithm] },
            false,
            ['sign']
          )
        )

        return yield* Effect.promise(() =>
          crypto.subtle.sign('HMAC', key, data)
        )
      })

      const sign = Effect.fn(function* hash(
        payloadClaims: JwtPayload & Record<string, unknown>,
        options: Jwt.Options = {}
      ) {
        const header = {
          alg: algorithm,
          typ: 'JWT',
          ...options.headers,
        }

        const payload = { ...payloadClaims }
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

        const headerPart = encodeBase64Url(
          textEncoder.encode(JSON.stringify(header))
        )
        const payloadPart = encodeBase64Url(
          textEncoder.encode(JSON.stringify(payload))
        )

        const data = textEncoder.encode(`${headerPart}.${payloadPart}`)
        const signature = yield* signData(data)
        const signaturePart = encodeBase64Url(new Uint8Array(signature))

        return AccessToken.make(`${headerPart}.${payloadPart}.${signaturePart}`)
      })

      const verify = Effect.fn(function* verify(token: AccessToken) {
        const [headerPart, payloadPart, signaturePart] = token.split('.')
        if (!headerPart || !payloadPart || !signaturePart)
          return yield* Effect.fail(
            new InvalidToken({ message: 'Invalid token format' })
          )

        const data = textEncoder.encode(`${headerPart}.${payloadPart}`)
        const expectedSignature = yield* signData(data)

        const expectedSignaturePart = encodeBase64Url(
          new Uint8Array(expectedSignature)
        )
        if (expectedSignaturePart !== signaturePart)
          return yield* Effect.fail(
            new InvalidToken({ message: 'Invalid token signature' })
          )

        const payloadJson = textDecoder.decode(decodeBase64Url(payloadPart))
        const headerJson = textDecoder.decode(decodeBase64Url(headerPart))

        const payload = JSON.parse(payloadJson) as JwtPayload & Jwt.Header
        const header = JSON.parse(headerJson) as Jwt.Header

        const currentTime = Math.floor(Date.now() / 1000)

        if (payload.exp && currentTime >= payload.exp)
          return yield* Effect.fail(new TokenExpired())

        if (payload.nbf && currentTime < payload.nbf)
          return yield* Effect.fail(
            new InvalidToken({ message: 'Token not yet valid' })
          )

        return { ...payload, ...header }
      })

      return {
        sign,
        verify,
      }
    })
  )
