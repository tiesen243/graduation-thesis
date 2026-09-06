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

export default function LoginScreen() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { api } = useRuntime()

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
                          await queryClient.invalidateQueries({
                            queryKey: api.auth.whoami.getQueryKey(),
                          })

                          toast.success('Login successful')
                          router.navigate('/(tabs)/home')
                        },
                        onError: (error) =>
                          toast.error('Login failed', error.message),
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
            <FieldLabel>or</FieldLabel>
          </FieldSeparator>

          <Field orientation='horizontal'>
            {['facebook', 'google'].map((provider) => (
              <OAuthButton key={provider} provider={provider} />
            ))}
          </Field>
        </FieldGroup>
      </loginForm.Root>
    </View>
  )
}
