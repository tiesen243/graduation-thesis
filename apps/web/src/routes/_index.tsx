import { Typography } from '@rozumari/ui/components/typography'
import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/runtime'

export default function IndexPage() {
  const { data, error } = useQuery({
    ...api.auth.whoami.queryOptions(),
  })

  return (
    <main className='grid min-h-dvh place-items-center'>
      <Typography variant='h1'>Welcome to Rozumari</Typography>

      <Typography as='pre'>
        {JSON.stringify({ data, error }, null, 2)}
      </Typography>
    </main>
  )
}
