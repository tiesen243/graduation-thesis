import { beforeEach, describe, expect, it } from 'bun:test'
import * as Effect from 'effect/Effect'

import { Password } from '@/modules/auth/lib/password'

describe('Password', () => {
  let password: Password

  beforeEach(() => {
    password = new Password()
  })

  describe('hash', () => {
    it('should successfully hash a password and return format "salt:key"', () =>
      Effect.gen(function* hashTestGen() {
        const rawPassword = 'mySecurePassword123'
        const hashResult = yield* password.hash(rawPassword)

        expect(hashResult).toBeDefined()
        expect(hashResult).toContain(':')

        const [salt, key] = hashResult.split(':')

        // Salt 16 bytes -> 32 hex chars
        expect(salt).toHaveLength(32)

        // dkLen 64 bytes -> 128 hex chars
        expect(key).toHaveLength(128)
      }).pipe(Effect.runPromise))

    it('should generate unique hashes for the same password due to random salt', () =>
      Effect.gen(function* hashTestGen() {
        const rawPassword = 'samePassword'
        const hash1 = yield* password.hash(rawPassword)
        const hash2 = yield* password.hash(rawPassword)

        expect(hash1).not.toBe(hash2)
      }).pipe(Effect.runPromise))
  })

  describe('verify', () => {
    it('should return true for a correct password', () =>
      Effect.gen(function* verifyTestGen() {
        const rawPassword = 'correct_password'
        const hash = yield* password.hash(rawPassword)

        const isValid = yield* password.verify(hash, rawPassword)
        expect(isValid).toBe(true)
      }).pipe(Effect.runPromise))

    it('should return false for an incorrect password', () =>
      Effect.gen(function* verifyTestGen() {
        const rawPassword = 'correct_password'
        const hash = yield* password.hash(rawPassword)

        const isValid = yield* password.verify(hash, 'wrong_password')
        expect(isValid).toBe(false)
      }).pipe(Effect.runPromise))

    it('should handle unicode normalization (NFKC) correctly', () =>
      Effect.gen(function* verifyTestGen() {
        const passwordNFC = '\u00E9' // é
        const passwordNFD = '\u0065\u0301' // e + ́

        const hash = yield* password.hash(passwordNFC)
        const isValid = yield* password.verify(hash, passwordNFD)

        expect(isValid).toBe(true)
      }).pipe(Effect.runPromise))

    it('should return false if the hash format is invalid', () =>
      Effect.gen(function* verifyTestGen() {
        const isValid1 = yield* password.verify('invalidHash', 'password')
        const isValid2 = yield* password.verify('saltOnly:', 'password')

        expect(isValid1).toBe(false)
        expect(isValid2).toBe(false)
      }).pipe(Effect.runPromise))
  })

  describe('Configuration & Props', () => {
    it('should fail verification if a different secret (pepper) is used', () =>
      Effect.gen(function* configTestGen() {
        const rawPassword = 'password123'

        const serviceA = new Password({ secret: 'secret-key-A' })
        const serviceB = new Password({ secret: 'secret-key-B' })

        const hashFromA = yield* serviceA.hash(rawPassword)
        const isValid = yield* serviceB.verify(hashFromA, rawPassword)

        expect(isValid).toBe(false)
      }).pipe(Effect.runPromise))

    it('should generate keys matching custom dkLen', () =>
      Effect.gen(function* configTestGen() {
        const customService = new Password({ dkLen: 32 })

        const hash = yield* customService.hash('password')
        const [, key] = hash.split(':')

        expect(key).toHaveLength(64)
      }).pipe(Effect.runPromise))
  })
})
