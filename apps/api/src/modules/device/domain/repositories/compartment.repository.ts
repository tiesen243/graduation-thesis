import * as Context from 'effect/Context'

import type { Compartment } from '@/modules/device/domain/entities/compartment.entity'
import type { IRepository } from '@/shared/repository'

interface ICompartmentRepository extends IRepository<Compartment> {}

export class CompartmentRepository extends Context.Service<
  CompartmentRepository,
  ICompartmentRepository
>()('device/domain/CompartmentRepository') {}
