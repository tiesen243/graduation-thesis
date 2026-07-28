import { useMutation, useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'

export default function App() {
  const query = useQuery(api.home.index.queryOptions())

  const mutation = useMutation({
    ...api.home.echo.mutationOptions(),
    onSuccess: (data) => console.log(data),
  })

  return (
    <main>
      <p>Welcome to Bun + React + TypeScript!</p>

      <pre>{JSON.stringify(query.data, null, 2)}</pre>

      <button
        type='button'
        onClick={() => mutation.mutate({ message: 'Hello from the client!' })}
      >
        Echo
      </button>
    </main>
  )
}
