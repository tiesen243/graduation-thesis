import { LoginDto } from '@rozumari/contract/auth/dto/login.dto'
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
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import { OAuthButtons } from '@/components/auth/oauth-buttons'
import { useRuntime } from '@/hooks/use-runtime'
import { setTokens } from '@/lib/secure-store'

const loginForm = FormBuilder.empty
  .add('email', LoginDto.Input.fields.email)
  .add('password', LoginDto.Input.fields.password)
  .make()

function LoginFormSubmit() {
  const isPending = loginForm.useValue((s) => s.isPending)
  const { t } = useTranslation('auth')

  const queryClient = useQueryClient()
  const router = useRouter()
  const { api } = useRuntime()

  const handleSubmit = loginForm.useSubmit(
    (payload) => api.auth.login.mutate({ payload }),
    {
      onSuccess: async ({ data }) => {
        await setTokens(data.accessToken, data.refreshToken)
        await queryClient.invalidateQueries({
          queryKey: api.auth.whoami.getQueryKey(),
        })
        toast.success('Login successful')
        router.navigate('/(tabs)/home')
      },
      onError: (error) => toast.error(error.message),
    }
  )

  return (
    <Button disabled={isPending} onPress={() => handleSubmit()}>
      {isPending ? t('login.title') : t('login.title')}
    </Button>
  )
}

export default function LoginScreen() {
  const { t } = useTranslation(['auth'])
  const router = useRouter()

  return (
    <loginForm.Provider defaultValues={{ email: '', password: '' }}>
      <FieldSet containerClassName='p-4' className='justify-center'>
        <FieldLegend>{t('login.title')}</FieldLegend>
        <FieldDescription>{t('login.description')}</FieldDescription>

        <FieldGroup>
          <loginForm.Field
            name='email'
            render={({ field, meta, helpers: { handleChange } }) => (
              <Field>
                <FieldLabel>{t('login.fields.email.label')}</FieldLabel>
                <Input
                  {...field}
                  placeholder={t('login.fields.email.placeholder')}
                  keyboardType='email-address'
                  onChangeText={handleChange}
                  editable={!meta.isPending}
                />
                <FieldError errors={meta.errors} />
              </Field>
            )}
          />

          <loginForm.Field
            name='password'
            render={({ field, meta, helpers: { handleChange } }) => (
              <Field>
                <View className='flex-row items-center justify-between'>
                  <FieldLabel>{t('login.fields.password.label')}</FieldLabel>
                  <Button variant='link' size='sm'>
                    {t('login.actions.forgotPassword')}
                  </Button>
                </View>
                <Input
                  {...field}
                  placeholder={t('login.fields.password.placeholder')}
                  onChangeText={handleChange}
                  editable={!meta.isPending}
                  secureTextEntry
                />
                <FieldError errors={meta.errors} />
              </Field>
            )}
          />

          <LoginFormSubmit />

          <View className='flex-row items-center'>
            <FieldDescription>{t('login.register.prompt')}</FieldDescription>
            <Button
              variant='link'
              onPress={() => router.navigate('/(auth)/register')}
            >
              {t('login.register.link')}
            </Button>
          </View>

          <OAuthButtons />
        </FieldGroup>
      </FieldSet>
    </loginForm.Provider>
  )
}
