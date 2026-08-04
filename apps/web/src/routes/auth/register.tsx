import { Button } from '@rozumari/ui/components/button'
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from '@rozumari/ui/components/card'
import {
  Field,
  FieldError,
  FieldLabel,
  FieldSet,
} from '@rozumari/ui/components/field'
import { Input } from '@rozumari/ui/components/input'
import { toast } from '@rozumari/ui/components/toast'
import { useForm } from '@rozumari/ui/hooks/use-form'
import { useMutation } from '@tanstack/react-query'

import { api } from '@/lib/effect'

export default function RegisterPage() {
  const login = useMutation({
    ...api.auth.register.mutationOptions(),
    onSuccess: ({ message }) => toast.add({ type: 'success', title: message }),
    onError: ({ message, error }) =>
      toast.add({
        type: 'error',
        title: 'Registration failed',
        description: JSON.stringify(error ?? message),
      }),
  })

  const form = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: login.mutate,
    onSuccess: () => console.log('Registration successful'),
  })

  return (
    <>
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>
          Create an account to access all features.
        </CardDescription>
      </CardHeader>

      <form id={form.formId} className='px-4' onSubmit={form.handleSubmit}>
        <FieldSet disabled={login.isPending}>
          <legend className='sr-only'>Register</legend>

          <form.Field
            name='username'
            render={({ field, meta }) => (
              <Field data-invalid={meta.errors.length > 0}>
                <FieldLabel htmlFor={field.id}>Username</FieldLabel>
                <Input
                  {...field}
                  type='text'
                  placeholder='Enter your username'
                />
                <FieldError id={meta.errorId} errors={meta.errors} />
              </Field>
            )}
          />

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
                <FieldLabel htmlFor={field.id}>Password</FieldLabel>
                <Input
                  {...field}
                  type='password'
                  placeholder='Enter your password'
                />
                <FieldError id={meta.errorId} errors={meta.errors} />
              </Field>
            )}
          />

          <form.Field
            name='confirmPassword'
            render={({ field, meta }) => (
              <Field data-invalid={meta.errors.length > 0}>
                <FieldLabel htmlFor={field.id}>Confirm Password</FieldLabel>
                <Input
                  {...field}
                  type='password'
                  placeholder='Confirm your password'
                />
                <FieldError id={meta.errorId} errors={meta.errors} />
              </Field>
            )}
          />

          <Field>
            <Button type='submit' form={form.formId}>
              Register
            </Button>
          </Field>
        </FieldSet>
      </form>
    </>
  )
}
