import * as Layer from 'effect/Layer'

import type { AppModule } from '@/modules/app.module'

import { CreateScheduleUseCase } from '@/modules/schedule/application/use-case/create-schedule.use-case'
import { ListSchedulesUseCase } from '@/modules/schedule/application/use-case/list-schedules.use-case'
import { ShowScheduleUseCase } from '@/modules/schedule/application/use-case/show-schedule.use-case'
import { UpdateScheduleUseCase } from '@/modules/schedule/application/use-case/update-schedule.use-case'
import { ScheduleInfrastructureModule } from '@/modules/schedule/infrastructure/infrastructure.module'
import { scheduleIoTController } from '@/modules/schedule/presentation/http/schedule-iot.controller'
import { scheduleController } from '@/modules/schedule/presentation/http/schedule.controller'

export class ScheduleModule {
  public static create(config: Pick<AppModule.Config, 'persistence'>) {
    const infrastructureLayer = ScheduleInfrastructureModule.create(
      config.persistence
    )

    const useCaseLayer = Layer.mergeAll(
      CreateScheduleUseCase.layer,
      ListSchedulesUseCase.layer,
      ShowScheduleUseCase.layer,
      UpdateScheduleUseCase.layer
    )

    const layer = Layer.provideMerge(useCaseLayer, infrastructureLayer)

    return {
      controller: Layer.merge(scheduleController, scheduleIoTController).pipe(
        Layer.provide(layer)
      ),
    }
  }
}
