import { UserInfrastructureDrizzleModule } from '@/modules/user/infrastructure/persistence/drizzle/drizzle.module'
import { UserInfrastructureInMemoryModule } from '@/modules/user/infrastructure/persistence/in-memory/in-memory.module'

export class UserInfrastructureModule {
  public static 'in-memory' = UserInfrastructureInMemoryModule

  public static drizzle = UserInfrastructureDrizzleModule
}
