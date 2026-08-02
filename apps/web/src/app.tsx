import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'

export default function App() {
  const query = useQuery(api.auth.whoami.queryOptions())

  return (
    <main>
      <p>Welcome to Bun + React + TypeScript!</p>

      <pre>{JSON.stringify(query, null, 2)}</pre>
    </main>
  )
}
