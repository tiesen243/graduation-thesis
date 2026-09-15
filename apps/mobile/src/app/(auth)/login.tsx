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
import { toast } from '@rozumari/ui/components/toast'
import { FormBuilder } from '@rozumari/ui/lib/form-builder'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { View } from 'react-native'

import { OAuthButton } from '@/components/auth/oauth-button'
import { useRuntime } from '@/hooks/use-runtime'
import { setTokens } from '@/lib/secure-store'

const loginForm = FormBuilder.empty
  .add('email', LoginDto.Input.fields.email)
  .add('password', LoginDto.Input.fields.password)
  .make()

function LoginFormSubmit() {
  const isPending = loginForm.useValue((s) => s.isPending)

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
      {isPending ? 'Logging in...' : 'Login'}
    </Button>
  )
}

export default function LoginScreen() {
  const router = useRouter()

  return (
    <loginForm.Provider defaultValues={{ email: '', password: '' }}>
      <FieldSet containerClassName='p-4' className='justify-center'>
        <FieldLegend>Login</FieldLegend>
        <FieldDescription>
          Please enter your email and password to login to your account.
        </FieldDescription>

        <FieldGroup>
          <loginForm.Field
            name='email'
            render={({ field, meta, helpers: { handleChange } }) => (
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  {...field}
                  placeholder='Enter your email'
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
                <FieldLabel>Password</FieldLabel>
                <Input
                  {...field}
                  placeholder='Enter your password'
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
            <FieldDescription>Don&apos;t have an account? </FieldDescription>
            <Button
              variant='link'
              onPress={() => router.navigate('/(auth)/register')}
            >
              Register here
            </Button>
          </View>

          <FieldSeparator>
            <FieldLabel>or</FieldLabel>
          </FieldSeparator>

          <Field orientation='horizontal'>
            {['facebook', 'google'].map((provider) => (
              <OAuthButton key={provider} provider={provider} />
            ))}
          </Field>
        </FieldGroup>
      </FieldSet>
    </loginForm.Provider>
  )
}
