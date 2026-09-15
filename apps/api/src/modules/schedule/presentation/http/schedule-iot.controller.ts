import { Api } from '@rozumari/contract'
import { CurrentDevice } from '@rozumari/contract/device/middleware'
import { ListSchedulesDto } from '@rozumari/contract/schedule/dto/list-schedules.dto'
import { UpdateScheduleDto } from '@rozumari/contract/schedule/dto/update-schedule.dto'
import * as Effect from 'effect/Effect'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'

import { ListSchedulesUseCase } from '@/modules/schedule/application/use-case/list-schedules.use-case'
import { UpdateScheduleUseCase } from '@/modules/schedule/application/use-case/update-schedule.use-case'

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

              if (!today) {
                const d = new Date()
                const year = d.getFullYear()
                const month = String(d.getMonth() + 1).padStart(2, '0')
                const day = String(d.getDate()).padStart(2, '0')
                today = `${year}-${month}-${day}`
              }

              return s.execute({ deviceId, startDate: today, endDate: today })
            })
          ),
          Effect.map((data) => new ListSchedulesDto({ data }))
        )
      )

      .handle('update-status', ({ params, payload }) =>
        UpdateScheduleUseCase.use((s) =>
          s.execute({ id: params.id, status: payload.status, items: [] })
        ).pipe(Effect.map((data) => new UpdateScheduleDto({ data })))
      )
)
