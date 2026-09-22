import { Api } from '@rozumari/contract'
import { CurrentDevice } from '@rozumari/contract/device/middleware'
import { ListSchedulesDto } from '@rozumari/contract/schedule/dto/list-schedules.dto'
import * as Effect from 'effect/Effect'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'

import { ListSchedulesUseCase } from '@/modules/schedule/application/use-case/list-schedules.use-case'
import { UpdateScheduleStatusUseCase } from '@/modules/schedule/application/use-case/update-schedule-status.use-case'

export const scheduleIoTController = HttpApiBuilder.group(
  Api,
  'schedule-iot',
  (handlers) =>
    handlers
      .handle('today', ({ query }) =>
        CurrentDevice.pipe(
          Effect.flatMap((deviceId) =>
            ListSchedulesUseCase.use((s) => {
              let today = query.date

              if (!today)
                today = Intl.DateTimeFormat('en-CA', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                }).format(new Date())

              return s.execute({ deviceId, startDate: today, endDate: today })
            })
          ),
          Effect.map((data) => new ListSchedulesDto({ data }))
        )
      )

      .handle('update-status', ({ params, payload }) =>
        UpdateScheduleStatusUseCase.use((s) =>
          s.execute({ id: params.id, status: payload.status })
        )
      )
)
