import * as Effect from 'effect/Effect'
import { scrypt } from 'node:crypto'

import {
  constantTimeEqual,
  decodeHex,
  encodeHex,
} from '@/modules/auth/lib/crypto'

export class Password {
  private readonly config: Omit<Password.Props, 'secret' | 'dkLen'>
  private readonly secret: string
  private readonly dkLen: number

  public constructor({ secret, dkLen, ...config }: Password.Props = {}) {
    this.secret = secret ?? ''
    this.dkLen = dkLen ?? 64

    this.config = {
      N: 16_384,
      r: 8,
      p: 1,
      maxmem: 32 * 1024 * 1024,
      ...config,
    }
  }

  public hash = (password: string): Effect.Effect<string, Error> =>
    Effect.gen(this, function* hashGen() {
      const salt = encodeHex(crypto.getRandomValues(new Uint8Array(16)))
      const key = yield* this.generateKey(password.normalize('NFKC'), salt)
      return `${salt}:${encodeHex(key)}`
    })

  public verify = (
    hash: string,
    password: string
  ): Effect.Effect<boolean, Error> =>
    Effect.gen(this, function* verifyGen() {
      try {
        const parts = hash.split(':')
        if (parts.length !== 2) return false

        const [salt = '', key = ''] = parts
        if (!salt || !key) return false

        const targetKey = yield* this.generateKey(
          password.normalize('NFKC'),
          salt
        )
        return constantTimeEqual(targetKey, decodeHex(key))
      } catch {
        return false
      }
    })

  private generateKey = (
    data: string,
    salt: string
  ): Effect.Effect<Uint8Array, Error> =>
    Effect.gen(this, function* generateKeyGen() {
      const textEncoder = new TextEncoder()

      const password = textEncoder.encode(data + this.secret)
      const nonce = textEncoder.encode(salt)

      const key = yield* this.scrypt(password, nonce)

      return new Uint8Array(key)
    })

  private scrypt = (
    password: Uint8Array,
    salt: Uint8Array
  ): Effect.Effect<Buffer, Error> =>
    Effect.async((resume) =>
      scrypt(password, salt, this.dkLen, this.config, (e, derivedKey) => {
        if (e) resume(Effect.fail(e))
        else resume(Effect.succeed(derivedKey))
      })
    )
}

export namespace Password {
  export interface Props {
    secret?: string
    dkLen?: number
    N?: number
    r?: number
    p?: number
    maxmem?: number
  }
}
