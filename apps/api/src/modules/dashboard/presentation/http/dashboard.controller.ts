import { Api } from '@rozumari/contract'
import { AdminDto } from '@rozumari/contract/dashboard/dto/admin.dto'
import { UserDto } from '@rozumari/contract/dashboard/dto/user.dto'
import * as Effect from 'effect/Effect'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'

import { AdminUseCase } from '@/modules/dashboard/application/use-case/admin.use-case'
import { UserUseCase } from '@/modules/dashboard/application/use-case/user.use-case'

export const dashboardController = HttpApiBuilder.group(
  Api,
  'dashboard',
  (handlers) =>
    handlers

      .handle('admin', () =>
        AdminUseCase.use((s) => s.execute()).pipe(
          Effect.map((data) => AdminDto.make({ data }))
        )
      )

      .handle('user', () =>
        UserUseCase.use((s) => s.execute()).pipe(
          Effect.map((data) => UserDto.make({ data }))
        )
      )
)
