import { describe, it, expect } from 'bun:test'

import {
  encodeHex,
  decodeHex,
  encodeBase64Url,
  decodeBase64Url,
} from '@/modules/auth/lib/crypto'

describe('Hex Codec', () => {
  describe('encodeHex', () => {
    it('should encode an empty Uint8Array into an empty string', () => {
      expect(encodeHex(new Uint8Array())).toBe('')
    })

    it('should correctly encode Uint8Array to a lowercase hex string', () => {
      const data = new Uint8Array([0, 15, 16, 255])
      expect(encodeHex(data)).toBe('000f10ff')
    })

    it('should work correctly with longer data strings', () => {
      const data = new Uint8Array([72, 101, 108, 108, 111]) // "Hello"
      expect(encodeHex(data)).toBe('48656c6c6f')
    })
  })

  describe('decodeHex', () => {
    it('should decode an empty string into an empty Uint8Array', () => {
      expect(decodeHex('')).toEqual(new Uint8Array())
    })

    it('should successfully decode both lowercase and uppercase hex characters', () => {
      const expected = new Uint8Array([0, 15, 16, 255])
      expect(decodeHex('000f10ff')).toEqual(expected)
      expect(decodeHex('000F10FF')).toEqual(expected)
    })

    it('should throw an error if the hex string has an odd length', () => {
      expect(() => decodeHex('a')).toThrow('Invalid hex string')
      expect(() => decodeHex('abc')).toThrow('Invalid hex string')
    })

    it('should throw an error when containing invalid characters', () => {
      expect(() => decodeHex('0g')).toThrow('Invalid hex string')
      expect(() => decodeHex('123z')).toThrow('Invalid hex string')
      expect(() => decodeHex('48656c6c6f-')).toThrow('Invalid hex string')
    })
  })

  describe('Hex Roundtrip Integration', () => {
    it('should correctly decode what was encoded', () => {
      const original = new Uint8Array([10, 20, 30, 40, 50, 254, 255])
      const encoded = encodeHex(original)
      const decoded = decodeHex(encoded)
      expect(decoded).toEqual(original)
    })
  })
})

describe('Base64Url Codec', () => {
  describe('encodeBase64Url', () => {
    it('should encode an empty array into an empty string', () => {
      expect(encodeBase64Url(new Uint8Array())).toBe('')
    })

    it('should correctly encode data that requires no padding', () => {
      // 3 bytes -> 4 chars (No padding needed)
      const data = new Uint8Array([72, 101, 108]) // "Hel"
      expect(encodeBase64Url(data)).toBe('SGVs')
    })

    it('should correctly encode and add "=" padding when bytes are missing', () => {
      // 1 byte -> 2 chars + 2 padding '='
      expect(encodeBase64Url(new Uint8Array([72]))).toBe('SA==')

      // 2 bytes -> 3 chars + 1 padding '='
      expect(encodeBase64Url(new Uint8Array([72, 101]))).toBe('SGU=')
    })

    it('should correctly encode URL-safe characters (- and _)', () => {
      const data = new Uint8Array([251, 255])
      expect(encodeBase64Url(data)).toBe('-_8=')
    })
  })

  describe('decodeBase64Url', () => {
    it('should decode an empty string into an empty Uint8Array with length 0', () => {
      const decoded = decodeBase64Url('')
      expect(decoded).toEqual(new Uint8Array())
      expect(decoded.length).toBe(0) // Verifies slicing worked
    })

    it('should correctly decode strings without padding', () => {
      const expected = new Uint8Array([72, 101, 108])
      const decoded = decodeBase64Url('SGVs')
      expect(decoded).toEqual(expected)
      expect(decoded.length).toBe(3)
    })

    it('should correctly decode strings with "=" padding and return exact length', () => {
      const decoded1 = decodeBase64Url('SA==')
      expect(decoded1).toEqual(new Uint8Array([72]))
      expect(decoded1.length).toBe(1)

      const decoded2 = decodeBase64Url('SGU=')
      expect(decoded2).toEqual(new Uint8Array([72, 101]))
      expect(decoded2.length).toBe(2)
    })

    it('should throw an error when containing invalid characters', () => {
      expect(() => decodeBase64Url('SG+s')).toThrow('Invalid character')
      expect(() => decodeBase64Url('SG/s')).toThrow('Invalid character')
      expect(() => decodeBase64Url('SGV*')).toThrow('Invalid character')
    })

    it('should throw an error on malformed padding', () => {
      expect(() => decodeBase64Url('S=Vs')).toThrow('Invalid padding')
      expect(() => decodeBase64Url('SB==')).toThrow('Invalid padding')
    })
  })

  describe('Base64Url Roundtrip Integration', () => {
    it('should correctly decode what was encoded across all byte lengths without manual slicing', () => {
      for (let len = 0; len < 10; len += 1) {
        const original = new Uint8Array(len)
        for (let i = 0; i < len; i += 1) original[i] = (i * 15) % 256

        const encoded = encodeBase64Url(original)
        const decoded = decodeBase64Url(encoded)

        expect(decoded).toEqual(original)
        expect(decoded.length).toBe(original.length)
      }
    })
  })
})
