// oxlint-disable eslint/no-bitwise

import * as Effect from 'effect/Effect'

export function generateSecureString(): string {
  const alphabet = 'abcdefghijklmnpqrstuvwxyz23456789'

  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)

  let id = ''
  for (const b of bytes) id += alphabet[b >> 3] ?? ''

  return id
}

export function generateStateOrCode(): string {
  const randomValues = new Uint8Array(32)
  crypto.getRandomValues(randomValues)
  return btoa(String.fromCodePoint(...randomValues))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll(/[=]/gu, '')
}

export const generateCodeChallenge = Effect.fn(function* generateCodeChallenge(
  codeVerifier: string
) {
  const textEncoder = new TextEncoder()

  const digest = yield* Effect.promise(() =>
    crypto.subtle.digest('SHA-256', textEncoder.encode(codeVerifier))
  )

  return btoa(String.fromCodePoint(...new Uint8Array(digest)))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll(/[=]/gu, '')
})
