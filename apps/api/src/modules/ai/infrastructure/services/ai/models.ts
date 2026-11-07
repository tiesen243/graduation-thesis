// import { createGoogle } from '@ai-sdk/google'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

import { env } from '@/shared/env'

// export const google = createGoogle({
//   apiKey: env.GOOGLE_API_KEY,
// })

export const openrouter = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
})
