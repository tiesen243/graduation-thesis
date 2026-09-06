import type { Config } from '@react-router/dev/config'

import { vercelPreset } from '@vercel/react-router/vite'

export default {
  presets: [vercelPreset()],
  appDirectory: 'src',
  ssr: true,
} satisfies Config
