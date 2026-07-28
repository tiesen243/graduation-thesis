import type { Bootstrap } from '@/bootstrap'

import { UserLive } from '@/modules/user/presentation/user.live'

export class UserModule {
  public static create(_config: Pick<Bootstrap.Config, 'persistentDriver'>) {
    return {
      live: UserLive,
    }
  }
}
