import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@rozumari/ui/components/avatar'
import { Badge } from '@rozumari/ui/components/badge'
import { Button } from '@rozumari/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@rozumari/ui/components/card'
import {
  CameraIcon,
  MailIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@rozumari/ui/components/icons'
import { Input } from '@rozumari/ui/components/input'
import { toast } from '@rozumari/ui/components/toast'
import { Typography } from '@rozumari/ui/components/typography'
import { useRef, useState } from 'react'

import { useSession } from '@/lib/use-session'

export default function AccountPage() {
  const { user, status } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  if (status !== 'authenticated' || !user) return null

  const avatarSrc = avatarPreview ?? user.image ?? ''

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Mock: preview the selected image locally (upload not implemented yet)
    const url = URL.createObjectURL(file)
    setAvatarPreview(url)
    toast.add({
      type: 'info',
      description: 'Avatar preview updated. Upload will be available soon.',
    })
  }

  return (
    <>
      <Typography variant='h2'>Account</Typography>
      <Typography>
        View your account details and manage your profile picture.
      </Typography>

      <div className='mt-4 grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Profile picture</CardTitle>
            <CardDescription>
              Upload a new avatar. This is a preview only for now.
            </CardDescription>
          </CardHeader>

          <CardContent className='flex flex-col items-center gap-4'>
            <div className='relative'>
              <Avatar className='size-24 rounded-lg'>
                <AvatarImage src={avatarSrc} alt={user.username} />
                <AvatarFallback className='rounded-lg text-2xl'>
                  {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <Button
                variant='outline'
                size='icon-sm'
                className='absolute right-0 bottom-0 rounded-full'
                onClick={() => fileInputRef.current?.click()}
              >
                <CameraIcon />
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type='file'
              accept='image/*'
              className='hidden'
              onChange={handleAvatarChange}
            />

            <Button
              variant='outline'
              size='sm'
              onClick={() => fileInputRef.current?.click()}
            >
              <CameraIcon /> Change avatar
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account details</CardTitle>
            <CardDescription>Your account information.</CardDescription>
          </CardHeader>

          <CardContent className='grid gap-4'>
            <div className='grid gap-2'>
              <Typography variant='small' className='text-muted-foreground'>
                <UserIcon className='mr-1 inline size-3.5' />
                Username
              </Typography>
              <Input value={user.username} readOnly />
            </div>

            <div className='grid gap-2'>
              <Typography variant='small' className='text-muted-foreground'>
                <MailIcon className='mr-1 inline size-3.5' />
                Email
              </Typography>
              <Input value={user.email} readOnly />
            </div>

            <div className='grid gap-2'>
              <Typography variant='small' className='text-muted-foreground'>
                <ShieldCheckIcon className='mr-1 inline size-3.5' />
                Role
              </Typography>
              <Badge
                variant={user.role === 'admin' ? 'default' : 'secondary'}
                className='capitalize'
              >
                {user.role}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
