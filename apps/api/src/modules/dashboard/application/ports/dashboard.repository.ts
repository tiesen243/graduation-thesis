import type { AdminDto } from '@rozumari/contract/dashboard/dto/admin.dto'
import type { UserDto } from '@rozumari/contract/dashboard/dto/user.dto'
import type { UserId } from '@rozumari/contract/user/schemas/user.schema'
import type { Effect } from 'effect/Effect'

import * as Context from 'effect/Context'

export class DashboardRepository extends Context.Service<
  DashboardRepository,
  {
    readonly getData: () => Effect<AdminDto.Output>

    readonly getDataByUserId: (userId: UserId) => Effect<UserDto.Output>
  }
>()('dashboard/application/DashboardRepository', {}) {}
