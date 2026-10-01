import {
  FieldSeparator,
  FieldLabel,
  Field,
} from '@rozumari/ui/components/field'
import { useTranslation } from 'react-i18next'

import { OAuthButton } from '@/components/auth/oauth-button'
import { SUPPORTED_PROVIDERS } from '@/lib/constants'

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
