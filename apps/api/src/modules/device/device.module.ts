import * as Layer from 'effect/Layer'

import type { AppModule } from '@/modules/app.module'

import { ListDevicesUseCase } from '@/modules/device/application/use-case/list-devices.use-case'
import { ShowDeviceUseCase } from '@/modules/device/application/use-case/show-device.use-case'
import { DeviceInfrastructureModule } from '@/modules/device/infrastructure/infrastructure.module'
import { deviceController } from '@/modules/device/presentation/http/device.controller'

export class DeviceModule {
  public static create(config: Pick<AppModule.Config, 'persistence'>) {
    const infrastructureLayer = DeviceInfrastructureModule.create(
      config.persistence
    )

    const useCaseLayer = Layer.mergeAll(
      ListDevicesUseCase.layer,
      ShowDeviceUseCase.layer
    )

    const layer = Layer.provideMerge(useCaseLayer, infrastructureLayer)

    return {
      controller: deviceController.pipe(Layer.provide(layer)),

      exports: {
        layer,
      },
    }
  }
}
