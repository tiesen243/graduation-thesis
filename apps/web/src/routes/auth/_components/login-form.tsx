import { LoginDto } from '@rozumari/contract/auth/dto/login.dto'
import { Button } from '@rozumari/ui/components/button'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from '@rozumari/ui/components/field'
import { FacebookIcon, GoogleIcon } from '@rozumari/ui/components/icons'
import { Input } from '@rozumari/ui/components/input'
import { toast } from '@rozumari/ui/components/toast'
import { FormBuilder } from '@rozumari/ui/lib/form-builder'
import { Link, useNavigate } from 'react-router'

import { useSession } from '@/hooks/use-session'
import { env } from '@/lib/env'
import { api } from '@/lib/runtime'
import { getBaseUrl } from '@/lib/utils'

const loginForm = FormBuilder.empty
  .add('email', LoginDto.Input.fields.email)
  .add('password', LoginDto.Input.fields.password)
  .make()

const PROVIDERS = [
  { name: 'facebook', label: 'Facebook', icon: FacebookIcon },
  { name: 'google', label: 'Google', icon: GoogleIcon },
]

function LoginFormSubmit({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { refetch } = useSession()
  const navigate = useNavigate()

  const formId = loginForm.useValue((s) => s.formId)
  const isPending = loginForm.useValue((s) => s.isPending)

  const handleSubmit = loginForm.useSubmit(
    (payload) => api.auth.login.mutate({ payload }),
    {
      onSuccess: async () => {
        await refetch()
        toast.success('You have successfully logged in.')
        navigate('/dashboard', { replace: true })
      },
      onError: (error) => toast.error(error.message),
    }
  )

  return (
    <form id={formId} className='px-4' onSubmit={handleSubmit}>
      <FieldSet disabled={isPending}>{children}</FieldSet>
    </form>
  )
}

export const LoginForm: React.FC = () => (
  <loginForm.Provider defaultValues={{ email: '', password: '' }}>
    <LoginFormSubmit>
      <loginForm.Field
        name='email'
        render={({ field, meta, helpers: { handleChange } }) => (
          <Field data-invalid={meta.errors.length > 0}>
            <FieldLabel htmlFor={field.id}>Email</FieldLabel>
            <Input
              {...field}
              type='email'
              placeholder='Enter your email'
              onChange={(e) => handleChange(e.target.value)}
            />
            <FieldError id={meta.errorId} errors={meta.errors} />
          </Field>
        )}
      />

      <loginForm.Field
        name='password'
        render={({ field, meta, helpers: { handleChange } }) => (
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
              placeholder='Enter your password'
              onChange={(e) => handleChange(e.target.value)}
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

      <FieldSeparator className='md:[&>[data-slot=field-separator-content]]:bg-card'>
        or
      </FieldSeparator>

      <Field className='grid grid-cols-1 pt-5 md:grid-cols-2'>
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
    </LoginFormSubmit>
  </loginForm.Provider>
)
