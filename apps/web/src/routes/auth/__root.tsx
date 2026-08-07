import { Card } from '@rozumari/ui/components/card'
import { Outlet } from 'react-router'

export default function AuthRoot() {
  return (
    <main className='grid min-h-dvh place-items-center md:px-4'>
      <Card className='w-full max-w-2xl bg-background ring-0 md:bg-card md:ring-1'>
        <Outlet />
      </Card>
    </main>
  )
}
