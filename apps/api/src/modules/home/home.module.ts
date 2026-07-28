import { HomeLive } from '@/modules/home/presentation/home.live'

export class HomeModule {
  public static create() {
    return {
      live: HomeLive,
    }
  }
}
