import type { QueryClient } from '@tanstack/react-query'

import { createQueryClient } from '@rozumari/lib/create-query-client'
import { ToastProvider } from '@rozumari/ui/components/toast'
import { TooltipProvider } from '@rozumari/ui/components/tooltip'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'

import { RuntimeProvider } from '@/hooks/use-runtime'

let clientQueryClientSingleton: QueryClient | undefined
const getQueryClient = () => {
  if (typeof window === 'undefined') return createQueryClient()
  return (clientQueryClientSingleton ??= createQueryClient())
}

export function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const queryClient = getQueryClient()

  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='system'
      themes={['light', 'dark', 'system']}
      disableTransitionOnChange
      enableSystem
    >
      <ToastProvider>
        <TooltipProvider>
          <QueryClientProvider client={queryClient}>
            <RuntimeProvider>{children}</RuntimeProvider>
          </QueryClientProvider>
        </TooltipProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
