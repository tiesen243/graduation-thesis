import { ChangePasswordDto } from '@rozumari/contract/auth/dto/change-password.dto'
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
import { Typography } from '@rozumari/ui/components/typography'
import { FormBuilder } from '@rozumari/ui/lib/form-builder'
import { useNavigate } from 'react-router'

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

export default function ChangePasswordPage() {
  const navigate = useNavigate()

  return (
    <>
      <div className='space-y-1'>
        <Typography variant='h2'>Change Password</Typography>
        <Typography>
          Update your password to keep your account secure. If you signed in
          with a social account, leave the current password blank to set one.
        </Typography>
      </div>

      <changePasswordForm.Root
        defaultValues={{
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }}
        render={({ handleSubmit }) => (
          <form
            className='mt-4 max-w-md'
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()

              handleSubmit(
                (payload) =>
                  api.auth['change-password'].mutateEffect({
                    payload: {
                      currentPassword: payload.currentPassword || undefined,
                      newPassword: payload.newPassword,
                    },
                  }),
                {
                  onSuccess: () => {
                    toast.add({
                      type: 'success',
                      description:
                        'Password changed successfully. Please log in again.',
                    })
                    navigate('/login', { replace: true })
                  },
                  onError: () =>
                    toast.add({
                      type: 'error',
                      description: 'Current password is incorrect.',
                    }),
                }
              )
            }}
          />
        )}
      >
        <FieldSet className='group-data-[pending=true]/form:pointer-events-none'>
          <legend className='sr-only'>Change Password</legend>

          <changePasswordForm.Field
            name='currentPassword'
            render={({ field, meta }) => (
              <Field data-invalid={meta.errors.length > 0}>
                <FieldLabel htmlFor={field.id}>Current Password</FieldLabel>
                <Input
                  {...field}
                  type='password'
                  disabled={meta.isPending}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder='Leave blank if you have no password'
                />
                <FieldError id={meta.errorId} errors={meta.errors} />
              </Field>
            )}
          />

          <changePasswordForm.Field
            name='newPassword'
            render={({ field, meta }) => (
              <Field data-invalid={meta.errors.length > 0}>
                <FieldLabel htmlFor={field.id}>New Password</FieldLabel>
                <Input
                  {...field}
                  type='password'
                  disabled={meta.isPending}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder='Enter your new password'
                />
                <FieldError id={meta.errorId} errors={meta.errors} />
              </Field>
            )}
          />

          <changePasswordForm.Field
            name='confirmPassword'
            render={({ field, meta }) => (
              <Field data-invalid={meta.errors.length > 0}>
                <FieldLabel htmlFor={field.id}>Confirm Password</FieldLabel>
                <Input
                  {...field}
                  type='password'
                  disabled={meta.isPending}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder='Re-enter your new password'
                />
                <FieldError id={meta.errorId} errors={meta.errors} />
              </Field>
            )}
          />

          <Field>
            <changePasswordForm.Submit
              render={({ meta }) => (
                <Button
                  type='submit'
                  form={meta.formId}
                  disabled={meta.isPending}
                >
                  {meta.isPending ? 'Changing...' : 'Change Password'}
                </Button>
              )}
            />

            <FieldDescription>
              Make sure your new password is at least 8 characters long and
              includes uppercase, lowercase, a number, and a symbol.
            </FieldDescription>
          </Field>
        </FieldSet>
      </changePasswordForm.Root>
    </>
  )
}
