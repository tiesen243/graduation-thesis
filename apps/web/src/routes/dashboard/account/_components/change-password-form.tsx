import { ChangePasswordDto } from '@rozumari/contract/auth/dto/change-password.dto'
import { Button } from '@rozumari/ui/components/button'
import {
  Field,
  FieldError,
  FieldLabel,
  FieldSet,
} from '@rozumari/ui/components/field'
import { Input } from '@rozumari/ui/components/input'
import { toast } from '@rozumari/ui/components/toast'
import { FormBuilder } from '@rozumari/ui/lib/form-builder'
import { useNavigate } from 'react-router'

import { useSession } from '@/hooks/use-session'
import { api } from '@/lib/runtime'

const changePasswordForm = FormBuilder.empty
  .add('currentPassword', ChangePasswordDto.Input.fields.currentPassword)
  .add('newPassword', ChangePasswordDto.Input.fields.newPassword)
  .add('confirmPassword', ChangePasswordDto.Input.fields.newPassword)
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    issue: 'Passwords do not match',
  })
  .make()

function ChangePasswordFormSubmit({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const formId = changePasswordForm.useValue((s) => s.formId)
  const isPending = changePasswordForm.useValue((s) => s.isPending)

  const navigate = useNavigate()
  const { logout } = useSession()

  const handleSubmit = changePasswordForm.useSubmit(
    (payload) => api.auth['change-password'].mutateEffect({ payload }),
    {
      onSuccess: () => {
        toast.success('Password changed successfully. Please log in again.')
        logout()
        navigate('/login', { replace: true })
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

export const ChangePasswordForm: React.FC = () => (
  <changePasswordForm.Provider
    defaultValues={{
      currentPassword: undefined,
      newPassword: '',
      confirmPassword: '',
    }}
  >
    <ChangePasswordFormSubmit>
      <legend className='sr-only'>Change Password</legend>

      <changePasswordForm.Field
        name='currentPassword'
        render={({ field, meta, helpers: { handleChange } }) => (
          <Field data-invalid={meta.errors.length > 0}>
            <FieldLabel htmlFor={field.id}>Current Password</FieldLabel>
            <Input
              {...field}
              type='password'
              placeholder='Leave blank if you have no password'
              onChange={(e) => handleChange(e.target.value)}
            />
            <FieldError id={meta.errorId} errors={meta.errors} />
          </Field>
        )}
      />

      <changePasswordForm.Field
        name='newPassword'
        render={({ field, meta, helpers: { handleChange } }) => (
          <Field data-invalid={meta.errors.length > 0}>
            <FieldLabel htmlFor={field.id}>New Password</FieldLabel>
            <Input
              {...field}
              type='password'
              placeholder='Enter your new password'
              onChange={(e) => handleChange(e.target.value)}
            />
            <FieldError id={meta.errorId} errors={meta.errors} />
          </Field>
        )}
      />

      <changePasswordForm.Field
        name='confirmPassword'
        render={({ field, meta, helpers: { handleChange } }) => (
          <Field data-invalid={meta.errors.length > 0}>
            <FieldLabel htmlFor={field.id}>Confirm Password</FieldLabel>
            <Input
              {...field}
              type='password'
              placeholder='Re-enter your new password'
              onChange={(e) => handleChange(e.target.value)}
            />
            <FieldError id={meta.errorId} errors={meta.errors} />
          </Field>
        )}
      />

      <Field>
        <Button type='submit'>Change Password</Button>
      </Field>
    </ChangePasswordFormSubmit>
  </changePasswordForm.Provider>
)
