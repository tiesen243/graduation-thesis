import type { RouteConfig } from '@react-router/dev/routes'

import { index, layout, route } from '@react-router/dev/routes'

export default [
  index('./routes/_index.tsx'),

  layout('./routes/auth/__root.tsx', [
    route('/login', './routes/auth/login.tsx'),
    route('/register', './routes/auth/register.tsx'),
  ]),

  // API routes
] satisfies RouteConfig
