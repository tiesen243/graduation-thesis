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
