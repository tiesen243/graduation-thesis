import { Badge } from '@rozumari/ui/components/badge'
import { SearchIcon } from '@rozumari/ui/components/icons'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@rozumari/ui/components/input-group'
import { Typography } from '@rozumari/ui/components/typography'
import { useQuery } from '@tanstack/react-query'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'

import { DataTable } from '@/components/data-table'
import { api } from '@/lib/runtime'
import { useSession } from '@/lib/use-session'
import { DeleteUserDialog } from '@/routes/dashboard/_components/delete-user-dialog'
import { EditUserDialog } from '@/routes/dashboard/_components/edit-user-dialog'

const ROLE_VARIANTS = {
  user: 'info',
  admin: 'warning',
} as const

export default function UsersPage() {
  const [query, setQuery] = useQueryStates(
    {
      query: parseAsString.withDefault(''),
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
    },
    { urlKeys: { query: 'q' } }
  )

  const { user } = useSession()

  const { data, isLoading } = useQuery(api.user.list.queryOptions({ query }))

  if (user?.role !== 'admin')
    return (
      <>
        <Typography variant='h2'>Users</Typography>
        <Typography>You do not have permission to view this page.</Typography>
      </>
    )

  return (
    <>
      <Typography variant='h2'>Users</Typography>
      <Typography>Manage user accounts, roles, and access.</Typography>

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
          placeholder='Search users...'
          type='search'
        />
      </InputGroup>

      <DataTable
        data={data?.data.users ?? []}
        keyExtractor={(item) => item.id}
        columns={{
          username: 'Username',
          email: 'Email',
          deletedAt: {
            header: 'Status',
            action: (item) =>
              item.deletedAt ? (
                <Badge variant='destructive'>Deleted</Badge>
              ) : (
                <Badge variant='success'>Active</Badge>
              ),
          },
          role: {
            header: 'Role',
            action: (item) => (
              <Badge
                className='capitalize'
                variant={ROLE_VARIANTS[item.role as keyof typeof ROLE_VARIANTS]}
              >
                {item.role}
              </Badge>
            ),
          },
          createdAt: {
            header: 'Joined',
            action: (item) => new Date(item.createdAt).toLocaleDateString(),
          },
          _: {
            header: 'Actions',
            action: (item) => (
              <div className='flex gap-2'>
                <EditUserDialog user={item} />
                <DeleteUserDialog user={item} />
              </div>
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
