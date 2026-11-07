import { BotController } from '@/modules/ai/presentation/http/bot.controller'

export class AiModule {
  public static create() {
    return {
      controller: BotController,
    }
  }
}
