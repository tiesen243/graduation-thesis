import { Layer } from 'effect'

import { HealthUseCase } from '@/modules/home/application/use-case/health.use-case'
import { HomeHandler } from '@/modules/home/presentation/http/home.handler'

export class HomeModule {
  public static create() {
    const useCaseLayer = Layer.mergeAll(HealthUseCase.layer)

    return {
      layer: HomeHandler.pipe(Layer.provide(useCaseLayer)),
    }
  }
}
