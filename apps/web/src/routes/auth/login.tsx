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
import { Link } from 'react-router'

import { useRuntime } from '@/hooks/use-runtime'

export default function LoginPage() {
  const { api } = useRuntime()

  const login = useMutation({
    ...api.auth.login.mutationOptions(),
    onSuccess: () => toast.add({ type: 'success', title: 'Login successful' }),
    onError: ({ message }) =>
      toast.add({ type: 'error', title: 'Login failed', description: message }),
  })

  const form = useForm({
    defaultValues: { email: '', password: '' },
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

      <form id={form.formId} className='px-4' onSubmit={form.handleSubmit}>
        <FieldSet disabled={login.isPending}>
          <legend className='sr-only'>Login</legend>

          <form.Field
            name='email'
            render={({ field, meta }) => (
              <Field data-invalid={meta.errors.length > 0}>
                <FieldLabel htmlFor={field.id}>Email</FieldLabel>
                <Input {...field} type='email' placeholder='Enter your email' />
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

          <Field>
            <Button type='submit' form={form.formId}>
              Login
            </Button>
          </Field>
        </FieldSet>
      </form>
    </>
  )
}
