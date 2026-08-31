import * as Effect from 'effect/Effect'
import * as Encoding from 'effect/Encoding'
import * as Layer from 'effect/Layer'
import { scrypt } from 'node:crypto'

import { PasswordService } from '@/modules/auth/application/ports/password.service'
import { constantTimeEqual } from '@/modules/auth/domain/utils/crypto'

export const PasswordServiceLayer = ({
  secret = '',
  dkLen = 64,
  ...config
}: PasswordService.Config) =>
  Layer.effect(
    PasswordService,
    Effect.sync(() => {
      const options = {
        N: 16_384,
        r: 8,
        p: 1,
        maxmem: 32 * 1024 * 1024,
        ...config,
      } satisfies PasswordService.Config

      const textEncoder = new TextEncoder()

      const scryptFn = (
        password: Uint8Array,
        salt: Uint8Array
      ): Effect.Effect<Buffer> =>
        Effect.callback((resume) =>
          scrypt(password, salt, dkLen, options, (e, derivedKey) => {
            if (e) resume(Effect.die(e))
            else resume(Effect.succeed(derivedKey))
          })
        )

      const generateKey = Effect.fn(function* generateKey(
        data: string,
        salt: string
      ) {
        const password = textEncoder.encode(data + secret)
        const nonce = textEncoder.encode(salt)

        const key = yield* scryptFn(password, nonce)

        return new Uint8Array(key)
      })

      const hash = Effect.fn(function* hash(password: string) {
        const salt = Encoding.encodeHex(
          crypto.getRandomValues(new Uint8Array(16))
        )
        const key = yield* generateKey(password.normalize('NFKC'), salt)
        return `${salt}:${Encoding.encodeHex(key)}`
      })

      const verify = Effect.fn(function* verify(
        password: string,
        hashedPassword: string
      ) {
        const parts = hashedPassword.split(':')
        if (parts.length !== 2) return false

        const [salt = '', key = ''] = parts
        const targetKey = yield* generateKey(password.normalize('NFKC'), salt)

        const decodedKey = Encoding.decodeHex(key)
        if (decodedKey._tag === 'Failure') return false
        return constantTimeEqual(targetKey, decodedKey.success)
      })

      return {
        hash,
        verify,
      }
    })
  )
