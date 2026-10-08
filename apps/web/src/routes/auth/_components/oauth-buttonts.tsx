import { Button } from '@rozumari/ui/components/button'
import { Field, FieldSeparator } from '@rozumari/ui/components/field'
import { Link } from 'react-router'

import { SUPPORTED_PROVIDERS } from '@/lib/constants'
import { env } from '@/lib/env'
import { getBaseUrl } from '@/lib/utils'

export const OAuthButtons: React.FC = () => (
  <>
    <FieldSeparator className='md:[&>[data-slot=field-separator-content]]:bg-card'>
      or
    </FieldSeparator>

    <Field className='grid grid-cols-1 md:grid-cols-2'>
      {SUPPORTED_PROVIDERS.map((provider) => (
        <Button
          key={provider.name}
          variant='outline'
          nativeButton={false}
          render={
            <Link
              to={`${env.VITE_API_URL}/api/auth/${provider.id}?redirect_uri=${getBaseUrl()}/login`}
            />
          }
        >
          <provider.Icon data-icon='inline-start' />
          Continue with {provider.name}
        </Button>
      ))}
    </Field>
  </>
)
