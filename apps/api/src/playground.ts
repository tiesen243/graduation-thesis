import * as BunCrypto from '@effect/platform-bun/BunCrypto'
import * as BunRuntime from '@effect/platform-bun/BunRuntime'
import * as Effect from 'effect/Effect'

import { hashSecret } from '@/modules/auth/infrastructure/security/crypto'

const program = Effect.gen(function* program() {
  const secret = 'my-secret'

  const hashedSecret = yield* hashSecret(secret)
  yield* Effect.log(`Hashed secret: ${hashedSecret}`)
}).pipe(Effect.provide(BunCrypto.layer))

BunRuntime.runMain(program)
