import { ForgotPasswordDto } from '@rozumari/contract/auth/dto/forgot-password.dto'
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
import { Link } from 'react-router'

import { api } from '@/lib/runtime'

const forgotPasswordForm = FormBuilder.empty
  .add('email', ForgotPasswordDto.Input.fields.email)
  .make()

export default function ForgotPasswordPage() {
  return (
    <>
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </CardDescription>
      </CardHeader>

      <forgotPasswordForm.Root
        defaultValues={{ email: '' }}
        render={({ handleSubmit }) => (
          <form
            className='px-4'
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()

              handleSubmit(
                (payload) =>
                  api.auth['forgot-password'].mutateEffect({ payload }),
                {
                  onSuccess: () =>
                    toast.add({
                      type: 'success',
                      description:
                        'If an account with that email exists, a reset link has been sent.',
                    }),
                }
              )
            }}
          />
        )}
      >
        <FieldSet className='group-data-[pending=true]/form:pointer-events-none'>
          <legend className='sr-only'>Forgot Password</legend>

          <forgotPasswordForm.Field
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

          <Field>
            <forgotPasswordForm.Submit
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
      </forgotPasswordForm.Root>
    </>
  )
}
