import * as z from 'zod'

import { userSchema } from '@/modules/user/application/types'
import { PaginationSchema } from '@/shared/types'

export namespace GetAllDto {
  export const input = PaginationSchema.input.extend({
    query: z.string().optional(),
  })
  export type Input = z.infer<typeof input>

  export const output = z.object({
    users: z.array(userSchema),
    meta: PaginationSchema.output,
  })
  export type Output = z.infer<typeof output>
}
