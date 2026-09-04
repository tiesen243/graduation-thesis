import { LoginDto } from '@rozumari/contract/auth/dto/login.dto'
import { Button } from '@rozumari/ui/components/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@rozumari/ui/components/field'
import { Input } from '@rozumari/ui/components/input'
import { FormBuilder } from '@rozumari/ui/lib/form-builder'
import { useRouter } from 'expo-router'
import { useLayoutEffect } from 'react'
import { View } from 'react-native'

import { OAuthButton } from '@/components/oauth-button'
import { useRuntime } from '@/hooks/use-runtime'
import { useSession } from '@/hooks/use-session'
import { setTokens } from '@/lib/secure-store'

const loginForm = FormBuilder.empty
  .add('email', LoginDto.Input.fields.email)
  .add('password', LoginDto.Input.fields.password)
  .make()

export default function LoginScreen() {
  const router = useRouter()
  const { api } = useRuntime()

  const { status } = useSession()
  useLayoutEffect(() => {
    if (status === 'authenticated') router.navigate('/(tabs)')
  }, [status, router])

  return (
    <View className='flex-1 items-center justify-center gap-4 px-4'>
      <loginForm.Root
        defaultValues={{ email: '', password: '' }}
        render={() => <FieldSet className='w-full' />}
      >
        <FieldLegend>Login</FieldLegend>
        <FieldDescription>
          Please enter your email and password to login to your account.
        </FieldDescription>

        <FieldGroup>
          <loginForm.Field
            name='email'
            render={({ field: { onChange, ...field }, meta }) => (
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  {...field}
                  onChangeText={onChange}
                  placeholder='Enter your email'
                />
                <FieldError errors={meta.errors} />
              </Field>
            )}
          />

          <loginForm.Field
            name='password'
            render={({ field: { onChange, ...field }, meta }) => (
              <Field>
                <FieldLabel>Password</FieldLabel>
                <Input
                  {...field}
                  onChangeText={onChange}
                  placeholder='Enter your password'
                  secureTextEntry
                />
                <FieldError errors={meta.errors} />
              </Field>
            )}
          />

          <loginForm.Submit
            render={({ handleSubmit }) => (
              <Field>
                <Button
                  onPress={() =>
                    handleSubmit(
                      (payload) => api.auth.login.mutateEffect({ payload }),
                      {
                        onSuccess: async ({ data }) => {
                          await setTokens(data.accessToken, data.refreshToken)
                          router.navigate('/(tabs)')
                        },
                        onError: (error) => console.log('Login failed', error),
                      }
                    )
                  }
                >
                  Login
                </Button>
              </Field>
            )}
          />

          <FieldSeparator>
            <FieldLabel>Or</FieldLabel>
          </FieldSeparator>

          <Field orientation='horizontal'>
            <OAuthButton provider='facebook' />
            <OAuthButton provider='google' />
          </Field>
        </FieldGroup>
      </loginForm.Root>
    </View>
  )
}
