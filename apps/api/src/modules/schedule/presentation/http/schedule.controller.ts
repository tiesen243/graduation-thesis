import { Api } from '@rozumari/contract'
import { CurrentUser } from '@rozumari/contract/auth/middleware'
import { CreateScheduleDto } from '@rozumari/contract/schedule/dto/create-schedule.dto'
import { ListSchedulesDto } from '@rozumari/contract/schedule/dto/list-schedules.dto'
import { ShowScheduleDto } from '@rozumari/contract/schedule/dto/show-schedule.dto'
import { UpdateScheduleDto } from '@rozumari/contract/schedule/dto/update-schedule.dto'
import * as Effect from 'effect/Effect'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'

import { CreateScheduleUseCase } from '@/modules/schedule/application/use-case/create-schedule.use-case'
import { ListSchedulesUseCase } from '@/modules/schedule/application/use-case/list-schedules.use-case'
import { ShowScheduleUseCase } from '@/modules/schedule/application/use-case/show-schedule.use-case'
import { UpdateScheduleUseCase } from '@/modules/schedule/application/use-case/update-schedule.use-case'

export const scheduleController = HttpApiBuilder.group(
  Api,
  'schedule',
  (handlers) =>
    handlers
      .handle('list', ({ query }) =>
        CurrentUser.pipe(
          Effect.flatMap(({ userId }) =>
            ListSchedulesUseCase.use((s) => s.execute({ ...query, userId }))
          ),
          Effect.map((data) => ListSchedulesDto.make({ data }))
        )
      )

      .handle('show', ({ params }) =>
        ShowScheduleUseCase.use((s) => s.execute(params)).pipe(
          Effect.map((data) => ShowScheduleDto.make({ data }))
        )
      )

      .handle('create', ({ payload }) =>
        CurrentUser.pipe(
          Effect.flatMap(({ userId }) =>
            CreateScheduleUseCase.use((s) =>
              s.execute({ ...payload, userId })
            )
          ),
          Effect.map((data) => CreateScheduleDto.make({ data }))
        )
      )

      .handle('update', ({ params, payload }) =>
        UpdateScheduleUseCase.use((s) =>
          s.execute({ ...params, ...payload })
        ).pipe(Effect.map((data) => UpdateScheduleDto.make({ data })))
      )
)
