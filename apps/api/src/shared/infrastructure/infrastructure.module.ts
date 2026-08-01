import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'
import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-memory.client'

export class InfrastructureModule {
  public static get inMemory() {
    return InMemoryClient.layer
  }

  public static get drizzle() {
    return DrizzleClient.layer
  }
}
