import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Redacted from 'effect/Redacted'
import { scrypt } from 'node:crypto'

import {
  Password,
  PasswordError,
} from '@/modules/auth/application/security/password'
import { constantTimeEqual } from '@/modules/auth/infrastructure/security/crypto'
import {
  decodeHex,
  encodeHex,
} from '@/modules/auth/infrastructure/security/crypto/encoding'

export const PasswordLayer = ({
  secret = Redacted.make(''),
  dkLen = 64,
  ...config
}: Password.Config) =>
  Layer.effect(
    Password,
    Effect.sync(() => {
      const secretValue = Redacted.value(secret)

      const options = {
        N: 16_384,
        r: 8,
        p: 1,
        maxmem: 32 * 1024 * 1024,
        ...config,
      } satisfies Password.Config

      const textEncoder = new TextEncoder()

      const scryptFn = (
        password: Uint8Array,
        salt: Uint8Array
      ): Effect.Effect<Buffer, PasswordError> =>
        Effect.callback((resume) =>
          scrypt(password, salt, dkLen, options, (e, derivedKey) => {
            if (e)
              resume(Effect.fail(new PasswordError({ message: e.message })))
            else resume(Effect.succeed(derivedKey))
          })
        )

      const generateKey = Effect.fn(function* generateKey(
        data: string,
        salt: string
      ) {
        const password = textEncoder.encode(data + secretValue)
        const nonce = textEncoder.encode(salt)

        const key = yield* scryptFn(password, nonce)

        return new Uint8Array(key)
      })

      const hash = Effect.fn(function* hash(password: string) {
        const salt = encodeHex(crypto.getRandomValues(new Uint8Array(16)))
        const key = yield* generateKey(password.normalize('NFKC'), salt)
        return `${salt}:${encodeHex(key)}`
      })

      const verify = Effect.fn(function* verify(
        password: string,
        hashedPassword: string
      ) {
        const parts = hashedPassword.split(':')
        if (parts.length !== 2) return false

        const [salt = '', key = ''] = parts
        const targetKey = yield* generateKey(password.normalize('NFKC'), salt)

        return constantTimeEqual(targetKey, decodeHex(key))
      })

      return {
        hash,
        verify,
      }
    })
  )
