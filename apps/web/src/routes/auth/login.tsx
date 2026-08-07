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
import { useForm } from '@rozumari/ui/hooks/use-form'
import { useMutation } from '@tanstack/react-query'
import { toStandardSchemaV1 } from 'effect/Schema'
import { Link } from 'react-router'

import { env } from '@/lib/env'
import { api } from '@/lib/runtime'
import { getBaseUrl } from '@/lib/utils'

export default function LoginPage() {
  const login = useMutation({
    ...api.auth.login.mutationOptions(),
    onSuccess: ({ message }) => toast.add({ type: 'success', title: message }),
    onError: ({ message }) =>
      toast.add({ type: 'error', title: 'Login failed', description: message }),
  })

  const form = useForm({
    defaultValues: { email: '', password: '' },
    schema: toStandardSchemaV1(LoginDto.Input),
    onSubmit: login.mutate,
  })

  return (
    <>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your account.
        </CardDescription>
      </CardHeader>

      <form.Form>
        <form id={form.formId} className='px-4' onSubmit={form.handleSubmit}>
          <FieldSet disabled={login.isPending}>
            <legend className='sr-only'>Login</legend>

            <form.Field
              name='email'
              render={({ field, meta }) => (
                <Field data-invalid={meta.errors.length > 0}>
                  <FieldLabel htmlFor={field.id}>Email</FieldLabel>
                  <Input
                    {...field}
                    type='email'
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
                    to={`${env.VITE_API_URL}/api/auth/google?redirect_uri=${getBaseUrl()}`}
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
        </form>
      </form.Form>
    </>
  )
}
