import * as z from 'zod'

import { passwordSchema } from '@/modules/auth/application/types'

export namespace RegisterDto {
  export const input = z
    .object({
      email: z.email(),
      username: z.string().min(4).max(20),
      password: passwordSchema,
      confirmPassword: z.string().min(8),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    })
  export type Input = z.infer<typeof input>

  export const output = z.void()
  export type Output = z.infer<typeof output>
}
