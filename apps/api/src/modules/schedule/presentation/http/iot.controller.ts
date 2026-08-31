import { Api } from '@rozumari/contract'
import { CurrentDevice } from '@rozumari/contract/device/middleware'
import { ListSchedulesDto } from '@rozumari/contract/schedule/dto/list-schedules.dto'
import * as Effect from 'effect/Effect'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'

import { ListSchedulesUseCase } from '@/modules/schedule/application/use-case/list-schedules.use-case'

export const iotController = HttpApiBuilder.group(
  Api,
  'schedule-iot',
  (handlers) =>
    handlers.handle('today', () =>
      CurrentDevice.pipe(
        Effect.flatMap((deviceId) =>
          ListSchedulesUseCase.use((s) => {
            const d = new Date()
            const year = d.getFullYear()
            const month = String(d.getMonth() + 1).padStart(2, '0')
            const day = String(d.getDate()).padStart(2, '0')
            const today = `${year}-${month}-${day}`

            return s.execute({ deviceId, startDate: today, endDate: today })
          })
        ),
        Effect.map((data) => ListSchedulesDto.make({ data }))
      )
    )
)
