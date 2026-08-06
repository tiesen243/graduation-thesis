import * as Layer from 'effect/Layer'

import { HealthUseCase } from '@/modules/home/application/use-case/health.use-case'
import { homeController } from '@/modules/home/presentation/http/home.controller'

export class HomeModule {
  public static create() {
    const layer = Layer.mergeAll(HealthUseCase.layer)

    return {
      controller: homeController.pipe(Layer.provide(layer)),

      exports: {
        layer,
      },
    }
  }
}
