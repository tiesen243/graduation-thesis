## @rozumari/contract@0.0.6

### Added change password feature

- Added change password contract (DTO + endpoint)
- Implemented change password use case with OAuth account creation support
- Added session invalidation on password change
- Added change password page in web app
- Added navigation to change password in sidebar user menu

## @rozumari/contract@0.0.5

### Added forgot password features

- Added send email using Resend
- Added welcome email
- Added send forgot password email
- Added reset password functionality

## @rozumari/contract@0.0.4

### Added device sse

## @rozumari/contract@0.0.3

### Add device management module

- Introduce endpoints to list all devices and fetch a device by ID
- Add contract schemas and linting configurations for device endpoints

### Layout & Navigation

- **Landing Page:** Added initial landing page layout.
- **Dashboard:** Implemented dashboard layout with responsive sidebar navigation.
- **Authentication Flows:** Added automatic route redirection based on user auth status:
  - Authenticated users -> Redirect to `/dashboard`
  - Unauthenticated users -> Redirect to `/login`

## @rozumari/contract@0.0.2

### Fix OAuth authentication flow and client-side cookie assignment.

- **api / contract**: Add `POST /api/auth/exchange` endpoint to exchange OAuth token and properly set Partitioned HTTP-only auth cookies on client-initiated fetch requests.
- **web**: Handle OAuth token exchange client-side, clear search params on completion, and switch between login form and OAuth handling states.
- **oxlint**: Update linting rules.

## @rozumari/contract@0.0.1

### Complete Auth features & UI

- **Authentication Core (`@rozumari/api`):**
  - Implemented core auth flow endpoints: `login`, `register`, `refresh`, and `whoami`.
  - Added OAuth support with **Google Sign-In**.

- **User Interface (`@rozumari/web`):**
  - Added interactive UI forms for **Login** and **Registration**.
  - Integrated Google OAuth login button into the auth UI.
  - Added auto token refresh mechanism on **401 Unauthorized** errors.
