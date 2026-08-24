import * as Layer from 'effect/Layer'

import type { AppModule } from '@/modules/app.module'

import { AddDeviceUseCase } from '@/modules/device/application/use-case/add-device.use-case'
import { DeviceStreamUseCase } from '@/modules/device/application/use-case/device-stream.use-case'
import { LinkDeviceUseCase } from '@/modules/device/application/use-case/link-device.use-case'
import { ListDevicesUseCase } from '@/modules/device/application/use-case/list-devices.use-case'
import { ShowDeviceUseCase } from '@/modules/device/application/use-case/show-device.use-case'
import { UpdateCompartmentUseCase } from '@/modules/device/application/use-case/update-compartment.use-case'
import { UpdateDeviceUseCase } from '@/modules/device/application/use-case/update-device.use-case'
import { DeviceInfrastructureModule } from '@/modules/device/infrastructure/infrastructure.module'
import { deviceController } from '@/modules/device/presentation/http/device.controller'
import { iotController } from '@/modules/device/presentation/http/iot.controller'
import { deviceMiddleware } from '@/modules/device/presentation/middleware/device.middleware'

export class DeviceModule {
  public static create(config: Pick<AppModule.Config, 'persistence'>) {
    const infrastructureLayer = DeviceInfrastructureModule.create(
      config.persistence
    )

    const useCaseLayer = Layer.mergeAll(
      AddDeviceUseCase.layer,
      DeviceStreamUseCase.layer,
      LinkDeviceUseCase.layer,
      ListDevicesUseCase.layer,
      ShowDeviceUseCase.layer,
      UpdateCompartmentUseCase.layer,
      UpdateDeviceUseCase.layer
    )

    const layer = Layer.provideMerge(useCaseLayer, infrastructureLayer)

    return {
      controller: Layer.merge(deviceController, iotController).pipe(
        Layer.provide(layer)
      ),

      exports: {
        layer,

        middlewares: {
          device: deviceMiddleware.pipe(Layer.provide(layer)),
        },
      },
    }
  }
}
