import { AuthInfrastructureDrizzleModule } from '@/modules/auth/infrastructure/persistence/drizzle/drizzle.module'
import { AuthInfrastructureInMemoryModule } from '@/modules/auth/infrastructure/persistence/in-memory/in-memory.module'

export class AuthInfrastructureModule {
  public static 'in-memory' = AuthInfrastructureInMemoryModule

  public static drizzle = AuthInfrastructureDrizzleModule
}
