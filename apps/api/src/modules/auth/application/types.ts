import { t } from 'elysia'
import * as z from 'zod'

import { baseSchema } from '@/shared/types'

export const passwordSchema = z
  .string()
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/u,
    'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character'
  )

export const accountSchema = z.object({
  provider: z.string().min(1).max(24),
  providerAccountId: z.string().min(1).max(24),
  password: z.nullable(passwordSchema),

  userId: z.cuid2(),
})
export type AccountSchema = z.infer<typeof accountSchema>

export const sessionSchema = baseSchema.omit({ updatedAt: true }).extend({
  token: z.string().min(1).max(64),
  expiresAt: z.date(),

  userId: z.cuid2(),
})
export type SessionSchema = z.infer<typeof sessionSchema>

export const authSchema = {
  cookie: t.Cookie({
    'auth.accessToken': t.Optional(t.String()),
    'auth.refreshToken': t.Optional(t.String()),

    // OAuth cookies
    'auth.code': t.Optional(t.String()),
    'auth.state': t.Optional(t.String()),
    'auth.redirect': t.Optional(t.String()),
  }),

  headers: t.Object({
    authorization: t.Optional(t.String({ pattern: /^Bearer\s.+$/u })),
  }),
}
