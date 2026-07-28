import '@/main.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from '@/app'

const queryClient = new QueryClient()

// oxlint-disable-next-line typescript/no-non-null-assertion
const elem = document.querySelector('#root')!
const app = (
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
)

// https://bun.com/docs/bundler/hot-reloading#import-meta-hot-data
;(import.meta.hot.data.root ??= createRoot(elem)).render(app)

// export function useApp() {
//   const query = useQuery(api.home.index.queryOptions())
//   console.log('query', query)
//
//   const mutation = useMutation(api.home.echo.mutationOptions())
//
//   const form = useForm({
//     defaultValues: { message: '' },
//     schema: Schema.toStandardSchemaV1(EchoDto),
//     onSubmit: (values) => mutation.mutateAsync(values),
//   })
//   console.log('form', form)
// }
