import * as Layer from 'effect/Layer'

import type { AppModule } from '@/modules/app.module'

import { AdminUseCase } from '@/modules/dashboard/application/use-case/admin.use-case'
import { UserUseCase } from '@/modules/dashboard/application/use-case/user.use-case'
import { DashboardInfrastructureModule } from '@/modules/dashboard/infrastructure/infrastructure.module'
import { dashboardController } from '@/modules/dashboard/presentation/http/dashboard.controller'

export class DashboardModule {
  public static create(config: Pick<AppModule.Config, 'persistence'>) {
    const infrastructureLayer = DashboardInfrastructureModule.create(
      config.persistence
    )

    const useCaseLayer = Layer.mergeAll(AdminUseCase.layer, UserUseCase.layer)

    const layer = Layer.provideMerge(useCaseLayer, infrastructureLayer)

    return {
      controller: dashboardController.pipe(Layer.provide(layer)),
    }
  }
}
