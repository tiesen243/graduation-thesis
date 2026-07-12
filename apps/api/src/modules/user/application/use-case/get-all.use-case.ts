import type { GetAllDto } from '@/modules/user/application/dto/get-all.dto'

import { UserRepository } from '@/modules/user/domain/repositories/user.repository'
import { createUseCase } from '@/shared/lib/create-use-case'

export const getAllUseCase = createUseCase<GetAllDto.Input, GetAllDto.Output>(
  (input) =>
    function* getAllUseCaseGen() {
      const { query, page, limit: pageSize } = input
      const offset = (page - 1) * pageSize

      const userRepo = yield* UserRepository

      const where = query ? [{ username: { $like: query } }] : []

      const users = yield* userRepo.find(
        where,
        { updatedAt: 'desc' },
        { offset, limit: pageSize }
      )
      const total = yield* userRepo.count(where)
      const totalPages = Math.ceil(total / pageSize)

      return {
        users,
        meta: { page, pageSize, total, totalPages },
      }
    }
)
