import { Button } from '@rozumari/ui/components/button'
import { toast } from '@rozumari/ui/components/toast'
import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { useTranslation } from 'react-i18next'

import { useSession } from '@/hooks/use-session'
import { setTokens } from '@/lib/secure-store'
import { getBaseUrl } from '@/lib/utils'

WebBrowser.maybeCompleteAuthSession()

export function OAuthButton({
  provider,
  children,
  ...props
}: React.ComponentProps<typeof Button> & {
  provider: { id: string; name: string }
}) {
  const { t } = useTranslation('auth')
  const { refetch } = useSession()
  const router = useRouter()

  const handleLogin = async () => {
    try {
      const redirectUri = Linking.createURL('login/oauth/callback')
      const authUrl = `${getBaseUrl()}/api/auth/${provider.id}?redirect_uri=${encodeURIComponent(redirectUri)}`

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri)

      if (result.type === 'success' && result.url) {
        const { queryParams } = Linking.parse(result.url)

        const accessToken = queryParams?.access_token as string
        const refreshToken = queryParams?.refresh_token as string

        if (accessToken && refreshToken)
          await setTokens(accessToken, refreshToken)
        await refetch()

        router.navigate('/(tabs)/home')
        toast.success('Login successful!')
      }
    } catch {
      toast.error('Login failed. Please try again.')
    }
  }

  return (
    <Button onPress={handleLogin} variant='outline' {...props}>
      {children ?? t('oauth.continue_with', { provider: provider.name })}
    </Button>
  )
}
