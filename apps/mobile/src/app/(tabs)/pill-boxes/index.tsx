import { Badge } from '@rozumari/ui/components/badge'
import { Button } from '@rozumari/ui/components/button'
import {
  CardContent,
  CardHeader,
  CardTitle,
} from '@rozumari/ui/components/card'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@rozumari/ui/components/icons'
import { Input } from '@rozumari/ui/components/input'
import { Typography } from '@rozumari/ui/components/typography'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, View } from 'react-native'

import { ActivityIndicator, RefreshControl } from '@/components/native'
import { useRuntime } from '@/hooks/use-runtime'
import { useSession } from '@/hooks/use-session'

export const STATUS_MAPPERS = {
  linked: { key: 'pill-box:statuses.linked', variant: 'success' },
  unlinked: { key: 'pill-box:statuses.unlinked', variant: 'info' },
  suspended: { key: 'pill-box:statuses.suspended', variant: 'destructive' },
} as const

export default function TabsPillBoxesIndexScreen() {
  const { t } = useTranslation(['common', 'pill-box'])
  const { user } = useSession()
  const { api } = useRuntime()
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState('')
  const [queryParams, setQueryParams] = useState({ query: '', page: 1 })

  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data, refetch, isRefetching, isLoading } = useQuery({
    ...(user?.role === 'admin'
      ? api.device.list.queryOptions({ query: queryParams })
      : api.device.me.queryOptions({ query: queryParams })),
    placeholderData: keepPreviousData,
    enabled: !!user,
  })

  const handleSearch = useCallback((text: string) => {
    setSearchTerm(text)

    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current)
    debounceTimeoutRef.current = setTimeout(() => {
      setQueryParams((prev) => ({ ...prev, query: text.trim(), page: 1 }))
    }, 500)
  }, [])

  const handlePageChange = useCallback(
    (newPage: number) => {
      const meta = data?.data?.meta
      if (!meta || newPage < 1 || newPage > meta.totalPages) return
      setQueryParams((prev) => ({ ...prev, page: newPage }))
    },
    [data?.data.meta]
  )

  if (!data?.data) return null
  const { meta, devices } = data.data

  return (
    <View className='flex-1'>
      <View className='px-4 pt-4 pb-2'>
        <Input
          placeholder={t('pill-box:index.searchPlaceholder')}
          value={searchTerm}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        contentContainerClassName='gap-3 px-4 py-2'
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch as never}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <View className='flex-1 items-center justify-center py-12'>
              <ActivityIndicator size='large' />
            </View>
          ) : (
            <View className='flex-1 items-center justify-center px-4 py-12'>
              <Typography className='text-center text-muted-foreground'>
                {t('pill-box:index.empty')}
              </Typography>
            </View>
          )
        }
        renderItem={({ item }) => {
          const status =
            STATUS_MAPPERS[item.status as keyof typeof STATUS_MAPPERS]

          return (
            <Pressable
              className='group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card py-4 ring-1 ring-foreground/10'
              onPress={() => router.push(`/(tabs)/pill-boxes/${item.id}`)}
            >
              <CardHeader className='flex-row items-center justify-between gap-2'>
                <CardTitle>{item.name ?? item.factoryModel}</CardTitle>
                <Badge variant={status.variant}>
                  <Typography className='capitalize'>
                    {t(status.key)}
                  </Typography>
                </Badge>
              </CardHeader>
              <CardContent className='gap-1'>
                <Typography className='text-sm text-muted-foreground'>
                  {t('pill-box:details.device.model')}: {item.factoryModel}
                </Typography>
                <Typography className='text-sm text-muted-foreground'>
                  {t('pill-box:details.device.position')}:{' '}
                  {item.position ?? 'Unknown'}
                </Typography>
              </CardContent>
            </Pressable>
          )
        }}
      />

      <View className='flex-row items-center justify-center gap-4 py-3'>
        <Button
          variant='outline'
          size='icon-sm'
          disabled={meta.page <= 1}
          onPress={() => handlePageChange(meta.page - 1)}
        >
          <ChevronLeftIcon className='size-4 shrink-0 text-foreground' />
        </Button>

        <Typography className='text-sm text-muted-foreground'>
          {t('pagination', { current: meta.page, total: meta.totalPages })}
        </Typography>

        <Button
          variant='outline'
          size='icon-sm'
          disabled={meta.page >= meta.totalPages}
          onPress={() => handlePageChange(meta.page + 1)}
        >
          <ChevronRightIcon className='size-4 shrink-0 text-foreground' />
        </Button>
      </View>
    </View>
  )
}
