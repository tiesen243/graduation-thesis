import * as Context from 'effect/Context'

import type { Compartment } from '@/modules/device/domain/entities/compartment.entity'
import type { IBaseRepository } from '@/shared/application/repositories/base.repository'

interface ICompartmentRepository extends IBaseRepository<Compartment> {}

export class CompartmentRepository extends Context.Service<
  CompartmentRepository,
  ICompartmentRepository
>()('device/domain/CompartmentRepository') {}
