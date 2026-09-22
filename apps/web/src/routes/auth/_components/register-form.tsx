import { RegisterDto } from '@rozumari/contract/auth/dto/register.dto'
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

function RegisterFormSubmit({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const formId = registerForm.useValue((s) => s.formId)
  const isPending = registerForm.useValue((s) => s.isPending)
  const navigate = useNavigate()

  const handleSubmit = registerForm.useSubmit(
    (payload) => api.auth.register.mutate({ payload }),
    {
      onSuccess: () => {
        navigate('/login', { replace: true })
        toast.success(
          'Registration successful. You can now log in with your new account.'
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

export const RegisterForm: React.FC = () => (
  <registerForm.Provider
    defaultValues={{
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    }}
  >
    <RegisterFormSubmit>
      <legend className='sr-only'>Register</legend>

      <registerForm.Field
        name='username'
        render={({ field, meta, helpers: { handleChange } }) => (
          <Field data-invalid={meta.errors.length > 0}>
            <FieldLabel htmlFor={field.id}>Username</FieldLabel>
            <Input
              {...field}
              placeholder='Enter your username'
              onChange={(e) => handleChange(e.target.value)}
            />
            <FieldError id={meta.errorId} errors={meta.errors} />
          </Field>
        )}
      />

      <registerForm.Field
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

      <registerForm.Field
        name='password'
        render={({ field, meta, helpers: { handleChange } }) => (
          <Field data-invalid={meta.errors.length > 0}>
            <FieldLabel htmlFor={field.id}>Password</FieldLabel>
            <Input
              {...field}
              type='password'
              placeholder='Enter your password'
              onChange={(e) => handleChange(e.target.value)}
            />
            <FieldError id={meta.errorId} errors={meta.errors} />
          </Field>
        )}
      />

      <registerForm.Field
        name='confirmPassword'
        render={({ field, meta, helpers: { handleChange } }) => (
          <Field data-invalid={meta.errors.length > 0}>
            <FieldLabel htmlFor={field.id}>Confirm Password</FieldLabel>
            <Input
              {...field}
              type='password'
              placeholder='Confirm your password'
              onChange={(e) => handleChange(e.target.value)}
            />
            <FieldError id={meta.errorId} errors={meta.errors} />
          </Field>
        )}
      />

      <Field>
        <Button type='submit'>Register</Button>

        <FieldDescription>
          Already have an account? <Link to='/login'>Login</Link>
        </FieldDescription>
      </Field>
    </RegisterFormSubmit>
  </registerForm.Provider>
)
