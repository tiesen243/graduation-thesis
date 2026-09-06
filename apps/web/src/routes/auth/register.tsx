import { RegisterDto } from '@rozumari/contract/auth/dto/register.dto'
import { Button } from '@rozumari/ui/components/button'
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from '@rozumari/ui/components/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
} from '@rozumari/ui/components/field'
import { Input } from '@rozumari/ui/components/input'
import { toast } from '@rozumari/ui/components/toast'
import { FormBuilder } from '@rozumari/ui/lib/form-builder'
import { Link, useNavigate } from 'react-router'

import { api } from '@/lib/runtime'

const registerForm = FormBuilder.empty
  .add('username', RegisterDto.Input.fields.username)
  .add('email', RegisterDto.Input.fields.email)
  .add('password', RegisterDto.Input.fields.password)
  .add('confirmPassword', RegisterDto.Input.fields.password)
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    issue: 'Passwords do not match',
  })
  .make()

export default function RegisterPage() {
  const navigate = useNavigate()

  return (
    <>
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>
          Create an account to access all features.
        </CardDescription>
      </CardHeader>

      <registerForm.Root
        defaultValues={{
          email: '',
          username: '',
          password: '',
          confirmPassword: '',
        }}
        render={({ handleSubmit }) => (
          <form
            className='px-4'
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()

              handleSubmit(
                (payload) => api.auth.register.mutateEffect({ payload }),
                {
                  onSuccess: () => {
                    navigate('/login', { replace: true })
                    toast.add({
                      type: 'success',
                      title: 'Registration successful',
                      description: 'You can now log in with your new account.',
                    })
                  },
                  onError: (error) =>
                    toast.add({ type: 'error', description: error.message }),
                }
              )
            }}
          />
        )}
      >
        <FieldSet className='group-data-[pending=true]/form:pointer-events-none'>
          <legend className='sr-only'>Register</legend>

          <registerForm.Field
            name='username'
            render={({ field, meta }) => (
              <Field data-invalid={meta.errors.length > 0}>
                <FieldLabel htmlFor={field.id}>Username</FieldLabel>
                <Input
                  {...field}
                  disabled={meta.isPending}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder='Enter your username'
                />
                <FieldError id={meta.errorId} errors={meta.errors} />
              </Field>
            )}
          />

          <registerForm.Field
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

          <registerForm.Field
            name='password'
            render={({ field, meta }) => (
              <Field data-invalid={meta.errors.length > 0}>
                <FieldLabel htmlFor={field.id}>Password</FieldLabel>
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

          <registerForm.Field
            name='confirmPassword'
            render={({ field, meta }) => (
              <Field data-invalid={meta.errors.length > 0}>
                <FieldLabel htmlFor={field.id}>Confirm Password</FieldLabel>
                <Input
                  {...field}
                  type='password'
                  disabled={meta.isPending}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder='Confirm your password'
                />
                <FieldError id={meta.errorId} errors={meta.errors} />
              </Field>
            )}
          />

          <Field>
            <registerForm.Submit
              render={({ meta }) => (
                <Button
                  type='submit'
                  form={meta.formId}
                  disabled={meta.isPending}
                >
                  {meta.isPending ? 'Registering...' : 'Register'}
                </Button>
              )}
            />

            <FieldDescription>
              Already have an account? <Link to='/login'>Login</Link>
            </FieldDescription>
          </Field>
        </FieldSet>
      </registerForm.Root>
    </>
  )
}
