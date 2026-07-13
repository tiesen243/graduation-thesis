import type { GetOneDto } from '@/modules/user/application/dto/get-one.dto'

import { UserRepository } from '@/modules/user/domain/repositories/user.repository'
import { Http } from '@/shared/http'
import { createUseCase } from '@/shared/lib/utils'

export const getOneUseCase = createUseCase<GetOneDto.Input, GetOneDto.Output>(
  (input) =>
    function* getOneUseCaseGen() {
      const { id } = input

      const userRepo = yield* UserRepository

      const [user] = yield* userRepo.find([{ id }], {}, { limit: 1 })
      if (!user) return yield* Http.notFound('User not found')

      return user
    }
)
