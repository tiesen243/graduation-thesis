import type { RouteConfig } from '@react-router/dev/routes'

import { index, layout, prefix, route } from '@react-router/dev/routes'

export default [
  index('./routes/_index.tsx'),

  layout('./routes/auth/__root.tsx', [
    route('/login', './routes/auth/login.tsx'),
    route('/register', './routes/auth/register.tsx'),
    route('/forgot-password', './routes/auth/forgot-password.tsx'),
    route('/forgot-password/reset', './routes/auth/reset-password.tsx'),
  ]),

  layout(
    './routes/dashboard/__root.tsx',
    prefix('/dashboard', [
      route('/', './routes/dashboard/_index.tsx'),

      route('/pill-boxes', './routes/dashboard/pill-boxes/_index.tsx'),
      route('/pill-boxes/:id', './routes/dashboard/pill-boxes/[id].tsx'),

      route('/change-password', './routes/dashboard/change-password.tsx'),

      route('/*', './routes/dashboard/[...catch-all].tsx'),
    ])
  ),
] satisfies RouteConfig
