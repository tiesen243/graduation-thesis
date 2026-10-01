import { Button } from '@rozumari/ui/components/button'
import {
  Field,
  FieldLabel,
  FieldSeparator,
} from '@rozumari/ui/components/field'
import { toast } from '@rozumari/ui/components/toast'
import { Typography } from '@rozumari/ui/components/typography'
import { useQueryClient } from '@tanstack/react-query'
import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { useTranslation } from 'react-i18next'
import { useCSSVariable } from 'uniwind'

import { useRuntime } from '@/hooks/use-runtime'
import { SUPPORTED_PROVIDERS } from '@/lib/constants'
import { setTokens } from '@/lib/secure-store'
import { getBaseUrl } from '@/lib/utils'

WebBrowser.maybeCompleteAuthSession()

export function OAuthButton({
  provider,
  children,
  ...props
}: React.ComponentProps<typeof Button> & {
  children?: React.ReactNode
  provider: (typeof SUPPORTED_PROVIDERS)[number]
}) {
  const foregroundColor = useCSSVariable('--color-foreground') as string
  const { t } = useTranslation('auth')
  const queryClient = useQueryClient()
  const { api } = useRuntime()
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

        if (!accessToken || !refreshToken)
          throw new Error('Missing access token or refresh token')

        await setTokens(accessToken, refreshToken)

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: api.auth.whoami.getQueryKey(),
          }),
          queryClient.invalidateQueries({
            queryKey: api.auth.accounts.getQueryKey(),
          }),
        ])

        router.navigate('/(tabs)/home')
        toast.success(t('login.messages.success'))
      }
    } catch {
      toast.error(t('login.messages.failed'))
    }
  }

  return (
    <Button onPress={handleLogin} variant='outline' {...props}>
      {children ?? (
        <>
          <provider.Icon width={16} height={16} fill={foregroundColor} />
          <Typography>
            {t('oauth.continue_with', { provider: provider.name })}
          </Typography>
        </>
      )}
    </Button>
  )
}

export const OAuthButtons = () => {
  const { t } = useTranslation('auth')

  return (
    <>
      <FieldSeparator>
        <FieldLabel className='text-muted-foreground'>
          {t('oauth.separator')}
        </FieldLabel>
      </FieldSeparator>

      <Field orientation='responsive'>
        {SUPPORTED_PROVIDERS.map((provider) => (
          <OAuthButton key={provider.id} provider={provider} />
        ))}
      </Field>
    </>
  )
}
