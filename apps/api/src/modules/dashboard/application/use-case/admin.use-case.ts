import type { AdminDto } from '@rozumari/contract/dashboard/dto/admin.dto'

import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { DashboardRepository } from '@/modules/dashboard/application/ports/dashboard.repository'

export class AdminUseCase extends Context.Service<
  AdminUseCase,
  {
    execute: (input: AdminDto.Input) => Effect.Effect<AdminDto.Output>
  }
>()('dashboard/application/AdminUseCase', {
  make: Effect.gen(function* make() {
    const dashboardRepository = yield* DashboardRepository

    return {
      execute: () => dashboardRepository.getData(),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
