const createRandom = () => {
  if (
    typeof globalThis !== 'undefined' &&
    typeof globalThis.crypto.getRandomValues === 'function'
  ) {
    return () => {
      const buffer = new Uint32Array(1)
      globalThis.crypto.getRandomValues(buffer)
      return (buffer.at(0) ?? 0) / 0x1_00_00_00_00
    }
  }

  return Math.random
}

const random = createRandom()

const createEntropy = (length = 4, rand = random) => {
  let entropy = ''

  while (entropy.length < length)
    entropy += Math.floor(rand() * 36).toString(36)

  return entropy
}

const fnv1a128 = (str: string): bigint => {
  let h1 = 0x81_1c_9d_c5n
  let h2 = 0x81_1c_9d_c5n
  let h3 = 0x81_1c_9d_c5n
  let h4 = 0x81_1c_9d_c5n

  for (let i = 0; i < str.length; i += 1) {
    const code = BigInt(str.codePointAt(i) ?? 0)
    h1 = (h1 ^ code) * 0x01_00_01_93n
    h2 = (h2 ^ h1) * 0x01_00_01_93n
    h3 = (h3 ^ h2) * 0x01_00_01_93n
    h4 = (h4 ^ h3) * 0x01_00_01_93n
  }

  return (h1 << 96n) | (h2 << 64n) | (h3 << 32n) | h4
}

const hash = (input: string) => {
  const hashBuf = fnv1a128(input)
  return hashBuf.toString(36).slice(1)
}

const createFingerprint = ({
  globalObj = globalThis,
  random: rand = random,
}) => {
  const globals = Object.keys(globalObj).toString()
  const sourceString =
    globals.length > 0
      ? globals + createEntropy(32, rand)
      : createEntropy(32, rand)

  return hash(sourceString).slice(0, 32)
}

// oxlint-disable-next-line no-param-reassign, no-plusplus
const createCounter = (count: number) => () => count++

export function createId(rand = random): string {
  const time = Date.now().toString(36)
  const count = createCounter(Math.floor(rand() * 476_782_367))().toString(36)
  const fingerprint = createFingerprint({ random: rand })

  const salt = createEntropy(24, rand)
  const hashInput = `${time}${salt}${count}${fingerprint}`

  const letter = String.fromCodePoint(97 + Math.floor(rand() * 26))
  return `${letter}${hash(hashInput).slice(1, 24)}`
}
