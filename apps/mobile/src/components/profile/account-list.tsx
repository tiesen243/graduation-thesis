import { Button } from '@rozumari/ui/components/button'
import { Card } from '@rozumari/ui/components/card'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@rozumari/ui/components/item'
import { Separator } from '@rozumari/ui/components/separator'
import { toast } from '@rozumari/ui/components/toast'
import { Typography } from '@rozumari/ui/components/typography'
import { cn } from '@rozumari/ui/lib/utils'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import { useCSSVariable } from 'uniwind'

import { OAuthButton } from '@/components/auth/oauth-button'
import { useRuntime } from '@/hooks/use-runtime'
import { SUPPORTED_PROVIDERS } from '@/lib/constants'

interface AccountItemProps {
  provider: (typeof SUPPORTED_PROVIDERS)[number]
  linkedAccount?: { provider: string; providerId: string }
  isLoading: boolean
  onSuccess: () => Promise<unknown>
  isFirst: boolean
  isLast: boolean
}

const AccountItem: React.FC<AccountItemProps> = ({
  provider,
  linkedAccount,
  isLoading,
  onSuccess,
  isFirst,
  isLast,
}) => {
  const { t } = useTranslation('profile')
  const isConnected = Boolean(linkedAccount)
  const foregroundColor = useCSSVariable('--color-foreground') as string

  const { api } = useRuntime()
  const disconnectMutation = useMutation({
    ...api.auth.unlink.mutationOptions(),
    onSuccess: async () => {
      toast.success(t('index.accounts.disconnect_dialog.success'))
      await onSuccess()
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <Item
      key={provider.id}
      className={cn('px-4', isFirst && 'pt-0', isLast && 'pb-0')}
    >
      <ItemMedia variant='image' className='border border-border'>
        <provider.Icon width={24} height={24} fill={foregroundColor} />
      </ItemMedia>

      <ItemContent>
        <ItemTitle>{provider.name}</ItemTitle>
        <ItemDescription>
          {isConnected
            ? `ID: ${linkedAccount?.providerId}`
            : t('index.accounts.not_connected')}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        {isConnected ? (
          <Button
            variant='destructive'
            size='sm'
            disabled={isLoading}
            onPress={() =>
              Alert.alert(
                t('index.accounts.disconnect_dialog.title'),
                t('index.accounts.disconnect_dialog.message', {
                  provider_name: provider.name,
                }),
                [
                  { text: t('index.accounts.cancel'), style: 'cancel' },
                  {
                    text: t('index.accounts.disconnect'),
                    style: 'destructive',
                    onPress: () =>
                      disconnectMutation.mutate({ provider: provider.id }),
                  },
                ]
              )
            }
          >
            <Typography>{t('index.accounts.disconnect')}</Typography>
          </Button>
        ) : (
          <OAuthButton provider={provider} size='sm'>
            <Typography>{t('index.accounts.connect')}</Typography>
          </OAuthButton>
        )}
      </ItemActions>
    </Item>
  )
}

export const AccountList: React.FC = () => {
  const { api } = useRuntime()
  const { data, isLoading, refetch } = useQuery(
    api.auth.accounts.queryOptions()
  )

  return (
    <Card>
      <ItemGroup className='gap-1.5'>
        {SUPPORTED_PROVIDERS.map((provider, idx) => {
          const linkedAccount = data?.data.find(
            (acc) => acc.provider === provider.id
          )

          return (
            <Fragment key={provider.id}>
              <AccountItem
                provider={provider}
                linkedAccount={linkedAccount}
                isLoading={isLoading}
                onSuccess={refetch}
                isFirst={idx === 0}
                isLast={idx === SUPPORTED_PROVIDERS.length - 1}
              />

              {idx < SUPPORTED_PROVIDERS.length - 1 && <Separator />}
            </Fragment>
          )
        })}
      </ItemGroup>
    </Card>
  )
}
