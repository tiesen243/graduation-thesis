import { LoginDto } from '@rozumari/contract/auth/dto/login.dto'
import { Button } from '@rozumari/ui/components/button'
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from '@rozumari/ui/components/card'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
} from '@rozumari/ui/components/field'
import { FacebookIcon, GoogleIcon } from '@rozumari/ui/components/icons'
import { Input } from '@rozumari/ui/components/input'
import { toast } from '@rozumari/ui/components/toast'
import { FormBuilder } from '@rozumari/ui/lib/form-builder'
import { Link, useNavigate } from 'react-router'

import { env } from '@/lib/env'
import { api } from '@/lib/runtime'
import { useSession } from '@/lib/use-session'
import { getBaseUrl } from '@/lib/utils'

const form = FormBuilder.empty
  .add('email', LoginDto.Input.fields.email)
  .add('password', LoginDto.Input.fields.password)
  .make()

const PROVIDERS = [
  { name: 'facebook', label: 'Facebook', icon: FacebookIcon },
  { name: 'google', label: 'Google', icon: GoogleIcon },
]

export function LoginForm() {
  const navigate = useNavigate()
  const { refetch } = useSession()

  return (
    <>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your account.
        </CardDescription>
      </CardHeader>

      <form.Root
        defaultValues={{ email: '', password: '' }}
        render={({ handleSubmit }) => (
          <form
            className='px-4'
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()

              handleSubmit(
                (payload) => api.auth.login.mutateEffect({ payload }),
                {
                  onSuccess: async () => {
                    await refetch()
                    toast.add({
                      type: 'success',
                      description: 'You have successfully logged in.',
                    })

                    navigate('/dashboard', { replace: true })
                  },
                  onError: (error) =>
                    toast.add({ type: 'error', description: error.message }),
                }
              )
            }}
          />
        )}
      >
        <FieldSet>
          <legend className='sr-only'>Login</legend>

          <form.Field
            name='email'
            render={({ field, meta }) => (
              <Field data-invalid={meta.errors.length > 0}>
                <FieldLabel htmlFor={field.id}>Email</FieldLabel>
                <Input
                  {...field}
                  type='email'
                  disabled={meta.isPending}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder='Enter your email'
                />
                <FieldError id={meta.errorId} errors={meta.errors} />
              </Field>
            )}
          />

          <form.Field
            name='password'
            render={({ field, meta }) => (
              <Field data-invalid={meta.errors.length > 0}>
                <FieldContent className='flex-row justify-between'>
                  <FieldLabel htmlFor={field.id}>Password</FieldLabel>
                  <FieldDescription>
                    <Link to='/forgot-password' tabIndex={-1}>
                      Forgot your password?
                    </Link>
                  </FieldDescription>
                </FieldContent>
                <Input
                  {...field}
                  type='password'
                  disabled={meta.isPending}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder='Enter your password'
                />
                <FieldError id={meta.errorId} errors={meta.errors} />
              </Field>
            )}
          />

          <Field>
            <Button type='submit'>Login</Button>

            <FieldDescription>
              Don&apos;t have an account? <Link to='/register'>Register</Link>
            </FieldDescription>
          </Field>

          <Field className='relative grid grid-cols-1 pt-5 md:grid-cols-2'>
            <div className='absolute inset-0 flex h-px w-full items-center justify-center bg-border'>
              <span className='bg-background px-2 text-muted-foreground md:bg-card'>
                Or
              </span>
            </div>

            {PROVIDERS.map((provider) => (
              <Button
                key={provider.name}
                variant='outline'
                nativeButton={false}
                render={
                  <Link
                    to={`${env.VITE_API_URL}/api/auth/${provider.name}?redirect_uri=${getBaseUrl()}/login`}
                  />
                }
              >
                <provider.icon /> Continue with {provider.label}
              </Button>
            ))}
          </Field>
        </FieldSet>
      </form.Root>
    </>
  )
}
