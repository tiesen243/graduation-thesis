import type { RouteConfig } from '@react-router/dev/routes'

import { index, layout, route } from '@react-router/dev/routes'

export default [
  index('./routes/_index.tsx'),

  layout('./routes/auth/__root.tsx', [
    route('/login', './routes/auth/login.tsx'),
    route('/register', './routes/auth/register.tsx'),
  ]),

  layout('./routes/dashboard/__root.tsx', [
    route('/dashboard', './routes/dashboard/_index.tsx'),
    route('/devices', './routes/dashboard/devices/_index.tsx'),
    route('/*', './routes/dashboard/[...catch-all].tsx'),
  ]),
] satisfies RouteConfig
