import { Card } from '@rozumari/ui/components/card'
import { Outlet } from 'react-router'

export default function AuthRoot() {
  return (
    <main className='grid min-h-dvh place-items-center md:px-4'>
      <Card className='bg-background md:bg-card w-full max-w-2xl ring-0 md:ring-1'>
        <Outlet />
      </Card>
    </main>
  )
}
