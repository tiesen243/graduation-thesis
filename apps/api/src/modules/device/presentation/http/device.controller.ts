import { Api } from '@rozumari/contract'
import { ListDevicesDto } from '@rozumari/contract/device/dto/list-devices.dto'
import { ShowDeviceDto } from '@rozumari/contract/device/dto/show-device.dto'
import * as Effect from 'effect/Effect'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'

import { ListDevicesUseCase } from '@/modules/device/application/use-case/list-devices.use-case'
import { ShowDeviceUseCase } from '@/modules/device/application/use-case/show-device.use-case'

export const deviceController = HttpApiBuilder.group(
  Api,
  'device',
  (handlers) =>
    handlers

      .handle('list', ({ query }) =>
        ListDevicesUseCase.use((s) => s.execute(query)).pipe(
          Effect.map((data) => ListDevicesDto.make({ data }))
        )
      )

      .handle('show', ({ params }) =>
        ShowDeviceUseCase.use((s) => s.execute(params)).pipe(
          Effect.map((data) => ShowDeviceDto.make({ data }))
        )
      )
)
