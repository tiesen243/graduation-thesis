import * as z from 'zod'

import { userSchema } from '@/modules/user/application/types'

export namespace GetOneDto {
  export const input = z.object({ id: userSchema.shape.id })
  export type Input = z.infer<typeof input>

  export const output = userSchema
  export type Output = z.infer<typeof output>
}
