## @rozumari/web@0.0.6

### Added device sse

## @rozumari/web@0.0.5

### Layout & Navigation

- **Landing Page:** Added initial landing page layout.
- **Dashboard:** Implemented dashboard layout with responsive sidebar navigation.
- **Authentication Flows:** Added automatic route redirection based on user auth status:
  - Authenticated users -> Redirect to `/dashboard`
  - Unauthenticated users -> Redirect to `/login`

## @rozumari/web@0.0.4

### Fix OAuth authentication flow and client-side cookie assignment.

- **api / contract**: Add `POST /api/auth/exchange` endpoint to exchange OAuth token and properly set Partitioned HTTP-only auth cookies on client-initiated fetch requests.
- **web**: Handle OAuth token exchange client-side, clear search params on completion, and switch between login form and OAuth handling states.
- **oxlint**: Update linting rules.

## @rozumari/web@0.0.3

### Fix base URL retrieval using Vercel environment variables

- Applied the required `VITE_` prefix to Vercel environment variables so Vite can properly expose them to the client bundle.

## @rozumari/web@0.0.2

### Complete Auth features & UI

- **Authentication Core (`@rozumari/api`):**
  - Implemented core auth flow endpoints: `login`, `register`, `refresh`, and `whoami`.
  - Added OAuth support with **Google Sign-In**.

- **User Interface (`@rozumari/web`):**
  - Added interactive UI forms for **Login** and **Registration**.
  - Integrated Google OAuth login button into the auth UI.
  - Added auto token refresh mechanism on **401 Unauthorized** errors.

### Initialized Web Application Architecture

- **Web App Structure:** Initialized core architecture powered by **React Router v8**, **Tailwind CSS**, and **shadcn/ui**.
- **Monorepo Integration:** Established cross-package linkages across:
  - `@rozumari/web`: Main web application routes and setup.
  - `@rozumari/ui`: Shared component layer with Tailwind and shadcn styling.

## @rozumari/web@0.0.1

### First release

- Initialize monorepo workspace structure.
- Configure automated versioning and changelogs using Tegami.
