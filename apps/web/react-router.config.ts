import type { Config } from '@react-router/dev/config'

import { vercelPreset } from '@vercel/react-router/vite'

export default {
  appDirectory: 'src',
  ssr: true,

  ...(process.env.VERCEL ? { presets: [vercelPreset()] } : {}),
} satisfies Config
