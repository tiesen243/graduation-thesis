import type { AppModule } from '@/modules/app.module'

import { UserLive } from '@/modules/user/presentation/user.live'

export class UserModule {
  public static create(_config: Pick<AppModule.Config, 'persistentDriver'>) {
    return {
      live: UserLive,
    }
  }
}
