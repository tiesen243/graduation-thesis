// oxlint-disable eslint/no-bitwise

import * as Crypto from 'effect/Crypto'
import * as Effect from 'effect/Effect'
import * as Encoding from 'effect/Encoding'

export function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) return false

  let c = 0
  for (let i = 0; i < a.byteLength; i += 1) c |= (a[i] ?? 0) ^ (b[i] ?? 0)
  return c === 0
}

export const hashSecret = Effect.fn(function* hashSecret(secret: string) {
  const crypto = yield* Crypto.Crypto

  const secretBytes = new TextEncoder().encode(secret)
  return yield* crypto.digest('SHA-256', secretBytes).pipe(Effect.orDie)
})

const ALPHABET = 'abcdefghijklmnpqrstuvwxyz23456789'

export const generateSecureString = Effect.gen(
  function* generateSecureString() {
    const crypto = yield* Crypto.Crypto

    const bytes = yield* crypto.randomBytes(24).pipe(Effect.orDie)

    let id = ''
    for (const b of bytes) id += ALPHABET[b >> 3] ?? ''

    return id
  }
)

export const generateStateOrCode = Effect.gen(function* generateStateOrCode() {
  const crypto = yield* Crypto.Crypto

  const randomValues = yield* crypto.randomBytes(32).pipe(Effect.orDie)

  return Encoding.encodeBase64Url(randomValues)
})

export const generateCodeChallenge = Effect.fn(function* generateCodeChallenge(
  codeVerifier: string
) {
  const crypto = yield* Crypto.Crypto

  const encodedVerifier = new TextEncoder().encode(codeVerifier)
  const digest = yield* crypto
    .digest('SHA-256', encodedVerifier)
    .pipe(Effect.orDie)

  return Encoding.encodeBase64Url(digest)
})
