import * as z from 'zod'

import { baseSchema } from '@/shared/types'

export const userSchema = baseSchema.extend({
  username: z.string().min(4).max(20),
  email: z.email(),
  image: z.nullable(z.url()),
  deletedAt: z.nullable(z.date()),
})
export type UserSchema = z.infer<typeof userSchema>
