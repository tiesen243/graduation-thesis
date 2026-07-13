import * as z from 'zod'

import { passwordSchema } from '@/modules/auth/application/types'

export namespace LoginDto {
  export const input = z.object({
    email: z.email(),
    password: passwordSchema,
  })
  export type Input = z.infer<typeof input>

  export const output = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresAt: z.date(),
  })
  export type Output = z.infer<typeof output>
}
