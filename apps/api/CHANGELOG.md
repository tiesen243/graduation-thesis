## @rozumari/api@0.0.9

### Added forgot password features

- Added send email using Resend
- Added welcome email
- Added send forgot password email
- Added reset password functionality

## @rozumari/api@0.0.8

### Added Facebook OAuth authentication provider.

- Integrated Facebook OAuth 2.0 flow into the authentication infrastructure.
- Added user profile retrieval (`id`, `name`, `picture`, `email`) via Facebook Graph API v26.0.
- Fixed query parameters formatting for HTTP requests and resolved PKCE `code_verifier` validation issues.

## @rozumari/api@0.0.7

### Added device sse

## @rozumari/api@0.0.6

### Add device management module

- Introduce endpoints to list all devices and fetch a device by ID
- Add contract schemas and linting configurations for device endpoints

### Layout & Navigation

- **Landing Page:** Added initial landing page layout.
- **Dashboard:** Implemented dashboard layout with responsive sidebar navigation.
- **Authentication Flows:** Added automatic route redirection based on user auth status:
  - Authenticated users -> Redirect to `/dashboard`
  - Unauthenticated users -> Redirect to `/login`

## @rozumari/api@0.0.5

### Fix OAuth authentication flow and client-side cookie assignment.

- **api / contract**: Add `POST /api/auth/exchange` endpoint to exchange OAuth token and properly set Partitioned HTTP-only auth cookies on client-initiated fetch requests.
- **web**: Handle OAuth token exchange client-side, clear search params on completion, and switch between login form and OAuth handling states.
- **oxlint**: Update linting rules.

## @rozumari/api@0.0.4

### Core Authentication & Authorization System

- Added `login`, `register`, and `whoami` API endpoints.
- Introduced `authMiddleware` to secure protected routes and handle user sessions.

### Complete Auth features & UI

- **Authentication Core (`@rozumari/api`):**
  - Implemented core auth flow endpoints: `login`, `register`, `refresh`, and `whoami`.
  - Added OAuth support with **Google Sign-In**.

- **User Interface (`@rozumari/web`):**
  - Added interactive UI forms for **Login** and **Registration**.
  - Integrated Google OAuth login button into the auth UI.
  - Added auto token refresh mechanism on **401 Unauthorized** errors.

### OAuth 2.0 Integration with Google

- Added Google OAuth 2.0 authentication endpoints (`redirect` and `callback`).
- Integrated secure PKCE/State validation using HttpOnly cookies with CSRF protection.
- Handled dynamic user provisioning and automated Google account linking.

## @rozumari/api@0.0.3

### Added

- **Security**: Added a secret key requirement to both password hashing and verification functions for enhanced security.
- **Testing**: Added comprehensive unit tests for `encoding` helpers, `Password` utilities, and `JWT` handling.

### Fixed

- **Database**: Fixed a logical operator bug in the query builder where `OR` was incorrectly used instead of `AND` when constructing `WHERE` clauses.

## @rozumari/api@0.0.2

### Patch Changes

- Add Google OAuth support to API
- Refactor dependency injection for storage infrastructure

## @rozumari/api@0.0.1

### First release

- Initialize monorepo workspace structure.
- Configure automated versioning and changelogs using Tegami.
