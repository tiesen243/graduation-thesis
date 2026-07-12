import * as z from 'zod'

export const baseSchema = z.object({
  id: z.cuid2(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export namespace PaginationSchema {
  export const input = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  })
  export type Input = z.infer<typeof input>

  export const output = z.object({
    page: z.int().min(1),
    pageSize: z.int().min(1).max(100),
    total: z.int().min(0),
    totalPages: z.int().min(1),
  })
  export type Output = z.infer<typeof output>
}
