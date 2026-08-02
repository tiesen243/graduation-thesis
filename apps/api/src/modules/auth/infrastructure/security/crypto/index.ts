// oxlint-disable eslint/no-bitwise

import * as Effect from 'effect/Effect'

export function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) return false

  let c = 0
  for (let i = 0; i < a.byteLength; i += 1) c |= (a[i] ?? 0) ^ (b[i] ?? 0)
  return c === 0
}

export const hashSecret = Effect.fn(function* hashSecret(secret: string) {
  const secretBytes = new TextEncoder().encode(secret)
  const secretHashBuffer = yield* Effect.promise(() =>
    crypto.subtle.digest('SHA-256', secretBytes)
  )
  return new Uint8Array(secretHashBuffer)
})
