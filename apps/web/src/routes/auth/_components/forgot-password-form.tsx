import { ForgotPasswordDto } from '@rozumari/contract/auth/dto/forgot-password.dto'
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
import { Link } from 'react-router'

import { api } from '@/lib/runtime'

const forgotPasswordForm = FormBuilder.empty
  .add('email', ForgotPasswordDto.Input.fields.email)
  .make()

function ForgotPasswordFormSubmit({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const formId = forgotPasswordForm.useValue((s) => s.formId)
  const isPending = forgotPasswordForm.useValue((s) => s.isPending)

  const handleSubmit = forgotPasswordForm.useSubmit(
    (payload) => api.auth['forgot-password'].mutate({ payload }),
    {
      onSuccess: () =>
        toast.success(
          'If an account with that email exists, a reset link has been sent.'
        ),
    }
  )

  return (
    <form id={formId} className='px-4' onSubmit={handleSubmit}>
      <FieldSet className='px-4' disabled={isPending}>
        {children}
      </FieldSet>
    </form>
  )
}

export const ForgotPasswordForm: React.FC = () => (
  <forgotPasswordForm.Provider defaultValues={{ email: '' }}>
    <ForgotPasswordFormSubmit>
      <forgotPasswordForm.Field
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

      <Field>
        <Button type='submit'>Send Reset Link</Button>

        <FieldDescription>
          Remembered your password? <Link to='/login'>Login</Link>
        </FieldDescription>
      </Field>
    </ForgotPasswordFormSubmit>
  </forgotPasswordForm.Provider>
)
