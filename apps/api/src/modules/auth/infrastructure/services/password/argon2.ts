import * as Crypto from 'effect/Crypto'
import * as Effect from 'effect/Effect'
import * as Hex from 'effect/encoding/Hex'
import * as Layer from 'effect/Layer'
import { argon2 } from 'node:crypto'

import { PasswordService } from '@/modules/auth/application/ports/password.service'
import { constantTimeEqual } from '@/modules/auth/domain/utils/crypto'
import { env } from '@/shared/env'

export const Argon2PasswordService = ({
  secret = env.AUTH_SECRET,
  algorithm = 'argon2id',
  ...config
}: PasswordService.Argon2Config = {}) =>
  Layer.effect(
    PasswordService,
    Effect.gen(function* make() {
      const crypto = yield* Crypto.Crypto

      const textEncoder = new TextEncoder()

      const options = {
        parallelism: 4,
        tagLength: 64,
        memory: 64 * 1024,
        passes: 3,
        ...config,
      } satisfies PasswordService.Argon2Config

      const argon2Fn = (
        password: Uint8Array,
        nonce: Uint8Array
      ): Effect.Effect<Buffer> =>
        Effect.callback((resume) =>
          argon2(
            algorithm,
            {
              message: password,
              nonce,
              secret: textEncoder.encode(secret),
              ...options,
            },
            (e, derivedKey) => {
              if (e) resume(Effect.die(e))
              else resume(Effect.succeed(derivedKey))
            }
          )
        )

      const generateKey = Effect.fn(function* generateKey(
        data: string,
        salt: string
      ) {
        const password = textEncoder.encode(data)
        const nonce = textEncoder.encode(salt)

        const key = yield* argon2Fn(password, nonce)
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
