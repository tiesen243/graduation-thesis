import { Badge } from '@rozumari/ui/components/badge'
import { buttonVariants } from '@rozumari/ui/components/button'
import { SearchIcon } from '@rozumari/ui/components/icons'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@rozumari/ui/components/input-group'
import { Typography } from '@rozumari/ui/components/typography'
import { useQuery } from '@tanstack/react-query'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { Link } from 'react-router'

import { DataTable } from '@/components/data-table'
import { api } from '@/lib/runtime'
import { AddDeviceButton } from '@/routes/dashboard/devices/_components/add-device-button'

const STATUS_VARIANTS = {
  unlinked: 'warning',
  linked: 'success',
  suspended: 'destructive',
} as const

export default function DevicesIndexPage() {
  const [query, setQuery] = useQueryStates(
    {
      query: parseAsString.withDefault(''),
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
    },
    { urlKeys: { query: 'q' } }
  )

  const { data: user } = useQuery(api.auth.whoami.queryOptions())
  const { data, isLoading } = useQuery(
    user?.data.role === 'admin'
      ? api.device.list.queryOptions({ query })
      : api.device.me.queryOptions({ query })
  )

  return (
    <>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-1'>
          <Typography variant='h2'>Devices</Typography>
          <Typography>
            Manage your devices, check status, and handle refills.
          </Typography>
        </div>

        <AddDeviceButton />
      </div>

      <InputGroup
        className='my-4'
        render={
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setQuery({ query: e.currentTarget.query.value, page: 1 })
            }}
          />
        }
      >
        <InputGroupAddon align='inline-start'>
          <SearchIcon />
        </InputGroupAddon>

        <InputGroupInput
          name='query'
          defaultValue={query.query}
          placeholder='Search devices...'
          type='search'
        />
      </InputGroup>

      <DataTable
        data={data?.data.devices ?? []}
        keyExtractor={(item) => item.id}
        columns={{
          factoryModel: 'Factory Model',
          name: 'Name',
          status: {
            header: 'Status',
            action: (item) => (
              <Badge
                className='capitalize'
                variant={
                  STATUS_VARIANTS[item.status as keyof typeof STATUS_VARIANTS]
                }
              >
                {item.status}
              </Badge>
            ),
          },
          _: {
            header: 'Actions',
            action: ({ id }) => (
              <Link
                to={`/devices/${id}`}
                className={buttonVariants({ variant: 'link' })}
              >
                View
              </Link>
            ),
          },
        }}

        isLoading={isLoading}

        page={query.page}
        pageSize={data?.data.meta.pageSize}
        totalPages={data?.data.meta.totalPages}
        setPage={(page) => setQuery({ page })}
      />
    </>
  )
}
