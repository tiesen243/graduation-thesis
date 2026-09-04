import type { UniwindConfig } from 'uniwind'

import * as SecureStore from 'expo-secure-store'

const REFRESH_TOKEN_KEY = 'auth.refreshToken'
const ACCESS_TOKEN_KEY = 'auth.accessToken'

const THEME_KEY = 'config.theme'

const options = (group: string) => ({
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  accessGroup: group,
})

export const getTokens = async (): Promise<{
  accessToken: string | null
  refreshToken: string | null
}> => {
  try {
    const [accessToken, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY, options('auth')),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY, options('auth')),
    ])

    return { accessToken, refreshToken }
  } catch {
    return { accessToken: null, refreshToken: null }
  }
}

export const setTokens = async (accessToken: string, refreshToken: string) => {
  try {
    if (accessToken)
      await SecureStore.setItemAsync(
        ACCESS_TOKEN_KEY,
        accessToken,
        options('auth')
      )
    if (refreshToken)
      await SecureStore.setItemAsync(
        REFRESH_TOKEN_KEY,
        refreshToken,
        options('auth')
      )
  } catch {
    // noop
  }
}

export const clearTokens = async () => {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY, options('auth')),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY, options('auth')),
    ])
  } catch {
    // noop
  }
}

export const getTheme = async (): Promise<'light' | 'dark' | 'system'> => {
  try {
    const theme = await SecureStore.getItemAsync(THEME_KEY, options('config'))
    return (theme as UniwindConfig['themes'][number]) ?? 'system'
  } catch {
    return 'light'
  }
}

export const setTheme = async (
  theme: 'light' | 'dark' | 'system'
): Promise<void> => {
  try {
    await SecureStore.setItemAsync(THEME_KEY, theme, options('config'))
  } catch {
    // noop
  }
}
