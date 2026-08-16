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
import { Input } from '@rozumari/ui/components/input'
import { toast } from '@rozumari/ui/components/toast'
import { FormBuilder } from '@rozumari/ui/lib/form-builder'
import { Link, useNavigate } from 'react-router'

import { env } from '@/lib/env'
import { api } from '@/lib/runtime'
import { getBaseUrl } from '@/lib/utils'

const form = FormBuilder.empty
  .add('email', LoginDto.Input.fields.email)
  .add('password', LoginDto.Input.fields.password)
  .make((payload) => api.auth.login.mutateEffect({ payload }), {
    defaultValues: { email: '', password: '' },
    onSuccess: () => toast.add({ type: 'success', title: 'Login successful' }),
    onError: (error) =>
      toast.add({
        type: 'error',
        title: 'Login Fail',
        description: error.message,
      }),
  })

export function LoginForm() {
  const navigate = useNavigate()

  return (
    <>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your account.
        </CardDescription>
      </CardHeader>

      <form.Root
        render={({ handleSubmit }) => (
          <form
            className='px-4'
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit({
                onSuccess: () => navigate('/dashboard', { replace: true }),
              })
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

          <Field orientation='responsive'>
            <Button type='submit'>Login</Button>

            <Button
              variant='outline'
              nativeButton={false}
              render={
                <Link
                  to={`${env.VITE_API_URL}/api/auth/google?redirect_uri=${getBaseUrl()}/login`}
                />
              }
            >
              Login with Google
            </Button>
          </Field>

          <FieldDescription>
            Don&apos;t have an account? <Link to='/register'>Register</Link>
          </FieldDescription>
        </FieldSet>
      </form.Root>
    </>
  )
}
