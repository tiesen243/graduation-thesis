import { Button } from '@rozumari/ui/components/button'
import { Typography } from '@rozumari/ui/components/typography'
import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'

import { setTokens } from '@/lib/secure-store'
import { getBaseUrl } from '@/lib/utils'

WebBrowser.maybeCompleteAuthSession()

export function OAuthButton({ provider }: { provider: 'google' | 'facebook' }) {
  const router = useRouter()

  const handleLogin = async () => {
    try {
      const redirectUri = Linking.createURL('login/oauth/callback')
      const authUrl = `${getBaseUrl()}/api/auth/${provider}?redirect_uri=${encodeURIComponent(redirectUri)}`

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri)

      if (result.type === 'success' && result.url) {
        const { queryParams } = Linking.parse(result.url)

        const accessToken = queryParams?.access_token as string
        const refreshToken = queryParams?.refresh_token as string

        if (accessToken && refreshToken)
          await setTokens(accessToken, refreshToken)

        router.navigate('/(tabs)')
      }
    } catch (error) {
      console.error('OAuth error:', error)
    }
  }

  return (
    <Button onPress={handleLogin} className='flex-1'>
      <Typography>Continue with {provider}</Typography>
    </Button>
  )
}
