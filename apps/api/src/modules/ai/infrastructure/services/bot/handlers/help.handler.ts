import { HELP_MESSAGE } from '@/modules/ai/infrastructure/services/bot/messages'

export const helpHandler = async (thread: {
  post: (message: string) => Promise<unknown>
}) => {
  await thread.post(HELP_MESSAGE)
}
