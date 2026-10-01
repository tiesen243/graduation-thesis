import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@rozumari/ui/components/alert-dialog'
import { Badge } from '@rozumari/ui/components/badge'
import { Button } from '@rozumari/ui/components/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@rozumari/ui/components/card'
import {
  UnlinkIcon,
  Link2Icon,
  XCircleIcon,
  CheckCircle2Icon,
} from '@rozumari/ui/components/icons'
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
import { useMutation, useQuery } from '@tanstack/react-query'
import { Fragment, useState } from 'react'
import { Link } from 'react-router'

import { SUPPORTED_PROVIDERS } from '@/lib/constants'
import { env } from '@/lib/env'
import { api } from '@/lib/runtime'
import { getBaseUrl } from '@/lib/utils'

interface AccountItemProps {
  provider: (typeof SUPPORTED_PROVIDERS)[number]
  linkedAccount?: { provider: string; providerId: string }
  isLoading: boolean
  onSuccess: () => Promise<unknown>
}

const AccountItem: React.FC<AccountItemProps> = ({
  provider,
  linkedAccount,
  isLoading,
  onSuccess,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const isConnected = Boolean(linkedAccount)
  const { Icon } = provider

  const disconnectMutation = useMutation({
    ...api.auth.unlink.mutationOptions(),
    onSuccess: async () => {
      toast.success('Account disconnected successfully')
      await onSuccess()
      setIsOpen(false)
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <Item key={provider.id} className='last:pb-0'>
      <ItemMedia variant='image' className='border'>
        <Icon className='size-6 shrink-0' />
      </ItemMedia>

      <ItemContent>
        <ItemTitle>
          {provider.name}

          {isConnected ? (
            <Badge variant='success'>
              <CheckCircle2Icon /> Connected
            </Badge>
          ) : (
            <Badge variant='outline'>
              <XCircleIcon /> Not Linked
            </Badge>
          )}
        </ItemTitle>

        <ItemDescription>
          {isConnected && linkedAccount?.providerId
            ? `ID: ${linkedAccount.providerId}`
            : `Connect your ${provider.name} account to enable quick sign-in.`}
        </ItemDescription>
      </ItemContent>

      <ItemActions>
        {isConnected ? (
          <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger
              render={
                <Button size='sm' variant='destructive' disabled={isLoading} />
              }
            >
              <UnlinkIcon data-icon='inline-start' /> Disconnect
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to disconnect your {provider.name}{' '}
                  account? This action cannot be undone.
                </AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={disconnectMutation.isPending}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  variant='destructive'
                  disabled={disconnectMutation.isPending}
                  onClick={() =>
                    disconnectMutation.mutate({ provider: provider.id })
                  }
                >
                  Disconnect
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button
            size='sm'
            variant='outline'
            disabled={isLoading}
            nativeButton={false}
            render={
              <Link
                to={`${env.VITE_API_URL}/api/auth/${provider.id}?redirect_uri=${getBaseUrl()}/dashboard/account`}
              />
            }
          >
            <Link2Icon data-icon='inline-start' /> Connect
          </Button>
        )}
      </ItemActions>
    </Item>
  )
}

export const AccountList: React.FC = () => {
  const { data, isLoading, refetch } = useQuery(
    api.auth.accounts.queryOptions()
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Linked Accounts</CardTitle>
        <CardDescription>
          Manage social accounts linked to your profile for faster sign-in.
        </CardDescription>
      </CardHeader>

      <ItemGroup className='gap-2 divide-y'>
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
              />
              {idx < SUPPORTED_PROVIDERS.length - 1 && <Separator />}
            </Fragment>
          )
        })}
      </ItemGroup>
    </Card>
  )
}
