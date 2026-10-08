import { ResetPasswordDto } from '@rozumari/contract/auth/dto/reset-password.dto'
import { Button } from '@rozumari/ui/components/button'
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

import { TurnstileChallenge } from '@/components/turnstile-challegen'
import { api } from '@/lib/runtime'

const resetPasswordForm = FormBuilder.empty
  .add('password', ResetPasswordDto.Input.fields.password)
  .add('confirmPassword', ResetPasswordDto.Input.fields.password)
  .add('challengeToken', ResetPasswordDto.Input.fields.challengeToken)
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    issue: 'Passwords do not match',
  })
  .make()

function ResetPasswordFormChallenge() {
  const set = resetPasswordForm.useSet()

  return (
    <TurnstileChallenge
      setToken={(challengeToken) =>
        set((prev) => ({ ...prev, values: { ...prev.values, challengeToken } }))
      }
    />
  )
}

function ResetPasswordFormSubmit({
  token,
  children,
}: Readonly<{ token: string; children: React.ReactNode }>) {
  const formId = resetPasswordForm.useValue((s) => s.formId)
  const isPending = resetPasswordForm.useValue((s) => s.isPending)

  const navigate = useNavigate()

  const handleSubmit = resetPasswordForm.useSubmit(
    (payload) =>
      api.auth['reset-password'].mutate({
        headers: { Authorization: `Bearer ${token}` },
        payload,
      }),
    {
      onSuccess: () => {
        navigate('/login', { replace: true })
        toast.success(
          'Password reset successfully. You can now log in with your new password.'
        )
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

export const ResetPasswordForm: React.FC<{ token: string }> = ({ token }) => (
  <resetPasswordForm.Provider
    defaultValues={{ password: '', confirmPassword: '', challengeToken: '' }}
  >
    <ResetPasswordFormSubmit token={token}>
      <legend className='sr-only'>Reset Password</legend>

      <resetPasswordForm.Field
        name='password'
        render={({ field, meta, helpers: { handleChange } }) => (
          <Field data-invalid={meta.errors.length > 0}>
            <FieldLabel htmlFor={field.id}>Password</FieldLabel>
            <Input
              {...field}
              type='password'
              onChange={(e) => handleChange(e.target.value)}
            />
            <FieldError id={meta.errorId} errors={meta.errors} />
          </Field>
        )}
      />

      <resetPasswordForm.Field
        name='confirmPassword'
        render={({ field, meta, helpers: { handleChange } }) => (
          <Field data-invalid={meta.errors.length > 0}>
            <FieldLabel htmlFor={field.id}>Confirm Password</FieldLabel>
            <Input
              {...field}
              type='password'
              onChange={(e) => handleChange(e.target.value)}
            />
            <FieldError id={meta.errorId} errors={meta.errors} />
          </Field>
        )}
      />

      <ResetPasswordFormChallenge />

      <Field>
        <Button type='submit'>Reset Password</Button>

        <FieldDescription>
          Remembered your password? <Link to='/login'>Login</Link>
        </FieldDescription>
      </Field>
    </ResetPasswordFormSubmit>
  </resetPasswordForm.Provider>
)
