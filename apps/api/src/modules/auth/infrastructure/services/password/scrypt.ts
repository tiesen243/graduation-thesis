import * as Crypto from 'effect/Crypto'
import * as Effect from 'effect/Effect'
import * as Hex from 'effect/encoding/Hex'
import * as Layer from 'effect/Layer'
import { scrypt } from 'node:crypto'

import { PasswordService } from '@/modules/auth/application/ports/password.service'
import { constantTimeEqual } from '@/modules/auth/domain/utils/crypto'
import { env } from '@/shared/env'

export const ScryptPasswordService = ({
  secret = env.AUTH_SECRET,
  dkLen = 64,
  ...config
}: PasswordService.ScryptConfig = {}) =>
  Layer.effect(
    PasswordService,
    Effect.gen(function* make() {
      const crypto = yield* Crypto.Crypto

      const textEncoder = new TextEncoder()

      const options = {
        N: 16_384,
        r: 8,
        p: 1,
        maxmem: 32 * 1024 * 1024,
        ...config,
      } satisfies PasswordService.ScryptConfig

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

      return {
        hash: Effect.fn(function* hash(password: string) {
          const salt = Hex.encode(
            yield* crypto.randomBytes(16).pipe(Effect.orDie)
          )
          const key = yield* generateKey(password.normalize('NFKC'), salt)
          return `${salt}:${Hex.encode(key)}`
        }),
        verify: Effect.fn(function* verify(
          password: string,
          hashedPassword: string
        ) {
          const parts = hashedPassword.split(':')
          if (parts.length !== 2) return false

          const [salt = '', key = ''] = parts
          const targetKey = yield* generateKey(password.normalize('NFKC'), salt)

          const decodedKey = Hex.decode(key)
          if (decodedKey._tag === 'Failure') return false
          return constantTimeEqual(targetKey, decodedKey.success)
        }),
      }
    })
  )
