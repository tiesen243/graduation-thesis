import * as Effect from 'effect/Effect'
import { scrypt } from 'node:crypto'
import { promisify } from 'node:util'

import {
  constantTimeEqual,
  decodeHex,
  encodeHex,
} from '@/modules/auth/lib/crypto'

export class Password {
  public constructor(private readonly dkLen = 64) {}

  public hash = (password: string): Effect.Effect<string> =>
    Effect.gen(this, function* hashGen() {
      const salt = encodeHex(crypto.getRandomValues(new Uint8Array(16)))
      const key = yield* this.generateKey(password.normalize('NFKC'), salt)
      return `${salt}:${encodeHex(key)}`
    })

  public verify = (hash: string, password: string): Effect.Effect<boolean> =>
    Effect.gen(this, function* verifyGen() {
      const parts = hash.split(':')
      if (parts.length !== 2) return false

      const [salt, key] = parts
      const targetKey = yield* this.generateKey(
        password.normalize('NFKC'),
        salt
      )
      return constantTimeEqual(targetKey, decodeHex(key ?? ''))
    })

  private generateKey = (
    data: string,
    salt?: string
  ): Effect.Effect<Uint8Array> =>
    Effect.gen(this, function* generateKeyGen() {
      const textEncoder = new TextEncoder()
      const key = yield* Effect.promise(
        () =>
          promisify(scrypt)(
            textEncoder.encode(data),
            textEncoder.encode(salt),
            this.dkLen
          ) as Promise<Buffer>
      )

      return new Uint8Array(key)
    })
}
