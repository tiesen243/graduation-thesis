import { ResetPasswordDto } from '@rozumari/contract/auth/dto/reset-password.dto'
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
import { Link, useNavigate, useSearchParams } from 'react-router'

import { api } from '@/lib/runtime'

const forgotPasswordForm = FormBuilder.empty
  .add('password', ResetPasswordDto.Input.fields.password)
  .add('confirmPassword', ResetPasswordDto.Input.fields.password)
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get('token')

  const form = forgotPasswordForm.make(
    (payload) =>
      api.auth['reset-password'].mutateEffect({
        headers: { Authorization: `Bearer ${token}` },
        payload,
      }),
    {
      defaultValues: { password: '', confirmPassword: '' },
      onSuccess: () => {
        toast.add({ type: 'success', title: 'Password reset successful' })
        navigate('/login', { replace: true })
      },
    }
  )

  if (!token)
    return (
      <CardHeader>
        <CardTitle>Invalid Token</CardTitle>
      </CardHeader>
    )

  return (
    <>
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </CardDescription>
      </CardHeader>

      <form.Root
        render={({ handleSubmit }) => (
          <form
            className='px-4'
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
          />
        )}
      >
        <FieldSet className='group-data-[pending=true]/form:pointer-events-none'>
          <legend className='sr-only'>Forgot Password</legend>

          <form.Field
            name='password'
            render={({ field, meta }) => (
              <Field data-invalid={meta.errors.length > 0}>
                <FieldLabel htmlFor={field.id}>Password</FieldLabel>
                <Input
                  {...field}
                  type='password'
                  disabled={meta.isPending}
                  onChange={(e) => field.onChange(e.target.value)}
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
                  disabled={meta.isPending}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                <FieldError id={meta.errorId} errors={meta.errors} />
              </Field>
            )}
          />

          <Field>
            <form.Submit
              render={({ meta }) => (
                <Button
                  type='submit'
                  form={meta.formId}
                  disabled={meta.isPending}
                >
                  {meta.isPending ? 'Sending...' : 'Send Reset Link'}
                </Button>
              )}
            />

            <FieldDescription>
              Remembered your password? <Link to='/login'>Login</Link>
            </FieldDescription>
          </Field>
        </FieldSet>
      </form.Root>
    </>
  )
}
