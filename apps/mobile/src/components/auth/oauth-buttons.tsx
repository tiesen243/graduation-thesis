import {
  FieldSeparator,
  FieldLabel,
  Field,
} from '@rozumari/ui/components/field'
import { useTranslation } from 'react-i18next'

import { OAuthButton } from '@/components/auth/oauth-button'

export const OAuthButtons = () => {
  const { t } = useTranslation('auth')

  return (
    <>
      <FieldSeparator>
        <FieldLabel className='text-muted-foreground'>
          {t('oauth.separator')}
        </FieldLabel>
      </FieldSeparator>

      <Field orientation='horizontal'>
        {['facebook', 'google'].map((provider) => (
          <OAuthButton key={provider} provider={provider} />
        ))}
      </Field>
    </>
  )
}
