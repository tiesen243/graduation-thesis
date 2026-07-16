// oxlint-disable no-underscore-dangle

import type { Mock } from 'bun:test'

import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'
import * as Effect from 'effect/Effect'

import type { Http } from '@/shared/http'

import { JWT } from '@/modules/auth/lib/jwt'

// Define a test payload type
interface UserPayload {
  userId: string
  role: string
}

describe('JWT', () => {
  let jwtService: JWT<UserPayload>
  let dateSpy: Mock<() => number>

  beforeEach(() => {
    jwtService = new JWT<UserPayload>('secret', 'HS256')
  })

  afterEach(() => {
    if (dateSpy) dateSpy.mockRestore()
  })

  describe('sign & verify (Happy Path)', () => {
    it('should successfully sign and verify a payload', () =>
      Effect.gen(function* testGen() {
        const payload: UserPayload = { userId: 'user-123', role: 'admin' }

        // Sign the token
        const token = yield* jwtService.sign(payload)
        expect(token).toBeDefined()
        expect(token.split('.')).toHaveLength(3)

        // Verify the token
        const decoded = yield* jwtService.verify(token)
        expect(decoded.userId).toBe('user-123')
        expect(decoded.role).toBe('admin')
        expect(decoded.alg).toBe('HS256')
        expect(decoded.typ).toBe('JWT')
        expect(decoded.exp).toBeDefined()
      }).pipe(Effect.runPromise))

    it('should support other HMAC algorithms (HS384, HS512)', () =>
      Effect.gen(function* testGen() {
        const jwt384 = new JWT<UserPayload>('secret', 'HS384')
        const jwt512 = new JWT<UserPayload>('secret', 'HS512')
        const payload = { userId: 'user-456', role: 'user' }

        const token384 = yield* jwt384.sign(payload)
        const token512 = yield* jwt512.sign(payload)

        const decoded384 = yield* jwt384.verify(token384)
        const decoded512 = yield* jwt512.verify(token512)

        expect(decoded384.alg).toBe('HS384')
        expect(decoded512.alg).toBe('HS512')
      }).pipe(Effect.runPromise))
  })

  describe('Options and Metadata Claims', () => {
    it('should inject correct headers, issuer, audience, and subject options', () =>
      Effect.gen(function* testGen() {
        const payload = { userId: 'user-123', role: 'admin' }
        const options: JWT.Options = {
          issuer: 'auth-service',
          subject: 'auth-token',
          audiences: ['client-app'],
          jwtId: 'unique-jwt-id-999',
          includeIssuedTimestamp: true,
          headers: { kid: 'key-1' },
        }

        const token = yield* jwtService.sign(payload, options)
        const decoded = yield* jwtService.verify(token)

        expect(decoded.iss).toBe('auth-service')
        expect(decoded.sub).toBe('auth-token')
        expect(decoded.aud).toEqual(['client-app'])
        expect(decoded.jti).toBe('unique-jwt-id-999')
        expect(decoded.iat).toBeDefined()
        expect(decoded.kid).toBe('key-1')
      }).pipe(Effect.runPromise))
  })

  describe('Verification Failures', () => {
    it('should fail with unauthorized error if the token format is invalid', () =>
      Effect.gen(function* testGen() {
        const invalidToken = 'onepart.twopart' // Missing signature

        const result = yield* Effect.either(jwtService.verify(invalidToken))

        expect(result._tag).toBe('Left')
        if (result._tag === 'Left') {
          const error = result.left as Http
          expect(error.status).toBe(401)
          expect(error.message).toContain('Invalid token format')
        }
      }).pipe(Effect.runPromise))

    it('should fail if the signature has been tampered with', () =>
      Effect.gen(function* testGen() {
        const payload = { userId: 'user-123', role: 'admin' }
        const token = yield* jwtService.sign(payload)

        // Mutate the signature portion slightly
        const parts = token.split('.')
        parts[2] = 'TamperedSignatureData'
        const tamperedToken = parts.join('.')

        const result = yield* Effect.either(jwtService.verify(tamperedToken))

        expect(result._tag).toBe('Left')
        if (result._tag === 'Left') {
          const error = result.left as Http
          expect(error.status).toBe(401)
          expect(error.message).toContain('Invalid token signature')
        }
      }).pipe(Effect.runPromise))

    it('should fail if a different secret is used to verify the token', () =>
      Effect.gen(function* testGen() {
        const payload = { userId: 'user-123', role: 'admin' }
        const token = yield* jwtService.sign(payload)

        const evilJwtService = new JWT<UserPayload>(
          'wrong-secret-key-attacker',
          'HS256'
        )
        const result = yield* Effect.either(evilJwtService.verify(token))

        expect(result._tag).toBe('Left')
        if (result._tag === 'Left') {
          const error = result.left as Http
          expect(error.status).toBe(401)
          expect(error.message).toContain('Invalid token signature')
        }
      }).pipe(Effect.runPromise))

    it('should fail verification if the token has expired', () =>
      Effect.gen(function* testGen() {
        // Freeze time at: Jan 1, 2026, 12:00:00 (1767225600 seconds)
        const mockCurrentTime = 1_767_225_600
        dateSpy = spyOn(Date, 'now').mockReturnValue(mockCurrentTime * 1000)

        const payload = { userId: 'user-123', role: 'admin' }

        // Token will expire in 60 seconds
        const token = yield* jwtService.sign(payload, { expiresIn: 60 })

        // Fast forward mock time beyond the 60-second window (e.g., +61 seconds)
        dateSpy.mockReturnValue((mockCurrentTime + 61) * 1000)

        const result = yield* Effect.either(jwtService.verify(token))

        expect(result._tag).toBe('Left')
        if (result._tag === 'Left') {
          const error = result.left as Http
          expect(error.status).toBe(401)
          expect(error.message).toContain('Token has expired')
        }
      }).pipe(Effect.runPromise))

    it('should fail verification if evaluated before the notBefore (nbf) date', () =>
      Effect.gen(function* testGen() {
        // Freeze time at: Jan 1, 2026, 12:00:00 (1767225600 seconds)
        const mockCurrentTime = 1_767_225_600
        dateSpy = spyOn(Date, 'now').mockReturnValue(mockCurrentTime * 1000)

        const payload = { userId: 'user-123', role: 'admin' }

        // Token becomes active 10 seconds in the future
        const futureDate = new Date((mockCurrentTime + 10) * 1000)
        const token = yield* jwtService.sign(payload, {
          notBefore: futureDate,
        })

        // Attempting to verify immediately (which is 10s too early)
        const result = yield* Effect.either(jwtService.verify(token))

        expect(result._tag).toBe('Left')
        if (result._tag === 'Left') {
          const error = result.left as Http
          expect(error.status).toBe(401)
          expect(error.message).toContain('Token not valid yet')
        }
      }).pipe(Effect.runPromise))
  })
})
