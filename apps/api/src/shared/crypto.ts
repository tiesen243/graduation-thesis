import * as Crypto from 'effect/Crypto'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as PlatformError from 'effect/PlatformError'
import * as NodeCrypto from 'node:crypto'

const toHashAlgorithm = (algorithm: Crypto.DigestAlgorithm): string => {
  switch (algorithm) {
    case 'SHA-1':
      return 'sha1'
    case 'SHA-256':
      return 'sha256'
    case 'SHA-384':
      return 'sha384'
    case 'SHA-512':
      return 'sha512'
    default:
      throw new Error(`Unsupported digest algorithm: ${algorithm}`)
  }
}

export const make = Crypto.make({
  digest: (algorithm, data) =>
    Effect.try({
      try: () =>
        Uint8Array.from(
          NodeCrypto.createHash(toHashAlgorithm(algorithm))
            .update(data)
            .digest()
        ),
      catch: (cause) =>
        PlatformError.systemError({
          module: 'Crypto',
          method: 'digest',
          _tag: 'Unknown',
          description: 'Could not compute digest',
          cause,
        }),
    }),
  randomBytes: NodeCrypto.randomBytes,
})

export const layer = Layer.succeed(Crypto.Crypto, make)
