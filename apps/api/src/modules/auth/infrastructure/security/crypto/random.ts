// oxlint-disable eslint/no-bitwise

export function generateSecureString(): string {
  const alphabet = 'abcdefghijklmnpqrstuvwxyz23456789'

  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)

  let id = ''
  for (const b of bytes) id += alphabet[b >> 3] ?? ''

  return id
}

export function generateStateOrCode(): string {
  const randomValues = new Uint8Array(32)
  crypto.getRandomValues(randomValues)
  return btoa(String.fromCodePoint(...randomValues))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll(/[=]/gu, '')
}

export async function generateCodeChallenge(
  codeVerifier: string
): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const base64String = btoa(String.fromCodePoint(...new Uint8Array(digest)))
  return base64String
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll(/[=]/gu, '')
}
