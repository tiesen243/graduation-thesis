export function encodeHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  )
}

export function decodeHex(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) throw new Error('Invalid hex string')

  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2)
    bytes[i / 2] = Number.parseInt(hex.slice(i, i + 2), 16)

  return bytes
}

export function encodeBase64Url(bytes: Uint8Array): string {
  const binary = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join(
    ''
  )
  return btoa(binary)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll(/=+$/gu, '')
}

export function decodeBase64Url(base64url: string): Uint8Array {
  const base64 = base64url.replaceAll('-', '+').replaceAll('_', '/')
  const paddedBase64 = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const binary = atob(paddedBase64)

  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1)
    bytes[i] = binary.codePointAt(i) ?? 0
  return bytes
}
