import { RegisterDto } from '@rozumari/contract/auth/dto/register.dto'
import { Button } from '@rozumari/ui/components/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@rozumari/ui/components/field'
import { Input } from '@rozumari/ui/components/input'
import { toast } from '@rozumari/ui/components/toast'
import { FormBuilder } from '@rozumari/ui/lib/form-builder'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import { OAuthButtons } from '@/components/auth/oauth-buttons'
import { useRuntime } from '@/hooks/use-runtime'

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

function RegisterFormSubmit() {
  const isPending = registerForm.useValue((s) => s.isPending)

  const router = useRouter()
  const { api } = useRuntime()

  const handleSubmit = registerForm.useSubmit(
    (payload) => api.auth.register.mutate({ payload }),
    {
      onSuccess: () => {
        toast.success('Registration successful')
        router.navigate('/(auth)/login')
      },
      onError: (error) => toast.error(error.message),
    }
  )

  return (
    <Button disabled={isPending} onPress={() => handleSubmit()}>
      {isPending ? 'Registering...' : 'Register'}
    </Button>
  )
}

export default function RegisterScreen() {
  const { t } = useTranslation('auth')
  const router = useRouter()

  return (
    <registerForm.Provider
      defaultValues={{
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
      }}
    >
      <FieldSet containerClassName='p-4' className='justify-center'>
        <FieldLegend>{t('register.title')}</FieldLegend>
        <FieldDescription>{t('register.description')}</FieldDescription>

        <FieldGroup>
          <registerForm.Field
            name='username'
            render={({ field, meta, helpers: { handleChange } }) => (
              <Field>
                <FieldLabel>{t('register.fields.username.label')}</FieldLabel>
                <Input
                  {...field}
                  placeholder={t('register.fields.username.placeholder')}
                  onChangeText={handleChange}
                  editable={!meta.isPending}
                />
                <FieldError errors={meta.errors} />
              </Field>
            )}
          />

          <registerForm.Field
            name='email'
            render={({ field, meta, helpers: { handleChange } }) => (
              <Field>
                <FieldLabel>{t('register.fields.email.label')}</FieldLabel>
                <Input
                  {...field}
                  placeholder={t('register.fields.email.placeholder')}
                  keyboardType='email-address'
                  onChangeText={handleChange}
                  editable={!meta.isPending}
                />
                <FieldError errors={meta.errors} />
              </Field>
            )}
          />

          <registerForm.Field
            name='password'
            render={({ field, meta, helpers: { handleChange } }) => (
              <Field>
                <FieldLabel>{t('register.fields.password.label')}</FieldLabel>
                <Input
                  {...field}
                  placeholder={t('register.fields.password.placeholder')}
                  onChangeText={handleChange}
                  editable={!meta.isPending}
                  secureTextEntry
                />
                <FieldError errors={meta.errors} />
              </Field>
            )}
          />

          <registerForm.Field
            name='confirmPassword'
            render={({ field, meta, helpers: { handleChange } }) => (
              <Field>
                <FieldLabel>
                  {t('register.fields.confirmPassword.label')}
                </FieldLabel>
                <Input
                  {...field}
                  placeholder={t('register.fields.confirmPassword.placeholder')}
                  onChangeText={handleChange}
                  editable={!meta.isPending}
                  secureTextEntry
                />
                <FieldError errors={meta.errors} />
              </Field>
            )}
          />

          <RegisterFormSubmit />

          <View className='flex flex-row items-center'>
            <FieldDescription>{t('register.login.prompt')}</FieldDescription>
            <Button
              variant='link'
              onPress={() => router.navigate('/(auth)/login')}
            >
              {t('register.login.link')}
            </Button>
          </View>

          <OAuthButtons />
        </FieldGroup>
      </FieldSet>
    </registerForm.Provider>
  )
}
